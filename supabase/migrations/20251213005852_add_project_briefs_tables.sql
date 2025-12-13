-- Create project_briefs table
CREATE TABLE project_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name TEXT NOT NULL,
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'passed', 'rejected')),
  checked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create brief_responses table
CREATE TABLE brief_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID REFERENCES project_briefs(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_value TEXT NOT NULL,
  section TEXT NOT NULL CHECK (section IN ('strategy', 'offer', 'assets')),
  review_status TEXT DEFAULT 'not_started' CHECK (review_status IN ('not_started', 'passed', 'rejected')),
  commentary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_briefs_submitted_by ON project_briefs(submitted_by);
CREATE INDEX idx_briefs_status ON project_briefs(status);
CREATE INDEX idx_responses_brief_id ON brief_responses(brief_id);

-- Enable RLS
ALTER TABLE project_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_briefs
CREATE POLICY "Users can view all project briefs"
  ON project_briefs FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own briefs"
  ON project_briefs FOR INSERT
  WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Admins and managers can update briefs"
  ON project_briefs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'manager')
      AND is_active = true
    )
  );

-- RLS Policies for brief_responses
CREATE POLICY "Users can view all brief responses"
  ON brief_responses FOR SELECT
  USING (true);

CREATE POLICY "Users can insert responses for their briefs"
  ON brief_responses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_briefs
      WHERE id = brief_responses.brief_id
      AND submitted_by = auth.uid()
    )
  );

CREATE POLICY "Admins and managers can update responses"
  ON brief_responses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'manager')
      AND is_active = true
    )
  );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_briefs_updated_at
  BEFORE UPDATE ON project_briefs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brief_responses_updated_at
  BEFORE UPDATE ON brief_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
