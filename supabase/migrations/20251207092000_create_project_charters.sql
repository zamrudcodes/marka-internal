-- Create project_charters table for TikTok video package scoping
CREATE TABLE project_charters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Project Details
  project_name VARCHAR(255) NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  
  -- Video Package Details
  tier_fast_count INTEGER DEFAULT 0 CHECK (tier_fast_count >= 0),
  tier_complex_count INTEGER DEFAULT 0 CHECK (tier_complex_count >= 0),
  
  -- Timeline
  requested_start_date DATE NOT NULL,
  final_delivery_due DATE NOT NULL,
  tentative_studio_shoot_week DATE, -- Only required if tier_complex_count > 0
  
  -- Budget
  budget_total NUMERIC(12, 2) NOT NULL CHECK (budget_total >= 0),
  
  -- Status & Approval
  project_status VARCHAR(50) DEFAULT 'pending_ops_review' CHECK (project_status IN ('approved', 'pending_ops_review', 'rejected')),
  
  -- Calculated Fields (stored for audit trail)
  production_days_needed INTEGER,
  days_available INTEGER,
  feasibility_status VARCHAR(20), -- 'green', 'yellow', 'red'
  
  -- Metadata
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_by VARCHAR(255),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT
);

-- Add indexes for performance
CREATE INDEX idx_project_charters_status ON project_charters(project_status);
CREATE INDEX idx_project_charters_created_at ON project_charters(created_at DESC);
CREATE INDEX idx_project_charters_client ON project_charters(client_name);

-- Add comments for documentation
COMMENT ON TABLE project_charters IS 'Smart project charter form for TikTok video package scoping with traffic light feasibility system';
COMMENT ON COLUMN project_charters.tier_fast_count IS 'Number of simple talking head videos (1 day SLA each)';
COMMENT ON COLUMN project_charters.tier_complex_count IS 'Number of high-production studio videos (3 days SLA each)';
COMMENT ON COLUMN project_charters.tentative_studio_shoot_week IS 'Required studio shoot week for complex videos';
COMMENT ON COLUMN project_charters.project_status IS 'Approval status: approved (green light), pending_ops_review (yellow gate), rejected (red blocker)';
COMMENT ON COLUMN project_charters.feasibility_status IS 'Traffic light status: green (healthy timeline), yellow (needs buffer/approval), red (impossible timeline)';