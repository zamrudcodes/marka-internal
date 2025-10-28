-- Add avatar_url column to employees table
ALTER TABLE employees ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN employees.avatar_url IS 'URL to employee avatar/profile picture';