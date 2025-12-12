-- Create features table to catalog all controllable features
CREATE TABLE features (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  parent_key TEXT REFERENCES features(key) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_feature_access table for granular permissions
CREATE TABLE user_feature_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feature_key TEXT REFERENCES features(key) ON DELETE CASCADE NOT NULL,
  is_enabled BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, feature_key)
);

-- Add indexes for performance
CREATE INDEX idx_user_feature_access_user_id ON user_feature_access(user_id);
CREATE INDEX idx_user_feature_access_feature_key ON user_feature_access(feature_key);
CREATE INDEX idx_user_feature_access_enabled ON user_feature_access(user_id, is_enabled);
CREATE INDEX idx_features_parent_key ON features(parent_key);

-- Seed features table with all application features
INSERT INTO features (key, name, description, parent_key) VALUES
  ('dashboard', 'Dashboard', 'Main dashboard and overview', NULL),
  ('employees', 'Employees', 'Employee management and profiles', NULL),
  ('departments', 'Departments', 'Department management', NULL),
  ('projects', 'Projects', 'Project management', NULL),
  ('projects.heatmap', 'Project Health Heatmap', 'Visual project health overview', 'projects'),
  ('project_charters', 'Project Charters', 'Project charter management', NULL),
  ('bonus_periods', 'Bonus Periods', 'Bonus calculation and management', NULL),
  ('payroll', 'Payroll', 'Payroll processing and management', NULL),
  ('ads_performance', 'Ads Performance', 'Advertising performance tracking', NULL),
  ('users', 'User Management', 'User account and permission management', NULL);

-- Function to get user's enabled features
CREATE OR REPLACE FUNCTION get_user_enabled_features(p_user_id UUID)
RETURNS TABLE(feature_key TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT ufa.feature_key
  FROM user_feature_access ufa
  WHERE ufa.user_id = p_user_id
    AND ufa.is_enabled = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has access to a feature
CREATE OR REPLACE FUNCTION user_has_feature_access(p_user_id UUID, p_feature_key TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  has_access BOOLEAN;
BEGIN
  -- Check if user has the feature enabled
  SELECT EXISTS(
    SELECT 1
    FROM user_feature_access
    WHERE user_id = p_user_id
      AND feature_key = p_feature_key
      AND is_enabled = true
  ) INTO has_access;
  
  RETURN has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to bulk update user features
CREATE OR REPLACE FUNCTION update_user_features(
  p_user_id UUID,
  p_feature_keys TEXT[]
)
RETURNS void AS $$
BEGIN
  -- Delete all existing feature access for this user
  DELETE FROM user_feature_access WHERE user_id = p_user_id;
  
  -- Insert new feature access
  INSERT INTO user_feature_access (user_id, feature_key, is_enabled)
  SELECT p_user_id, unnest(p_feature_keys), true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill user_feature_access based on existing user_roles
-- This maintains current access levels during migration
DO $$
DECLARE
  user_record RECORD;
  feature_keys TEXT[];
BEGIN
  FOR user_record IN SELECT user_id, role FROM user_roles WHERE is_active = true LOOP
    -- Determine features based on role
    CASE user_record.role
      WHEN 'admin' THEN
        feature_keys := ARRAY['dashboard', 'employees', 'departments', 'projects', 'projects.heatmap', 
                              'project_charters', 'bonus_periods', 'payroll', 'ads_performance', 'users'];
      WHEN 'manager' THEN
        feature_keys := ARRAY['dashboard', 'employees', 'departments', 'projects', 'projects.heatmap',
                              'project_charters', 'bonus_periods', 'payroll'];
      WHEN 'operations' THEN
        feature_keys := ARRAY['dashboard', 'employees', 'departments', 'projects', 'projects.heatmap',
                              'project_charters'];
      WHEN 'sales' THEN
        feature_keys := ARRAY['dashboard', 'employees', 'departments', 'projects', 'projects.heatmap',
                              'project_charters'];
      WHEN 'viewer' THEN
        feature_keys := ARRAY['dashboard', 'employees', 'departments', 'projects', 'projects.heatmap',
                              'project_charters', 'bonus_periods', 'payroll'];
      ELSE
        feature_keys := ARRAY['dashboard'];
    END CASE;
    
    -- Insert feature access for this user
    INSERT INTO user_feature_access (user_id, feature_key, is_enabled)
    SELECT user_record.user_id, unnest(feature_keys), true
    ON CONFLICT (user_id, feature_key) DO NOTHING;
  END LOOP;
END $$;

-- Enable RLS on new tables
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feature_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies for features table (read-only for all authenticated users)
CREATE POLICY "Anyone can view features"
  ON features FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_feature_access
CREATE POLICY "Users can view their own feature access"
  ON user_feature_access FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all feature access"
  ON user_feature_access FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
        AND user_roles.is_active = true
    )
  );

CREATE POLICY "Admins can manage feature access"
  ON user_feature_access FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
        AND user_roles.is_active = true
    )
  );

-- Add comments
COMMENT ON TABLE features IS 'Catalog of all controllable features in the application';
COMMENT ON TABLE user_feature_access IS 'Granular feature access control per user';
COMMENT ON FUNCTION get_user_enabled_features IS 'Get list of enabled features for a user';
COMMENT ON FUNCTION user_has_feature_access IS 'Check if user has access to a specific feature';
COMMENT ON FUNCTION update_user_features IS 'Bulk update user feature access';