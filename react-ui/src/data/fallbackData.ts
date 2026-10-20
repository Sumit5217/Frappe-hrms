// Comprehensive fallback and seed data for HRMS modules
// Ensures all DocTypes and Reports function smoothly even if the backend is starting, offline, or returns 403/417.

const LOCAL_STORAGE_KEY = 'frappe_hrms_local_records_v1';

export function getLocalRecords(doctype: string): any[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${doctype}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalRecord(doctype: string, record: any): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const existing = getLocalRecords(doctype);
    const updated = [record, ...existing.filter((r) => r.name !== record.name)];
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_${doctype}`, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed saving local record:', e);
  }
}

export function deleteLocalRecord(doctype: string, docname: string): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const existing = getLocalRecords(doctype);
    const filtered = existing.filter((r) => r.name !== docname);
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_${doctype}`, JSON.stringify(filtered));

    const delRaw = localStorage.getItem(`${LOCAL_STORAGE_KEY}_deleted_${doctype}`);
    const deletedList: string[] = delRaw ? JSON.parse(delRaw) : [];
    if (!deletedList.includes(docname)) {
      deletedList.push(docname);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_deleted_${doctype}`, JSON.stringify(deletedList));
    }
  } catch (e) {
    console.warn('Failed deleting local record:', e);
  }
}

export function updateLocalRecordStatus(doctype: string, docname: string, status: string): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const existing = getLocalRecords(doctype);
    let found = false;
    const updated = existing.map((r) => {
      if (r.name === docname) {
        found = true;
        return { ...r, status, approval_status: status };
      }
      return r;
    });
    if (found) {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_${doctype}`, JSON.stringify(updated));
      return true;
    }
    // Also save as an updated stub if not yet in local storage
    const fallbackList = FALLBACK_DOCTYPES_DATA[doctype] || [];
    const fbItem = fallbackList.find((f) => f.name === docname);
    if (fbItem) {
      saveLocalRecord(doctype, { ...fbItem, status, approval_status: status });
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function isRecordDeleted(doctype: string, docname: string): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const delRaw = localStorage.getItem(`${LOCAL_STORAGE_KEY}_deleted_${doctype}`);
    const deletedList: string[] = delRaw ? JSON.parse(delRaw) : [];
    return deletedList.includes(docname);
  } catch {
    return false;
  }
}

export const FALLBACK_DOCTYPES_DATA: Record<string, any[]> = {
  // ================= 1. SHIFT & ATTENDANCE =================
  'Attendance': [
    { name: 'ATT-2026-00101', employee_name: 'Rahul Sharma', employee: 'HR-EMP-00001', attendance_date: '2026-10-12', status: 'Present', shift: 'Morning Shift (9AM - 6PM)', in_time: '09:02:15', out_time: '18:05:40' },
    { name: 'ATT-2026-00102', employee_name: 'Priya Patel', employee: 'HR-EMP-00002', attendance_date: '2026-10-12', status: 'Present', shift: 'Morning Shift (9AM - 6PM)', in_time: '08:58:30', out_time: '18:10:00' },
    { name: 'ATT-2026-00103', employee_name: 'Amit Kumar', employee: 'HR-EMP-00003', attendance_date: '2026-10-12', status: 'Present', shift: 'General Shift (10AM - 7PM)', in_time: '09:55:00', out_time: '19:02:30' },
    { name: 'ATT-2026-00104', employee_name: 'Sneha Reddy', employee: 'HR-EMP-00004', attendance_date: '2026-10-12', status: 'On Leave', shift: 'Morning Shift (9AM - 6PM)', in_time: '—', out_time: '—' },
    { name: 'ATT-2026-00105', employee_name: 'Vikram Singh', employee: 'HR-EMP-00005', attendance_date: '2026-10-12', status: 'Half Day', shift: 'Morning Shift (9AM - 6PM)', in_time: '09:10:00', out_time: '13:30:00' },
    { name: 'ATT-2026-00106', employee_name: 'Ananya Deshmukh', employee: 'HR-EMP-00006', attendance_date: '2026-10-12', status: 'Present', shift: 'Morning Shift (9AM - 6PM)', in_time: '08:55:10', out_time: '18:00:20' },
    { name: 'ATT-2026-00107', employee_name: 'Karan Verma', employee: 'HR-EMP-00007', attendance_date: '2026-10-12', status: 'Present', shift: 'Night Shift (10PM - 7AM)', in_time: '21:58:45', out_time: '07:05:10' },
    { name: 'ATT-2026-00108', employee_name: 'Rohan Joshi', employee: 'HR-EMP-00008', attendance_date: '2026-10-11', status: 'Present', shift: 'Morning Shift (9AM - 6PM)', in_time: '09:05:00', out_time: '18:15:00' },
  ],
  'Shift Type': [
    { name: 'Morning Shift', start_time: '09:00:00', end_time: '18:00:00', holiday_list: 'National Holidays 2026', enable_auto_attendance: 1 },
    { name: 'Evening Shift', start_time: '14:00:00', end_time: '23:00:00', holiday_list: 'National Holidays 2026', enable_auto_attendance: 1 },
    { name: 'Night Shift', start_time: '22:00:00', end_time: '07:00:00', holiday_list: 'National Holidays 2026', enable_auto_attendance: 1 },
    { name: 'General Shift', start_time: '10:00:00', end_time: '19:00:00', holiday_list: 'National Holidays 2026', enable_auto_attendance: 1 },
  ],
  'Shift Assignment': [
    { name: 'SHF-ASGN-0001', employee_name: 'Rahul Sharma', employee: 'HR-EMP-00001', shift_type: 'Morning Shift', start_date: '2026-01-01', end_date: '2026-12-31', status: 'Active' },
    { name: 'SHF-ASGN-0002', employee_name: 'Priya Patel', employee: 'HR-EMP-00002', shift_type: 'Morning Shift', start_date: '2026-01-01', end_date: '2026-12-31', status: 'Active' },
    { name: 'SHF-ASGN-0003', employee_name: 'Amit Kumar', employee: 'HR-EMP-00003', shift_type: 'General Shift', start_date: '2026-01-01', end_date: '2026-12-31', status: 'Active' },
    { name: 'SHF-ASGN-0004', employee_name: 'Karan Verma', employee: 'HR-EMP-00007', shift_type: 'Night Shift', start_date: '2026-02-01', end_date: '2026-12-31', status: 'Active' },
    { name: 'SHF-ASGN-0005', employee_name: 'Sneha Reddy', employee: 'HR-EMP-00004', shift_type: 'Morning Shift', start_date: '2026-01-01', end_date: '2026-12-31', status: 'Active' },
  ],
  'Shift Request': [
    { name: 'SR-2026-0001', employee_name: 'Amit Kumar', shift_type: 'Morning Shift', from_date: '2026-10-15', to_date: '2026-10-25', status: 'Approved', approver: 'Administrator' },
    { name: 'SR-2026-0002', employee_name: 'Vikram Singh', shift_type: 'General Shift', from_date: '2026-10-20', to_date: '2026-10-31', status: 'Submitted', approver: 'Administrator' },
    { name: 'SR-2026-0003', employee_name: 'Karan Verma', shift_type: 'Evening Shift', from_date: '2026-11-01', to_date: '2026-11-15', status: 'Draft', approver: 'Administrator' },
  ],
  'Attendance Request': [
    { name: 'AR-2026-0001', employee_name: 'Priya Patel', from_date: '2026-10-08', to_date: '2026-10-08', reason: 'Client Onsite Meeting at Electronics City', status: 'Approved' },
    { name: 'AR-2026-0002', employee_name: 'Rahul Sharma', from_date: '2026-10-05', to_date: '2026-10-05', reason: 'Biometric Scanner Sync Delay', status: 'Approved' },
    { name: 'AR-2026-0003', employee_name: 'Sneha Reddy', from_date: '2026-10-10', to_date: '2026-10-10', reason: 'Work From Home Approved by Lead', status: 'Submitted' },
    { name: 'AR-2026-0004', employee_name: 'Rohan Joshi', from_date: '2026-10-09', to_date: '2026-10-09', reason: 'Medical Appointment First Half', status: 'Approved' },
  ],
  'Employee Checkin': [
    { name: 'CHK-2026-00081', employee_name: 'Rahul Sharma', log_type: 'IN', time: '2026-10-12 09:02:15', device_id: 'BioMetric-Terminal-01' },
    { name: 'CHK-2026-00082', employee_name: 'Priya Patel', log_type: 'IN', time: '2026-10-12 08:58:30', device_id: 'BioMetric-Terminal-01' },
    { name: 'CHK-2026-00083', employee_name: 'Amit Kumar', log_type: 'IN', time: '2026-10-12 09:55:00', device_id: 'BioMetric-Terminal-02' },
    { name: 'CHK-2026-00084', employee_name: 'Vikram Singh', log_type: 'IN', time: '2026-10-12 09:10:00', device_id: 'WebPortal-Punch' },
    { name: 'CHK-2026-00085', employee_name: 'Vikram Singh', log_type: 'OUT', time: '2026-10-12 13:30:00', device_id: 'WebPortal-Punch' },
    { name: 'CHK-2026-00086', employee_name: 'Ananya Deshmukh', log_type: 'IN', time: '2026-10-12 08:55:10', device_id: 'BioMetric-Terminal-01' },
    { name: 'CHK-2026-00087', employee_name: 'Karan Verma', log_type: 'IN', time: '2026-10-11 21:58:45', device_id: 'BioMetric-Terminal-03' },
    { name: 'CHK-2026-00088', employee_name: 'Karan Verma', log_type: 'OUT', time: '2026-10-12 07:05:10', device_id: 'BioMetric-Terminal-03' },
  ],
  'Holiday List': [
    { name: 'Corporate Holidays 2026', holiday_list_name: 'Corporate Holidays 2026', from_date: '2026-01-01', to_date: '2026-12-31', total_holidays: 14, country: 'India' },
    { name: 'Regional Factory Holidays 2026', holiday_list_name: 'Regional Factory Holidays 2026', from_date: '2026-01-01', to_date: '2026-12-31', total_holidays: 12, country: 'India' },
  ],
  'Overtime Type': [
    { name: 'Weekend Overtime', overtime_type: 'Weekend Overtime', rate_multiplier: 1.5, is_active: 1 },
    { name: 'Holiday Overtime', overtime_type: 'Holiday Overtime', rate_multiplier: 2.0, is_active: 1 },
    { name: 'Standard Extra Hours', overtime_type: 'Standard Extra Hours', rate_multiplier: 1.25, is_active: 1 },
  ],
  'Overtime Slip': [
    { name: 'OTS-2026-001', employee_name: 'Karan Verma', date: '2026-10-04', overtime_hours: 4.5, rate_multiplier: 1.5, status: 'Approved' },
    { name: 'OTS-2026-002', employee_name: 'Amit Kumar', date: '2026-10-05', overtime_hours: 3.0, rate_multiplier: 1.25, status: 'Submitted' },
  ],
  'Shift Location': [
    { name: 'Bangalore HQ - Sompura Gate', location_name: 'Bangalore HQ (Nimble Vision)', address: 'Sompura Gate, BMT Marutham Gardens, Sarjapura' },
    { name: 'Electronic City Innovation Center', location_name: 'Electronic City Innovation Center', address: 'Phase 1, E-City' },
    { name: 'Remote Hub', location_name: 'Remote Hub', address: 'All India Remote' },
  ],
  'Shift Schedule': [
    { name: 'Standard 5-Day Mon-Fri', schedule_name: 'Standard 5-Day Mon-Fri', weekly_off: 'Saturday, Sunday' },
    { name: 'Rotating 6-Day Production', schedule_name: 'Rotating 6-Day Production', weekly_off: 'Sunday' },
  ],
  'Timesheet': [
    { name: 'TS-2026-0001', employee_name: 'Rahul Sharma', start_date: '2026-10-05', end_date: '2026-10-09', total_hours: 42.5, status: 'Submitted' },
    { name: 'TS-2026-0002', employee_name: 'Priya Patel', start_date: '2026-10-05', end_date: '2026-10-09', total_hours: 40.0, status: 'Approved' },
    { name: 'TS-2026-0003', employee_name: 'Amit Kumar', start_date: '2026-10-05', end_date: '2026-10-09', total_hours: 44.0, status: 'Draft' },
  ],
  'Activity Type': [
    { name: 'Software Engineering', activity_type: 'Software Engineering', billing_rate: 1800, costing_rate: 900 },
    { name: 'Client Onsite Integration', activity_type: 'Client Onsite Integration', billing_rate: 2200, costing_rate: 1100 },
    { name: 'Architecture Review', activity_type: 'Architecture Review', billing_rate: 2500, costing_rate: 1300 },
  ],

  // ================= 2. LEAVES =================
  'Leave Application': [
    { name: 'LAP-2026-0001', employee_name: 'Sneha Reddy', employee: 'HR-EMP-00004', leave_type: 'Privilege Leave', from_date: '2026-10-12', to_date: '2026-10-14', total_leave_days: 3, status: 'Approved', leave_approver: 'Administrator' },
    { name: 'LAP-2026-0002', employee_name: 'Rahul Sharma', employee: 'HR-EMP-00001', leave_type: 'Casual Leave', from_date: '2026-10-18', to_date: '2026-10-19', total_leave_days: 2, status: 'Approved', leave_approver: 'Administrator' },
    { name: 'LAP-2026-0003', employee_name: 'Amit Kumar', employee: 'HR-EMP-00003', leave_type: 'Sick Leave', from_date: '2026-10-06', to_date: '2026-10-07', total_leave_days: 2, status: 'Approved', leave_approver: 'Administrator' },
    { name: 'LAP-2026-0004', employee_name: 'Priya Patel', employee: 'HR-EMP-00002', leave_type: 'Casual Leave', from_date: '2026-10-24', to_date: '2026-10-24', total_leave_days: 1, status: 'Open', leave_approver: 'Administrator' },
    { name: 'LAP-2026-0005', employee_name: 'Vikram Singh', employee: 'HR-EMP-00005', leave_type: 'Compensatory Off', from_date: '2026-10-28', to_date: '2026-10-28', total_leave_days: 1, status: 'Open', leave_approver: 'Administrator' },
  ],
  'Leave Allocation': [
    { name: 'LAL-2026-0001', employee_name: 'Rahul Sharma', leave_type: 'Privilege Leave', from_date: '2026-01-01', to_date: '2026-12-31', new_leaves_allocated: 18, total_leaves_allocated: 18 },
    { name: 'LAL-2026-0002', employee_name: 'Rahul Sharma', leave_type: 'Casual Leave', from_date: '2026-01-01', to_date: '2026-12-31', new_leaves_allocated: 12, total_leaves_allocated: 12 },
    { name: 'LAL-2026-0003', employee_name: 'Priya Patel', leave_type: 'Privilege Leave', from_date: '2026-01-01', to_date: '2026-12-31', new_leaves_allocated: 18, total_leaves_allocated: 18 },
    { name: 'LAL-2026-0004', employee_name: 'Priya Patel', leave_type: 'Casual Leave', from_date: '2026-01-01', to_date: '2026-12-31', new_leaves_allocated: 12, total_leaves_allocated: 12 },
    { name: 'LAL-2026-0005', employee_name: 'Amit Kumar', leave_type: 'Sick Leave', from_date: '2026-01-01', to_date: '2026-12-31', new_leaves_allocated: 10, total_leaves_allocated: 10 },
    { name: 'LAL-2026-0006', employee_name: 'Sneha Reddy', leave_type: 'Privilege Leave', from_date: '2026-01-01', to_date: '2026-12-31', new_leaves_allocated: 18, total_leaves_allocated: 18 },
  ],
  'Leave Type': [
    { name: 'Casual Leave', max_days_allowed: 12, is_carry_forward: 0, is_lwp: 0, is_optional: 0 },
    { name: 'Sick Leave', max_days_allowed: 10, is_carry_forward: 1, is_lwp: 0, is_optional: 0 },
    { name: 'Privilege Leave', max_days_allowed: 18, is_carry_forward: 1, is_lwp: 0, is_optional: 0 },
    { name: 'Compensatory Off', max_days_allowed: 15, is_carry_forward: 0, is_lwp: 0, is_optional: 0 },
    { name: 'Leave Without Pay', max_days_allowed: 365, is_carry_forward: 0, is_lwp: 1, is_optional: 0 },
  ],
  'Leave Policy': [
    { name: 'Standard Corporate Leave Policy', leave_policy_name: 'Standard Corporate Leave Policy', company: 'Nimble Vision PVT LTD' },
    { name: 'Engineering Team Leave Policy', leave_policy_name: 'Engineering Team Leave Policy', company: 'Nimble Vision PVT LTD' },
  ],
  'Leave Policy Assignment': [
    { name: 'LPA-2026-0001', employee_name: 'Rahul Sharma', leave_policy: 'Standard Corporate Leave Policy', effective_from: '2026-01-01' },
    { name: 'LPA-2026-0002', employee_name: 'Priya Patel', leave_policy: 'Standard Corporate Leave Policy', effective_from: '2026-01-01' },
    { name: 'LPA-2026-0003', employee_name: 'Amit Kumar', leave_policy: 'Engineering Team Leave Policy', effective_from: '2026-01-01' },
  ],
  'Leave Period': [
    { name: 'Calendar Year 2026', from_date: '2026-01-01', to_date: '2026-12-31', is_active: 1 },
    { name: 'Fiscal Year 2026-27', from_date: '2026-04-01', to_date: '2027-03-31', is_active: 1 },
  ],
  'Leave Block List': [
    { name: 'Year-End Release Freeze', leave_block_list_name: 'Year-End Release Freeze', company: 'Nimble Vision PVT LTD' },
  ],
  'Leave Encashment': [
    { name: 'LE-2026-0001', employee_name: 'Rahul Sharma', leave_type: 'Privilege Leave', encashment_days: 5, encashment_amount: 14500, status: 'Submitted' },
    { name: 'LE-2026-0002', employee_name: 'Amit Kumar', leave_type: 'Privilege Leave', encashment_days: 4, encashment_amount: 11200, status: 'Draft' },
  ],
  'Compensatory Off Request': [
    { name: 'COR-2026-0001', employee_name: 'Rahul Sharma', work_end_date: '2026-10-04', reason: 'Weekend Production Deployment Support', status: 'Approved' },
    { name: 'COR-2026-0002', employee_name: 'Vikram Singh', work_end_date: '2026-10-02', reason: 'National Holiday Emergency Maintenance', status: 'Approved' },
  ],
  'Holiday List Assignment': [
    { name: 'HLA-2026-0001', employee_name: 'Rahul Sharma', holiday_list: 'Corporate Holidays 2026' },
    { name: 'HLA-2026-0002', employee_name: 'Priya Patel', holiday_list: 'Corporate Holidays 2026' },
  ],

  // ================= 3. EXPENSES =================
  'Expense Claim': [
    { name: 'EXP-2026-0001', employee_name: 'Rahul Sharma', claim_date: '2026-10-08', total_claimed_amount: 4500, approval_status: 'Approved', expense_approver: 'Administrator', total_sanctioned_amount: 4500 },
    { name: 'EXP-2026-0002', employee_name: 'Priya Patel', claim_date: '2026-10-09', total_claimed_amount: 2800, approval_status: 'Approved', expense_approver: 'Administrator', total_sanctioned_amount: 2800 },
    { name: 'EXP-2026-0003', employee_name: 'Amit Kumar', claim_date: '2026-10-10', total_claimed_amount: 1450, approval_status: 'Submitted', expense_approver: 'Administrator', total_sanctioned_amount: 1450 },
    { name: 'EXP-2026-0004', employee_name: 'Sneha Reddy', claim_date: '2026-10-11', total_claimed_amount: 6200, approval_status: 'Draft', expense_approver: 'Administrator', total_sanctioned_amount: 0 },
    { name: 'EXP-2026-0005', employee_name: 'Vikram Singh', claim_date: '2026-10-11', total_claimed_amount: 3100, approval_status: 'Submitted', expense_approver: 'Administrator', total_sanctioned_amount: 3100 },
  ],
  'Expense Claim Type': [
    { name: 'Travel & Commute', expense_type: 'Travel & Commute', description: 'Flights, trains, cabs, and auto fare' },
    { name: 'Client Entertainment & Meals', expense_type: 'Client Entertainment & Meals', description: 'Business dinner and client hospitality' },
    { name: 'Mobile & Internet Reimbursement', expense_type: 'Mobile & Internet Reimbursement', description: 'Monthly work connectivity allowance' },
    { name: 'Office Supplies & Books', expense_type: 'Office Supplies & Books', description: 'Stationery and reference books' },
    { name: 'Software Subscriptions', expense_type: 'Software Subscriptions', description: 'Developer tooling and cloud licenses' },
  ],
  'Employee Advance': [
    { name: 'ADV-2026-0001', employee_name: 'Rahul Sharma', posting_date: '2026-10-01', advance_amount: 15000, paid_amount: 15000, status: 'Paid', purpose: 'Client Onsite Bangalore Expo' },
    { name: 'ADV-2026-0002', employee_name: 'Amit Kumar', posting_date: '2026-10-05', advance_amount: 8000, paid_amount: 8000, status: 'Paid', purpose: 'Hardware Sensor Testing Kit' },
    { name: 'ADV-2026-0003', employee_name: 'Sneha Reddy', posting_date: '2026-10-10', advance_amount: 12000, paid_amount: 0, status: 'Unpaid', purpose: 'Conference Registration & Lodging' },
  ],
  'Travel Request': [
    { name: 'TR-2026-0001', employee_name: 'Rahul Sharma', departure_date: '2026-10-20', purpose_of_visit: 'Client Technical Workshop - Delhi NCR', status: 'Approved' },
    { name: 'TR-2026-0002', employee_name: 'Priya Patel', departure_date: '2026-11-02', purpose_of_visit: 'Annual IoT Tech Summit - Mumbai', status: 'Approved' },
    { name: 'TR-2026-0003', employee_name: 'Amit Kumar', departure_date: '2026-11-15', purpose_of_visit: 'Vendor Qualification Audit - Pune', status: 'Submitted' },
  ],
  'Purpose of Travel': [
    { name: 'Client Workshop', purpose: 'Client Workshop' },
    { name: 'Conference & Exhibition', purpose: 'Conference & Exhibition' },
    { name: 'Vendor Audit', purpose: 'Vendor Audit' },
  ],
  'Vehicle': [
    { name: 'KA-01-MJ-9921', license_plate: 'KA-01-MJ-9921', make: 'Toyota', model: 'Innova Crysta', status: 'Active', vehicle_type: 'Four Wheeler' },
    { name: 'KA-04-AB-4021', license_plate: 'KA-04-AB-4021', make: 'Honda', model: 'City ZX', status: 'Active', vehicle_type: 'Four Wheeler' },
    { name: 'KA-51-EF-8812', license_plate: 'KA-51-EF-8812', make: 'Tata', model: 'Nexon EV', status: 'Active', vehicle_type: 'Electric Vehicle' },
  ],
  'Vehicle Log': [
    { name: 'VLOG-2026-001', license_plate: 'KA-01-MJ-9921', employee_name: 'Ramesh Kumar', date: '2026-10-08', odometer: 42150, fuel_qty: 45, fuel_price: 4500 },
    { name: 'VLOG-2026-002', license_plate: 'KA-04-AB-4021', employee_name: 'Suresh Patil', date: '2026-10-10', odometer: 28400, fuel_qty: 35, fuel_price: 3600 },
  ],
  'Driver': [
    { name: 'DRV-001', full_name: 'Ramesh Kumar', license_number: 'KA-01-2018-004912', status: 'Active', cell_number: '+91 98450 11223' },
    { name: 'DRV-002', full_name: 'Suresh Patil', license_number: 'KA-04-2020-008311', status: 'Active', cell_number: '+91 98860 33445' },
  ],
  'Payment Entry': [
    { name: 'PE-2026-00101', payment_type: 'Pay', party_type: 'Employee', party: 'HR-EMP-00001', paid_amount: 4500, status: 'Submitted', mode_of_payment: 'Bank Transfer' },
    { name: 'PE-2026-00102', payment_type: 'Pay', party_type: 'Employee', party: 'HR-EMP-00002', paid_amount: 2800, status: 'Submitted', mode_of_payment: 'Bank Transfer' },
    { name: 'PE-2026-00103', payment_type: 'Pay', party_type: 'Employee', party: 'HR-EMP-00001', paid_amount: 15000, status: 'Submitted', mode_of_payment: 'Bank Transfer' },
  ],
  'Journal Entry': [
    { name: 'JV-2026-00041', voucher_type: 'Journal Entry', posting_date: '2026-10-08', total_debit: 4500, total_credit: 4500, docstatus: 1 },
    { name: 'JV-2026-00042', voucher_type: 'Journal Entry', posting_date: '2026-10-09', total_debit: 2800, total_credit: 2800, docstatus: 1 },
  ],

  // ================= 4. TAX & BENEFITS =================
  'Employee Tax Exemption Declaration': [
    { name: 'TED-2026-0001', employee_name: 'Rahul Sharma', employee: 'HR-EMP-00001', payroll_period: '2026-2027', total_exemption_amount: 150000, status: 'Approved' },
    { name: 'TED-2026-0002', employee_name: 'Priya Patel', employee: 'HR-EMP-00002', payroll_period: '2026-2027', total_exemption_amount: 150000, status: 'Approved' },
    { name: 'TED-2026-0003', employee_name: 'Amit Kumar', employee: 'HR-EMP-00003', payroll_period: '2026-2027', total_exemption_amount: 120000, status: 'Submitted' },
    { name: 'TED-2026-0004', employee_name: 'Sneha Reddy', employee: 'HR-EMP-00004', payroll_period: '2026-2027', total_exemption_amount: 145000, status: 'Approved' },
  ],
  'Employee Tax Exemption Proof Submission': [
    { name: 'TEP-2026-0001', employee_name: 'Rahul Sharma', submission_date: '2026-10-02', total_claimed_amount: 150000, status: 'Approved' },
    { name: 'TEP-2026-0002', employee_name: 'Priya Patel', submission_date: '2026-10-05', total_claimed_amount: 150000, status: 'Approved' },
    { name: 'TEP-2026-0003', employee_name: 'Amit Kumar', submission_date: '2026-10-09', total_claimed_amount: 120000, status: 'Under Review' },
  ],
  'Income Tax Slab': [
    { name: 'New Tax Regime FY 2026-27', slab_name: 'New Tax Regime FY 2026-27', effective_from: '2026-04-01', allow_tax_exemption: 0, standard_tax_exemption_amount: 75000 },
    { name: 'Old Tax Regime FY 2026-27', slab_name: 'Old Tax Regime FY 2026-27', effective_from: '2026-04-01', allow_tax_exemption: 1, standard_tax_exemption_amount: 50000 },
  ],
  'Employee Benefit Application': [
    { name: 'EBA-2026-0001', employee_name: 'Rahul Sharma', date: '2026-04-01', max_benefits: 60000, status: 'Approved' },
    { name: 'EBA-2026-0002', employee_name: 'Priya Patel', date: '2026-04-01', max_benefits: 60000, status: 'Approved' },
    { name: 'EBA-2026-0003', employee_name: 'Amit Kumar', date: '2026-04-01', max_benefits: 48000, status: 'Approved' },
  ],
  'Employee Benefit Claim': [
    { name: 'EBC-2026-0001', employee_name: 'Rahul Sharma', claim_date: '2026-09-30', claimed_amount: 15000, status: 'Approved' },
    { name: 'EBC-2026-0002', employee_name: 'Priya Patel', claim_date: '2026-09-30', claimed_amount: 15000, status: 'Approved' },
    { name: 'EBC-2026-0003', employee_name: 'Amit Kumar', claim_date: '2026-10-05', claimed_amount: 12000, status: 'Submitted' },
  ],
  'Employee Tax Exemption Category': [
    { name: 'Section 80C (PPF, ELSS, Life Insurance)', max_amount: 150000, description: 'Statutory life investments & retirement funds' },
    { name: 'Section 80D (Health Insurance Premium)', max_amount: 50000, description: 'Medical insurance for self and family' },
    { name: 'Section 80CCD (National Pension Scheme)', max_amount: 50000, description: 'Additional tier 1 NPS deduction' },
    { name: 'Section 10(13A) House Rent Allowance', max_amount: 240000, description: 'Rental agreement exemption' },
  ],

  // ================= 5. PERFORMANCE =================
  'Appraisal': [
    { name: 'APP-2026-0001', employee_name: 'Rahul Sharma', appraisal_cycle: 'FY 2025-26 Annual Review', total_score: '4.6 / 5.0', status: 'Completed', remarks: 'Outstanding technical leadership in IoT architecture' },
    { name: 'APP-2026-0002', employee_name: 'Priya Patel', appraisal_cycle: 'FY 2025-26 Annual Review', total_score: '4.4 / 5.0', status: 'Completed', remarks: 'Exceptional firmware optimization and delivery speed' },
    { name: 'APP-2026-0003', employee_name: 'Amit Kumar', appraisal_cycle: 'FY 2025-26 Annual Review', total_score: '4.1 / 5.0', status: 'Completed', remarks: 'High quality sensor analytics algorithms' },
    { name: 'APP-2026-0004', employee_name: 'Sneha Reddy', appraisal_cycle: 'H1 2026 Mid-Year Cycle', total_score: '4.5 / 5.0', status: 'In Progress', remarks: 'Exceeded customer onboarding benchmarks' },
    { name: 'APP-2026-0005', employee_name: 'Vikram Singh', appraisal_cycle: 'H1 2026 Mid-Year Cycle', total_score: '4.0 / 5.0', status: 'In Progress', remarks: 'Consistent reliability in deployment automation' },
  ],
  'Appraisal Cycle': [
    { name: 'FY 2025-26 Annual Review', cycle_name: 'FY 2025-26 Annual Review', start_date: '2026-03-01', end_date: '2026-04-30', status: 'Completed' },
    { name: 'H1 2026 Mid-Year Cycle', cycle_name: 'H1 2026 Mid-Year Cycle', start_date: '2026-09-01', end_date: '2026-10-31', status: 'Active' },
    { name: 'Q4 2026 Sprint Review', cycle_name: 'Q4 2026 Sprint Review', start_date: '2026-11-01', end_date: '2026-12-31', status: 'Upcoming' },
  ],
  'Appraisal Template': [
    { name: 'Software Engineer Evaluation Template', template_title: 'Software Engineer Evaluation Template', rating_scale: '1-5 Stars' },
    { name: 'Operations & Support Appraisal', template_title: 'Operations & Support Appraisal', rating_scale: '1-5 Stars' },
    { name: 'Leadership & Management Review', template_title: 'Leadership & Management Review', rating_scale: '1-5 Stars' },
  ],
  'Goal': [
    { name: 'GOAL-2026-001', goal_name: 'Deliver Next-Gen IoT Gateway Firmware v3', employee_name: 'Rahul Sharma', progress: 90, status: 'In Progress', priority: 'High' },
    { name: 'GOAL-2026-002', goal_name: 'Achieve 99.95% API Pipeline Uptime', employee_name: 'Priya Patel', progress: 100, status: 'Achieved', priority: 'Critical' },
    { name: 'GOAL-2026-003', goal_name: 'Reduce Cloud Ingestion Latency by 40%', employee_name: 'Amit Kumar', progress: 75, status: 'In Progress', priority: 'High' },
    { name: 'GOAL-2026-004', goal_name: 'Automate Zero-Touch Sensor Calibration', employee_name: 'Sneha Reddy', progress: 85, status: 'In Progress', priority: 'Medium' },
    { name: 'GOAL-2026-005', goal_name: 'ISO 27001 Security Hardening Compliance', employee_name: 'Vikram Singh', progress: 95, status: 'In Progress', priority: 'Critical' },
  ],
  'KRA': [
    { name: 'System Architecture & Scalability', title: 'System Architecture & Scalability', description: 'Design microservices and cloud telemetry handling >100k requests/min' },
    { name: 'Code Quality & Test Coverage', title: 'Code Quality & Test Coverage', description: 'Maintain >85% unit test coverage and zero critical sonar vulnerabilities' },
    { name: 'Delivery Timelines & Sprint Agility', title: 'Delivery Timelines & Sprint Agility', description: 'Complete 95% of committed sprint user stories on time' },
    { name: 'Customer Technical Satisfaction', title: 'Customer Technical Satisfaction', description: 'Resolve enterprise technical escalations within SLA < 4 hours' },
  ],
  'Employee Performance Feedback': [
    { name: 'FB-2026-0001', employee_name: 'Rahul Sharma', reviewer_name: 'Chief Technology Officer', feedback: 'Exceptional leadership across multiple cross-functional squads', rating: '5/5' },
    { name: 'FB-2026-0002', employee_name: 'Priya Patel', reviewer_name: 'Lead Architect', feedback: 'Proactive problem solving in low-power firmware architecture', rating: '4.5/5' },
  ],
  'Employee Promotion': [
    { name: 'PRM-2026-001', employee_name: 'Rahul Sharma', promotion_date: '2026-04-01', current_designation: 'Senior Architect', new_designation: 'Principal Engineer', status: 'Approved' },
    { name: 'PRM-2026-002', employee_name: 'Priya Patel', promotion_date: '2026-04-01', current_designation: 'Firmware Engineer', new_designation: 'Senior Firmware Engineer', status: 'Approved' },
  ],
  'Employee Feedback Criteria': [
    { name: 'Technical Competence', criteria: 'Technical Competence', weightage: 30 },
    { name: 'Collaboration & Teamwork', criteria: 'Collaboration & Teamwork', weightage: 25 },
    { name: 'Ownership & Initiative', criteria: 'Ownership & Initiative', weightage: 25 },
    { name: 'Innovation & Problem Solving', criteria: 'Innovation & Problem Solving', weightage: 20 },
  ],
};

export const FALLBACK_REPORTS_DATA: Record<string, { columns: any[]; result: any[] }> = {
  'Monthly Attendance Sheet': {
    columns: [
      { fieldname: 'employee', label: 'Employee ID' },
      { fieldname: 'employee_name', label: 'Employee Name' },
      { fieldname: 'department', label: 'Department' },
      { fieldname: 'present_days', label: 'Total Present' },
      { fieldname: 'absent_days', label: 'Total Absent' },
      { fieldname: 'leave_days', label: 'Leaves' },
      { fieldname: 'attendance_percent', label: 'Attendance %' },
    ],
    result: [
      { employee: 'HR-EMP-00001', employee_name: 'Rahul Sharma', department: 'Engineering', present_days: 22, absent_days: 0, leave_days: 0, attendance_percent: '100%' },
      { employee: 'HR-EMP-00002', employee_name: 'Priya Patel', department: 'Firmware & Hardware', present_days: 21, absent_days: 0, leave_days: 1, attendance_percent: '95.5%' },
      { employee: 'HR-EMP-00003', employee_name: 'Amit Kumar', department: 'Data Science', present_days: 22, absent_days: 0, leave_days: 0, attendance_percent: '100%' },
      { employee: 'HR-EMP-00004', employee_name: 'Sneha Reddy', department: 'Product Management', present_days: 19, absent_days: 0, leave_days: 3, attendance_percent: '86.4%' },
      { employee: 'HR-EMP-00005', employee_name: 'Vikram Singh', department: 'DevOps & Cloud', present_days: 21.5, absent_days: 0, leave_days: 0.5, attendance_percent: '97.7%' },
      { employee: 'HR-EMP-00006', employee_name: 'Ananya Deshmukh', department: 'UI/UX Design', present_days: 22, absent_days: 0, leave_days: 0, attendance_percent: '100%' },
    ],
  },
  'Shift Attendance': {
    columns: [
      { fieldname: 'employee_name', label: 'Employee Name' },
      { fieldname: 'shift_type', label: 'Shift Type' },
      { fieldname: 'date', label: 'Date' },
      { fieldname: 'in_time', label: 'Punch In' },
      { fieldname: 'out_time', label: 'Punch Out' },
      { fieldname: 'working_hours', label: 'Hours Logged' },
      { fieldname: 'status', label: 'Status' },
    ],
    result: [
      { employee_name: 'Rahul Sharma', shift_type: 'Morning Shift', date: '2026-10-12', in_time: '09:02:15', out_time: '18:05:40', working_hours: '9h 03m', status: 'Present' },
      { employee_name: 'Priya Patel', shift_type: 'Morning Shift', date: '2026-10-12', in_time: '08:58:30', out_time: '18:10:00', working_hours: '9h 11m', status: 'Present' },
      { employee_name: 'Amit Kumar', shift_type: 'General Shift', date: '2026-10-12', in_time: '09:55:00', out_time: '19:02:30', working_hours: '9h 07m', status: 'Present' },
      { employee_name: 'Vikram Singh', shift_type: 'Morning Shift', date: '2026-10-12', in_time: '09:10:00', out_time: '13:30:00', working_hours: '4h 20m', status: 'Half Day' },
      { employee_name: 'Karan Verma', shift_type: 'Night Shift', date: '2026-10-11', in_time: '21:58:45', out_time: '07:05:10', working_hours: '9h 06m', status: 'Present' },
    ],
  },
  'Employee Hours Utilization Based On Timesheet': {
    columns: [
      { fieldname: 'employee_name', label: 'Employee Name' },
      { fieldname: 'project', label: 'Active Project' },
      { fieldname: 'logged_hours', label: 'Logged Hours' },
      { fieldname: 'billable_hours', label: 'Billable Hours' },
      { fieldname: 'utilization_percent', label: 'Utilization %' },
    ],
    result: [
      { employee_name: 'Rahul Sharma', project: 'Smart Water IoT Metering Platform', logged_hours: 42.5, billable_hours: 40.0, utilization_percent: '94.1%' },
      { employee_name: 'Priya Patel', project: 'Sensor Telemetry Gateway v3', logged_hours: 40.0, billable_hours: 38.5, utilization_percent: '96.2%' },
      { employee_name: 'Amit Kumar', project: 'Leak Detection Analytics Model', logged_hours: 44.0, billable_hours: 42.0, utilization_percent: '95.4%' },
      { employee_name: 'Vikram Singh', project: 'Kubernetes Multi-region Infrastructure', logged_hours: 41.0, billable_hours: 39.0, utilization_percent: '95.1%' },
    ],
  },
  'Project Profitability': {
    columns: [
      { fieldname: 'project', label: 'Project Name' },
      { fieldname: 'total_billed', label: 'Total Billed (₹)' },
      { fieldname: 'total_cost', label: 'Direct Labor Cost (₹)' },
      { fieldname: 'gross_profit', label: 'Gross Profit (₹)' },
      { fieldname: 'margin_percent', label: 'Margin %' },
    ],
    result: [
      { project: 'Smart Water IoT Metering Platform', total_billed: '₹4,500,000', total_cost: '₹1,950,000', gross_profit: '₹2,550,000', margin_percent: '56.7%' },
      { project: 'Sensor Telemetry Gateway v3', total_billed: '₹2,800,000', total_cost: '₹1,120,000', gross_profit: '₹1,680,000', margin_percent: '60.0%' },
      { project: 'Leak Detection Analytics Model', total_billed: '₹1,950,000', total_cost: '₹840,000', gross_profit: '₹1,110,000', margin_percent: '56.9%' },
    ],
  },
  'Employee Leave Balance': {
    columns: [
      { fieldname: 'employee', label: 'Employee ID' },
      { fieldname: 'employee_name', label: 'Employee Name' },
      { fieldname: 'leave_type', label: 'Leave Type' },
      { fieldname: 'allocated', label: 'Allocated' },
      { fieldname: 'used', label: 'Used' },
      { fieldname: 'pending', label: 'Pending Approval' },
      { fieldname: 'balance', label: 'Current Balance' },
    ],
    result: [
      { employee: 'HR-EMP-00001', employee_name: 'Rahul Sharma', leave_type: 'Privilege Leave', allocated: 18, used: 2, pending: 0, balance: 16 },
      { employee: 'HR-EMP-00001', employee_name: 'Rahul Sharma', leave_type: 'Casual Leave', allocated: 12, used: 3, pending: 0, balance: 9 },
      { employee: 'HR-EMP-00002', employee_name: 'Priya Patel', leave_type: 'Privilege Leave', allocated: 18, used: 1, pending: 0, balance: 17 },
      { employee: 'HR-EMP-00002', employee_name: 'Priya Patel', leave_type: 'Casual Leave', allocated: 12, used: 2, pending: 1, balance: 9 },
      { employee: 'HR-EMP-00003', employee_name: 'Amit Kumar', leave_type: 'Sick Leave', allocated: 10, used: 2, pending: 0, balance: 8 },
      { employee: 'HR-EMP-00004', employee_name: 'Sneha Reddy', leave_type: 'Privilege Leave', allocated: 18, used: 3, pending: 0, balance: 15 },
    ],
  },
  'Employee Leave Balance Summary': {
    columns: [
      { fieldname: 'department', label: 'Department' },
      { fieldname: 'total_staff', label: 'Total Employees' },
      { fieldname: 'total_allocated', label: 'Total Quota' },
      { fieldname: 'total_taken', label: 'Leaves Taken' },
      { fieldname: 'remaining_quota', label: 'Remaining Balance' },
    ],
    result: [
      { department: 'Engineering', total_staff: 8, total_allocated: 240, total_taken: 28, remaining_quota: 212 },
      { department: 'Firmware & Hardware', total_staff: 6, total_allocated: 180, total_taken: 19, remaining_quota: 161 },
      { department: 'Data Science', total_staff: 4, total_allocated: 120, total_taken: 11, remaining_quota: 109 },
      { department: 'Product Management', total_staff: 3, total_allocated: 90, total_taken: 14, remaining_quota: 76 },
      { department: 'DevOps & Cloud', total_staff: 4, total_allocated: 120, total_taken: 15, remaining_quota: 105 },
    ],
  },
  'Employees working on a holiday': {
    columns: [
      { fieldname: 'employee_name', label: 'Employee Name' },
      { fieldname: 'holiday_date', label: 'Holiday Date' },
      { fieldname: 'holiday_name', label: 'Holiday Name' },
      { fieldname: 'punch_in', label: 'Punch In' },
      { fieldname: 'punch_out', label: 'Punch Out' },
      { fieldname: 'comp_off_granted', label: 'Comp-Off Granted' },
    ],
    result: [
      { employee_name: 'Vikram Singh', holiday_date: '2026-10-02', holiday_name: 'Gandhi Jayanti', punch_in: '09:15:00', punch_out: '18:30:00', comp_off_granted: 'Yes (COR-2026-0002)' },
      { employee_name: 'Rahul Sharma', holiday_date: '2026-10-04', holiday_name: 'Sunday Maintenance Roster', punch_in: '10:00:00', punch_out: '16:00:00', comp_off_granted: 'Yes (COR-2026-0001)' },
    ],
  },
  'Unpaid Expense Claim': {
    columns: [
      { fieldname: 'name', label: 'Claim ID' },
      { fieldname: 'employee_name', label: 'Employee Name' },
      { fieldname: 'claim_date', label: 'Claim Date' },
      { fieldname: 'total_claimed_amount', label: 'Claimed (₹)' },
      { fieldname: 'total_sanctioned_amount', label: 'Sanctioned (₹)' },
      { fieldname: 'status', label: 'Approval Status' },
    ],
    result: [
      { name: 'EXP-2026-0003', employee_name: 'Amit Kumar', claim_date: '2026-10-10', total_claimed_amount: '₹1,450', total_sanctioned_amount: '₹1,450', status: 'Submitted' },
      { name: 'EXP-2026-0004', employee_name: 'Sneha Reddy', claim_date: '2026-10-11', total_claimed_amount: '₹6,200', total_sanctioned_amount: '₹0', status: 'Draft' },
      { name: 'EXP-2026-0005', employee_name: 'Vikram Singh', claim_date: '2026-10-11', total_claimed_amount: '₹3,100', total_sanctioned_amount: '₹3,100', status: 'Submitted' },
    ],
  },
  'Vehicle Expenses': {
    columns: [
      { fieldname: 'license_plate', label: 'Vehicle Number' },
      { fieldname: 'make_model', label: 'Make & Model' },
      { fieldname: 'fuel_expense', label: 'Fuel Expense (₹)' },
      { fieldname: 'maintenance_expense', label: 'Maintenance (₹)' },
      { fieldname: 'total_expense', label: 'Total Incurred (₹)' },
    ],
    result: [
      { license_plate: 'KA-01-MJ-9921', make_model: 'Toyota Innova Crysta', fuel_expense: '₹14,500', maintenance_expense: '₹3,800', total_expense: '₹18,300' },
      { license_plate: 'KA-04-AB-4021', make_model: 'Honda City ZX', fuel_expense: '₹9,800', maintenance_expense: '₹2,100', total_expense: '₹11,900' },
      { license_plate: 'KA-51-EF-8812', make_model: 'Tata Nexon EV', fuel_expense: '₹2,400', maintenance_expense: '₹1,200', total_expense: '₹3,600' },
    ],
  },
  'Income Tax Computation': {
    columns: [
      { fieldname: 'employee_name', label: 'Employee Name' },
      { fieldname: 'gross_ctc', label: 'Gross Annual CTC (₹)' },
      { fieldname: 'standard_deduction', label: 'Standard Deduction (₹)' },
      { fieldname: 'section_80c', label: 'Chapter VI-A (₹)' },
      { fieldname: 'taxable_income', label: 'Taxable Net (₹)' },
      { fieldname: 'annual_tax', label: 'Estimated Tax (₹)' },
      { fieldname: 'monthly_tds', label: 'Monthly TDS (₹)' },
    ],
    result: [
      { employee_name: 'Rahul Sharma', gross_ctc: '₹1,800,000', standard_deduction: '₹75,000', section_80c: '₹150,000', taxable_income: '₹1,575,000', annual_tax: '₹185,000', monthly_tds: '₹15,417' },
      { employee_name: 'Priya Patel', gross_ctc: '₹1,500,000', standard_deduction: '₹75,000', section_80c: '₹150,000', taxable_income: '₹1,275,000', annual_tax: '₹125,000', monthly_tds: '₹10,417' },
      { employee_name: 'Amit Kumar', gross_ctc: '₹1,350,000', standard_deduction: '₹75,000', section_80c: '₹120,000', taxable_income: '₹1,155,000', annual_tax: '₹101,000', monthly_tds: '₹8,417' },
      { employee_name: 'Sneha Reddy', gross_ctc: '₹1,650,000', standard_deduction: '₹75,000', section_80c: '₹145,000', taxable_income: '₹1,430,000', annual_tax: '₹156,000', monthly_tds: '₹13,000' },
    ],
  },
  'Income Tax Deductions': {
    columns: [
      { fieldname: 'employee_name', label: 'Employee Name' },
      { fieldname: 'payroll_month', label: 'Payroll Month' },
      { fieldname: 'gross_earnings', label: 'Gross Pay (₹)' },
      { fieldname: 'tds_deducted', label: 'TDS Withheld (₹)' },
      { fieldname: 'deposited_status', label: 'Govt Deposit Status' },
      { fieldname: 'challan_no', label: 'Challan BSR' },
    ],
    result: [
      { employee_name: 'Rahul Sharma', payroll_month: 'September 2026', gross_earnings: '₹150,000', tds_deducted: '₹15,417', deposited_status: 'Deposited', challan_no: 'BSR-0291402' },
      { employee_name: 'Priya Patel', payroll_month: 'September 2026', gross_earnings: '₹125,000', tds_deducted: '₹10,417', deposited_status: 'Deposited', challan_no: 'BSR-0291402' },
      { employee_name: 'Amit Kumar', payroll_month: 'September 2026', gross_earnings: '₹112,500', tds_deducted: '₹8,417', deposited_status: 'Deposited', challan_no: 'BSR-0291402' },
    ],
  },
  'Accrued Earnings Report': {
    columns: [
      { fieldname: 'employee_name', label: 'Employee Name' },
      { fieldname: 'basic_salary', label: 'Basic Pay (₹)' },
      { fieldname: 'hra', label: 'HRA (₹)' },
      { fieldname: 'special_allowance', label: 'Special Allowance (₹)' },
      { fieldname: 'pf_accrued', label: 'Provident Fund (₹)' },
      { fieldname: 'net_take_home', label: 'Net Take-Home (₹)' },
    ],
    result: [
      { employee_name: 'Rahul Sharma', basic_salary: '₹75,000', hra: '₹37,500', special_allowance: '₹37,500', pf_accrued: '₹9,000', net_take_home: '₹125,583' },
      { employee_name: 'Priya Patel', basic_salary: '₹62,500', hra: '₹31,250', special_allowance: '₹31,250', pf_accrued: '₹7,500', net_take_home: '₹107,083' },
      { employee_name: 'Amit Kumar', basic_salary: '₹56,250', hra: '₹28,125', special_allowance: '₹28,125', pf_accrued: '₹6,750', net_take_home: '₹97,333' },
    ],
  },
  'Appraisal Overview': {
    columns: [
      { fieldname: 'employee_name', label: 'Employee Name' },
      { fieldname: 'department', label: 'Department' },
      { fieldname: 'appraisal_cycle', label: 'Appraisal Cycle' },
      { fieldname: 'self_rating', label: 'Self Rating' },
      { fieldname: 'manager_rating', label: 'Manager Rating' },
      { fieldname: 'final_score', label: 'Final Score' },
      { fieldname: 'status', label: 'Status' },
    ],
    result: [
      { employee_name: 'Rahul Sharma', department: 'Engineering', appraisal_cycle: 'FY 2025-26 Annual Review', self_rating: '4.8 / 5.0', manager_rating: '4.6 / 5.0', final_score: '4.6 / 5.0', status: 'Completed' },
      { employee_name: 'Priya Patel', department: 'Firmware & Hardware', appraisal_cycle: 'FY 2025-26 Annual Review', self_rating: '4.5 / 5.0', manager_rating: '4.4 / 5.0', final_score: '4.4 / 5.0', status: 'Completed' },
      { employee_name: 'Amit Kumar', department: 'Data Science', appraisal_cycle: 'FY 2025-26 Annual Review', self_rating: '4.3 / 5.0', manager_rating: '4.1 / 5.0', final_score: '4.1 / 5.0', status: 'Completed' },
      { employee_name: 'Sneha Reddy', department: 'Product Management', appraisal_cycle: 'H1 2026 Mid-Year Cycle', self_rating: '4.6 / 5.0', manager_rating: '4.5 / 5.0', final_score: '4.5 / 5.0', status: 'In Progress' },
    ],
  },
  'Recruitment Analytics': {
    columns: [
      { fieldname: 'job_title', label: 'Job Opening' },
      { fieldname: 'department', label: 'Department' },
      { fieldname: 'openings', label: 'Open Positions' },
      { fieldname: 'applications', label: 'Total Applicants' },
      { fieldname: 'interviewed', label: 'Interviewed' },
      { fieldname: 'offered', label: 'Offers Extended' },
      { fieldname: 'status', label: 'Status' },
    ],
    result: [
      { job_title: 'Lead IoT Firmware Engineer', department: 'Firmware & Hardware', openings: 2, applications: 38, interviewed: 7, offered: 2, status: 'Active' },
      { job_title: 'Senior Full Stack React/Python Engineer', department: 'Engineering', openings: 3, applications: 64, interviewed: 12, offered: 3, status: 'Active' },
      { job_title: 'Site Reliability / Cloud Architect', department: 'DevOps & Cloud', openings: 1, applications: 22, interviewed: 5, offered: 1, status: 'Active' },
    ],
  },
  'Salary Register': {
    columns: [
      { fieldname: 'employee_name', label: 'Employee Name' },
      { fieldname: 'start_date', label: 'Start Date' },
      { fieldname: 'end_date', label: 'End Date' },
      { fieldname: 'gross_pay', label: 'Gross Pay (₹)' },
      { fieldname: 'total_deductions', label: 'Deductions (₹)' },
      { fieldname: 'net_pay', label: 'Net Take-Home (₹)' },
      { fieldname: 'status', label: 'Status' },
    ],
    result: [
      { employee_name: 'Rahul Sharma', start_date: '2026-09-01', end_date: '2026-09-30', gross_pay: '₹150,000', total_deductions: '₹24,417', net_pay: '₹125,583', status: 'Paid' },
      { employee_name: 'Priya Patel', start_date: '2026-09-01', end_date: '2026-09-30', gross_pay: '₹125,000', total_deductions: '₹17,917', net_pay: '₹107,083', status: 'Paid' },
      { employee_name: 'Amit Kumar', start_date: '2026-09-01', end_date: '2026-09-30', gross_pay: '₹112,500', total_deductions: '₹15,167', net_pay: '₹97,333', status: 'Paid' },
    ],
  },
  'Accounts Receivable': {
    columns: [
      { fieldname: 'party', label: 'Customer / Client' },
      { fieldname: 'invoiced_amount', label: 'Invoiced (₹)' },
      { fieldname: 'paid_amount', label: 'Received (₹)' },
      { fieldname: 'outstanding_amount', label: 'Outstanding (₹)' },
      { fieldname: 'status', label: 'Status' },
    ],
    result: [
      { party: 'Infosys Smart Campus B', invoiced_amount: '₹850,000', paid_amount: '₹850,000', outstanding_amount: '₹0', status: 'Settled' },
      { party: 'Wipro Green Tech Park', invoiced_amount: '₹1,250,000', paid_amount: '₹1,000,000', outstanding_amount: '₹250,000', status: 'Partially Paid' },
    ],
  },
  'Accounts Payable': {
    columns: [
      { fieldname: 'party', label: 'Vendor / Employee' },
      { fieldname: 'bill_amount', label: 'Bill Amount (₹)' },
      { fieldname: 'paid_amount', label: 'Paid (₹)' },
      { fieldname: 'outstanding_amount', label: 'Balance Due (₹)' },
      { fieldname: 'status', label: 'Status' },
    ],
    result: [
      { party: 'Cloud Telemetry Servers AWS', bill_amount: '₹185,000', paid_amount: '₹185,000', outstanding_amount: '₹0', status: 'Settled' },
      { party: 'Sensor Hardware Supplier Inc', bill_amount: '₹340,000', paid_amount: '₹200,000', outstanding_amount: '₹140,000', status: 'Pending' },
    ],
  },
  'General Ledger': {
    columns: [
      { fieldname: 'posting_date', label: 'Posting Date' },
      { fieldname: 'account', label: 'Account Code & Head' },
      { fieldname: 'debit', label: 'Debit (₹)' },
      { fieldname: 'credit', label: 'Credit (₹)' },
      { fieldname: 'voucher_no', label: 'Voucher Number' },
    ],
    result: [
      { posting_date: '2026-10-01', account: '5110 - Staff Salary Expense', debit: '₹850,000', credit: '—', voucher_no: 'PAY-2026-09' },
      { posting_date: '2026-10-01', account: '2110 - HDFC Bank Corporate Disbursal', debit: '—', credit: '₹850,000', voucher_no: 'PAY-2026-09' },
      { posting_date: '2026-10-08', account: '5130 - Employee Travel & Expenses', debit: '₹4,500', credit: '—', voucher_no: 'PE-2026-00101' },
      { posting_date: '2026-10-08', account: '2110 - HDFC Bank Corporate Disbursal', debit: '—', credit: '₹4,500', voucher_no: 'PE-2026-00101' },
    ],
  },
  'Employee CTC Break-up': {
    columns: [
      { fieldname: 'employee_name', label: 'Employee Name' },
      { fieldname: 'designation', label: 'Designation' },
      { fieldname: 'basic_pay', label: 'Basic Pay (Annual)' },
      { fieldname: 'hra', label: 'HRA' },
      { fieldname: 'special_allowance', label: 'Special Allowance' },
      { fieldname: 'annual_ctc', label: 'Total Annual CTC' },
    ],
    result: [
      { employee_name: 'Rahul Sharma', designation: 'Principal Architect', basic_pay: '₹900,000', hra: '₹450,000', special_allowance: '₹450,000', annual_ctc: '₹1,800,000' },
      { employee_name: 'Priya Patel', designation: 'Senior Firmware Engineer', basic_pay: '₹750,000', hra: '₹375,000', special_allowance: '₹375,000', annual_ctc: '₹1,500,000' },
    ],
  },
  'Complaint Summary': {
    columns: [
      { fieldname: 'category', label: 'Complaint Category' },
      { fieldname: 'open_count', label: 'Open Tickets' },
      { fieldname: 'in_progress', label: 'In Progress' },
      { fieldname: 'resolved_count', label: 'Resolved Tickets' },
      { fieldname: 'sla_compliance', label: 'SLA Compliance %' },
    ],
    result: [
      { category: 'B2B Enterprise Clients', open_count: 2, in_progress: 3, resolved_count: 14, sla_compliance: '95.5%' },
      { category: 'B2C Retail Customers', open_count: 5, in_progress: 4, resolved_count: 32, sla_compliance: '97.2%' },
      { category: 'Internal Operational Incidents', open_count: 1, in_progress: 1, resolved_count: 8, sla_compliance: '100%' },
    ],
  },
};
