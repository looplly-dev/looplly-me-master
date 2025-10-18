-- Phase 1: Database Schema Enhancement

-- Add columns to profile_questions
ALTER TABLE profile_questions 
  ADD COLUMN IF NOT EXISTS applicability TEXT DEFAULT 'global' CHECK (applicability IN ('global', 'country_specific')),
  ADD COLUMN IF NOT EXISTS country_codes TEXT[],
  ADD COLUMN IF NOT EXISTS targeting_tags TEXT[],
  ADD COLUMN IF NOT EXISTS question_group TEXT;

-- Create country_question_options table
CREATE TABLE IF NOT EXISTS country_question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES profile_questions(id) ON DELETE CASCADE,
  country_code TEXT NOT NULL,
  options JSONB NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_question_country UNIQUE(question_id, country_code)
);

-- Enable RLS on country_question_options
ALTER TABLE country_question_options ENABLE ROW LEVEL SECURITY;

-- RLS Policies for country_question_options
CREATE POLICY "Admins can manage country options"
  ON country_question_options
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view country options"
  ON country_question_options
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Add targeting columns to profile_answers
ALTER TABLE profile_answers
  ADD COLUMN IF NOT EXISTS answer_normalized TEXT,
  ADD COLUMN IF NOT EXISTS targeting_metadata JSONB DEFAULT '{}';

-- Create trigger function for targeting metadata
CREATE OR REPLACE FUNCTION compute_targeting_metadata()
RETURNS TRIGGER AS $$
DECLARE
  v_question RECORD;
BEGIN
  -- Fetch question metadata
  SELECT question_key, targeting_tags, question_group
  INTO v_question
  FROM profile_questions
  WHERE id = NEW.question_id;
  
  -- Normalize answer value
  NEW.answer_normalized := CASE
    WHEN NEW.answer_value IS NOT NULL THEN NEW.answer_value
    WHEN NEW.answer_json IS NOT NULL THEN 
      COALESCE(
        NEW.answer_json->>'value',
        NEW.answer_json->>'formatted_address'
      )
    ELSE NULL
  END;
  
  -- Cache targeting metadata
  NEW.targeting_metadata := jsonb_build_object(
    'question_key', v_question.question_key,
    'tags', COALESCE(v_question.targeting_tags, ARRAY[]::TEXT[]),
    'group', v_question.question_group
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS compute_targeting_trigger ON profile_answers;
CREATE TRIGGER compute_targeting_trigger
  BEFORE INSERT OR UPDATE ON profile_answers
  FOR EACH ROW
  EXECUTE FUNCTION compute_targeting_metadata();

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_questions_targeting ON profile_questions USING GIN(targeting_tags);
CREATE INDEX IF NOT EXISTS idx_questions_country ON profile_questions USING GIN(country_codes);
CREATE INDEX IF NOT EXISTS idx_questions_group ON profile_questions(question_group);
CREATE INDEX IF NOT EXISTS idx_questions_applicability ON profile_questions(applicability);
CREATE INDEX IF NOT EXISTS idx_country_options_question ON country_question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_country_options_country ON country_question_options(country_code);
CREATE INDEX IF NOT EXISTS idx_answers_normalized ON profile_answers(answer_normalized);
CREATE INDEX IF NOT EXISTS idx_answers_user_question ON profile_answers(user_id, question_id);
CREATE INDEX IF NOT EXISTS idx_answers_targeting_metadata ON profile_answers USING GIN(targeting_metadata);
CREATE INDEX IF NOT EXISTS idx_answers_user_normalized ON profile_answers(user_id, answer_normalized);

-- Phase 2: Migrate Existing Questions

-- Mark global questions
UPDATE profile_questions 
SET 
  applicability = 'global',
  targeting_tags = ARRAY['demographics', 'targeting_core']
WHERE question_key IN (
  'gender',
  'date_of_birth',
  'ethnicity',
  'first_name',
  'last_name'
) AND applicability IS NULL;

-- Mark income-related questions as country-specific
UPDATE profile_questions 
SET 
  applicability = 'country_specific',
  country_codes = ARRAY['ZA', 'NG', 'KE', 'GB', 'IN'],
  question_group = CASE 
    WHEN question_key LIKE '%income%' THEN question_key || '_group'
    WHEN question_key IN ('sec', 'sem', 'nccs') THEN question_key || '_group'
    ELSE NULL
  END,
  targeting_tags = ARRAY['income', 'financial', 'targeting_core']
WHERE (question_key LIKE '%income%' OR question_key IN ('sec', 'sem', 'nccs'))
  AND applicability IS NULL;

-- Create targeting functions
CREATE OR REPLACE FUNCTION find_users_by_criteria(
  p_country_code TEXT,
  p_criteria JSONB
) RETURNS TABLE(
  user_id UUID,
  match_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH matching_users AS (
    SELECT 
      pa.user_id,
      COUNT(*) as criteria_matched
    FROM profile_answers pa
    JOIN profiles p ON p.user_id = pa.user_id
    CROSS JOIN LATERAL jsonb_each_text(p_criteria) AS criteria(key, vals)
    WHERE 
      p.country_code = p_country_code
      AND pa.targeting_metadata->>'question_key' = criteria.key
      AND pa.answer_normalized = ANY(
        SELECT jsonb_array_elements_text(criteria.vals::jsonb)
      )
    GROUP BY pa.user_id
  )
  SELECT 
    mu.user_id,
    mu.criteria_matched::INTEGER as match_score
  FROM matching_users mu
  ORDER BY mu.criteria_matched DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Grant access to service role
GRANT EXECUTE ON FUNCTION find_users_by_criteria TO service_role;

CREATE OR REPLACE FUNCTION get_targeting_values_by_question(
  p_country_code TEXT,
  p_question_key TEXT
) RETURNS TABLE(
  value TEXT,
  user_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pa.answer_normalized,
    COUNT(DISTINCT pa.user_id) as user_count
  FROM profile_answers pa
  JOIN profiles p ON p.user_id = pa.user_id
  WHERE 
    p.country_code = p_country_code
    AND pa.targeting_metadata->>'question_key' = p_question_key
  GROUP BY pa.answer_normalized
  ORDER BY user_count DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Grant access to service role
GRANT EXECUTE ON FUNCTION get_targeting_values_by_question TO service_role;