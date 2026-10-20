export type ModuleTab =
  | 'hr_setup'
  | 'tenure'
  | 'recruitment'
  | 'shift_and_attendance'
  | 'leaves'
  | 'expenses'
  | 'performance'
  | 'payroll'
  | 'tax_and_benefits'
  | 'complaints';

export interface Employee {
  name: string;
  employee_name: string;
  department?: string;
  designation?: string;
  company?: string;
  status: 'Active' | 'Inactive' | 'Suspended' | 'Left';
  gender?: 'Female' | 'Male' | 'Other';
  date_of_birth?: string;
  image?: string;
  date_of_joining?: string;
  cell_number?: string;
  reports_to?: string;
  user_id?: string;
  company_email?: string;
  personal_email?: string;
  password?: string;
  [key: string]: any;
}

export interface DepartmentHeadcount {
  department: string;
  count: number;
  color?: string;
}

export interface HRKPIs {
  totalEmployees: number;
  joiningThisQuarter: number;
  relievingThisQuarter: number;
  presentToday: number;
  onLeaveToday: number;
  attendanceRate: number;
  pendingApprovals: number;
}

export interface UserSession {
  name: string;
  email: string;
  full_name: string;
  roles: string[];
  user_image?: string;
  is_logged_in: boolean;
}
