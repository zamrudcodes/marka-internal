-- Manual admin user creation
-- This creates the admin role entry that will be linked when the user signs up

-- Note: You need to create the user in Supabase Dashboard first:
-- 1. Go to Authentication → Users
-- 2. Click "Add User"
-- 3. Email: emeraldo@marka-digital.com
-- 4. Password: P4ssword
-- 5. Then run this migration OR the trigger will handle it automatically

-- Alternative: If you want to pre-create the role mapping (will be linked on first login)
-- Uncomment the following if you've already created the user in Supabase Dashboard:

-- INSERT INTO user_roles (user_id, email, role, is_active)
-- VALUES (
--   'YOUR_USER_ID_FROM_SUPABASE_DASHBOARD',
--   'emeraldo@marka-digital.com',
--   'admin',
--   true
-- )
-- ON CONFLICT (user_id) DO UPDATE SET
--   role = 'admin',
--   is_active = true;

-- For now, the trigger from the previous migration will handle this automatically
-- when you create the user through Supabase Dashboard

COMMENT ON TABLE user_roles IS 'Admin user will be auto-created via trigger when emeraldo@marka-digital.com signs up';