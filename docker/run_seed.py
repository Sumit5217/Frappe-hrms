import os
import sys

bench_dir = "/home/frappe/frappe-bench"
sys.path.insert(0, os.path.join(bench_dir, "apps", "frappe"))
sys.path.insert(0, os.path.join(bench_dir, "apps", "hrms"))
sys.path.insert(0, os.path.join(bench_dir, "apps", "erpnext"))

import frappe
os.chdir(os.path.join(bench_dir, "sites"))
frappe.init("hrms.localhost")
frappe.connect()

company = "Nimble vision pvt ltd"
currency = "INR"

frappe.db.sql('DELETE FROM `tabSalary Detail`')
frappe.db.sql('DELETE FROM `tabSalary Slip`')
frappe.db.commit()
print("Cleaned up existing Salary Slips in DB.")

employees = frappe.get_all(
    "Employee",
    fields=["name", "employee_name", "first_name", "department", "designation", "company", "status"],
    filters={"status": "Active"},
    order_by="name"
)
print(f"Active employees: {len(employees)}")

def get_salary_config(emp):
    name_lower = (emp.employee_name or "").lower()
    if "sushmita" in name_lower:
        gross = 65000
        basic = 39000
        special = 26000
        tds = 1500
    elif "tarun" in name_lower:
        gross = 80000
        basic = 48000
        special = 32000
        tds = 3337
    elif "tejas" in name_lower:
        gross = 95000
        basic = 57000
        special = 38000
        tds = 5833
    else:
        gross = 75000
        basic = 45000
        special = 30000
        tds = 2817

    pf = 1800
    pt = 200
    total_ded = pf + pt + tds
    net_pay = gross - total_ded
    return {
        "basic": basic,
        "specialAllowance": special,
        "gross": gross,
        "pf": pf,
        "profTax": pt,
        "incomeTax": tds,
        "totalDeductions": total_ded,
        "netPay": net_pay
    }

months = [
    {"start_date": "2026-06-01", "end_date": "2026-06-30", "posting_date": "2026-07-04"},
    {"start_date": "2026-07-01", "end_date": "2026-07-31", "posting_date": "2026-08-04"},
    {"start_date": "2026-08-01", "end_date": "2026-08-31", "posting_date": "2026-09-04"},
    {"start_date": "2026-09-01", "end_date": "2026-09-30", "posting_date": "2026-10-04"},
]

count = 0
for emp in employees:
    preset = get_salary_config(emp)
    print(f"Emp {emp.name} ({emp.employee_name}): Gross {preset['gross']}, Net {preset['netPay']}")
    for m in months:
        slip = frappe.new_doc("Salary Slip")
        slip.employee = emp.name
        slip.employee_name = emp.employee_name or emp.first_name
        slip.company = emp.company or company
        slip.department = emp.department or "Operations"
        slip.designation = emp.designation or "Developer"
        slip.currency = currency
        slip.posting_date = m["posting_date"]
        slip.start_date = m["start_date"]
        slip.end_date = m["end_date"]
        slip.payroll_frequency = "Monthly"
        slip.total_working_days = 30
        slip.payment_days = 30
        slip.leave_without_pay = 0

        # Earnings
        slip.append("earnings", {
            "salary_component": "Basic",
            "amount": preset["basic"]
        })
        slip.append("earnings", {
            "salary_component": "Special Allowance",
            "amount": preset["specialAllowance"]
        })

        # Deductions
        slip.append("deductions", {
            "salary_component": "Provident Fund",
            "amount": preset["pf"]
        })
        slip.append("deductions", {
            "salary_component": "Professional Tax",
            "amount": preset["profTax"]
        })
        if preset["incomeTax"] > 0:
            slip.append("deductions", {
                "salary_component": "Income Tax",
                "amount": preset["incomeTax"]
            })

        slip.gross_pay = preset["gross"]
        slip.total_deduction = preset["totalDeductions"]
        slip.net_pay = preset["netPay"]
        slip.rounded_total = preset["netPay"]
        slip.docstatus = 0
        slip.status = "Draft"

        slip.flags.ignore_permissions = True
        slip.flags.ignore_mandatory = True
        slip.flags.ignore_validate = True
        slip.flags.ignore_links = True
        slip.insert()

        frappe.db.set_value("Salary Slip", slip.name, {
            "docstatus": 1,
            "status": "Submitted"
        })
        count += 1

frappe.db.commit()
print(f"SUCCESS: Generated {count} distinct salary slips in DB!")
