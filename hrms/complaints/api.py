import frappe
from frappe import _
from frappe.utils import today, add_days


# ── B2B/External: Create complaint via API ─────────────────────────────
@frappe.whitelist(allow_guest=False)
def create_complaint(
	title: str,
	description: str,
	complaint_type: str = "Other",
	complaint_category: str = "B2C",
	priority: str = "Medium",
	# B2C fields
	customer_name: str = "",
	phone: str = "",
	email: str = "",
	address: str = "",
	# B2B fields
	company_name: str = "",
	gst_number: str = "",
	contact_person: str = "",
	contact_phone: str = "",
	contact_email: str = "",
	contract_id: str = "",
	source: str = "API",
) -> dict:
	"""
	External apps (B2B companies) call this to create a complaint.
	Endpoint: POST /api/method/hrms.complaints.api.create_complaint
	"""
	# Validate required fields
	if not title:
		frappe.throw(_("Complaint title is required"))
	if not description:
		frappe.throw(_("Complaint description is required"))

	# Create the complaint document
	complaint = frappe.new_doc("Complaint")
	complaint.title             = title
	complaint.description       = description
	complaint.complaint_type    = complaint_type
	complaint.complaint_category = complaint_category
	complaint.priority          = priority.capitalize()
	complaint.status            = "Open"
	complaint.source            = source
	complaint.date              = today()

	# B2C fields
	complaint.customer_name = customer_name
	complaint.phone         = phone
	complaint.email         = email
	complaint.address       = address

	# B2B fields
	complaint.company_name  = company_name
	complaint.gst_number    = gst_number
	complaint.contact_person = contact_person
	complaint.contact_phone = contact_phone
	complaint.contact_email = contact_email
	complaint.contract_id   = contract_id

	complaint.insert(ignore_permissions=True)
	frappe.db.commit()

	return {
		"success": True,
		"complaint_id": complaint.name,
		"status": complaint.status,
		"sla_deadline": str(complaint.sla_deadline),
		"message": _("Complaint registered successfully. ID: {0}").format(complaint.name),
	}


# ── Check status of a complaint ────────────────────────────────────────
@frappe.whitelist(allow_guest=False)
def get_complaint_status(complaint_id: str) -> dict:
	"""
	External apps poll this to check complaint status.
	Endpoint: GET /api/method/hrms.complaints.api.get_complaint_status?complaint_id=CMP-2024-00001
	"""
	if not frappe.db.exists("Complaint", complaint_id):
		frappe.throw(_("Complaint {0} not found").format(complaint_id))

	complaint = frappe.get_doc("Complaint", complaint_id)

	return {
		"complaint_id": complaint.name,
		"title": complaint.title,
		"status": complaint.status,
		"priority": complaint.priority,
		"assigned_to": complaint.assigned_to or "Pending assignment",
		"sla_deadline": str(complaint.sla_deadline),
		"resolution_note": complaint.resolution_note or "",
		"resolution_date": str(complaint.resolution_date) if complaint.resolution_date else "",
	}


# ── Get all complaints (with optional filters) ─────────────────────────
@frappe.whitelist(allow_guest=False)
def get_complaints(
	status: str = "",
	complaint_category: str = "",
	company_name: str = "",
	from_date: str = "",
	to_date: str = "",
) -> dict:
	"""
	Returns a list of complaints. Supports filters.
	Endpoint: GET /api/method/hrms.complaints.api.get_complaints
	"""
	filters = {}
	if status:
		filters["status"] = status
	if complaint_category:
		filters["complaint_category"] = complaint_category
	if company_name:
		filters["company_name"] = ["like", f"%{company_name}%"]
	if from_date:
		filters["date"] = [">=", from_date]
	if to_date:
		filters["date"] = ["<=", to_date]

	complaints = frappe.get_all(
		"Complaint",
		filters=filters,
		fields=[
			"name", "title", "complaint_type", "complaint_category",
			"priority", "status", "date", "sla_deadline",
			"customer_name", "company_name", "assigned_to",
		],
		order_by="creation desc",
		limit=100,
	)

	return {
		"total": len(complaints),
		"complaints": complaints,
	}
