// complaint_list.js — Indicator colors in list view
frappe.provide("frappe.listview_settings");
frappe.listview_settings["Complaint"] = {
	get_indicator(doc) {
		const colors = {
			"Open": "red",
			"In Review": "orange",
			"Escalated": "purple",
			"Resolved": "green",
			"Closed": "gray",
			"Rejected": "gray",
		};
		return [__(doc.status || "Open"), colors[doc.status] || "blue", "status,=," + (doc.status || "Open")];
	},
};
