-- Disable RLS on employees table to allow access
-- This is a temporary solution for development
-- In production, you should implement proper RLS policies

ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE employee_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE bonus_periods DISABLE ROW LEVEL SECURITY;
ALTER TABLE employee_ratings DISABLE ROW LEVEL SECURITY;
ALTER TABLE bonus_calculations DISABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_records DISABLE ROW LEVEL SECURITY;