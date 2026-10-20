// complaint.js — Admin form custom buttons and behavior

frappe.ui.form.on("Complaint", {
	refresh(frm) {
		try {
			// Show custom action buttons only on saved documents
			if (!frm.doc.__islocal) {
				frm.trigger("show_action_buttons");
				frm.trigger("check_sla_deadline");
			}
		} catch (err) {
			console.error("Error in Complaint refresh:", err);
		}
	},

	show_action_buttons(frm) {
		// Button: Assign to Me (visible when Open)
		if (frm.doc.status === "Open") {
			frm.add_custom_button(__("Assign to Me"), function () {
				frappe.confirm(
					__("Assign this complaint to yourself and mark as 'In Review'?"),
					function () {
						frappe.call({
							method: "frappe.client.set_value",
							args: {
								doctype: "Complaint",
								name: frm.doc.name,
								fieldname: {
									assigned_to: frappe.session.user,
									status: "In Review",
								},
							},
							callback: function () {
								frm.reload_doc();
								frappe.show_alert({
									message: __("Complaint assigned to you and marked In Review."),
									indicator: "orange",
								});
							},
						});
					}
				);
			}, __("Actions"));

			// Button: Reject (visible when Open)
			frm.add_custom_button(__("Reject"), function () {
				frappe.confirm(__("Reject this complaint as invalid?"), function () {
					frappe.call({
						method: "frappe.client.set_value",
						args: {
							doctype: "Complaint",
							name: frm.doc.name,
							fieldname: { status: "Rejected" },
						},
						callback: function () {
							frm.reload_doc();
							frappe.show_alert({
								message: __("Complaint rejected."),
								indicator: "gray",
							});
						},
					});
				});
			}, __("Actions"));
		}

		// Button: Mark Resolved (visible when In Review or Escalated)
		if (["In Review", "Escalated"].includes(frm.doc.status)) {
			frm.add_custom_button(__("Mark Resolved"), function () {
				let d = new frappe.ui.Dialog({
					title: __("Resolve Complaint"),
					fields: [
						{
							fieldname: "resolution_note",
							fieldtype: "Long Text",
							label: __("Resolution Note"),
							reqd: 1,
							description: __("Describe how the complaint was resolved"),
						},
					],
					primary_action_label: __("Resolve"),
					primary_action(values) {
						frappe.call({
							method: "frappe.client.set_value",
							args: {
								doctype: "Complaint",
								name: frm.doc.name,
								fieldname: {
									status: "Resolved",
									resolution_note: values.resolution_note,
								},
							},
							callback: function () {
								d.hide();
								frm.reload_doc();
								frappe.show_alert({
									message: __("Complaint resolved!"),
									indicator: "green",
								});
							},
						});
					},
				});
				d.show();
			}, __("Actions"));
		}

		// Button: Close (visible when Resolved)
		if (frm.doc.status === "Resolved") {
			frm.add_custom_button(__("Close Complaint"), function () {
				frappe.confirm(__("Close this complaint permanently?"), function () {
					frappe.call({
						method: "frappe.client.set_value",
						args: {
							doctype: "Complaint",
							name: frm.doc.name,
							fieldname: { status: "Closed" },
						},
						callback: function () {
							frm.reload_doc();
							frappe.show_alert({
								message: __("Complaint closed."),
								indicator: "gray",
							});
						},
					});
				});
			}, __("Actions"));
		}
	},

	check_sla_deadline(frm) {
		if (
			frm.doc.sla_deadline &&
			["Open", "In Review"].includes(frm.doc.status) &&
			frm.dashboard &&
			typeof frm.dashboard.set_headline_alert === "function"
		) {
			const today = frappe.datetime?.get_today ? frappe.datetime.get_today() : null;
			if (today && frm.doc.sla_deadline < today) {
				frm.dashboard.set_headline_alert(
					__("⚠️ SLA Breached! This complaint was due on {0}.", [frm.doc.sla_deadline]),
					"red"
				);
			}
		}
	},
});
