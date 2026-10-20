# Copyright (c) 2026, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

from frappe.model.document import Document

class Employee(Document):
	def before_insert(self):
		if not self.employee_name and self.first_name:
			self.employee_name = f"{self.first_name} {self.last_name or ''}".strip()
