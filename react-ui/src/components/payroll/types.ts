export interface PayrollEntry {
  name: string;
  company: string;
  posting_date: string;
  payroll_frequency: 'Monthly' | 'Bimonthly' | 'Fortnightly' | 'Weekly' | 'Daily';
  start_date: string;
  end_date: string;
  department?: string;
  branch?: string;
  designation?: string;
  number_of_employees: number;
  total_net_pay?: number;
  status: 'Draft' | 'Submitted' | 'Failed';
  remarks?: string;
  employees?: Array<{
    employee: string;
    employee_name: string;
    department?: string;
    designation?: string;
  }>;
}

export interface SalaryComponentDetail {
  salary_component: string;
  amount: number;
  type?: 'Earning' | 'Deduction';
  depends_on_payment_days?: boolean;
}

export interface SalarySlip {
  name: string;
  employee: string;
  employee_name: string;
  department?: string;
  designation?: string;
  company: string;
  posting_date: string;
  start_date: string;
  end_date: string;
  salary_structure?: string;
  payroll_entry?: string;
  total_working_days: number;
  payment_days: number;
  leave_without_pay: number;
  gross_pay: number;
  total_deduction: number;
  net_pay: number;
  rounded_total?: number;
  status: 'Draft' | 'Submitted' | 'Cancelled';
  bank_name?: string;
  bank_account_no?: string;
  pan_number?: string;
  pf_number?: string;
  uan?: string;
  earnings: SalaryComponentDetail[];
  deductions: SalaryComponentDetail[];
}

export interface SalaryStructureAssignment {
  name: string;
  employee: string;
  employee_name: string;
  department?: string;
  designation?: string;
  salary_structure: string;
  from_date: string;
  base: number;
  company: string;
}

export interface SalaryStructure {
  name: string;
  company: string;
  payroll_frequency: string;
  is_active: 'Yes' | 'No' | boolean;
  currency?: string;
  earnings: Array<{ salary_component: string; amount?: number; formula?: string }>;
  deductions: Array<{ salary_component: string; amount?: number; formula?: string }>;
}

export interface SalaryComponent {
  name: string;
  type: 'Earning' | 'Deduction';
  description?: string;
  depends_on_payment_days?: boolean;
  is_tax_applicable?: boolean;
  round_to_the_nearest_integer?: boolean;
}

export interface AdditionalSalary {
  name: string;
  employee: string;
  employee_name: string;
  salary_component: string;
  amount: number;
  payroll_date: string;
  type: 'Earning' | 'Deduction';
  company?: string;
}
