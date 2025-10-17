-- Phase 2 Chunk 1: Database Schema Fixes for Reputation Beta Pitfalls

-- A. Add beta cohort tracking columns to user_reputation
ALTER TABLE public.user_reputation
ADD COLUMN IF NOT EXISTS beta_cohort BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS cohort_joined_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS beta_rep_cap INTEGER DEFAULT 1000;

-- Create index for efficient beta cohort queries
CREATE INDEX IF NOT EXISTS idx_user_reputation_beta_cohort 
ON public.user_reputation(beta_cohort);

-- B. Function to automatically create user_reputation when profile is created
CREATE OR REPLACE FUNCTION public.handle_new_user_reputation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_reputation (
    user_id,
    score,
    level,
    tier,
    prestige,
    next_level_threshold,
    history,
    quality_metrics,
    beta_cohort,
    cohort_joined_at,
    beta_rep_cap
  )
  VALUES (
    NEW.user_id,
    0,
    'Bronze Novice',
    'Bronze',
    0,
    100,
    '[]'::jsonb,
    '{"surveysCompleted": 0, "surveysRejected": 0, "averageTime": "0 min", "consistencyScore": 0, "speedingRate": 0}'::jsonb,
    true,
    NOW(),
    1000
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger on profile creation
DROP TRIGGER IF EXISTS on_profile_created_reputation ON public.profiles;
CREATE TRIGGER on_profile_created_reputation
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_reputation();

-- C. Admin function to manually adjust reputation
CREATE OR REPLACE FUNCTION public.admin_adjust_reputation(
  p_user_id UUID,
  p_points INT,
  p_reason TEXT,
  p_admin_note TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_rep RECORD;
  v_new_score INT;
  v_new_tier TEXT;
  v_new_level TEXT;
  v_new_threshold INT;
  v_transaction_id UUID;
  v_new_history JSONB;
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can adjust reputation';
  END IF;

  -- Get current reputation
  SELECT * INTO v_current_rep
  FROM public.user_reputation
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User reputation not found';
  END IF;

  -- Calculate new score (floor at 0)
  v_new_score := GREATEST(0, v_current_rep.score + p_points);

  -- Calculate new tier/level
  IF v_new_score >= 2000 THEN
    v_new_tier := 'Diamond';
    v_new_level := 'Diamond Master';
    v_new_threshold := 5000;
  ELSIF v_new_score >= 1000 THEN
    v_new_tier := 'Gold';
    v_new_level := 'Gold Elite';
    v_new_threshold := 2000;
  ELSIF v_new_score >= 500 THEN
    v_new_tier := 'Silver';
    v_new_level := 'Silver Elite';
    v_new_threshold := 1000;
  ELSIF v_new_score >= 100 THEN
    v_new_tier := 'Bronze';
    v_new_level := 'Bronze Champion';
    v_new_threshold := 500;
  ELSE
    v_new_tier := 'Bronze';
    v_new_level := 'Bronze Novice';
    v_new_threshold := 100;
  END IF;

  -- Generate transaction ID
  v_transaction_id := gen_random_uuid();

  -- Build new history entry (expanded schema)
  v_new_history := jsonb_build_object(
    'transaction_id', v_transaction_id,
    'action', 'Admin Adjustment: ' || p_reason,
    'points', p_points,
    'date', NOW(),
    'category', 'admin',
    'description', p_reason,
    'metadata', jsonb_build_object('admin_note', p_admin_note),
    'type', CASE WHEN p_points >= 0 THEN 'gain' ELSE 'adjustment' END
  );

  -- Update reputation with new history prepended
  UPDATE public.user_reputation
  SET
    score = v_new_score,
    tier = v_new_tier,
    level = v_new_level,
    next_level_threshold = v_new_threshold,
    history = jsonb_build_array(v_new_history) || 
              CASE 
                WHEN jsonb_array_length(history) >= 50 
                THEN history[0:49] 
                ELSE history 
              END,
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$;