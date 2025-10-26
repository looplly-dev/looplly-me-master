-- Allow super_admins to use reset_user_journey
CREATE OR REPLACE FUNCTION public.reset_user_journey(p_caller_user_id uuid, p_target_user_id uuid, p_stage journey_stage)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_result JSONB;
  v_is_test BOOLEAN;
BEGIN
  -- Security: Only allow resetting test accounts
  SELECT is_test_account INTO v_is_test
  FROM profiles
  WHERE user_id = p_target_user_id;
  
  IF NOT v_is_test THEN
    RAISE EXCEPTION 'Cannot reset non-test account';
  END IF;
  
  -- Security: testers, admins, and super_admins can reset
  IF NOT (
    has_role(p_caller_user_id, 'tester') OR 
    has_role(p_caller_user_id, 'admin') OR 
    has_role(p_caller_user_id, 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;
  
  -- Log the reset
  INSERT INTO audit_logs (user_id, action, metadata)
  VALUES (
    p_caller_user_id,
    'simulator_journey_reset',
    jsonb_build_object('target_user_id', p_target_user_id, 'stage', p_stage)
  );
  
  -- Reset based on stage
  CASE p_stage
    WHEN 'fresh_signup' THEN
      -- Clear all data
      UPDATE profiles SET
        profile_complete = false,
        profile_level = 1,
        profile_completeness_score = 0,
        is_verified = false,
        date_of_birth = NULL,
        gender = NULL,
        sec = NULL,
        address = NULL,
        household_income = NULL,
        ethnicity = NULL
      WHERE user_id = p_target_user_id;
      
      DELETE FROM profile_answers WHERE user_id = p_target_user_id;
      DELETE FROM earning_activities WHERE user_id = p_target_user_id;
      DELETE FROM user_badges WHERE user_id = p_target_user_id;
      
      UPDATE user_reputation SET score = 0, level = 'Bronze Novice', tier = 'Bronze' WHERE user_id = p_target_user_id;
      UPDATE user_balances SET balance = 0, pending_balance = 0, lifetime_earnings = 0 WHERE user_id = p_target_user_id;
      
      v_result = jsonb_build_object('stage', 'fresh_signup', 'description', 'New account, no data');
    
    WHEN 'otp_verified' THEN
      PERFORM reset_user_journey(p_caller_user_id, p_target_user_id, 'fresh_signup');
      UPDATE profiles SET is_verified = true WHERE user_id = p_target_user_id;
      v_result = jsonb_build_object('stage', 'otp_verified', 'description', 'Verified mobile number');
    
    WHEN 'basic_profile' THEN
      PERFORM reset_user_journey(p_caller_user_id, p_target_user_id, 'otp_verified');
      UPDATE profiles SET
        date_of_birth = '1990-01-15',
        gender = 'male',
        profile_level = 1,
        profile_completeness_score = 40
      WHERE user_id = p_target_user_id;
      v_result = jsonb_build_object('stage', 'basic_profile', 'description', 'Level 1 profile complete');
    
    WHEN 'full_profile' THEN
      PERFORM reset_user_journey(p_caller_user_id, p_target_user_id, 'basic_profile');
      UPDATE profiles SET
        sec = 'C1',
        address = '123 Test Street, Johannesburg',
        household_income = '$50,000 - $75,000',
        profile_complete = true,
        profile_level = 2,
        profile_completeness_score = 100
      WHERE user_id = p_target_user_id;
      v_result = jsonb_build_object('stage', 'full_profile', 'description', 'Full profile completed');
    
    WHEN 'first_survey' THEN
      PERFORM reset_user_journey(p_caller_user_id, p_target_user_id, 'full_profile');
      INSERT INTO earning_activities (user_id, activity_type, title, reward_amount, status, completed_at)
      VALUES (p_target_user_id, 'survey', 'First Test Survey', 5.00, 'completed', now());
      
      UPDATE user_balances SET balance = 5.00, lifetime_earnings = 5.00 WHERE user_id = p_target_user_id;
      UPDATE user_reputation SET score = 150, level = 'Bronze Elite', tier = 'Bronze' WHERE user_id = p_target_user_id;
      v_result = jsonb_build_object('stage', 'first_survey', 'description', 'Completed first survey');
    
    WHEN 'established_user' THEN
      PERFORM reset_user_journey(p_caller_user_id, p_target_user_id, 'first_survey');
      
      -- Add 4 more surveys
      INSERT INTO earning_activities (user_id, activity_type, title, reward_amount, status, completed_at)
      SELECT p_target_user_id, 'survey', 'Test Survey #' || i, 7.00, 'completed', now() - (i || ' days')::interval
      FROM generate_series(2, 5) i;
      
      UPDATE user_balances SET balance = 50.00, lifetime_earnings = 50.00 WHERE user_id = p_target_user_id;
      UPDATE user_reputation SET score = 850, level = 'Silver Elite', tier = 'Silver' WHERE user_id = p_target_user_id;
      v_result = jsonb_build_object('stage', 'established_user', 'description', 'Established user with reputation');
  END CASE;
  
  RETURN v_result;
END;
$function$;