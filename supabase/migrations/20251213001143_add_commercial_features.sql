-- Add commercial features to the features table

INSERT INTO features (key, name, description, category)
VALUES 
  ('commercial', 'Commercial Module', 'Access to the Commercial module', 'Commercial'),
  ('commercial.new_intake', 'New Project Intake', 'Access to the New Project Intake form', 'Commercial')
ON CONFLICT (key) DO NOTHING;

-- Grant these features to existing admins automatically
INSERT INTO user_feature_access (user_id, feature_key, is_enabled)
SELECT 
  ur.user_id, 
  f.key, 
  true
FROM user_roles ur
CROSS JOIN features f
WHERE ur.role = 'admin' 
  AND f.key IN ('commercial', 'commercial.new_intake')
ON CONFLICT (user_id, feature_key) DO UPDATE SET is_enabled = true;
