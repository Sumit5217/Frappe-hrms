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

    # Individual CTC Packages matching Salary Structure Assignment screen:
    # 1. Sushmita Kumari: ₹65,000/mo (Executive Leadership CTC)
    # 2. Tarun Kumar: ₹80,000/mo (Standard Engineering CTC)
    # 3. Tejas Desai: ₹95,000/mo (Standard Engineering CTC)
    def calculate_statutory_tds(monthly_gross):
        annual_gross = monthly_gross * 12
        std_ded = 75000
        taxable_income = max(0, annual_gross - std_ded)
        if taxable_income <= 700000:
            return 0
        slabs = [
            (300000, 0.0),
            (400000, 0.05),
            (300000, 0.10),
            (200000, 0.15),
            (300000, 0.20),
            (float("inf"), 0.30),
        ]
        rem = taxable_income
        base_tax = 0.0
        for cap, rate in slabs:
            taxed = min(rem, cap)
            base_tax += taxed * rate
            rem -= taxed
            if rem <= 0:
                break
        cess = base_tax * 0.04
        return round((base_tax + cess) / 12)

    def get_employee_salary_config(emp):
        name_lower = (emp.employee_name or "").lower()
        if "sushmita" in name_lower:
            gross = 65000
        elif "tarun" in name_lower:
            gross = 80000
        elif "tejas" in name_lower:
            gross = 95000
        else:
            gross = 75000

        basic = round(gross * 0.60)
        special = gross - basic
        tds = calculate_statutory_tds(gross)
        pf = 1800 if gross >= 15000 else min(1800, round(basic * 0.12))  # EPFO Statutory Cap
        pt = 200 if gross >= 15000 else 0   # Professional Tax
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
        {"start_date": "2026-06-01", "end_date": "2026-06-30", "posting_date": "2026-07-04", "name_prefix": "2026-06"},
        {"start_date": "2026-07-01", "end_date": "2026-07-31", "posting_date": "2026-08-04", "name_prefix": "2026-07"},
        {"start_date": "2026-08-01", "end_date": "2026-08-31", "posting_date": "2026-09-04", "name_prefix": "2026-08"},
        {"start_date": "2026-09-01", "end_date": "2026-09-30", "posting_date": "2026-10-04", "name_prefix": "2026-09"},
    ]

    count = 0
    for emp in employees:
        preset = get_employee_salary_config(emp)

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
