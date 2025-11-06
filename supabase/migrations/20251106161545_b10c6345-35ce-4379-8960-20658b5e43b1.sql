
-- Emergency fix: Create auth.users for existing team_profiles
-- This handles the case where team_profiles exist but auth.users don't

DO $$
DECLARE
  team_member RECORD;
  temp_password TEXT := 'TempPass2025!ChangeMe';
  new_user_id UUID;
BEGIN
  -- Loop through team profiles that don't have auth.users
  FOR team_member IN 
    SELECT tp.user_id, tp.email, tp.first_name, tp.last_name
    FROM team_profiles tp
    WHERE tp.is_active = true
      AND tp.user_id NOT IN (SELECT id FROM auth.users)
  LOOP
    -- Create auth user using admin API would be ideal, but we'll use a workaround
    -- Insert into auth.users (this requires service role privileges)
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      aud,
      role
    )
    VALUES (
      team_member.user_id,
      '00000000-0000-0000-0000-000000000000',
      team_member.email,
      crypt(temp_password, gen_salt('bf')), -- Temporary password
      now(), -- Email pre-confirmed
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'first_name', team_member.first_name,
        'last_name', team_member.last_name
      ),
      now(),
      now(),
      '', -- Empty confirmation token since email is confirmed
      '', -- Empty recovery token
      '', -- Empty email change token
      'authenticated',
      'authenticated'
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Created auth user for: %', team_member.email;
  END LOOP;
  
  -- Mark all team profiles as must_change_password
  UPDATE team_profiles 
  SET must_change_password = true,
      temp_password_expires_at = now() + interval '7 days'
  WHERE user_id IN (
    SELECT user_id FROM team_profiles
    WHERE is_active = true
  );
  
  RAISE NOTICE 'Migration complete. All team members must change password on first login.';
  RAISE NOTICE 'Temporary password for ALL team members: %', temp_password;
END $$;
