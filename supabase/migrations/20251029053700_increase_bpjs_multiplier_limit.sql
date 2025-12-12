-- Increase the limit for bpjs_kes_salary_multiplier to allow larger values
-- Change from DECIMAL(5,2) to DECIMAL(15,2) to match other monetary fields
ALTER TABLE employees 
ALTER COLUMN bpjs_kes_salary_multiplier TYPE DECIMAL(15, 2);