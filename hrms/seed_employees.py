import frappe

def run():
    employees_to_add = [
        {"name": "HR-EMP-00006", "first_name": "Madan Mohan", "department": "Operations - NVPL", "designation": "Technical Lead", "status": "Active", "date_of_joining": "2023-04-10"},
        {"name": "HR-EMP-00007", "first_name": "D Mohan Rao", "department": "Operations - NVPL", "designation": "Senior Architect", "status": "Active", "date_of_joining": "2023-06-15"},
        {"name": "HR-EMP-00008", "first_name": "Aadesh Hiralal Sonar", "department": "Operations - NVPL", "designation": "Senior Engineer", "status": "Active", "date_of_joining": "2023-08-01"},
        {"name": "HR-EMP-00009", "first_name": "P Hari Hara Rao", "department": "Operations - NVPL", "designation": "Director of Engineering", "status": "Active", "date_of_joining": "2022-01-15"},
        {"name": "HR-EMP-00010", "first_name": "A Kalyan Kumar", "department": "Operations - NVPL", "designation": "Operations Lead", "status": "Active", "date_of_joining": "2023-11-20"},
        {"name": "HR-EMP-00011", "first_name": "Ramesh Belludi", "department": "Operations - NVPL", "designation": "Principal Engineer", "status": "Active", "date_of_joining": "2023-03-01"},
        {"name": "HR-EMP-00012", "first_name": "Rajesh V", "department": "Accounts - NVPL", "designation": "Finance Manager", "status": "Active", "date_of_joining": "2022-09-10"},
        {"name": "HR-EMP-00013", "first_name": "Deepa M", "department": "Operations - NVPL", "designation": "Operations Specialist", "status": "Active", "date_of_joining": "2024-01-08"},
        {"name": "HR-EMP-00014", "first_name": "Suresh Babu", "department": "Operations - NVPL", "designation": "Site Engineer", "status": "Active", "date_of_joining": "2024-02-15"}
    ]

    for emp in employees_to_add:
        # Ensure designation exists
        desig = emp["designation"]
        if not frappe.db.exists("Designation", desig):
            d = frappe.new_doc("Designation")
            d.designation_name = desig
            d.flags.ignore_permissions = True
            d.insert()
            print(f"Created Designation: {desig}")

        if not frappe.db.exists("Employee", emp["name"]):
            try:
                doc = frappe.new_doc("Employee")
                doc.name = emp["name"]
                doc.employee = emp["name"]
                doc.first_name = emp["first_name"]
                doc.department = emp["department"]
                doc.designation = emp["designation"]
                doc.status = emp["status"]
                doc.date_of_joining = emp["date_of_joining"]
                doc.flags.ignore_permissions = True
                doc.flags.ignore_mandatory = True
                doc.flags.ignore_validate = True
                doc.insert()
                print(f"Inserted {doc.name}: {emp['first_name']}")
            except Exception as e:
                print(f"Error inserting {emp['name']}: {e}")

    frappe.db.commit()
    print("SUCCESS: Total Employees count in DB:", frappe.db.count("Employee"))

if __name__ == "__main__":
    run()
