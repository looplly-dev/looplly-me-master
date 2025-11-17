-- Fix admin portal access for Nadia and Warren
-- Update their user_type to looplly_team_user so they can access /admin
-- Note: Using first_name and last_name instead of email (column doesn't exist)

UPDATE profiles 
SET user_type = 'looplly_team_user'::user_type,
    updated_at = now()
WHERE (first_name = 'Nadia' AND last_name = 'Gaspari')
   OR (first_name = 'Warren' AND last_name = 'Le Roux');
