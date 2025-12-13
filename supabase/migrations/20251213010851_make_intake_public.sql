-- Make submitted_by nullable to allow anonymous submissions
ALTER TABLE project_briefs ALTER COLUMN submitted_by DROP NOT NULL;

-- Add submitter_email field for public submissions
ALTER TABLE project_briefs ADD COLUMN submitter_email TEXT;

-- Add constraint: either submitted_by OR submitter_email must be present
ALTER TABLE project_briefs ADD CONSTRAINT check_submitter 
  CHECK (submitted_by IS NOT NULL OR submitter_email IS NOT NULL);

-- Drop existing insert policy for project_briefs
DROP POLICY IF EXISTS "Users can insert their own briefs" ON project_briefs;

-- Allow anyone to insert project briefs (public submissions)
CREATE POLICY "Anyone can insert project briefs"
  ON project_briefs FOR INSERT
  WITH CHECK (true);

-- Drop existing insert policy for brief_responses
DROP POLICY IF EXISTS "Users can insert responses for their briefs" ON brief_responses;

-- Allow anyone to insert brief responses (when creating a brief)
CREATE POLICY "Anyone can insert brief responses"
  ON brief_responses FOR INSERT
  WITH CHECK (true);

-- Keep SELECT policies restrictive (only admins/managers can view)
-- This is already handled by the existing "Users can view all project briefs" policy
