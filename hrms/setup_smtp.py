import frappe

def run():
    account_name = "Nimble Vision Support"
    if frappe.db.exists("Email Account", account_name):
        doc = frappe.get_doc("Email Account", account_name)
    else:
        doc = frappe.new_doc("Email Account")
        doc.email_account_name = account_name

    doc.email_id = "support@nimblevision.io"
    doc.enable_outgoing = 1
    doc.default_outgoing = 1
    doc.smtp_server = "127.0.0.1"
    doc.smtp_port = 1025
    doc.use_tls = 0
    doc.use_ssl = 0
    doc.no_smtp_authentication = 1
    doc.save(ignore_permissions=True)
    frappe.db.commit()
    print("SUCCESS: Configured default outgoing Email Account in Frappe!")

def check_queue():
    records = frappe.db.get_list("Email Queue", fields=["name", "recipient", "status", "modified"], order_by="modified desc", limit=5)
    print("EMAIL QUEUE STATUS:")
    for r in records:
        print(f"ID: {r.name} | To: {r.recipient} | Status: {r.status} | Time: {r.modified}")
