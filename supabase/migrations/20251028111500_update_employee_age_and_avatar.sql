-- Drop the age column if it exists
ALTER TABLE employees
DROP COLUMN IF EXISTS age;

-- Add age as a regular column (not generated) since age() function is not immutable
ALTER TABLE employees
ADD COLUMN age INTEGER;

-- Rename semi_formal_photo_url to avatar_url only if avatar_url doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'avatar_url'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'employees' AND column_name = 'semi_formal_photo_url'
    ) THEN
      ALTER TABLE employees RENAME COLUMN semi_formal_photo_url TO avatar_url;
    END IF;
  END IF;
END $$;

-- Create a function to calculate age
CREATE OR REPLACE FUNCTION calculate_employee_age()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.birth_date IS NOT NULL THEN
    NEW.age := date_part('year', age(NEW.birth_date))::INTEGER;
  ELSE
    NEW.age := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update age when birth_date changes
DROP TRIGGER IF EXISTS update_employee_age_trigger ON employees;
CREATE TRIGGER update_employee_age_trigger
BEFORE INSERT OR UPDATE OF birth_date ON employees
FOR EACH ROW
EXECUTE FUNCTION calculate_employee_age();

-- Update existing records
UPDATE employees
SET age = date_part('year', age(birth_date))::INTEGER
WHERE birth_date IS NOT NULL;