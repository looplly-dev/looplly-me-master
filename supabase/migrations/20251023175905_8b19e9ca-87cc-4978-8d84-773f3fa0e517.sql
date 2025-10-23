-- Fix admin portal access for Nadia and Warren
-- Update their user_type to looplly_team_user so they can access /admin

UPDATE profiles 
SET user_type = 'looplly_team_user'::user_type,
    updated_at = now()
WHERE email IN ('nadia@looplly.me', 'warren@looplly.me');