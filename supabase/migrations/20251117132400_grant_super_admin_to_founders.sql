-- Grant super_admin role to all founder team members
-- This ensures they can access admin portal and manage all user types

INSERT INTO user_roles (user_id, role, granted_by, granted_at)
SELECT 
  u.id,
  'super_admin'::app_role,
  u.id, -- self-granted for initial setup
  NOW()
FROM auth.users u
WHERE u.email IN (
  'warren@looplly.me',
  'calvin@looplly.me', 
  'candice@looplly.me',
  'james@looplly.me',
  'nadia@looplly.me'
)
ON CONFLICT (user_id) DO UPDATE
  SET role = 'super_admin',
      granted_at = NOW();
