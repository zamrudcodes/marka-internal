-- Create initial admin user
-- This migration creates the first admin user for the system

-- Note: This assumes Supabase Auth is configured
-- The user will need to be created through Supabase Dashboard or Auth API first
-- This migration only creates the role mapping

-- Insert admin role for emeraldo@marka-digital.com
-- The user_id will be populated after the user signs up through Supabase Auth
-- For now, we'll create a placeholder that will be updated

-- Create a function to add admin role after user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is the admin email
  IF NEW.email = 'emeraldo@marka-digital.com' THEN
    INSERT INTO public.user_roles (user_id, email, role, is_active)
    VALUES (NEW.id, NEW.email, 'admin', true);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically assign admin role on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add comment
COMMENT ON FUNCTION public.handle_new_user IS 'Automatically assigns admin role to emeraldo@marka-digital.com on signup';