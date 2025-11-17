-- Create profile decay configuration table
CREATE TABLE IF NOT EXISTS public.profile_decay_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  interval_type TEXT NOT NULL,
  interval_days INTEGER,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profile_decay_config ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can manage decay configs"
  ON public.profile_decay_config
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view active decay configs"
  ON public.profile_decay_config
  FOR SELECT
  USING (is_active = true);

-- Seed default intervals
INSERT INTO public.profile_decay_config (config_key, interval_type, interval_days, description) VALUES
  ('decay_weekly', 'Weekly', 7, 'Re-ask question every week'),
  ('decay_monthly', 'Monthly', 30, 'Re-ask question every month'),
  ('decay_quarterly', 'Quarterly', 90, 'Re-ask question every quarter'),
  ('decay_yearly', 'Yearly', 365, 'Re-ask question every year'),
  ('decay_never', 'Never', NULL, 'Never expires (immutable fields)');

-- Add is_immutable column to profile_questions (if not exists)
ALTER TABLE public.profile_questions 
ADD COLUMN IF NOT EXISTS is_immutable BOOLEAN NOT NULL DEFAULT FALSE;

-- Mark immutable fields
UPDATE public.profile_questions 
SET is_immutable = TRUE 
WHERE question_key IN ('gender', 'ethnicity', 'date_of_birth', 'first_name', 'last_name');

-- Add decay_config_key to profile_questions
ALTER TABLE public.profile_questions 
ADD COLUMN IF NOT EXISTS decay_config_key TEXT REFERENCES public.profile_decay_config(config_key);

-- Add default_decay_config_key to profile_categories
ALTER TABLE public.profile_categories 
ADD COLUMN IF NOT EXISTS default_decay_config_key TEXT REFERENCES public.profile_decay_config(config_key);

-- Migrate existing staleness_days to decay_config_key
UPDATE public.profile_questions 
SET decay_config_key = CASE 
  WHEN staleness_days IS NULL OR staleness_days > 365 THEN 'decay_never'
  WHEN staleness_days <= 10 THEN 'decay_weekly'
  WHEN staleness_days <= 45 THEN 'decay_monthly'
  WHEN staleness_days <= 120 THEN 'decay_quarterly'
  ELSE 'decay_yearly'
END
WHERE decay_config_key IS NULL;

-- Set immutable fields to never decay
UPDATE public.profile_questions 
SET decay_config_key = 'decay_never'
WHERE is_immutable = TRUE;

-- Set default category decay configs
UPDATE public.profile_categories 
SET default_decay_config_key = 'decay_yearly'
WHERE default_decay_config_key IS NULL;

-- Add updated_at trigger for profile_decay_config
CREATE TRIGGER update_profile_decay_config_updated_at
  BEFORE UPDATE ON public.profile_decay_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.profile_decay_config IS 'Admin-configurable intervals for profile question decay/staleness';
COMMENT ON COLUMN public.profile_questions.is_immutable IS 'When TRUE, users cannot change this field after initial answer';
COMMENT ON COLUMN public.profile_questions.decay_config_key IS 'Override decay interval for this question. Falls back to category default if NULL';
COMMENT ON COLUMN public.profile_categories.default_decay_config_key IS 'Default decay interval for all questions in this category';