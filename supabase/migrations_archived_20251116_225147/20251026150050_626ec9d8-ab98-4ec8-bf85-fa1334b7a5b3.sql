-- Fix Simulator Data Seeding: Update reset_user_journey to seed profile_answers instead of legacy profiles columns

DROP FUNCTION IF EXISTS public.reset_user_journey(uuid, uuid, journey_stage);

CREATE OR REPLACE FUNCTION public.reset_user_journey(
  p_caller_user_id uuid, 
  p_target_user_id uuid, 
  p_stage journey_stage
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_result JSONB;
  v_is_test BOOLEAN;
  -- Question IDs (fetched dynamically)
  v_gender_q_id UUID;
  v_dob_q_id UUID;
  v_sec_q_id UUID;
  v_address_q_id UUID;
  v_income_q_id UUID;
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
  
  -- Fetch question IDs dynamically for data seeding
  SELECT id INTO v_gender_q_id FROM profile_questions WHERE question_key = 'gender' AND is_active = true LIMIT 1;
  SELECT id INTO v_dob_q_id FROM profile_questions WHERE question_key = 'date_of_birth' AND is_active = true LIMIT 1;
  SELECT id INTO v_sec_q_id FROM profile_questions WHERE question_key = 'sec' AND is_active = true LIMIT 1;
  SELECT id INTO v_address_q_id FROM profile_questions WHERE question_key = 'address' AND is_active = true LIMIT 1;
  SELECT id INTO v_income_q_id FROM profile_questions WHERE question_key = 'household_income' AND is_active = true LIMIT 1;
  
  -- Reset based on stage
  CASE p_stage
    WHEN 'fresh_signup' THEN
      -- Clear all data for fresh start
      UPDATE profiles SET
        profile_complete = false,
        profile_level = 1,
        profile_completeness_score = 0,
        -- is_verified = false,  -- Column doesn't exist
        date_of_birth = NULL,
        gender = NULL,
        sec = NULL,
        address = NULL,
        household_income = NULL,
        ethnicity = NULL
      WHERE user_id = p_target_user_id;
      
      -- Clear dynamic profile answers
      DELETE FROM profile_answers WHERE user_id = p_target_user_id;
      DELETE FROM earning_activities WHERE user_id = p_target_user_id;
      DELETE FROM user_badges WHERE user_id = p_target_user_id;
      
      -- Reset reputation and balance
      UPDATE user_reputation SET 
        score = 0, 
        level = 'Bronze Novice', 
        tier = 'Bronze',
        next_level_threshold = 100,
        history = '[]'::jsonb
      WHERE user_id = p_target_user_id;
      
      UPDATE user_balances SET 
        balance = 0, 
        pending_balance = 0, 
        lifetime_earnings = 0 
      WHERE user_id = p_target_user_id;
      
      v_result = jsonb_build_object('stage', 'fresh_signup', 'description', 'New account, no data');
    
    WHEN 'otp_verified' THEN
      -- Start from fresh_signup
      PERFORM reset_user_journey(p_caller_user_id, p_target_user_id, 'fresh_signup');
      
      -- Mark as verified
      -- UPDATE profiles SET is_verified = true WHERE user_id = p_target_user_id;
      
      v_result = jsonb_build_object('stage', 'otp_verified', 'description', 'Verified mobile number, ready for profile setup');
    
    WHEN 'basic_profile' THEN
      -- Start from otp_verified
      PERFORM reset_user_journey(p_caller_user_id, p_target_user_id, 'otp_verified');
      
      -- Seed Level 1 answers to profile_answers table (NOT legacy profiles columns)
      IF v_gender_q_id IS NOT NULL THEN
        INSERT INTO profile_answers (user_id, question_id, answer_value, answer_normalized, last_updated, is_stale)
        VALUES (p_target_user_id, v_gender_q_id, 'male', 'male', now(), false)
        ON CONFLICT (user_id, question_id) DO UPDATE 
        SET answer_value = 'male', answer_normalized = 'male', last_updated = now(), is_stale = false;
      END IF;
      
      IF v_dob_q_id IS NOT NULL THEN
        INSERT INTO profile_answers (user_id, question_id, answer_value, answer_normalized, last_updated, is_stale)
        VALUES (p_target_user_id, v_dob_q_id, '1990-01-15', '1990-01-15', now(), false)
        ON CONFLICT (user_id, question_id) DO UPDATE 
        SET answer_value = '1990-01-15', answer_normalized = '1990-01-15', last_updated = now(), is_stale = false;
      END IF;
      
      -- Update ONLY control fields in profiles table
      UPDATE profiles SET
        profile_level = 1,
        profile_completeness_score = 40,
        last_profile_update = now()
      WHERE user_id = p_target_user_id;
      
      v_result = jsonb_build_object('stage', 'basic_profile', 'description', 'Level 1 profile complete (gender, DOB in profile_answers)');
    
    WHEN 'full_profile' THEN
      -- Start from basic_profile
      PERFORM reset_user_journey(p_caller_user_id, p_target_user_id, 'basic_profile');
      
      -- Seed Level 2 answers to profile_answers table
      IF v_sec_q_id IS NOT NULL THEN
        INSERT INTO profile_answers (user_id, question_id, answer_value, answer_normalized, last_updated, is_stale)
        VALUES (p_target_user_id, v_sec_q_id, 'C1', 'C1', now(), false)
        ON CONFLICT (user_id, question_id) DO UPDATE 
        SET answer_value = 'C1', answer_normalized = 'C1', last_updated = now(), is_stale = false;
      END IF;
      
      IF v_address_q_id IS NOT NULL THEN
        INSERT INTO profile_answers (user_id, question_id, answer_value, answer_normalized, last_updated, is_stale)
        VALUES (p_target_user_id, v_address_q_id, '123 Test Street, Johannesburg', '123 Test Street, Johannesburg', now(), false)
        ON CONFLICT (user_id, question_id) DO UPDATE 
        SET answer_value = '123 Test Street, Johannesburg', answer_normalized = '123 Test Street, Johannesburg', last_updated = now(), is_stale = false;
      END IF;
      
      IF v_income_q_id IS NOT NULL THEN
        INSERT INTO profile_answers (user_id, question_id, answer_value, answer_normalized, last_updated, is_stale)
        VALUES (p_target_user_id, v_income_q_id, '$50,000 - $75,000', '$50,000 - $75,000', now(), false)
        ON CONFLICT (user_id, question_id) DO UPDATE 
        SET answer_value = '$50,000 - $75,000', answer_normalized = '$50,000 - $75,000', last_updated = now(), is_stale = false;
      END IF;
      
      -- Update ONLY control fields in profiles table
      UPDATE profiles SET
        profile_complete = true,
        profile_level = 2,
        profile_completeness_score = 100,
        last_profile_update = now()
      WHERE user_id = p_target_user_id;
      
      v_result = jsonb_build_object('stage', 'full_profile', 'description', 'Full profile completed (Level 1 + 2 in profile_answers)');
    
    WHEN 'first_survey' THEN
      -- Start from full_profile
      PERFORM reset_user_journey(p_caller_user_id, p_target_user_id, 'full_profile');
      
      -- Add first survey
      INSERT INTO earning_activities (user_id, activity_type, title, reward_amount, status, completed_at)
      VALUES (p_target_user_id, 'survey', 'First Test Survey', 5.00, 'completed', now());
      
      -- Update balance and reputation
      UPDATE user_balances SET balance = 5.00, lifetime_earnings = 5.00 WHERE user_id = p_target_user_id;
      UPDATE user_reputation SET 
        score = 150, 
        level = 'Bronze Elite', 
        tier = 'Bronze',
        next_level_threshold = 500
      WHERE user_id = p_target_user_id;
      
      v_result = jsonb_build_object('stage', 'first_survey', 'description', 'Completed first survey, earning $5');
    
    WHEN 'established_user' THEN
      -- Start from first_survey
      PERFORM reset_user_journey(p_caller_user_id, p_target_user_id, 'first_survey');
      
      -- Add 4 more surveys (5 total)
      INSERT INTO earning_activities (user_id, activity_type, title, reward_amount, status, completed_at)
      SELECT p_target_user_id, 'survey', 'Test Survey #' || i, 7.00, 'completed', now() - (i || ' days')::interval
      FROM generate_series(2, 5) i;
      
      -- Update balance and reputation for established user
      UPDATE user_balances SET balance = 50.00, lifetime_earnings = 50.00 WHERE user_id = p_target_user_id;
      UPDATE user_reputation SET 
        score = 850, 
        level = 'Silver Elite', 
        tier = 'Silver',
        next_level_threshold = 1000
      WHERE user_id = p_target_user_id;
      
      v_result = jsonb_build_object('stage', 'established_user', 'description', 'Established user with 5 surveys, $50 earned');
  END CASE;
  
  RETURN v_result;
END;
$$;