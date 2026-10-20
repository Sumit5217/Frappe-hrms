import frappe
from frappe.utils.password import update_password
from frappe.utils import now

def run():
    frappe.db.rollback()
    
    # Clean up rawtest
    frappe.db.sql('DELETE FROM "tabUser" WHERE name = %s', ('rawtest@alphavision.io',))
    frappe.db.commit()

    company = "Alpha vision pvt ltd"
    print(f"Company: '{company}'")

    employees_data = [
        {
            "first_name": "Kavita",
            "last_name": "Patel",
            "gender": "Female",
            "designation": "HR Specialist",
            "department": "Human Resources",
            "date_of_birth": "1995-04-12",
            "date_of_joining": "2024-02-01",
            "email": "kavita@alphavision.io",
            "password": "kavita@123",
            "cell_number": "+91 98765 43210"
        },
        {
            "first_name": "Vikram",
            "last_name": "Singhania",
            "gender": "Male",
            "designation": "Frontend Developer",
            "department": "Engineering",
            "date_of_birth": "1994-08-22",
            "date_of_joining": "2024-03-01",
            "email": "vikram@alphavision.io",
            "password": "vikram@123",
            "cell_number": "+91 98765 43211"
        },
        {
            "first_name": "Ananya",
            "last_name": "Iyer",
            "gender": "Female",
            "designation": "Quality Assurance",
            "department": "Quality Assurance",
            "date_of_birth": "1996-11-05",
            "date_of_joining": "2024-04-15",
            "email": "ananya@alphavision.io",
            "password": "ananya@123",
            "cell_number": "+91 98765 43212"
        },
        {
            "first_name": "Sameer",
            "last_name": "Khan",
            "gender": "Male",
            "designation": "DevOps Engineer",
            "department": "Operations",
            "date_of_birth": "1993-01-30",
            "date_of_joining": "2024-05-01",
            "email": "sameer@alphavision.io",
            "password": "sameer@123",
            "cell_number": "+91 98765 43213"
        }
    ]

    for item in employees_data:
        email = item["email"]
        desig_name = item["designation"]
        dept_name = item["department"]
        pwd = item["password"]

        # Ensure Designation
        if not frappe.db.exists("Designation", desig_name):
            d = frappe.new_doc("Designation")
            d.designation_name = desig_name
            d.flags.ignore_permissions = True
            d.insert()
            frappe.db.commit()

        # Department
        dept = frappe.db.get_value("Department", {"department_name": dept_name}, "name") or \
               frappe.db.get_value("Department", {"name": dept_name}, "name")
        if not dept:
            d = frappe.new_doc("Department")
            d.department_name = dept_name
            d.company = company
            d.flags.ignore_permissions = True
            d.insert()
            frappe.db.commit()
            dept = d.name

        # Ensure User in tabUser
        user_exists = frappe.db.sql('SELECT name FROM "tabUser" WHERE name = %s', (email,))
        if not user_exists:
            curr_time = now()
            frappe.db.sql("""
                INSERT INTO "tabUser" (
                    name, email, first_name, last_name, full_name, username,
                    enabled, docstatus, user_type, creation, modified, modified_by, owner
                ) VALUES (
                    %s, %s, %s, %s, %s, %s,
                    1, 0, 'System User', %s, %s, 'Administrator', 'Administrator'
                )
            """, (
                email, email, item["first_name"], item["last_name"],
                f"{item['first_name']} {item['last_name']}", email,
                curr_time, curr_time
            ))
            # Assign Employee Role
            frappe.db.sql("""
                INSERT INTO "tabHas Role" (name, parent, parenttype, parentfield, role, creation, modified, modified_by, owner)
                VALUES (%s, %s, 'User', 'roles', 'Employee', %s, %s, 'Administrator', 'Administrator')
            """, (frappe.generate_hash(length=10), email, curr_time, curr_time))
            frappe.db.commit()
            
            # Set Password in Auth system
            try:
                update_password(email, pwd)
                frappe.db.commit()
            except Exception as e:
                print(f"Password update notice for {email}: {e}")
            print(f"User created & password set for {email}")
        else:
            print(f"User already exists: {email}")

        # Check / Create Employee
        existing_emp = frappe.db.get_value("Employee", {"company_email": email}, "name") or \
                       frappe.db.get_value("Employee", {"user_id": email}, "name")
        if not existing_emp:
            emp = frappe.new_doc("Employee")
            emp.first_name = item["first_name"]
            emp.last_name = item["last_name"]
            emp.company = company
            emp.gender = item["gender"]
            emp.date_of_birth = item["date_of_birth"]
            emp.date_of_joining = item["date_of_joining"]
            emp.status = "Active"
            emp.designation = desig_name
            if dept:
                emp.department = dept
            emp.company_email = email
            emp.user_id = email
            emp.cell_number = item["cell_number"]
            emp.employment_type = "Full-time"
            emp.flags.ignore_permissions = True
            emp.flags.ignore_mandatory = True
            emp.insert()
            frappe.db.commit()
            print(f"CREATED EMPLOYEE: {emp.name} - {emp.employee_name} ({company})")
        else:
            print(f"Employee already exists: {existing_emp}")

    print("\n===============================")
    print(f"ALL EMPLOYEES UNDER {company}:")
    all_alpha_emps = frappe.db.sql("""
        SELECT name, employee_name, designation, department, company_email, user_id
        FROM "tabEmployee"
        WHERE company = %s
        ORDER BY creation ASC
    """, (company,), as_dict=True)
    for e in all_alpha_emps:
        print(f"• ID: {e['name']} | Name: {e['employee_name']} | Role: {e['designation']} | Dept: {e['department']} | Email: {e['company_email']}")
    print("===============================\n")
