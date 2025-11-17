-- Update user role from tester to super_admin
UPDATE public.user_roles 
SET role = 'super_admin'
WHERE user_id = 'bcf0974b-80b3-4b4c-a329-b8fdf3eee4fc';