-- Create project_weekly_updates table for historical tracking
CREATE TABLE project_weekly_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  report_date DATE NOT NULL, -- The date of the check-in (usually end of week)
  
  -- The Metrics (History)
  actual_value DECIMAL(12, 2), -- Snapshot of achievements for this week
  sla_percentage DECIMAL(5, 2), -- The SLA score for that week
  health_status VARCHAR(20) CHECK (health_status IN ('green', 'amber', 'red')),
  primary_blocker VARCHAR(50) CHECK (primary_blocker IN ('client_approval', 'creative_capacity', 'tech_issue', 'budget_cap', 'none')),
  
  -- Qualitative Data
  notes TEXT, -- "Why are we Red?" or "What went well?"
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure only one report per project per week
  UNIQUE(project_id, report_date)
);

-- Add indexes for performance
CREATE INDEX idx_project_weekly_updates_project ON project_weekly_updates(project_id);
CREATE INDEX idx_project_weekly_updates_date ON project_weekly_updates(report_date);
CREATE INDEX idx_project_weekly_updates_project_date ON project_weekly_updates(project_id, report_date DESC);

-- Add comments for documentation
COMMENT ON TABLE project_weekly_updates IS 'Historical tracking of project health metrics on a weekly basis';
COMMENT ON COLUMN project_weekly_updates.report_date IS 'The date of the weekly check-in (typically end of week)';
COMMENT ON COLUMN project_weekly_updates.actual_value IS 'Actual achievement value for this week';
COMMENT ON COLUMN project_weekly_updates.sla_percentage IS 'SLA percentage achieved for this week';
COMMENT ON COLUMN project_weekly_updates.health_status IS 'Overall health status: green (stable), amber (at risk), red (critical)';
COMMENT ON COLUMN project_weekly_updates.primary_blocker IS 'Main blocker affecting the project this week';
COMMENT ON COLUMN project_weekly_updates.notes IS 'Qualitative notes about the week (achievements, issues, context)';

-- Function to automatically update the projects table when a new weekly update is added
CREATE OR REPLACE FUNCTION sync_project_current_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the projects table with the latest weekly update data
  UPDATE projects
  SET 
    current_actual_value = NEW.actual_value,
    current_sla_percentage = NEW.sla_percentage,
    health_status = NEW.health_status,
    primary_blocker = NEW.primary_blocker,
    updated_at = NOW()
  WHERE id = NEW.project_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to sync project status when a weekly update is inserted or updated
CREATE TRIGGER trigger_sync_project_status
AFTER INSERT OR UPDATE ON project_weekly_updates
FOR EACH ROW
EXECUTE FUNCTION sync_project_current_status();