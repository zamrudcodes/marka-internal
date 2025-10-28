-- Enable UUID extension
-- Add new columns to Employees table for payroll
ALTER TABLE employees
ADD COLUMN emp_no VARCHAR(50) UNIQUE,
ADD COLUMN role VARCHAR(100),
ADD COLUMN npwp VARCHAR(25),
ADD COLUMN nik VARCHAR(25),
ADD COLUMN nitku VARCHAR(25),
ADD COLUMN ptkp_status VARCHAR(10),
ADD COLUMN gross_up_enabled BOOLEAN DEFAULT false,
ADD COLUMN bpjs_kes_salary_multiplier DECIMAL(5, 2) DEFAULT 1.0;

-- Payroll Records Table
CREATE TABLE payroll_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  period_month DATE NOT NULL, -- e.g., '2025-10-01' for October 2025
  basic_salary DECIMAL(15, 2) DEFAULT 0,
  adj_previous_payroll DECIMAL(15, 2) DEFAULT 0,
  kinerja_allowance DECIMAL(15, 2) DEFAULT 0,
  meal_allowance DECIMAL(15, 2) DEFAULT 0,
  komunikasi_allowance DECIMAL(15, 2) DEFAULT 0,
  pph21_allowance DECIMAL(15, 2) DEFAULT 0,
  thr_bonus DECIMAL(15, 2) DEFAULT 0,
  severance DECIMAL(15, 2) DEFAULT 0,
  bpjs_tk_jkk_comp DECIMAL(15, 2) DEFAULT 0,
  bpjs_tk_jkm_comp DECIMAL(15, 2) DEFAULT 0,
  bpjs_kes_comp DECIMAL(15, 2) DEFAULT 0,
  bpjs_tk_jht_comp DECIMAL(15, 2) DEFAULT 0,
  bpjs_tk_jp_comp DECIMAL(15, 2) DEFAULT 0,
  total_bruto DECIMAL(15, 2) DEFAULT 0,
  total_bruto_gross_up DECIMAL(15, 2) DEFAULT 0,
  total_income DECIMAL(15, 2) DEFAULT 0,
  bpjs_tk_jht_emp DECIMAL(15, 2) DEFAULT 0,
  bpjs_tk_jp_emp DECIMAL(15, 2) DEFAULT 0,
  bpjs_kes_emp DECIMAL(15, 2) DEFAULT 0,
  tarif_percentage DECIMAL(5, 2) DEFAULT 0,
  tarif_value DECIMAL(15, 2) DEFAULT 0,
  regular_income_tax DECIMAL(15, 2) DEFAULT 0,
  tunjangan_pph DECIMAL(15, 2) DEFAULT 0,
  control_tunjangan_pph DECIMAL(15, 2) DEFAULT 0,
  adj_income_tax DECIMAL(15, 2) DEFAULT 0,
  payable_tax DECIMAL(15, 2) DEFAULT 0,
  severance_tax DECIMAL(15, 2) DEFAULT 0,
  total_deduction DECIMAL(15, 2) DEFAULT 0,
  reimbursement DECIMAL(15, 2) DEFAULT 0,
  take_home_pay DECIMAL(15, 2) DEFAULT 0,
  already_paid_adj DECIMAL(15, 2) DEFAULT 0,
  salary_to_be_paid DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, period_month)
);

-- Indexes for performance
CREATE INDEX idx_payroll_records_employee ON payroll_records(employee_id);
CREATE INDEX idx_payroll_records_period ON payroll_records(period_month);