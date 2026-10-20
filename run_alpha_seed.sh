#!/usr/bin/env bash
cd ~/frappe/my-bench
./env/bin/python -c "
import frappe
frappe.init('mysite.localhost')
frappe.connect()
import sys
sys.path.insert(0, '/mnt/c/Users/sumit/OneDrive/Desktop/frappe-hrms/hrms')
import seed_alpha_employees
seed_alpha_employees.run()
"
