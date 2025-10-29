-- Add role column to employees table
ALTER TABLE employees ADD COLUMN IF NOT EXISTS role VARCHAR(100);

-- Add index for role column
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);

-- Add comment
COMMENT ON COLUMN employees.role IS 'Employee role/position in the company';