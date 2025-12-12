-- Change bpjs_kes_salary_multiplier from DECIMAL to BIGINT
-- This field represents an amount in IDR (currency), not a decimal multiplier
-- IDR amounts are typically whole numbers (no decimal places needed)
ALTER TABLE employees 
ALTER COLUMN bpjs_kes_salary_multiplier TYPE BIGINT USING ROUND(bpjs_kes_salary_multiplier);

-- Update default value to 0 instead of 1.0 since it's now an amount field
ALTER TABLE employees 
ALTER COLUMN bpjs_kes_salary_multiplier SET DEFAULT 0;