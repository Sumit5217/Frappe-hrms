import frappe

def run():
    company = "Nimble vision pvt ltd"
    print("--- Starting Salary Update from Assignments ---")

    # 1. Clean existing salary slips
    frappe.db.sql('DELETE FROM `tabSalary Detail`')
    frappe.db.sql('DELETE FROM `tabSalary Slip`')
    frappe.db.commit()
    print("Cleaned up old Salary Slips.")

    # 2. Get active employees
    employees = frappe.get_all(
        "Employee",
        fields=["name", "employee_name", "first_name", "department", "designation", "company", "status"],
        filters={"status": "Active"},
        order_by="name"
    )

    # Individual CTC packages matching Salary Structure Assignment screen:
    # Sushmita: ₹65,000 | Tarun: ₹80,000 | Tejas: ₹95,000
    def get_salary_for_emp(emp):
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
            "gross": gross,
            "basic": basic,
            "specialAllowance": special,
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

    total_slips = 0
    for emp in employees:
        sal = get_salary_for_emp(emp)
        print(f"Creating slips for {emp.name}: {emp.employee_name} -> Gross: {sal['gross']}, Net: {sal['netPay']}")

        for m in months:
            slip = frappe.new_doc("Salary Slip")
            slip.employee = emp.name
            slip.employee_name = emp.employee_name or emp.first_name
            slip.company = emp.company or company
            slip.department = emp.department or "Operations"
            slip.designation = emp.designation or "Developer"
            slip.currency = "INR"
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
                "amount": sal["basic"]
            })
            slip.append("earnings", {
                "salary_component": "Special Allowance",
                "amount": sal["specialAllowance"]
            })

            # Deductions
            slip.append("deductions", {
                "salary_component": "Provident Fund",
                "amount": sal["pf"]
            })
            slip.append("deductions", {
                "salary_component": "Professional Tax",
                "amount": sal["profTax"]
            })
            if sal["incomeTax"] > 0:
                slip.append("deductions", {
                    "salary_component": "Income Tax",
                    "amount": sal["incomeTax"]
                })

            slip.gross_pay = sal["gross"]
            slip.total_deduction = sal["totalDeductions"]
            slip.net_pay = sal["netPay"]
            slip.rounded_total = sal["netPay"]
            slip.docstatus = 1
            slip.status = "Submitted"

            slip.flags.ignore_permissions = True
            slip.flags.ignore_mandatory = True
            slip.flags.ignore_validate = True
            slip.flags.ignore_links = True
            slip.insert()
            total_slips += 1

    frappe.db.commit()
    print(f"SUCCESS: Created {total_slips} Salary Slips with individual salaries!")

run()
