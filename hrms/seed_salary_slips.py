import frappe

def run():
    # 1. Print all existing employees in DB
    employees = frappe.get_all(
        "Employee",
        fields=["name", "employee", "first_name", "last_name", "employee_name", "company", "department", "designation", "status"]
    )
    print(f"Found {len(employees)} Employees in DB:")
    for e in employees:
        print(f"  ID: {e.name} | First: {e.first_name} | Full: {e.employee_name}")

    companies = frappe.get_all("Company", fields=["name", "default_currency"])
    default_company = companies[0].name if companies else "NVPL"
    currency = companies[0].default_currency if companies else "INR"

    # 2. Employee salary configurations (matching June - Sep 2026 data)
    salary_presets = [
        {"pattern": "nandish", "basic": 43674, "specialAllowance": 31459, "gross": 75133, "pf": 3606, "incomeTax": 0, "profTax": 200, "totalDeductions": 3806, "netPay": 71327},
        {"pattern": "rita", "basic": 23817, "specialAllowance": 15856, "gross": 39673, "pf": 0, "incomeTax": 0, "profTax": 200, "totalDeductions": 200, "netPay": 39473},
        {"pattern": "lipika", "basic": 82100, "specialAllowance": 61650, "gross": 143750, "pf": 6900, "incomeTax": 8088, "profTax": 1250, "totalDeductions": 16238, "netPay": 127512},
        {"pattern": "madan", "basic": 69808, "specialAllowance": 51992, "gross": 121800, "pf": 5846, "incomeTax": 0, "profTax": 200, "totalDeductions": 6046, "netPay": 115754},
        {"pattern": "mohan rao", "basic": 76014, "specialAllowance": 56869, "gross": 132883, "pf": 6378, "incomeTax": 5383, "profTax": 200, "totalDeductions": 11961, "netPay": 120922},
        {"pattern": "aadesh", "basic": 71600, "specialAllowance": 53400, "gross": 125000, "pf": 6000, "incomeTax": 0, "profTax": 200, "totalDeductions": 6200, "netPay": 118800},
        {"pattern": "hari hara", "basic": 106978, "specialAllowance": 81197, "gross": 188175, "pf": 9032, "incomeTax": 16135, "profTax": 200, "totalDeductions": 25367, "netPay": 162808},
        {"pattern": "kalyan", "basic": 44534, "specialAllowance": 32133, "gross": 76667, "pf": 3680, "incomeTax": 0, "profTax": 0, "totalDeductions": 3680, "netPay": 72987},
        {"pattern": "ramesh", "basic": 82500, "specialAllowance": 64250, "gross": 146750, "pf": 7044, "incomeTax": 9240, "profTax": 200, "totalDeductions": 16484, "netPay": 130266},
        {"pattern": "sumanth", "basic": 95400, "specialAllowance": 73800, "gross": 169200, "pf": 8120, "incomeTax": 12450, "profTax": 200, "totalDeductions": 20770, "netPay": 148430},
        {"pattern": "kavitha", "basic": 68400, "specialAllowance": 52600, "gross": 121000, "pf": 5808, "incomeTax": 3400, "profTax": 200, "totalDeductions": 9408, "netPay": 111592},
        {"pattern": "rajesh", "basic": 91500, "specialAllowance": 71200, "gross": 162700, "pf": 7810, "incomeTax": 11800, "profTax": 200, "totalDeductions": 19810, "netPay": 142890},
        {"pattern": "deepa", "basic": 65800, "specialAllowance": 50400, "gross": 116200, "pf": 5578, "incomeTax": 2400, "profTax": 200, "totalDeductions": 8178, "netPay": 108022},
        {"pattern": "suresh", "basic": 57400, "specialAllowance": 43217, "gross": 100617, "pf": 4830, "incomeTax": 1200, "profTax": 200, "totalDeductions": 6230, "netPay": 94387},
    ]

    months = [
        {"start_date": "2026-06-01", "end_date": "2026-06-30", "posting_date": "2026-07-04"},
        {"start_date": "2026-07-01", "end_date": "2026-07-31", "posting_date": "2026-08-04"},
        {"start_date": "2026-08-01", "end_date": "2026-08-31", "posting_date": "2026-09-04"},
        {"start_date": "2026-09-01", "end_date": "2026-09-30", "posting_date": "2026-10-04"},
    ]

    created_slips = 0

    for emp in employees:
        emp_text = f"{emp.name} {emp.first_name or ''} {emp.employee_name or ''}".lower()
        
        # Match with salary preset
        matched_preset = None
        for preset in salary_presets:
            if preset["pattern"] in emp_text:
                matched_preset = preset
                break

        if not matched_preset:
            # Fallback default salary if no preset matched
            matched_preset = {
                "basic": 50000,
                "specialAllowance": 25000,
                "gross": 75000,
                "pf": 3600,
                "incomeTax": 2000,
                "profTax": 200,
                "totalDeductions": 5800,
                "netPay": 69200
            }

        emp_company = emp.company or default_company

        for m in months:
            existing = frappe.db.get_value(
                "Salary Slip",
                {"employee": emp.name, "start_date": m["start_date"], "end_date": m["end_date"]},
                "name"
            )
            if existing:
                continue

            slip = frappe.new_doc("Salary Slip")
            slip.employee = emp.name
            slip.employee_name = emp.employee_name or emp.first_name or emp.name
            slip.company = emp_company
            slip.department = emp.department
            slip.designation = emp.designation
            slip.currency = currency
            slip.posting_date = m["posting_date"]
            slip.start_date = m["start_date"]
            slip.end_date = m["end_date"]
            slip.payroll_frequency = "Monthly"
            slip.total_working_days = 30
            slip.payment_days = 30

            slip.append("earnings", {
                "salary_component": "Basic",
                "amount": matched_preset["basic"]
            })
            slip.append("earnings", {
                "salary_component": "Special Allowance",
                "amount": matched_preset["specialAllowance"]
            })

            if matched_preset["pf"] > 0:
                slip.append("deductions", {
                    "salary_component": "Provident Fund",
                    "amount": matched_preset["pf"]
                })
            if matched_preset["incomeTax"] > 0:
                slip.append("deductions", {
                    "salary_component": "Income Tax",
                    "amount": matched_preset["incomeTax"]
                })
            if matched_preset["profTax"] > 0:
                slip.append("deductions", {
                    "salary_component": "Professional Tax",
                    "amount": matched_preset["profTax"]
                })

            slip.gross_pay = matched_preset["gross"]
            slip.total_deduction = matched_preset["totalDeductions"]
            slip.net_pay = matched_preset["netPay"]
            slip.rounded_total = round(matched_preset["netPay"])
            slip.docstatus = 0
            slip.status = "Draft"

            slip.flags.ignore_permissions = True
            slip.flags.ignore_mandatory = True
            slip.flags.ignore_validate = True
            slip.flags.ignore_links = True

            slip.insert()

            # Now mark as Submitted in DB
            frappe.db.set_value("Salary Slip", slip.name, {
                "docstatus": 1,
                "status": "Submitted"
            })
            created_slips += 1

    frappe.db.commit()
    print(f"SUCCESS: Inserted {created_slips} Salary Slips! Total Salary Slips in DB: {frappe.db.count('Salary Slip')}")

if __name__ == "__main__":
    run()
