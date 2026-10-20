# Copyright (c) 2026, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import nowdate

class AssetOperatorAssignment(Document):
	def before_insert(self):
		if self.is_active:
			# Deactivate any previous active assignments for this equipment
			frappe.db.sql("""
				UPDATE `tabAsset Operator Assignment`
				SET is_active = 0, effective_to = %s, status = 'Reassigned'
				WHERE equipment = %s AND is_active = 1
			""", (nowdate(), self.equipment))
