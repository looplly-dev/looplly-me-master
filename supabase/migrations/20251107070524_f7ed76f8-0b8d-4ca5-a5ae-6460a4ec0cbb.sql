-- Promote warren@looplly.me to super_admin
UPDATE public.user_roles
SET role = 'super_admin'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'warren@looplly.me'
);