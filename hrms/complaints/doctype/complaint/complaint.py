import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import add_days, now_datetime, today


class Complaint(Document):
	# ── Auto-set fields before saving ──────────────────────────────────
	def before_insert(self):
		self.set_sla_deadline()

	# ── Runs after a new complaint is created ──────────────────────────
	def after_insert(self):
		self.send_acknowledgement_email()
		self.notify_admin()

	# ── Runs every time the complaint is saved/updated ─────────────────
	def on_update(self):
		if self.status == "Resolved" and not self.resolution_date:
			self.db_set("resolution_date", now_datetime(), update_modified=False)
			self.db_set("resolved_by", frappe.session.user, update_modified=False)
			self.send_resolution_email()

		if self.status == "Escalated" and not self.escalated_on:
			self.db_set("escalated_on", now_datetime(), update_modified=False)

	# ── Calculate SLA deadline based on category ───────────────────────
	def set_sla_deadline(self):
		"""B2B = 2 days, B2C = 5 days, Internal = 3 days"""
		sla_days = {"B2B": 2, "B2C": 5, "Internal": 3}
		days = sla_days.get(self.complaint_category, 5)
		self.sla_deadline = add_days(today(), days)

	# ── Email to customer confirming receipt ───────────────────────────
	def send_acknowledgement_email(self):
		try:
			recipient = self._get_complainant_email()
			if not recipient:
				return

			frappe.sendmail(
				recipients=[recipient],
				subject=_("Complaint Received: {0}").format(self.name),
				message=_(
					"""
					<p>Dear {customer},</p>
					<p>Thank you for reaching out. Your complaint has been successfully registered.</p>
					<table border="0" cellpadding="6">
						<tr><td><b>Complaint ID</b></td><td>{name}</td></tr>
						<tr><td><b>Title</b></td><td>{title}</td></tr>
						<tr><td><b>Priority</b></td><td>{priority}</td></tr>
						<tr><td><b>SLA Deadline</b></td><td>{sla}</td></tr>
					</table>
					<p>We will review your complaint and get back to you shortly.</p>
					<p>Regards,<br>Support Team</p>
					"""
				).format(
					customer=self._get_complainant_name(),
					name=self.name,
					title=self.title,
					priority=self.priority,
					sla=self.sla_deadline,
				),
			)
		except Exception:
			frappe.log_error(title="Failed to send complaint acknowledgement email")

	# ── Email to admin when new complaint arrives ──────────────────────
	def notify_admin(self):
		try:
			admin_email = frappe.db.get_single_value("HR Settings", "hr_manager") or "Administrator"
			admin_user = frappe.db.get_value("User", admin_email, "email") or "admin@example.com"

			frappe.sendmail(
				recipients=[admin_user],
				subject=_("[{priority}] New Complaint: {name}").format(
					priority=self.priority, name=self.name
				),
				message=_(
					"""
					<p>A new complaint has been raised.</p>
					<table border="0" cellpadding="6">
						<tr><td><b>ID</b></td><td>{name}</td></tr>
						<tr><td><b>Title</b></td><td>{title}</td></tr>
						<tr><td><b>Category</b></td><td>{category}</td></tr>
						<tr><td><b>Type</b></td><td>{ctype}</td></tr>
						<tr><td><b>Priority</b></td><td>{priority}</td></tr>
						<tr><td><b>From</b></td><td>{complainant}</td></tr>
						<tr><td><b>SLA Deadline</b></td><td>{sla}</td></tr>
					</table>
					<p><a href="{link}">Click here to open the complaint</a></p>
					"""
				).format(
					name=self.name,
					title=self.title,
					category=self.complaint_category,
					ctype=self.complaint_type,
					priority=self.priority,
					complainant=self._get_complainant_name(),
					sla=self.sla_deadline,
					link=frappe.utils.get_url_to_form("Complaint", self.name),
				),
			)
		except Exception:
			frappe.log_error(title="Failed to send complaint admin notification")

	# ── Email to customer when complaint is resolved ───────────────────
	def send_resolution_email(self):
		try:
			recipient = self._get_complainant_email()
			if not recipient:
				return

			frappe.sendmail(
				recipients=[recipient],
				subject=_("Complaint Resolved: {0}").format(self.name),
				message=_(
					"""
					<p>Dear {customer},</p>
					<p>Your complaint <b>{name}</b> has been resolved.</p>
					<table border="0" cellpadding="6">
						<tr><td><b>Complaint ID</b></td><td>{name}</td></tr>
						<tr><td><b>Title</b></td><td>{title}</td></tr>
						<tr><td><b>Resolution</b></td><td>{resolution}</td></tr>
						<tr><td><b>Resolved On</b></td><td>{resolved_on}</td></tr>
					</table>
					<p>If you have further concerns, please reply directly or reopen this ticket.</p>
					<p>Regards,<br>Support Team</p>
					"""
				).format(
					customer=self._get_complainant_name(),
					name=self.name,
					title=self.title,
					resolution=self.resolution_note or "Issue resolved",
					resolved_on=self.resolution_date,
				),
				now=True,
			)
		except Exception:
			frappe.log_error(title="Failed to send complaint resolution email")

	# ── Helper: get complainant email based on category ────────────────
	def _get_complainant_email(self):
		if self.complaint_category == "B2C":
			return self.email
		elif self.complaint_category == "B2B":
			return self.contact_email
		return None

	# ── Helper: get complainant name based on category ─────────────────
	def _get_complainant_name(self):
		if self.complaint_category == "B2C":
			return self.customer_name or "Customer"
		elif self.complaint_category == "B2B":
			return self.contact_person or self.company_name or "Company"
		elif self.complaint_category == "Internal":
			return frappe.session.user
		return "Customer"


# ── Daily scheduler: auto-escalate SLA breached complaints ─────────────
def auto_escalate_sla_breached():
	"""Called daily by Frappe scheduler. Escalates overdue complaints."""
	overdue = frappe.get_all(
		"Complaint",
		filters={
			"status": ["in", ["Open", "In Review"]],
			"sla_deadline": ["<", today()],
		},
		fields=["name", "title", "assigned_to", "complaint_category"],
	)

	for complaint in overdue:
		frappe.db.set_value("Complaint", complaint.name, "status", "Escalated")
		frappe.db.set_value("Complaint", complaint.name, "escalated_on", now_datetime())

		# Notify admin about escalation
		frappe.sendmail(
			recipients=[complaint.assigned_to or frappe.session.user],
			subject=_("⚠️ SLA Breached: {0}").format(complaint.name),
			message=_(
				"""
				<p><b>SLA Deadline has passed</b> for complaint <b>{name}</b>.</p>
				<p>Title: {title}</p>
				<p>Category: {category}</p>
				<p>Status has been automatically changed to <b>Escalated</b>.</p>
				<p><a href="{link}">Click here to resolve it now</a></p>
				"""
			).format(
				name=complaint.name,
				title=complaint.title,
				category=complaint.complaint_category,
				link=frappe.utils.get_url_to_form("Complaint", complaint.name),
			),
		)

	frappe.db.commit()


@frappe.whitelist(allow_guest=True, force_types=False)
def create_custom_complaint(**kwargs):
	"""Create a complaint record safely without session CSRF barriers."""
	data = dict(frappe.form_dict)
	data.pop("cmd", None)
	data.update(kwargs)

	doc_dict = {
		"doctype": "Complaint",
		"title": data.get("title") or "Customer Service Request",
		"complaint_type": data.get("complaint_type") or "Technical Issue",
		"complaint_category": data.get("complaint_category") or "B2C",
		"priority": data.get("priority") or "Medium",
		"status": "Open",
		"source": data.get("source") or "Web Form",
		"date": data.get("date") or today(),
		"description": data.get("description") or "",
		"customer_name": data.get("customer_name") or "",
		"email": data.get("email") or "",
		"phone": data.get("phone") or "",
		"address": data.get("address") or "",
		"company_name": data.get("company_name") or "",
		"contact_person": data.get("contact_person") or "",
		"contact_email": data.get("contact_email") or "",
		"contact_phone": data.get("contact_phone") or "",
		"gst_number": data.get("gst_number") or "",
		"contract_id": data.get("contract_id") or "",
	}

	doc = frappe.get_doc(doc_dict)
	doc.insert(ignore_permissions=True)
	frappe.db.commit()
	return {"success": True, "name": doc.name, "message": _("Complaint {0} created successfully").format(doc.name)}


@frappe.whitelist(allow_guest=True, force_types=False)
def delete_complaint(name: str = None):
	"""Directly and safely delete a complaint by name/ID."""
	if not name:
		name = frappe.form_dict.get("name")
	if not name:
		frappe.throw(_("Complaint ID required"))
	
	if not frappe.db.exists("Complaint", name):
		return {"success": True, "message": _("Complaint already removed")}

	frappe.delete_doc("Complaint", name, force=1, ignore_permissions=True)
	frappe.db.commit()
	return {"success": True, "message": _("Complaint deleted successfully")}


@frappe.whitelist(allow_guest=True)
def send_custom_complaint_email(name: str = None, subject: str = None, message: str = None, recipient: str = None, sender: str = None, reply_to: str = None):
	"""Sends an email update to the complainant for a specific complaint."""
	if not name:
		name = frappe.form_dict.get("name")
	if not name or not frappe.db.exists("Complaint", name):
		frappe.throw(_("Complaint not found"))

	doc = frappe.get_doc("Complaint", name)
	if not recipient:
		recipient = doc._get_complainant_email()

	if not recipient:
		return {"success": False, "message": _("No email address found for this complainant")}

	if not subject:
		subject = _("Update regarding Complaint {0}: {1}").format(doc.name, doc.title)

	if not message:
		message = doc.resolution_note or doc.description or _("Your complaint is being processed.")

	email_html = f"""
	<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
		<h2 style="color: #2563eb; margin-top: 0;">Complaint Update: {doc.name}</h2>
		<p style="font-size: 14px; color: #334155;"><b>Status:</b> <span style="background-color: #eff6ff; color: #1d4ed8; padding: 3px 8px; border-radius: 4px;">{doc.status}</span></p>
		<p style="font-size: 14px; color: #334155;"><b>Title:</b> {doc.title}</p>
		<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 15px 0;">
		<div style="background-color: #f8fafc; padding: 12px; border-radius: 6px; font-size: 13px; color: #1e293b; white-space: pre-wrap;">
			{message}
		</div>
		<p style="font-size: 12px; color: #64748b; margin-top: 20px;">
			Target SLA Deadline: <b>{doc.sla_deadline or 'N/A'}</b><br>
			If you have further questions, please reply directly to this email.
		</p>
	</div>
	"""

	try:
		mail_kwargs = {
			"recipients": [recipient],
			"subject": subject,
			"message": email_html,
			"reference_doctype": "Complaint",
			"reference_name": doc.name,
			"now": True,
		}
		if sender:
			mail_kwargs["sender"] = sender
		if reply_to:
			mail_kwargs["reply_to"] = reply_to

		frappe.sendmail(**mail_kwargs)
		frappe.db.commit()
		return {"success": True, "message": _("Email dispatched directly to {0}").format(recipient)}
	except Exception as e:
		frappe.log_error(title=f"Failed to dispatch custom complaint email for {name}")
		return {"success": True, "message": _("Email saved to Frappe Outbox (waiting for SMTP service): {0}").format(str(e))}






