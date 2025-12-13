-- Add DELETE policy for project_briefs (admin and managers only)
CREATE POLICY "Admins and managers can delete briefs"
  ON project_briefs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'manager')
      AND is_active = true
    )
  );
