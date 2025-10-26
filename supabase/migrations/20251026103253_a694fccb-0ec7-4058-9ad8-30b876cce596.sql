-- Update the existing team member's role to tester for simulator access
-- The user_roles table has a unique constraint on user_id, so users can only have one role

UPDATE public.user_roles
SET role = 'tester'::app_role
WHERE user_id = 'bcf0974b-80b3-4b4c-a329-b8fdf3eee4fc';