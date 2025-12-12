-- Add Project Health Fields to projects table
-- This migration adds fields for SLA tracking, health monitoring, and operational management

-- I. Core/Static Fields
ALTER TABLE projects ADD COLUMN IF NOT EXISTS sow_type VARCHAR(50) CHECK (sow_type IN ('paid_media', 'content_creation', 'social_listening'));
ALTER TABLE projects ADD COLUMN IF NOT EXISTS sla_target_type VARCHAR(100); -- e.g., "Videos Delivered", "ROAS", "Response Time"
ALTER TABLE projects ADD COLUMN IF NOT EXISTS sla_target_value DECIMAL(12, 2); -- The target value (e.g., 5 videos/week, $5k Spend)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS billable_cap DECIMAL(12, 2); -- Max budget/hours before scope creep
ALTER TABLE projects ADD COLUMN IF NOT EXISTS squad_lead VARCHAR(255); -- Person responsible for the project health
ALTER TABLE projects ADD COLUMN IF NOT EXISTS renewal_date DATE; -- Contract renewal date for retention alerts

-- II. Dynamic Fields (Updated Weekly)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS current_actual_value DECIMAL(12, 2); -- Actual value achieved this week
ALTER TABLE projects ADD COLUMN IF NOT EXISTS current_sla_percentage DECIMAL(5, 2); -- Current SLA % (e.g., 88%)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS health_status VARCHAR(20) DEFAULT 'green' CHECK (health_status IN ('green', 'amber', 'red'));
ALTER TABLE projects ADD COLUMN IF NOT EXISTS primary_blocker VARCHAR(50) CHECK (primary_blocker IN ('client_approval', 'creative_capacity', 'tech_issue', 'budget_cap', 'none'));
ALTER TABLE projects ADD COLUMN IF NOT EXISTS last_client_touch DATE; -- Last client interaction date

-- III. Link Fields (Efficiency)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS link_to_sow TEXT; -- Direct PDF link to the contract
ALTER TABLE projects ADD COLUMN IF NOT EXISTS link_to_live_tracker TEXT; -- Google Sheet/Looker Studio link
ALTER TABLE projects ADD COLUMN IF NOT EXISTS link_to_asset_folder TEXT; -- Direct link to Creative Drive

-- Add index for health status filtering
CREATE INDEX IF NOT EXISTS idx_projects_health_status ON projects(health_status);

-- Add index for renewal date alerts
CREATE INDEX IF NOT EXISTS idx_projects_renewal_date ON projects(renewal_date);

-- Add index for last client touch (for flagging stale accounts)
CREATE INDEX IF NOT EXISTS idx_projects_last_client_touch ON projects(last_client_touch);

-- Comment on columns for documentation
COMMENT ON COLUMN projects.sow_type IS 'Type of Statement of Work: paid_media, content_creation, or social_listening';
COMMENT ON COLUMN projects.sla_target_type IS 'What success looks like: Videos Delivered, ROAS, Response Time, etc.';
COMMENT ON COLUMN projects.sla_target_value IS 'The target value for SLA (denominator for charts)';
COMMENT ON COLUMN projects.billable_cap IS 'Maximum budget/hours before working for free (scope creep defense)';
COMMENT ON COLUMN projects.squad_lead IS 'Person responsible for the project health status';
COMMENT ON COLUMN projects.renewal_date IS 'Contract renewal date - triggers retention alert 45 days prior';
COMMENT ON COLUMN projects.current_actual_value IS 'Actual value achieved this week (numerator for bullet chart)';
COMMENT ON COLUMN projects.current_sla_percentage IS 'Current SLA percentage for heatmap coloring';
COMMENT ON COLUMN projects.health_status IS 'Overall health: green (stable), amber (at risk), red (critical/churn)';
COMMENT ON COLUMN projects.primary_blocker IS 'Current bottleneck: client_approval, creative_capacity, tech_issue, budget_cap, or none';
COMMENT ON COLUMN projects.last_client_touch IS 'Last client interaction date - flag if > 7 days';
COMMENT ON COLUMN projects.link_to_sow IS 'Direct link to Statement of Work PDF';
COMMENT ON COLUMN projects.link_to_live_tracker IS 'Link to Google Sheet or Looker Studio tracker';
COMMENT ON COLUMN projects.link_to_asset_folder IS 'Link to Creative Drive asset folder';