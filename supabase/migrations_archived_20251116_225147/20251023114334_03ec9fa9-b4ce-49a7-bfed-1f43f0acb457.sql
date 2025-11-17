-- Phase 1.1: Underage User Prevention System

-- Create country_legal_age table
CREATE TABLE IF NOT EXISTS public.country_legal_age (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL UNIQUE,
  minimum_age INTEGER NOT NULL DEFAULT 18,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_minimum_age CHECK (minimum_age >= 13 AND minimum_age <= 25)
);

-- Enable RLS
ALTER TABLE public.country_legal_age ENABLE ROW LEVEL SECURITY;

-- Policies for country_legal_age
CREATE POLICY "Anyone can view legal ages"
  ON public.country_legal_age
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage legal ages"
  ON public.country_legal_age
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Seed default legal ages
INSERT INTO public.country_legal_age (country_code, minimum_age) VALUES
  ('GLOBAL', 18),
  ('ZA', 18),
  ('NG', 18),
  ('KE', 18),
  ('GB', 18)
ON CONFLICT (country_code) DO NOTHING;

-- Create age validation function
CREATE OR REPLACE FUNCTION public.validate_user_age(
  p_user_id UUID,
  p_date_of_birth DATE
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_country_code TEXT;
  v_minimum_age INTEGER;
  v_user_age INTEGER;
BEGIN
  -- Get user's country code
  SELECT country_code INTO v_country_code
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  -- Get minimum age for country (fallback to GLOBAL)
  SELECT minimum_age INTO v_minimum_age
  FROM public.country_legal_age
  WHERE country_code = COALESCE(v_country_code, 'GLOBAL')
  LIMIT 1;
  
  -- If no specific country rule, use GLOBAL
  IF v_minimum_age IS NULL THEN
    SELECT minimum_age INTO v_minimum_age
    FROM public.country_legal_age
    WHERE country_code = 'GLOBAL';
  END IF;
  
  -- Calculate user's age
  v_user_age := EXTRACT(YEAR FROM AGE(p_date_of_birth));
  
  -- Return true if user meets minimum age
  RETURN v_user_age >= v_minimum_age;
END;
$$;

-- Create trigger function to validate age before saving DOB answers
CREATE OR REPLACE FUNCTION public.check_age_before_save()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_question_key TEXT;
  v_date_of_birth DATE;
  v_is_valid_age BOOLEAN;
BEGIN
  -- Get question key
  SELECT question_key INTO v_question_key
  FROM public.profile_questions
  WHERE id = NEW.question_id;
  
  -- Only check if this is the date_of_birth question
  IF v_question_key = 'date_of_birth' THEN
    -- Extract DOB from answer
    v_date_of_birth := NEW.answer_value::DATE;
    
    -- Validate age
    v_is_valid_age := public.validate_user_age(NEW.user_id, v_date_of_birth);
    
    IF NOT v_is_valid_age THEN
      RAISE EXCEPTION 'User does not meet minimum age requirement for their country';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on profile_answers
DROP TRIGGER IF EXISTS validate_age_on_answer ON public.profile_answers;
CREATE TRIGGER validate_age_on_answer
  BEFORE INSERT OR UPDATE ON public.profile_answers
  FOR EACH ROW
  EXECUTE FUNCTION public.check_age_before_save();

-- Phase 1.2: Country Blocklist System

-- Create country_blocklist table
CREATE TABLE IF NOT EXISTS public.country_blocklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL UNIQUE,
  country_name TEXT NOT NULL,
  dial_code TEXT NOT NULL,
  reason TEXT NOT NULL,
  blocked_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.country_blocklist ENABLE ROW LEVEL SECURITY;

-- Policies for country_blocklist
CREATE POLICY "Admins can manage blocklist"
  ON public.country_blocklist
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view blocklist"
  ON public.country_blocklist
  FOR SELECT
  USING (true);

-- Seed blocked countries (data residency requirements)
INSERT INTO public.country_blocklist (country_code, country_name, dial_code, reason) VALUES
  ('IN', 'India', '+91', 'Data localization law requires data to be stored in India'),
  ('CN', 'China', '+86', 'Data localization law requires data to be stored in China'),
  ('RU', 'Russia', '+7', 'Data localization law requires data to be stored in Russia'),
  ('VN', 'Vietnam', '+84', 'Data localization law requires data to be stored in Vietnam'),
  ('ID', 'Indonesia', '+62', 'Data localization requirements'),
  ('PK', 'Pakistan', '+92', 'Data localization requirements'),
  ('TR', 'Turkey', '+90', 'Data localization requirements'),
  ('KZ', 'Kazakhstan', '+7', 'Data localization requirements')
ON CONFLICT (country_code) DO NOTHING;

-- Add index for faster lookup
CREATE INDEX IF NOT EXISTS idx_country_blocklist_dial_code ON public.country_blocklist(dial_code);