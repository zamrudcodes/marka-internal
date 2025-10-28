-- Make salary column nullable in employees table
ALTER TABLE employees 
ALTER COLUMN salary DROP NOT NULL;