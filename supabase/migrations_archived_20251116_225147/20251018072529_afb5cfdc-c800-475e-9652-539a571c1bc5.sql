-- ============================================
-- PROFILE SYSTEM ARCHITECTURE - DATABASE SCHEMA
-- Phase 1: Create tables, RLS policies, seed data
-- ============================================

-- 1. CREATE PROFILE CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.profile_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  level INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on profile_categories
ALTER TABLE public.profile_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profile_categories
CREATE POLICY "All authenticated users can view active categories"
  ON public.profile_categories FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON public.profile_categories FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- 2. CREATE PROFILE QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.profile_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.profile_categories(id) ON DELETE CASCADE,
  question_key TEXT NOT NULL UNIQUE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('text', 'select', 'multiselect', 'date', 'number', 'address', 'email', 'phone', 'boolean')),
  validation_rules JSONB DEFAULT '{}',
  options JSONB,
  placeholder TEXT,
  help_text TEXT,
  level INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  staleness_days INTEGER DEFAULT 365,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on profile_questions
ALTER TABLE public.profile_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profile_questions
CREATE POLICY "All authenticated users can view active questions"
  ON public.profile_questions FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage questions"
  ON public.profile_questions FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- 3. CREATE PROFILE ANSWERS TABLE
CREATE TABLE IF NOT EXISTS public.profile_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.profile_questions(id) ON DELETE CASCADE,
  answer_value TEXT,
  answer_json JSONB,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  last_updated TIMESTAMPTZ DEFAULT now(),
  is_stale BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, question_id)
);

-- Enable RLS on profile_answers
ALTER TABLE public.profile_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profile_answers
CREATE POLICY "Users can view own answers"
  ON public.profile_answers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own answers"
  ON public.profile_answers FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own answers"
  ON public.profile_answers FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all answers"
  ON public.profile_answers FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage answers"
  ON public.profile_answers FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- 4. CREATE ADDRESS COMPONENTS TABLE
CREATE TABLE IF NOT EXISTS public.address_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id TEXT,
  formatted_address TEXT NOT NULL,
  street_number TEXT,
  route TEXT,
  locality TEXT,
  administrative_area_level_1 TEXT,
  administrative_area_level_2 TEXT,
  country TEXT,
  postal_code TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  is_primary BOOLEAN DEFAULT true,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on address_components
ALTER TABLE public.address_components ENABLE ROW LEVEL SECURITY;

-- RLS Policies for address_components
CREATE POLICY "Users can view own addresses"
  ON public.address_components FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own addresses"
  ON public.address_components FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own addresses"
  ON public.address_components FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all addresses"
  ON public.address_components FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- 5. ENHANCE PROFILES TABLE
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS profile_level INTEGER DEFAULT 1 CHECK (profile_level IN (1, 2, 3)),
  ADD COLUMN IF NOT EXISTS profile_completeness_score INTEGER DEFAULT 0 CHECK (profile_completeness_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS last_profile_update TIMESTAMPTZ DEFAULT now();

-- 6. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profile_questions_category ON public.profile_questions(category_id);
CREATE INDEX IF NOT EXISTS idx_profile_questions_level ON public.profile_questions(level);
CREATE INDEX IF NOT EXISTS idx_profile_answers_user ON public.profile_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_answers_question ON public.profile_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_profile_answers_stale ON public.profile_answers(is_stale);
CREATE INDEX IF NOT EXISTS idx_address_components_user ON public.address_components(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_level ON public.profiles(profile_level);

-- 7. CREATE TRIGGER FOR AUTOMATIC UPDATED_AT
CREATE OR REPLACE FUNCTION update_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profile_categories_timestamp
  BEFORE UPDATE ON public.profile_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_timestamp();

CREATE TRIGGER update_profile_questions_timestamp
  BEFORE UPDATE ON public.profile_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_timestamp();

CREATE TRIGGER update_address_components_timestamp
  BEFORE UPDATE ON public.address_components
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_timestamp();

-- 8. SEED PROFILE CATEGORIES
INSERT INTO public.profile_categories (name, display_name, description, icon, level, display_order) VALUES
('identity_security', 'Identity & Security', 'Core identity and account security', 'Shield', 1, 1),
('demographics', 'Demographics', 'Basic demographic information', 'Users', 2, 2),
('financial', 'Financial Profile', 'Income and financial information', 'DollarSign', 2, 3),
('employment', 'Employment & Career', 'Work and career details', 'Briefcase', 3, 4),
('lifestyle', 'Lifestyle & Housing', 'Living situation and preferences', 'Home', 3, 5),
('automotive', 'Automotive & Transportation', 'Vehicle and transportation info', 'Car', 3, 6)
ON CONFLICT (name) DO NOTHING;

-- 9. SEED PROFILE QUESTIONS - LEVEL 1 (Identity & Security)
INSERT INTO public.profile_questions (category_id, question_key, question_text, question_type, level, is_required, display_order, staleness_days) 
SELECT id, 'first_name', 'First Name', 'text', 1, true, 1, 365 FROM public.profile_categories WHERE name = 'identity_security'
ON CONFLICT (question_key) DO NOTHING;

INSERT INTO public.profile_questions (category_id, question_key, question_text, question_type, level, is_required, display_order, staleness_days)
SELECT id, 'last_name', 'Last Name', 'text', 1, true, 2, 365 FROM public.profile_categories WHERE name = 'identity_security'
ON CONFLICT (question_key) DO NOTHING;

INSERT INTO public.profile_questions (category_id, question_key, question_text, question_type, level, is_required, display_order, staleness_days)
SELECT id, 'email', 'Email Address', 'email', 1, true, 3, 180 FROM public.profile_categories WHERE name = 'identity_security'
ON CONFLICT (question_key) DO NOTHING;

INSERT INTO public.profile_questions (category_id, question_key, question_text, question_type, level, is_required, display_order, staleness_days)
SELECT id, 'mobile', 'Mobile Number', 'phone', 1, true, 4, 180 FROM public.profile_categories WHERE name = 'identity_security'
ON CONFLICT (question_key) DO NOTHING;

INSERT INTO public.profile_questions (category_id, question_key, question_text, question_type, level, is_required, display_order, staleness_days)
SELECT id, 'date_of_birth', 'Date of Birth', 'date', 1, true, 5, 9999 FROM public.profile_categories WHERE name = 'identity_security'
ON CONFLICT (question_key) DO NOTHING;

-- SEED PROFILE QUESTIONS - LEVEL 2 (Demographics)
INSERT INTO public.profile_questions (category_id, question_key, question_text, question_type, level, is_required, display_order, options, staleness_days)
SELECT id, 'gender', 'Gender', 'select', 2, true, 1, '["male", "female", "other"]'::jsonb, 9999 FROM public.profile_categories WHERE name = 'demographics'
ON CONFLICT (question_key) DO NOTHING;

INSERT INTO public.profile_questions (category_id, question_key, question_text, question_type, level, is_required, display_order, staleness_days)
SELECT id, 'address', 'Address', 'address', 2, true, 2, 365 FROM public.profile_categories WHERE name = 'demographics'
ON CONFLICT (question_key) DO NOTHING;

INSERT INTO public.profile_questions (category_id, question_key, question_text, question_type, level, is_required, display_order, options, staleness_days)
SELECT id, 'ethnicity', 'Ethnicity', 'select', 2, false, 3, '["Asian", "Black", "Hispanic", "White", "Other"]'::jsonb, 9999 FROM public.profile_categories WHERE name = 'demographics'
ON CONFLICT (question_key) DO NOTHING;

-- SEED PROFILE QUESTIONS - LEVEL 2 (Financial)
INSERT INTO public.profile_questions (category_id, question_key, question_text, question_type, level, is_required, display_order, options, staleness_days)
SELECT id, 'household_income', 'Household Income', 'select', 2, true, 1, '["Under $25k", "$25k-$50k", "$50k-$75k", "$75k-$100k", "Over $100k"]'::jsonb, 365 FROM public.profile_categories WHERE name = 'financial'
ON CONFLICT (question_key) DO NOTHING;

INSERT INTO public.profile_questions (category_id, question_key, question_text, question_type, level, is_required, display_order, options, staleness_days)
SELECT id, 'sec', 'Socioeconomic Class', 'select', 2, true, 2, '["A", "B", "C1", "C2", "D", "E"]'::jsonb, 365 FROM public.profile_categories WHERE name = 'financial'
ON CONFLICT (question_key) DO NOTHING;

-- 10. MIGRATE EXISTING PROFILE DATA TO ANSWERS TABLE
INSERT INTO public.profile_answers (user_id, question_id, answer_value, last_updated)
SELECT 
  p.user_id,
  q.id,
  p.first_name,
  p.updated_at
FROM public.profiles p
CROSS JOIN public.profile_questions q
WHERE q.question_key = 'first_name' AND p.first_name IS NOT NULL
ON CONFLICT (user_id, question_id) DO NOTHING;

INSERT INTO public.profile_answers (user_id, question_id, answer_value, last_updated)
SELECT 
  p.user_id,
  q.id,
  p.last_name,
  p.updated_at
FROM public.profiles p
CROSS JOIN public.profile_questions q
WHERE q.question_key = 'last_name' AND p.last_name IS NOT NULL
ON CONFLICT (user_id, question_id) DO NOTHING;

-- Email column does not exist in profiles table, skipping migration
-- INSERT INTO public.profile_answers (user_id, question_id, answer_value, last_updated)
-- SELECT 
--   p.user_id,
--   q.id,
--   p.email,
--   p.updated_at
-- FROM public.profiles p
-- CROSS JOIN public.profile_questions q
-- WHERE q.question_key = 'email' AND p.email IS NOT NULL
-- ON CONFLICT (user_id, question_id) DO NOTHING;

INSERT INTO public.profile_answers (user_id, question_id, answer_value, last_updated)
SELECT 
  p.user_id,
  q.id,
  p.mobile,
  p.updated_at
FROM public.profiles p
CROSS JOIN public.profile_questions q
WHERE q.question_key = 'mobile' AND p.mobile IS NOT NULL
ON CONFLICT (user_id, question_id) DO NOTHING;

INSERT INTO public.profile_answers (user_id, question_id, answer_value, last_updated)
SELECT 
  p.user_id,
  q.id,
  p.date_of_birth::text,
  p.updated_at
FROM public.profiles p
CROSS JOIN public.profile_questions q
WHERE q.question_key = 'date_of_birth' AND p.date_of_birth IS NOT NULL
ON CONFLICT (user_id, question_id) DO NOTHING;

INSERT INTO public.profile_answers (user_id, question_id, answer_value, last_updated)
SELECT 
  p.user_id,
  q.id,
  p.gender,
  p.updated_at
FROM public.profiles p
CROSS JOIN public.profile_questions q
WHERE q.question_key = 'gender' AND p.gender IS NOT NULL
ON CONFLICT (user_id, question_id) DO NOTHING;

INSERT INTO public.profile_answers (user_id, question_id, answer_value, last_updated)
SELECT 
  p.user_id,
  q.id,
  p.address,
  p.updated_at
FROM public.profiles p
CROSS JOIN public.profile_questions q
WHERE q.question_key = 'address' AND p.address IS NOT NULL
ON CONFLICT (user_id, question_id) DO NOTHING;

INSERT INTO public.profile_answers (user_id, question_id, answer_value, last_updated)
SELECT 
  p.user_id,
  q.id,
  p.ethnicity,
  p.updated_at
FROM public.profiles p
CROSS JOIN public.profile_questions q
WHERE q.question_key = 'ethnicity' AND p.ethnicity IS NOT NULL
ON CONFLICT (user_id, question_id) DO NOTHING;

INSERT INTO public.profile_answers (user_id, question_id, answer_value, last_updated)
SELECT 
  p.user_id,
  q.id,
  p.household_income,
  p.updated_at
FROM public.profiles p
CROSS JOIN public.profile_questions q
WHERE q.question_key = 'household_income' AND p.household_income IS NOT NULL
ON CONFLICT (user_id, question_id) DO NOTHING;

INSERT INTO public.profile_answers (user_id, question_id, answer_value, last_updated)
SELECT 
  p.user_id,
  q.id,
  p.sec,
  p.updated_at
FROM public.profiles p
CROSS JOIN public.profile_questions q
WHERE q.question_key = 'sec' AND p.sec IS NOT NULL
ON CONFLICT (user_id, question_id) DO NOTHING;