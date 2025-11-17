-- =====================================================
-- PHASE 2: DATABASE SCHEMA ENHANCEMENTS
-- =====================================================

-- Step 1: Add short_id columns to core tables
-- =====================================================

-- Add short_id to profile_questions
ALTER TABLE profile_questions ADD COLUMN IF NOT EXISTS short_id TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_profile_questions_short_id ON profile_questions(short_id);

-- Add short_id to profile_categories  
ALTER TABLE profile_categories ADD COLUMN IF NOT EXISTS short_id TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_profile_categories_short_id ON profile_categories(short_id);

-- Add short_id to profiles (for user IDs like USR_WARLER001)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS short_id TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_profiles_short_id ON profiles(short_id);

-- Step 2: Backfill short_ids for existing questions
-- =====================================================

-- Level 1 Questions
UPDATE profile_questions SET short_id = 'Q_L1_FIRSTNAME' WHERE question_key = 'first_name' AND short_id IS NULL;
UPDATE profile_questions SET short_id = 'Q_L1_LASTNAME' WHERE question_key = 'last_name' AND short_id IS NULL;
UPDATE profile_questions SET short_id = 'Q_L1_EMAIL' WHERE question_key = 'email' AND short_id IS NULL;
UPDATE profile_questions SET short_id = 'Q_L1_MOBILE' WHERE question_key = 'mobile' AND short_id IS NULL;
UPDATE profile_questions SET short_id = 'Q_L1_DOB' WHERE question_key = 'date_of_birth' AND short_id IS NULL;

-- Level 2 Questions
UPDATE profile_questions SET short_id = 'Q_L2_GENDER' WHERE question_key = 'gender' AND short_id IS NULL;
UPDATE profile_questions SET short_id = 'Q_L2_ADDRESS' WHERE question_key = 'address' AND short_id IS NULL;
UPDATE profile_questions SET short_id = 'Q_L2_HHINCOME' WHERE question_key = 'household_income' AND short_id IS NULL;
UPDATE profile_questions SET short_id = 'Q_L2_ETHNICITY' WHERE question_key = 'ethnicity' AND short_id IS NULL;

-- Rename SEC to SES (Socioeconomic Status)
UPDATE profile_questions 
SET 
  question_key = 'socioeconomic_status',
  short_id = 'Q_L2_SES',
  question_text = 'Socioeconomic Status',
  applicability = 'country_specific'
WHERE question_key = 'sec' AND short_id IS NULL;

-- Backfill Categories
UPDATE profile_categories SET short_id = 'CAT_L1_IDENTITY' 
WHERE level = 1 AND short_id IS NULL 
AND (name ILIKE '%identity%' OR name ILIKE '%basic%' OR name ILIKE '%essential%');

UPDATE profile_categories SET short_id = 'CAT_L2_DEMOGRAPHICS' 
WHERE level = 2 AND short_id IS NULL 
AND (name ILIKE '%demographic%' OR name ILIKE '%profile%' OR name ILIKE '%about%');

UPDATE profile_categories SET short_id = 'CAT_L3_LIFESTYLE' 
WHERE level = 3 AND short_id IS NULL 
AND (name ILIKE '%lifestyle%' OR name ILIKE '%preferences%' OR name ILIKE '%interests%');

-- Step 3: Create question_answer_options table
-- =====================================================

CREATE TABLE IF NOT EXISTS question_answer_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id TEXT UNIQUE NOT NULL,
  question_id UUID NOT NULL REFERENCES profile_questions(id) ON DELETE CASCADE,
  question_short_id TEXT NOT NULL,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(question_id, value)
);

CREATE INDEX IF NOT EXISTS idx_answer_options_question ON question_answer_options(question_id);
CREATE INDEX IF NOT EXISTS idx_answer_options_short_id ON question_answer_options(short_id);
CREATE INDEX IF NOT EXISTS idx_answer_options_question_short ON question_answer_options(question_short_id);

-- Enable RLS
ALTER TABLE question_answer_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage answer options"
  ON question_answer_options FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view active options"
  ON question_answer_options FOR SELECT
  USING (is_active = true);

-- Add updated_at trigger
CREATE TRIGGER update_answer_options_updated_at 
  BEFORE UPDATE ON question_answer_options
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 4: Update profile_answers table
-- =====================================================

ALTER TABLE profile_answers 
ADD COLUMN IF NOT EXISTS selected_option_short_id TEXT;

CREATE INDEX IF NOT EXISTS idx_profile_answers_option_short_id 
ON profile_answers(selected_option_short_id);

-- Step 5: Migrate existing JSONB options to relational table
-- =====================================================

-- Gender options
INSERT INTO question_answer_options (short_id, question_id, question_short_id, value, label, display_order)
SELECT 
  'Q_L2_GENDER_MALE_001',
  id,
  'Q_L2_GENDER',
  'male',
  'Guy 👨',
  1
FROM profile_questions WHERE short_id = 'Q_L2_GENDER'
ON CONFLICT (short_id) DO NOTHING;

INSERT INTO question_answer_options (short_id, question_id, question_short_id, value, label, display_order)
SELECT 
  'Q_L2_GENDER_FEMALE_001',
  id,
  'Q_L2_GENDER',
  'female',
  'Lady 👩',
  2
FROM profile_questions WHERE short_id = 'Q_L2_GENDER'
ON CONFLICT (short_id) DO NOTHING;

INSERT INTO question_answer_options (short_id, question_id, question_short_id, value, label, display_order)
SELECT 
  'Q_L2_GENDER_OTHER_001',
  id,
  'Q_L2_GENDER',
  'other',
  'Other / Prefer not to say',
  3
FROM profile_questions WHERE short_id = 'Q_L2_GENDER'
ON CONFLICT (short_id) DO NOTHING;

-- Household Income options (Global fallback)
INSERT INTO question_answer_options (short_id, question_id, question_short_id, value, label, display_order)
SELECT 
  'Q_L2_HHINCOME_GLOBAL_UNDER25K_001',
  id,
  'Q_L2_HHINCOME',
  'Under $25k',
  'Under $25k',
  1
FROM profile_questions WHERE short_id = 'Q_L2_HHINCOME'
ON CONFLICT (short_id) DO NOTHING;

INSERT INTO question_answer_options (short_id, question_id, question_short_id, value, label, display_order)
SELECT 'Q_L2_HHINCOME_GLOBAL_25K50K_001', id, 'Q_L2_HHINCOME', '$25k-$50k', '$25k-$50k', 2
FROM profile_questions WHERE short_id = 'Q_L2_HHINCOME'
ON CONFLICT (short_id) DO NOTHING;

INSERT INTO question_answer_options (short_id, question_id, question_short_id, value, label, display_order)
SELECT 'Q_L2_HHINCOME_GLOBAL_50K75K_001', id, 'Q_L2_HHINCOME', '$50k-$75k', '$50k-$75k', 3
FROM profile_questions WHERE short_id = 'Q_L2_HHINCOME'
ON CONFLICT (short_id) DO NOTHING;

INSERT INTO question_answer_options (short_id, question_id, question_short_id, value, label, display_order)
SELECT 'Q_L2_HHINCOME_GLOBAL_75K100K_001', id, 'Q_L2_HHINCOME', '$75k-$100k', '$75k-$100k', 4
FROM profile_questions WHERE short_id = 'Q_L2_HHINCOME'
ON CONFLICT (short_id) DO NOTHING;

INSERT INTO question_answer_options (short_id, question_id, question_short_id, value, label, display_order)
SELECT 'Q_L2_HHINCOME_GLOBAL_OVER100K_001', id, 'Q_L2_HHINCOME', 'Over $100k', 'Over $100k', 5
FROM profile_questions WHERE short_id = 'Q_L2_HHINCOME'
ON CONFLICT (short_id) DO NOTHING;

-- Ethnicity options (Global fallback)
INSERT INTO question_answer_options (short_id, question_id, question_short_id, value, label, display_order)
SELECT 'Q_L2_ETHNICITY_GLOBAL_ASIAN_001', id, 'Q_L2_ETHNICITY', 'Asian', 'Asian', 1
FROM profile_questions WHERE short_id = 'Q_L2_ETHNICITY'
ON CONFLICT (short_id) DO NOTHING;

INSERT INTO question_answer_options (short_id, question_id, question_short_id, value, label, display_order)
SELECT 'Q_L2_ETHNICITY_GLOBAL_BLACK_001', id, 'Q_L2_ETHNICITY', 'Black', 'Black', 2
FROM profile_questions WHERE short_id = 'Q_L2_ETHNICITY'
ON CONFLICT (short_id) DO NOTHING;

INSERT INTO question_answer_options (short_id, question_id, question_short_id, value, label, display_order)
SELECT 'Q_L2_ETHNICITY_GLOBAL_HISPANIC_001', id, 'Q_L2_ETHNICITY', 'Hispanic', 'Hispanic', 3
FROM profile_questions WHERE short_id = 'Q_L2_ETHNICITY'
ON CONFLICT (short_id) DO NOTHING;

INSERT INTO question_answer_options (short_id, question_id, question_short_id, value, label, display_order)
SELECT 'Q_L2_ETHNICITY_GLOBAL_WHITE_001', id, 'Q_L2_ETHNICITY', 'White', 'White', 4
FROM profile_questions WHERE short_id = 'Q_L2_ETHNICITY'
ON CONFLICT (short_id) DO NOTHING;

INSERT INTO question_answer_options (short_id, question_id, question_short_id, value, label, display_order)
SELECT 'Q_L2_ETHNICITY_GLOBAL_OTHER_001', id, 'Q_L2_ETHNICITY', 'Other', 'Other', 5
FROM profile_questions WHERE short_id = 'Q_L2_ETHNICITY'
ON CONFLICT (short_id) DO NOTHING;

-- SES options (Global fallback - will be country-specific later)
INSERT INTO question_answer_options (short_id, question_id, question_short_id, value, label, display_order)
SELECT 'Q_L2_SES_GLOBAL_A_001', id, 'Q_L2_SES', 'A', 'Class A (High Income)', 1
FROM profile_questions WHERE short_id = 'Q_L2_SES'
ON CONFLICT (short_id) DO NOTHING;

INSERT INTO question_answer_options (short_id, question_id, question_short_id, value, label, display_order)
SELECT 'Q_L2_SES_GLOBAL_B_001', id, 'Q_L2_SES', 'B', 'Class B (Upper Middle)', 2
FROM profile_questions WHERE short_id = 'Q_L2_SES'
ON CONFLICT (short_id) DO NOTHING;

INSERT INTO question_answer_options (short_id, question_id, question_short_id, value, label, display_order)
SELECT 'Q_L2_SES_GLOBAL_C1_001', id, 'Q_L2_SES', 'C1', 'Class C1 (Middle)', 3
FROM profile_questions WHERE short_id = 'Q_L2_SES'
ON CONFLICT (short_id) DO NOTHING;

INSERT INTO question_answer_options (short_id, question_id, question_short_id, value, label, display_order)
SELECT 'Q_L2_SES_GLOBAL_C2_001', id, 'Q_L2_SES', 'C2', 'Class C2 (Lower Middle)', 4
FROM profile_questions WHERE short_id = 'Q_L2_SES'
ON CONFLICT (short_id) DO NOTHING;

INSERT INTO question_answer_options (short_id, question_id, question_short_id, value, label, display_order)
SELECT 'Q_L2_SES_GLOBAL_D_001', id, 'Q_L2_SES', 'D', 'Class D (Working Class)', 5
FROM profile_questions WHERE short_id = 'Q_L2_SES'
ON CONFLICT (short_id) DO NOTHING;

INSERT INTO question_answer_options (short_id, question_id, question_short_id, value, label, display_order)
SELECT 'Q_L2_SES_GLOBAL_E_001', id, 'Q_L2_SES', 'E', 'Class E (Low Income)', 6
FROM profile_questions WHERE short_id = 'Q_L2_SES'
ON CONFLICT (short_id) DO NOTHING;

-- Step 6: Backfill selected_option_short_id in profile_answers
-- =====================================================

UPDATE profile_answers pa
SET selected_option_short_id = qao.short_id
FROM question_answer_options qao
WHERE pa.question_id = qao.question_id
  AND pa.answer_value = qao.value
  AND pa.selected_option_short_id IS NULL;