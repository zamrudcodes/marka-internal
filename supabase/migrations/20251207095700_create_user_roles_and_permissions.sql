-- Enable Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_charters ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_weekly_updates ENABLE ROW LEVEL SECURITY;

-- Create user_roles table to extend Supabase auth.users
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'sales', 'operations', 'viewer')),
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create user_invitations table
CREATE TABLE user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'sales', 'operations', 'viewer')),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invitation_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email)
);

-- Create role_permissions table for granular access control
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(50) NOT NULL,
  resource VARCHAR(100) NOT NULL, -- e.g., 'employees', 'projects', 'payroll'
  can_view BOOLEAN DEFAULT false,
  can_create BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role, resource)
);

-- Insert default role permissions
INSERT INTO role_permissions (role, resource, can_view, can_create, can_edit, can_delete) VALUES
-- Admin: Full access to everything
('admin', 'employees', true, true, true, true),
('admin', 'departments', true, true, true, true),
('admin', 'projects', true, true, true, true),
('admin', 'bonus_periods', true, true, true, true),
('admin', 'payroll', true, true, true, true),
('admin', 'project_charters', true, true, true, true),
('admin', 'users', true, true, true, true),

-- Manager: Can view and edit most things, limited delete
('manager', 'employees', true, true, true, false),
('manager', 'departments', true, true, true, false),
('manager', 'projects', true, true, true, false),
('manager', 'bonus_periods', true, true, true, false),
('manager', 'payroll', true, true, true, false),
('manager', 'project_charters', true, true, true, false),
('manager', 'users', true, false, false, false),

-- Sales: Limited to project charters and viewing projects
('sales', 'employees', true, false, false, false),
('sales', 'departments', true, false, false, false),
('sales', 'projects', true, false, false, false),
('sales', 'bonus_periods', false, false, false, false),
('sales', 'payroll', false, false, false, false),
('sales', 'project_charters', true, true, true, false),
('sales', 'users', false, false, false, false),

-- Operations: Can manage projects and weekly updates
('operations', 'employees', true, false, false, false),
('operations', 'departments', true, false, false, false),
('operations', 'projects', true, true, true, false),
('operations', 'bonus_periods', false, false, false, false),
('operations', 'payroll', false, false, false, false),
('operations', 'project_charters', true, false, true, false),
('operations', 'users', false, false, false, false),

-- Viewer: Read-only access
('viewer', 'employees', true, false, false, false),
('viewer', 'departments', true, false, false, false),
('viewer', 'projects', true, false, false, false),
('viewer', 'bonus_periods', true, false, false, false),
('viewer', 'payroll', true, false, false, false),
('viewer', 'project_charters', true, false, false, false),
('viewer', 'users', false, false, false, false);

-- Add indexes
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_email ON user_roles(email);
CREATE INDEX idx_user_roles_role ON user_roles(role);
CREATE INDEX idx_user_invitations_email ON user_invitations(email);
CREATE INDEX idx_user_invitations_token ON user_invitations(invitation_token);
CREATE INDEX idx_role_permissions_role ON role_permissions(role);

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_email TEXT)
RETURNS TEXT AS $$
  SELECT role FROM user_roles WHERE email = user_email AND is_active = true LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION has_permission(user_email TEXT, resource_name TEXT, permission_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  has_perm BOOLEAN;
BEGIN
  -- Get user role
  SELECT role INTO user_role FROM user_roles WHERE email = user_email AND is_active = true LIMIT 1;
  
  IF user_role IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check permission based on type
  CASE permission_type
    WHEN 'view' THEN
      SELECT can_view INTO has_perm FROM role_permissions WHERE role = user_role AND resource = resource_name;
    WHEN 'create' THEN
      SELECT can_create INTO has_perm FROM role_permissions WHERE role = user_role AND resource = resource_name;
    WHEN 'edit' THEN
      SELECT can_edit INTO has_perm FROM role_permissions WHERE role = user_role AND resource = resource_name;
    WHEN 'delete' THEN
      SELECT can_delete INTO has_perm FROM role_permissions WHERE role = user_role AND resource = resource_name;
    ELSE
      RETURN false;
  END CASE;
  
  RETURN COALESCE(has_perm, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON TABLE user_roles IS 'User roles and permissions mapping to Supabase auth users';
COMMENT ON TABLE user_invitations IS 'Pending user invitations with expiration';
COMMENT ON TABLE role_permissions IS 'Granular permissions for each role and resource';
COMMENT ON FUNCTION get_user_role IS 'Get the role of a user by email';
COMMENT ON FUNCTION has_permission IS 'Check if a user has a specific permission for a resource';