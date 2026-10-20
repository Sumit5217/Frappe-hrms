export interface NavItem {
  label: string;
  type: 'Link' | 'Section Break';
  link_to?: string;
  link_type?: 'DocType' | 'Workspace' | 'Page' | 'Report' | 'URL' | 'Dashboard';
  icon?: string;
  child?: number;
  url?: string;
}

export interface WorkspaceSidebarData {
  title: string;
  header_icon?: string;
  items: NavItem[];
}

export const WORKSPACE_SIDEBARS: Record<string, WorkspaceSidebarData> = {
  "complaints": {
    "title": "Complaints",
    "header_icon": "message-circle-warning",
    "items": [
      {
        "label": "Home",
        "type": "Link",
        "link_to": "Complaints",
        "link_type": "Workspace",
        "icon": "house",
        "child": 0,
        "url": ""
      },
      {
        "label": "All Complaints",
        "type": "Link",
        "link_to": "Complaint",
        "link_type": "DocType",
        "icon": "triangle-alert",
        "child": 0,
        "url": ""
      },
      {
        "label": "Open Complaints",
        "type": "Link",
        "link_to": "Complaint",
        "link_type": "DocType",
        "icon": "circle-dot",
        "child": 0,
        "url": ""
      },
      {
        "label": "B2B Complaints",
        "type": "Link",
        "link_to": "Complaint",
        "link_type": "DocType",
        "icon": "building-2",
        "child": 0,
        "url": ""
      },
      {
        "label": "B2C Complaints",
        "type": "Link",
        "link_to": "Complaint",
        "link_type": "DocType",
        "icon": "user",
        "child": 0,
        "url": ""
      },
      {
        "label": "Reports",
        "type": "Section Break",
        "link_to": "",
        "link_type": "DocType",
        "icon": "notepad-text",
        "child": 0,
        "url": ""
      },
      {
        "label": "Complaint Summary",
        "type": "Link",
        "link_to": "Complaint Summary",
        "link_type": "Report",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Setup",
        "type": "Section Break",
        "link_to": "",
        "link_type": "DocType",
        "icon": "database",
        "child": 0,
        "url": ""
      },
      {
        "label": "Complaint Settings",
        "type": "Link",
        "link_to": "Complaint",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      }
    ]
  },
  "expenses": {
    "title": "Expenses",
    "header_icon": "receipt-text",
    "items": [
      {
        "label": "Home",
        "type": "Link",
        "link_to": "Expenses",
        "link_type": "Workspace",
        "icon": "house",
        "child": 0,
        "url": ""
      },
      {
        "label": "Dashboard",
        "type": "Link",
        "link_to": "Expense Claims",
        "link_type": "Dashboard",
        "icon": "layout-dashboard",
        "child": 0,
        "url": ""
      },
      {
        "label": "Employee Advance",
        "type": "Link",
        "link_to": "Employee Advance",
        "link_type": "DocType",
        "icon": "upload",
        "child": 0,
        "url": ""
      },
      {
        "label": "Expense Claim",
        "type": "Link",
        "link_to": "Expense Claim",
        "link_type": "DocType",
        "icon": "arrow-down-from-line",
        "child": 0,
        "url": ""
      },
      {
        "label": "Travel",
        "type": "Section Break",
        "link_to": "",
        "link_type": "DocType",
        "icon": "plane",
        "child": 0,
        "url": ""
      },
      {
        "label": "Purpose of Travel",
        "type": "Link",
        "link_to": "Purpose of Travel",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Travel Request",
        "type": "Link",
        "link_to": "Travel Request",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Vehicle Log",
        "type": "Link",
        "link_to": "Vehicle Log",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Accounting Entries",
        "type": "Section Break",
        "link_to": "",
        "link_type": "DocType",
        "icon": "coins",
        "child": 0,
        "url": ""
      },
      {
        "label": "Payment Entry",
        "type": "Link",
        "link_to": "Payment Entry",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Journal Entry",
        "type": "Link",
        "link_to": "Journal Entry",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Reports",
        "type": "Section Break",
        "link_to": "",
        "link_type": "DocType",
        "icon": "notepad-text",
        "child": 0,
        "url": ""
      },
      {
        "label": "Unpaid Expense Claim",
        "type": "Link",
        "link_to": "Unpaid Expense Claim",
        "link_type": "Report",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Vehicle Expenses",
        "type": "Link",
        "link_to": "Vehicle Expenses",
        "link_type": "Report",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Accounts Receivable",
        "type": "Link",
        "link_to": "Accounts Receivable",
        "link_type": "Report",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Accounts Payable",
        "type": "Link",
        "link_to": "Accounts Payable",
        "link_type": "Report",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "General Ledger",
        "type": "Link",
        "link_to": "General Ledger",
        "link_type": "Report",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Setup",
        "type": "Section Break",
        "link_to": "",
        "link_type": "DocType",
        "icon": "database",
        "child": 0,
        "url": ""
      },
      {
        "label": "Expense Claim Type",
        "type": "Link",
        "link_to": "Expense Claim Type",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Driver",
        "type": "Link",
        "link_to": "Driver",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Vehicle",
        "type": "Link",
        "link_to": "Vehicle",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Settings",
        "type": "Link",
        "link_to": "HR Settings",
        "link_type": "DocType",
        "icon": "settings",
        "child": 0,
        "url": ""
      }
    ]
  },
  "hr_setup": {
    "title": "HR Setup",
    "header_icon": "briefcase-business",
    "items": [
      {
        "label": "Home",
        "type": "Link",
        "link_to": "HR Setup",
        "link_type": "Workspace",
        "icon": "house",
        "child": 0,
        "url": ""
      },
      {
        "label": "Dashboard",
        "type": "Link",
        "link_to": "Human Resource",
        "link_type": "Dashboard",
        "icon": "layout-dashboard",
        "child": 0,
        "url": ""
      },
      {
        "label": "Employee",
        "type": "Link",
        "link_to": "Employee",
        "link_type": "DocType",
        "icon": "square-user-round",
        "child": 0,
        "url": ""
      },
      {
        "label": "Organizational Chart",
        "type": "Link",
        "link_to": "organizational-chart",
        "link_type": "Page",
        "icon": "building-2",
        "child": 0,
        "url": ""
      },
      {
        "label": "Setup",
        "type": "Section Break",
        "link_to": "",
        "link_type": "DocType",
        "icon": "database",
        "child": 0,
        "url": ""
      },
      {
        "label": "Company",
        "type": "Link",
        "link_to": "Company",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Branch",
        "type": "Link",
        "link_to": "Branch",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Department",
        "type": "Link",
        "link_to": "Department",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Designation",
        "type": "Link",
        "link_to": "Designation",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Employee Group",
        "type": "Link",
        "link_to": "Employee Group",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Employee Grade",
        "type": "Link",
        "link_to": "Employee Grade",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Settings",
        "type": "Link",
        "link_to": "HR Settings",
        "link_type": "DocType",
        "icon": "settings",
        "child": 0,
        "url": "/desk/hr-settings#employee_tab"
      }
    ]
  },
  "leaves": {
    "title": "Leaves",
    "header_icon": "tree-palm",
    "items": [
      {
        "label": "Home",
        "type": "Link",
        "link_to": "Leaves",
        "link_type": "Workspace",
        "icon": "house",
        "child": 0,
        "url": ""
      },
      {
        "label": "Leave Application",
        "type": "Link",
        "link_to": "Leave Application",
        "link_type": "DocType",
        "icon": "clipboard-pen",
        "child": 0,
        "url": ""
      },
      {
        "label": "Leave Encashment",
        "type": "Link",
        "link_to": "Leave Encashment",
        "link_type": "DocType",
        "icon": "coins",
        "child": 0,
        "url": ""
      },
      {
        "label": "Leave Control Panel",
        "type": "Link",
        "link_to": "Leave Control Panel",
        "link_type": "DocType",
        "icon": "sliders-horizontal",
        "child": 1,
        "url": ""
      },
      {
        "label": "Leave Policy Assignment",
        "type": "Link",
        "link_to": "Leave Policy Assignment",
        "link_type": "DocType",
        "icon": "calendar-heart",
        "child": 1,
        "url": ""
      },
      {
        "label": "Leave Allocation",
        "type": "Link",
        "link_to": "Leave Allocation",
        "link_type": "DocType",
        "icon": "clipboard-check",
        "child": 1,
        "url": ""
      },
      {
        "label": "Reports",
        "type": "Section Break",
        "link_to": "",
        "link_type": "DocType",
        "icon": "notepad-text",
        "child": 0,
        "url": ""
      },
      {
        "label": "Leave Balance",
        "type": "Link",
        "link_to": "Employee Leave Balance",
        "link_type": "Report",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Leave Balance Summary",
        "type": "Link",
        "link_to": "Employee Leave Balance Summary",
        "link_type": "Report",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Employees Working on a Holiday",
        "type": "Link",
        "link_to": "Employees working on a holiday",
        "link_type": "Report",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Setup",
        "type": "Section Break",
        "link_to": "",
        "link_type": "DocType",
        "icon": "database",
        "child": 0,
        "url": ""
      },
      {
        "label": "Holiday List",
        "type": "Link",
        "link_to": "Holiday List",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Holiday List Assignment",
        "type": "Link",
        "link_to": "Holiday List Assignment",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Leave Period",
        "type": "Link",
        "link_to": "Leave Period",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Leave Policy",
        "type": "Link",
        "link_to": "Leave Policy",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Leave Block List",
        "type": "Link",
        "link_to": "Leave Block List",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Leave Type",
        "type": "Link",
        "link_to": "Leave Type",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Settings",
        "type": "Link",
        "link_to": "HR Settings",
        "link_type": "DocType",
        "icon": "settings",
        "child": 0,
        "url": ""
      }
    ]
  },
  "payroll": {
    "title": "Payroll",
    "header_icon": "wallet",
    "items": [
      {
        "label": "Home",
        "type": "Link",
        "link_to": "Payroll",
        "link_type": "Workspace",
        "icon": "house",
        "child": 0,
        "url": ""
      },
      {
        "label": "Dashboard",
        "type": "Link",
        "link_to": "Payroll",
        "link_type": "Dashboard",
        "icon": "layout-dashboard",
        "child": 0,
        "url": ""
      },
      {
        "label": "Payroll Entry",
        "type": "Link",
        "link_to": "Payroll Entry",
        "link_type": "DocType",
        "icon": "banknote-arrow-up",
        "child": 0,
        "url": ""
      },
      {
        "label": "Salary Structure Assignment",
        "type": "Link",
        "link_to": "Salary Structure Assignment",
        "link_type": "DocType",
        "icon": "hand-coins",
        "child": 0,
        "url": ""
      },
      {
        "label": "Salary Slip",
        "type": "Link",
        "link_to": "Salary Slip",
        "link_type": "DocType",
        "icon": "wallet",
        "child": 0,
        "url": ""
      },
      {
        "label": "Additional Salary",
        "type": "Link",
        "link_to": "Additional Salary",
        "link_type": "DocType",
        "icon": "piggy-bank",
        "child": 0,
        "url": ""
      },
      {
        "label": "Salary Withholding",
        "type": "Link",
        "link_to": "Salary Withholding",
        "link_type": "DocType",
        "icon": "banknote-x",
        "child": 0,
        "url": ""
      },
      {
        "label": "Reports",
        "type": "Section Break",
        "link_to": "",
        "link_type": "DocType",
        "icon": "notepad-text",
        "child": 0,
        "url": ""
      },
      {
        "label": "Employee CTC Break-up",
        "type": "Link",
        "link_to": "Employee CTC Break-up",
        "link_type": "Report",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Salary Register",
        "type": "Link",
        "link_to": "Salary Register",
        "link_type": "Report",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Income Tax Deductions",
        "type": "Link",
        "link_to": "Income Tax Deductions",
        "link_type": "Report",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Professional Tax Deductions",
        "type": "Link",
        "link_to": "Professional Tax Deductions",
        "link_type": "Report",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "General Ledger",
        "type": "Link",
        "link_to": "General Ledger",
        "link_type": "Report",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Accounts Payable",
        "type": "Link",
        "link_to": "Accounts Payable",
        "link_type": "Report",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Setup",
        "type": "Section Break",
        "link_to": "",
        "link_type": "DocType",
        "icon": "database",
        "child": 0,
        "url": ""
      },
      {
        "label": "Salary Component",
        "type": "Link",
        "link_to": "Salary Component",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Salary Structure",
        "type": "Link",
        "link_to": "Salary Structure",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Settings",
        "type": "Link",
        "link_to": "Payroll Settings",
        "link_type": "DocType",
        "icon": "settings",
        "child": 0,
        "url": ""
      }
    ]
  },
  "performance": {
    "title": "Performance",
    "header_icon": "star",
    "items": [
      {
        "label": "Home",
        "type": "Link",
        "link_to": "Performance",
        "link_type": "Workspace",
        "icon": "house",
        "child": 0,
        "url": ""
      },
      {
        "label": "Goal",
        "type": "Link",
        "link_to": "Goal",
        "link_type": "DocType",
        "icon": "goal",
        "child": 0,
        "url": ""
      },
      {
        "label": "Appraisal Cycle",
        "type": "Link",
        "link_to": "Appraisal Cycle",
        "link_type": "DocType",
        "icon": "orbit",
        "child": 0,
        "url": ""
      },
      {
        "label": "Appraisal",
        "type": "Link",
        "link_to": "Appraisal",
        "link_type": "DocType",
        "icon": "arrow-up",
        "child": 0,
        "url": ""
      },
      {
        "label": "Employee Performance Feedback",
        "type": "Link",
        "link_to": "Employee Performance Feedback",
        "link_type": "DocType",
        "icon": "trending-up",
        "child": 0,
        "url": ""
      },
      {
        "label": "Employee Promotion",
        "type": "Link",
        "link_to": "Employee Promotion",
        "link_type": "DocType",
        "icon": "graduation-cap",
        "child": 0,
        "url": ""
      },
      {
        "label": "Reports",
        "type": "Section Break",
        "link_to": "",
        "link_type": "DocType",
        "icon": "notepad-text",
        "child": 0,
        "url": ""
      },
      {
        "label": "Appraisal Overview",
        "type": "Link",
        "link_to": "Appraisal Overview",
        "link_type": "Report",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Setup",
        "type": "Section Break",
        "link_to": "",
        "link_type": "DocType",
        "icon": "database",
        "child": 0,
        "url": ""
      },
      {
        "label": "Appraisal Template",
        "type": "Link",
        "link_to": "Appraisal Template",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "KRA",
        "type": "Link",
        "link_to": "KRA",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Employee Feedback Criteria",
        "type": "Link",
        "link_to": "Employee Feedback Criteria",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      }
    ]
  },
  "recruitment": {
    "title": "Recruitment",
    "header_icon": "users",
    "items": [
      {
        "label": "Home",
        "type": "Link",
        "link_to": "Recruitment",
        "link_type": "Workspace",
        "icon": "house",
        "child": 0,
        "url": ""
      },
      {
        "label": "Dashboard",
        "type": "Link",
        "link_to": "Recruitment",
        "link_type": "Dashboard",
        "icon": "layout-dashboard",
        "child": 0,
        "url": ""
      },
      {
        "label": "Hiring Pipeline",
        "type": "Link",
        "link_to": "",
        "link_type": "URL",
        "icon": "kanban",
        "child": 0,
        "url": "/desk/job-applicant/view/kanban"
      },
      {
        "label": "Job Opening",
        "type": "Link",
        "link_to": "Job Opening",
        "link_type": "DocType",
        "icon": "user-round-plus",
        "child": 0,
        "url": ""
      },
      {
        "label": "Job Applicant",
        "type": "Link",
        "link_to": "Job Applicant",
        "link_type": "DocType",
        "icon": "circle-user-round",
        "child": 0,
        "url": ""
      },
      {
        "label": "Interview",
        "type": "Link",
        "link_to": "Interview",
        "link_type": "DocType",
        "icon": "videotape",
        "child": 0,
        "url": ""
      },
      {
        "label": "Job Offer",
        "type": "Link",
        "link_to": "Job Offer",
        "link_type": "DocType",
        "icon": "user-round-check",
        "child": 0,
        "url": ""
      },
      {
        "label": "Appointment Letter",
        "type": "Link",
        "link_to": "Appointment Letter",
        "link_type": "DocType",
        "icon": "file-text",
        "child": 0,
        "url": ""
      },
      {
        "label": "Planning",
        "type": "Section Break",
        "link_to": "",
        "link_type": "DocType",
        "icon": "align-start-horizontal",
        "child": 0,
        "url": ""
      },
      {
        "label": "Job Requisition",
        "type": "Link",
        "link_to": "Job Requisition",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Staffing Plan",
        "type": "Link",
        "link_to": "Staffing Plan",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Employee Referral",
        "type": "Link",
        "link_to": "Employee Referral",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Reports",
        "type": "Section Break",
        "link_to": "",
        "link_type": "DocType",
        "icon": "notepad-text",
        "child": 0,
        "url": ""
      },
      {
        "label": "Recruitment Analytics",
        "type": "Link",
        "link_to": "Recruitment Analytics",
        "link_type": "Report",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Setup",
        "type": "Section Break",
        "link_to": "",
        "link_type": "DocType",
        "icon": "database",
        "child": 0,
        "url": ""
      },
      {
        "label": "Interview Type",
        "type": "Link",
        "link_to": "Interview Type",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Job Opening Template",
        "type": "Link",
        "link_to": "Job Opening Template",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Appointment Letter Template",
        "type": "Link",
        "link_to": "Appointment Letter Template",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Job Offer Term Template",
        "type": "Link",
        "link_to": "Job Offer Term Template",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Job Portal",
        "type": "Link",
        "link_to": "",
        "link_type": "URL",
        "icon": "globe",
        "child": 0,
        "url": "/jobs"
      },
      {
        "label": "Settings",
        "type": "Link",
        "link_to": "HR Settings",
        "link_type": "DocType",
        "icon": "settings",
        "child": 0,
        "url": ""
      }
    ]
  },
  "shift_and_attendance": {
    "title": "Shift & Attendance",
    "header_icon": "milestone",
    "items": [
      {
        "label": "Home",
        "type": "Link",
        "link_to": "Shift & Attendance",
        "link_type": "Workspace",
        "icon": "house",
        "child": 0,
        "url": ""
      },
      {
        "label": "Roster",
        "type": "Link",
        "link_to": "",
        "link_type": "URL",
        "icon": "calendar-range",
        "child": 0,
        "url": "/hr/roster"
      },
      {
        "label": "Dashboard",
        "type": "Link",
        "link_to": "Attendance",
        "link_type": "Dashboard",
        "icon": "layout-dashboard",
        "child": 0,
        "url": ""
      },
      {
        "label": "Employee Attendance Tool",
        "type": "Link",
        "link_to": "Employee Attendance Tool",
        "link_type": "DocType",
        "icon": "wrench",
        "child": 0,
        "url": ""
      },
      {
        "label": "Employee Checkin",
        "type": "Link",
        "link_to": "Employee Checkin",
        "link_type": "DocType",
        "icon": "pointer",
        "child": 0,
        "url": ""
      },
      {
        "label": "Shift Request",
        "type": "Link",
        "link_to": "Shift Request",
        "link_type": "DocType",
        "icon": "bell-dot",
        "child": 0,
        "url": ""
      },
      {
        "label": "Attendance Request",
        "type": "Link",
        "link_to": "Attendance Request",
        "link_type": "DocType",
        "icon": "calendar-check",
        "child": 0,
        "url": ""
      },
      {
        "label": "Overtime",
        "type": "Section Break",
        "link_to": "",
        "link_type": "DocType",
        "icon": "calendar-clock",
        "child": 0,
        "url": ""
      },
      {
        "label": "Overtime Type",
        "type": "Link",
        "link_to": "Overtime Type",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Overtime Slip",
        "type": "Link",
        "link_to": "Overtime Slip",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Reports",
        "type": "Section Break",
        "link_to": "",
        "link_type": "DocType",
        "icon": "notepad-text",
        "child": 0,
        "url": ""
      },
      {
        "label": "Monthly Attendance Sheet",
        "type": "Link",
        "link_to": "Monthly Attendance Sheet",
        "link_type": "Report",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Shift Attendance",
        "type": "Link",
        "link_to": "Shift Attendance",
        "link_type": "Report",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Employee Hours Utilization",
        "type": "Link",
        "link_to": "Employee Hours Utilization Based On Timesheet",
        "link_type": "Report",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Project Profitability",
        "type": "Link",
        "link_to": "Project Profitability",
        "link_type": "Report",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Setup",
        "type": "Section Break",
        "link_to": "",
        "link_type": "DocType",
        "icon": "database",
        "child": 0,
        "url": ""
      },
      {
        "label": "Shift Type",
        "type": "Link",
        "link_to": "Shift Type",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Shift Location",
        "type": "Link",
        "link_to": "Shift Location",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Shift Schedule",
        "type": "Link",
        "link_to": "Shift Schedule",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Activity Type",
        "type": "Link",
        "link_to": "Activity Type",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Timesheet",
        "type": "Link",
        "link_to": "Timesheet",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Settings",
        "type": "Link",
        "link_to": "HR Settings",
        "link_type": "DocType",
        "icon": "settings",
        "child": 0,
        "url": ""
      }
    ]
  },
  "tax_and_benefits": {
    "title": "Tax & Benefits",
    "header_icon": "coins",
    "items": [
      {
        "label": "Home",
        "type": "Link",
        "link_to": "Tax & Benefits",
        "link_type": "Workspace",
        "icon": "house",
        "child": 0,
        "url": ""
      },
      {
        "label": "Exemption Declaration",
        "type": "Link",
        "link_to": "Employee Tax Exemption Declaration",
        "link_type": "DocType",
        "icon": "badge-alert",
        "child": 0,
        "url": ""
      },
      {
        "label": "Exemption Submission Proof",
        "type": "Link",
        "link_to": "Employee Tax Exemption Proof Submission",
        "link_type": "DocType",
        "icon": "scale",
        "child": 0,
        "url": ""
      },
      {
        "label": "Benefit Application",
        "type": "Link",
        "link_to": "Employee Benefit Application",
        "link_type": "DocType",
        "icon": "trending-up",
        "child": 0,
        "url": ""
      },
      {
        "label": "Benefit Claim",
        "type": "Link",
        "link_to": "Employee Benefit Claim",
        "link_type": "DocType",
        "icon": "list-todo",
        "child": 0,
        "url": ""
      },
      {
        "label": "Reports",
        "type": "Section Break",
        "link_to": "",
        "link_type": "DocType",
        "icon": "notepad-text",
        "child": 0,
        "url": ""
      },
      {
        "label": "Income Tax Computation",
        "type": "Link",
        "link_to": "Income Tax Computation",
        "link_type": "Report",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Income Tax Deductions",
        "type": "Link",
        "link_to": "Income Tax Deductions",
        "link_type": "Report",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Accrued Earnings Report",
        "type": "Link",
        "link_to": "Accrued Earnings Report",
        "link_type": "Report",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Setup",
        "type": "Section Break",
        "link_to": "",
        "link_type": "DocType",
        "icon": "database",
        "child": 0,
        "url": ""
      },
      {
        "label": "Income Tax Slab",
        "type": "Link",
        "link_to": "Income Tax Slab",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Exemption Category",
        "type": "Link",
        "link_to": "Employee Tax Exemption Category",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      }
    ]
  },
  "tenure": {
    "title": "Tenure",
    "header_icon": "user",
    "items": [
      {
        "label": "Home",
        "type": "Link",
        "link_to": "Tenure",
        "link_type": "Workspace",
        "icon": "house",
        "child": 0,
        "url": ""
      },
      {
        "label": "Dashboard",
        "type": "Link",
        "link_to": "Employee Lifecycle",
        "link_type": "Dashboard",
        "icon": "layout-dashboard",
        "child": 0,
        "url": ""
      },
      {
        "label": "Employee Onboarding",
        "type": "Link",
        "link_to": "Employee Onboarding",
        "link_type": "DocType",
        "icon": "user-star",
        "child": 0,
        "url": ""
      },
      {
        "label": "Employee Separation",
        "type": "Link",
        "link_to": "Employee Separation",
        "link_type": "DocType",
        "icon": "user-round-minus",
        "child": 0,
        "url": ""
      },
      {
        "label": "Employee Grievance",
        "type": "Link",
        "link_to": "Employee Grievance",
        "link_type": "DocType",
        "icon": "user-lock",
        "child": 0,
        "url": ""
      },
      {
        "label": "Reports",
        "type": "Section Break",
        "link_to": "",
        "link_type": "DocType",
        "icon": "notepad-text",
        "child": 0,
        "url": ""
      },
      {
        "label": "Employee Exits",
        "type": "Link",
        "link_to": "Employee Exits",
        "link_type": "Report",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Employee Birthday",
        "type": "Link",
        "link_to": "Employee Birthday",
        "link_type": "Report",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Employee Information",
        "type": "Link",
        "link_to": "Employee Information",
        "link_type": "Report",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Employee Analytics",
        "type": "Link",
        "link_to": "Employee Analytics",
        "link_type": "Report",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Setup",
        "type": "Section Break",
        "link_to": "",
        "link_type": "DocType",
        "icon": "database",
        "child": 0,
        "url": ""
      },
      {
        "label": "Employee Skill Map",
        "type": "Link",
        "link_to": "Employee Skill Map",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Grievance Type",
        "type": "Link",
        "link_to": "Grievance Type",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Training Program",
        "type": "Link",
        "link_to": "Training Program",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Training Event",
        "type": "Link",
        "link_to": "Training Event",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Training Feedback",
        "type": "Link",
        "link_to": "Training Feedback",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Training Result",
        "type": "Link",
        "link_to": "Training Result",
        "link_type": "DocType",
        "icon": "",
        "child": 1,
        "url": ""
      },
      {
        "label": "Settings",
        "type": "Link",
        "link_to": "HR Settings",
        "link_type": "DocType",
        "icon": "settings",
        "child": 0,
        "url": ""
      }
    ]
  }
};
