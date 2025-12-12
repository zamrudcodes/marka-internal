-- Rename revenue to monthly_revenue
ALTER TABLE projects RENAME COLUMN revenue TO monthly_revenue;

-- Rename squad_lead to project_manager_id and change to UUID foreign key
ALTER TABLE projects DROP COLUMN IF EXISTS squad_lead;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_manager_id UUID REFERENCES employees(id) ON DELETE SET NULL;

-- Add index for project manager lookups
CREATE INDEX IF NOT EXISTS idx_projects_project_manager ON projects(project_manager_id);

-- Comment on columns
COMMENT ON COLUMN projects.monthly_revenue IS 'Monthly revenue for the project';
COMMENT ON COLUMN projects.project_manager_id IS 'Reference to the employee who is the project manager';