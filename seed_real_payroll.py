import os
import sys

bench_dir = os.path.expanduser("~/frappe/my-bench")
sys.path.insert(0, os.path.join(bench_dir, "apps", "frappe"))
import frappe

os.chdir(os.path.join(bench_dir, "sites"))
frappe.init("mysite.localhost")
frappe.connect()

def setup_salary_components():
    components = [
        {"name": "Basic", "type": "Earning", "description": "Basic Salary"},
        {"name": "Special Allowance", "type": "Earning", "description": "Special Allowance"},
        {"name": "House Rent Allowance", "type": "Earning", "description": "House Rent Allowance"},
        {"name": "Provident Fund", "type": "Deduction", "description": "Employee Provident Fund (PF)"},
        {"name": "Professional Tax", "type": "Deduction", "description": "Professional Tax (PT)"},
        {"name": "Income Tax", "type": "Deduction", "description": "TDS / Income Tax"},
    ]
    for c in components:
        if not frappe.db.exists("Salary Component", c["name"]):
            doc = frappe.new_doc("Salary Component")
            doc.name = c["name"]
            doc.salary_component = c["name"]
            doc.type = c["type"]
            doc.description = c["description"]
            doc.flags.ignore_permissions = True
            doc.flags.ignore_mandatory = True
            doc.insert()
            print(f"Created Salary Component: {c['name']} ({c['type']})")

def run():
    setup_salary_components()

    company = "Nimble vision pvt ltd"
    currency = "INR"

    # 1. Clear any old Salary Slips & details
    frappe.db.sql('DELETE FROM "tabSalary Detail"')
    frappe.db.sql('DELETE FROM "tabSalary Slip"')
    frappe.db.commit()
    print("Cleaned up existing Salary Slips in DB.")

    # 2. Get the 6 active employees
    employees = frappe.get_all(
        "Employee",
        fields=["name", "employee_name", "first_name", "department", "designation", "company", "status"],
        filters={"status": "Active"},
        order_by="name"
    )
    print(f"Active employees found for payroll: {len(employees)}")
    for e in employees:
        print(f"  {e.name}: {e.employee_name} ({e.designation})")

    # Salary configurations for the real team members
    # EPFO Statutory Cap: PF is capped at ₹1,800/mo (12% of ₹15,000 statutory limit)
    # Developers: Gross 75,000 | Basic 45,000 | Special 30,000 | PF 1,800 | PT 200 | TDS 2,817 | Net 70,183
    # Business Analyst: Gross 80,000 | Basic 48,000 | Special 32,000 | PF 1,800 | PT 200 | TDS 3,337 | Net 74,663
    presets = {
        "Developer": {
            "basic": 45000,
            "specialAllowance": 30000,
            "gross": 75000,
            "pf": 1800,
            "profTax": 200,
            "incomeTax": 2817,
            "totalDeductions": 4817,
            "netPay": 70183
        },
        "Business Analyst": {
            "basic": 48000,
            "specialAllowance": 32000,
            "gross": 80000,
            "pf": 1800,
            "profTax": 200,
            "incomeTax": 3337,
            "totalDeductions": 5337,
            "netPay": 74663
        }
    }

    months = [
        {"start_date": "2026-06-01", "end_date": "2026-06-30", "posting_date": "2026-07-04", "name_prefix": "2026-06"},
        {"start_date": "2026-07-01", "end_date": "2026-07-31", "posting_date": "2026-08-04", "name_prefix": "2026-07"},
        {"start_date": "2026-08-01", "end_date": "2026-08-31", "posting_date": "2026-09-04", "name_prefix": "2026-08"},
        {"start_date": "2026-09-01", "end_date": "2026-09-30", "posting_date": "2026-10-04", "name_prefix": "2026-09"},
    ]

    count = 0
    for emp in employees:
        desig = emp.designation or "Developer"
        preset = presets.get(desig, presets["Developer"])

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

            # Mark as Submitted
            frappe.db.set_value("Salary Slip", slip.name, {
                "docstatus": 1,
                "status": "Submitted"
            })
            count += 1

    frappe.db.commit()
    print(f"\nSUCCESS: Created {count} fresh Salary Slips for the 6 real employees!")
    print(f"Total Salary Slips in DB: {frappe.db.count('Salary Slip')}")

if __name__ == "__main__":
    run()
