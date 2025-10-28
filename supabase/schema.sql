-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Departments Table
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employees Table
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  salary DECIMAL(12, 2) NOT NULL,
  hire_date DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  lark_user VARCHAR(255),
  preferred_nickname VARCHAR(100),
  lark_work_email VARCHAR(255),
  gender VARCHAR(50),
  contract_status VARCHAR(50),
  tenure_months INTEGER,
  marital_status VARCHAR(50),
  instagram_handle VARCHAR(100),
  ktp_photo_url VARCHAR(255),
  npwp_photo_url VARCHAR(255),
  kartu_keluarga_number VARCHAR(50),
  bca_account_number VARCHAR(50),
  semi_formal_photo_url VARCHAR(255),
  birth_date DATE,
  age INTEGER,
  birthplace VARCHAR(100),
  current_address TEXT,
  emergency_contact_phone VARCHAR(50),
  emergency_contact_name_relationship VARCHAR(255),
  phone_number VARCHAR(50),
  lark_status VARCHAR(50),
  pkwt VARCHAR(50),
  pkwt_synced BOOLEAN,
  bpjs_tk_id VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects Table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employee Projects Junction Table
CREATE TABLE employee_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, project_id)
);

-- Bonus Periods Table
CREATE TABLE bonus_periods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, -- e.g., "Q1 2024"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  net_profit DECIMAL(12, 2) NOT NULL,
  bonus_pool DECIMAL(12, 2) GENERATED ALWAYS AS (net_profit * 0.05) STORED,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'calculated', 'finalized')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  finalized_at TIMESTAMP WITH TIME ZONE,
  finalized_by UUID REFERENCES auth.users(id)
);

-- Employee Ratings Table
CREATE TABLE employee_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bonus_period_id UUID REFERENCES bonus_periods(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  performance_rating INTEGER CHECK (performance_rating >= 1 AND performance_rating <= 10),
  notes TEXT,
  rated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(bonus_period_id, employee_id)
);

-- Bonus Calculations Table
CREATE TABLE bonus_calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bonus_period_id UUID REFERENCES bonus_periods(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  contribution_score DECIMAL(5, 2),
  revenue_score DECIMAL(5, 2),
  salary_adjustment_score DECIMAL(5, 2),
  weighted_score DECIMAL(5, 2),
  bonus_amount DECIMAL(12, 2),
  bonus_percentage DECIMAL(5, 2),
  calculation_details JSONB, -- Store detailed breakdown
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(bonus_period_id, employee_id)
);

-- Indexes for performance
CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_projects_department ON projects(department_id);
CREATE INDEX idx_employee_projects_employee ON employee_projects(employee_id);
CREATE INDEX idx_employee_projects_project ON employee_projects(project_id);
CREATE INDEX idx_bonus_periods_department ON bonus_periods(department_id);
CREATE INDEX idx_employee_ratings_period ON employee_ratings(bonus_period_id);
CREATE INDEX idx_bonus_calculations_period ON bonus_calculations(bonus_period_id);

-- Payroll Records Table
CREATE TABLE payroll_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- RLS Policies will be added in a separate step after tables are created.