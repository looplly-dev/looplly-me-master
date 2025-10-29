-- Fix audit_logs foreign key to support team members

-- Drop existing foreign key constraint on audit_logs
ALTER TABLE public.audit_logs 
DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;

-- Add new foreign key to auth.users (allows both regular users and team members)
ALTER TABLE public.audit_logs 
ADD CONSTRAINT audit_logs_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Now insert the bootstrap audit logs
-- Email column may not exist in team_profiles, using first_name/last_name
INSERT INTO public.audit_logs (user_id, action, metadata)
SELECT 
  tp.user_id,
  'role_bootstrap',
  jsonb_build_object(
    'role', 'super_admin',
    'name', tp.first_name || ' ' || tp.last_name,
    'reason', 'Initial super_admin role assignment for existing team members'
  )
FROM public.team_profiles tp
WHERE tp.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM public.audit_logs al
    WHERE al.user_id = tp.user_id 
      AND al.action = 'role_bootstrap'
  );
