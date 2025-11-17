-- ============================================================================
-- SEED LEVEL 2 PROFILE QUESTIONS
-- ============================================================================
-- This migration seeds the profile_categories and profile_questions tables
-- with Level 2 questions needed for the "Complete Profile" flow.
--
-- STRUCTURE:
-- 1. Profile Categories (Level 2)
-- 2. Profile Questions (Level 2)
-- 3. Question Answer Options
-- ============================================================================

-- ============================================================================
-- SECTION 1: PROFILE CATEGORIES (LEVEL 2)
-- ============================================================================

INSERT INTO public.profile_categories (id, name, display_name, description, icon, level, display_order, is_active)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'demographics', 'Demographics', 'Basic demographic information', '👤', 2, 1, true),
  ('22222222-2222-2222-2222-222222222222', 'lifestyle', 'Lifestyle', 'Lifestyle and interests', '🏡', 2, 2, true),
  ('33333333-3333-3333-3333-333333333333', 'consumer', 'Consumer Behavior', 'Shopping and spending habits', '🛒', 2, 3, true),
  ('44444444-4444-4444-4444-444444444444', 'employment', 'Employment', 'Work and education', '💼', 2, 4, true),
  ('55555555-5555-5555-5555-555555555555', 'family', 'Family & Household', 'Household composition', '👨‍👩‍👧‍👦', 2, 5, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SECTION 2: PROFILE QUESTIONS (LEVEL 2)
-- ============================================================================

-- Demographics Category
INSERT INTO public.profile_questions (
  id, category_id, question_key, question_text, question_type, 
  validation_rules, options, placeholder, help_text, 
  level, is_required, display_order, is_active, staleness_days, is_immutable
)
VALUES
  -- Gender
  (
    '10000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'gender',
    'What is your gender?',
    'select',
    '{"required": true}'::jsonb,
    '["male", "female", "other", "prefer_not_to_say"]'::jsonb,
    NULL,
    'This helps us provide relevant opportunities',
    2,
    true,
    1,
    true,
    730,
    false
  ),
  
  -- Ethnicity
  (
    '10000000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'ethnicity',
    'What is your ethnicity?',
    'select',
    '{"required": false}'::jsonb,
    '["african", "coloured", "indian", "white", "asian", "other", "prefer_not_to_say"]'::jsonb,
    NULL,
    'Optional demographic information',
    2,
    false,
    2,
    true,
    730,
    false
  ),
  
  -- Education Level
  (
    '10000000-0000-0000-0000-000000000003',
    '44444444-4444-4444-4444-444444444444',
    'education_level',
    'What is your highest level of education?',
    'select',
    '{"required": true}'::jsonb,
    '["high_school", "some_college", "bachelors", "masters", "doctorate", "vocational", "other"]'::jsonb,
    NULL,
    'Your highest completed education level',
    2,
    true,
    1,
    true,
    365,
    false
  ),
  
  -- Employment Status
  (
    '10000000-0000-0000-0000-000000000004',
    '44444444-4444-4444-4444-444444444444',
    'employment_status',
    'What is your current employment status?',
    'select',
    '{"required": true}'::jsonb,
    '["employed_full_time", "employed_part_time", "self_employed", "unemployed", "student", "retired", "homemaker"]'::jsonb,
    NULL,
    'Your current work situation',
    2,
    true,
    2,
    true,
    90,
    false
  ),

  -- Lifestyle Category
  
  -- Marital Status
  (
    '10000000-0000-0000-0000-000000000005',
    '55555555-5555-5555-5555-555555555555',
    'marital_status',
    'What is your marital status?',
    'select',
    '{"required": false}'::jsonb,
    '["single", "married", "divorced", "widowed", "separated", "in_relationship", "prefer_not_to_say"]'::jsonb,
    NULL,
    'Your current marital status',
    2,
    false,
    1,
    true,
    180,
    false
  ),
  
  -- Children
  (
    '10000000-0000-0000-0000-000000000006',
    '55555555-5555-5555-5555-555555555555',
    'has_children',
    'Do you have children?',
    'select',
    '{"required": false}'::jsonb,
    '["yes", "no", "prefer_not_to_say"]'::jsonb,
    NULL,
    'This helps us understand household composition',
    2,
    false,
    2,
    true,
    180,
    false
  ),
  
  -- Number of Children (conditional)
  (
    '10000000-0000-0000-0000-000000000007',
    '55555555-5555-5555-5555-555555555555',
    'number_of_children',
    'How many children do you have?',
    'select',
    '{"required": false}'::jsonb,
    '["1", "2", "3", "4", "5_or_more"]'::jsonb,
    NULL,
    'Total number of children',
    2,
    false,
    3,
    true,
    180,
    false
  ),
  
  -- Household Size
  (
    '10000000-0000-0000-0000-000000000008',
    '55555555-5555-5555-5555-555555555555',
    'household_size',
    'How many people live in your household?',
    'select',
    '{"required": true}'::jsonb,
    '["1", "2", "3", "4", "5", "6_or_more"]'::jsonb,
    NULL,
    'Total number of people living with you',
    2,
    true,
    4,
    true,
    180,
    false
  ),

  -- Consumer Behavior
  
  -- Shopping Frequency
  (
    '10000000-0000-0000-0000-000000000009',
    '33333333-3333-3333-3333-333333333333',
    'shopping_frequency',
    'How often do you shop for groceries?',
    'select',
    '{"required": false}'::jsonb,
    '["daily", "2_3_times_week", "weekly", "biweekly", "monthly"]'::jsonb,
    NULL,
    'Your typical grocery shopping routine',
    2,
    false,
    1,
    true,
    90,
    false
  ),
  
  -- Online Shopping
  (
    '10000000-0000-0000-0000-000000000010',
    '33333333-3333-3333-3333-333333333333',
    'online_shopping_frequency',
    'How often do you shop online?',
    'select',
    '{"required": false}'::jsonb,
    '["never", "rarely", "monthly", "weekly", "daily"]'::jsonb,
    NULL,
    'How frequently you make online purchases',
    2,
    false,
    2,
    true,
    90,
    false
  ),
  
  -- Preferred Shopping Time
  (
    '10000000-0000-0000-0000-000000000011',
    '33333333-3333-3333-3333-333333333333',
    'preferred_shopping_time',
    'When do you prefer to shop?',
    'select',
    '{"required": false}'::jsonb,
    '["weekday_morning", "weekday_afternoon", "weekday_evening", "weekend_morning", "weekend_afternoon", "weekend_evening", "no_preference"]'::jsonb,
    NULL,
    'Your preferred time for shopping',
    2,
    false,
    3,
    true,
    90,
    false
  ),

  -- Lifestyle & Interests
  
  -- Primary Transport
  (
    '10000000-0000-0000-0000-000000000012',
    '22222222-2222-2222-2222-222222222222',
    'primary_transport',
    'What is your primary mode of transportation?',
    'select',
    '{"required": false}'::jsonb,
    '["own_car", "public_transport", "taxi", "ride_sharing", "bicycle", "walking", "motorcycle"]'::jsonb,
    NULL,
    'How you usually get around',
    2,
    false,
    1,
    true,
    180,
    false
  ),
  
  -- Internet Access
  (
    '10000000-0000-0000-0000-000000000013',
    '22222222-2222-2222-2222-222222222222',
    'internet_access',
    'What type of internet access do you have?',
    'multiselect',
    '{"required": false}'::jsonb,
    '["home_wifi", "mobile_data", "work_wifi", "public_wifi", "none"]'::jsonb,
    NULL,
    'Select all that apply',
    2,
    false,
    2,
    true,
    180,
    false
  ),
  
  -- Hobbies/Interests
  (
    '10000000-0000-0000-0000-000000000014',
    '22222222-2222-2222-2222-222222222222',
    'hobbies',
    'What are your main hobbies or interests?',
    'multiselect',
    '{"required": false}'::jsonb,
    '["sports", "reading", "cooking", "music", "movies", "gaming", "travel", "fitness", "arts_crafts", "technology", "fashion", "gardening", "photography"]'::jsonb,
    NULL,
    'Select all that apply',
    2,
    false,
    3,
    true,
    365,
    false
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SECTION 3: QUESTION ANSWER OPTIONS
-- ============================================================================
-- Note: These are explicit options for use in the UI, separate from the JSONB options array

-- Gender options
INSERT INTO public.question_answer_options (short_id, question_id, question_short_id, value, label, display_order, is_active)
VALUES
  ('GEND_M', '10000000-0000-0000-0000-000000000001', 'gender', 'male', 'Male', 1, true),
  ('GEND_F', '10000000-0000-0000-0000-000000000001', 'gender', 'female', 'Female', 2, true),
  ('GEND_O', '10000000-0000-0000-0000-000000000001', 'gender', 'other', 'Other', 3, true),
  ('GEND_N', '10000000-0000-0000-0000-000000000001', 'gender', 'prefer_not_to_say', 'Prefer not to say', 4, true)
ON CONFLICT (question_id, value) DO NOTHING;

-- Ethnicity options
INSERT INTO public.question_answer_options (short_id, question_id, question_short_id, value, label, display_order, is_active)
VALUES
  ('ETH_AF', '10000000-0000-0000-0000-000000000002', 'ethnicity', 'african', 'African', 1, true),
  ('ETH_CL', '10000000-0000-0000-0000-000000000002', 'ethnicity', 'coloured', 'Coloured', 2, true),
  ('ETH_IN', '10000000-0000-0000-0000-000000000002', 'ethnicity', 'indian', 'Indian', 3, true),
  ('ETH_WH', '10000000-0000-0000-0000-000000000002', 'ethnicity', 'white', 'White', 4, true),
  ('ETH_AS', '10000000-0000-0000-0000-000000000002', 'ethnicity', 'asian', 'Asian', 5, true),
  ('ETH_OT', '10000000-0000-0000-0000-000000000002', 'ethnicity', 'other', 'Other', 6, true),
  ('ETH_PN', '10000000-0000-0000-0000-000000000002', 'ethnicity', 'prefer_not_to_say', 'Prefer not to say', 7, true)
ON CONFLICT (question_id, value) DO NOTHING;

-- Education Level options
INSERT INTO public.question_answer_options (short_id, question_id, question_short_id, value, label, display_order, is_active)
VALUES
  ('EDU_HS', '10000000-0000-0000-0000-000000000003', 'education_level', 'high_school', 'High School', 1, true),
  ('EDU_SC', '10000000-0000-0000-0000-000000000003', 'education_level', 'some_college', 'Some College', 2, true),
  ('EDU_BA', '10000000-0000-0000-0000-000000000003', 'education_level', 'bachelors', 'Bachelor''s Degree', 3, true),
  ('EDU_MA', '10000000-0000-0000-0000-000000000003', 'education_level', 'masters', 'Master''s Degree', 4, true),
  ('EDU_DO', '10000000-0000-0000-0000-000000000003', 'education_level', 'doctorate', 'Doctorate', 5, true),
  ('EDU_VO', '10000000-0000-0000-0000-000000000003', 'education_level', 'vocational', 'Vocational Training', 6, true),
  ('EDU_OT', '10000000-0000-0000-0000-000000000003', 'education_level', 'other', 'Other', 7, true)
ON CONFLICT (question_id, value) DO NOTHING;

-- Employment Status options
INSERT INTO public.question_answer_options (short_id, question_id, question_short_id, value, label, display_order, is_active)
VALUES
  ('EMP_FT', '10000000-0000-0000-0000-000000000004', 'employment_status', 'employed_full_time', 'Employed Full-Time', 1, true),
  ('EMP_PT', '10000000-0000-0000-0000-000000000004', 'employment_status', 'employed_part_time', 'Employed Part-Time', 2, true),
  ('EMP_SE', '10000000-0000-0000-0000-000000000004', 'employment_status', 'self_employed', 'Self-Employed', 3, true),
  ('EMP_UN', '10000000-0000-0000-0000-000000000004', 'employment_status', 'unemployed', 'Unemployed', 4, true),
  ('EMP_ST', '10000000-0000-0000-0000-000000000004', 'employment_status', 'student', 'Student', 5, true),
  ('EMP_RT', '10000000-0000-0000-0000-000000000004', 'employment_status', 'retired', 'Retired', 6, true),
  ('EMP_HM', '10000000-0000-0000-0000-000000000004', 'employment_status', 'homemaker', 'Homemaker', 7, true)
ON CONFLICT (question_id, value) DO NOTHING;

-- Marital Status options
INSERT INTO public.question_answer_options (short_id, question_id, question_short_id, value, label, display_order, is_active)
VALUES
  ('MAR_SI', '10000000-0000-0000-0000-000000000005', 'marital_status', 'single', 'Single', 1, true),
  ('MAR_MA', '10000000-0000-0000-0000-000000000005', 'marital_status', 'married', 'Married', 2, true),
  ('MAR_DI', '10000000-0000-0000-0000-000000000005', 'marital_status', 'divorced', 'Divorced', 3, true),
  ('MAR_WI', '10000000-0000-0000-0000-000000000005', 'marital_status', 'widowed', 'Widowed', 4, true),
  ('MAR_SE', '10000000-0000-0000-0000-000000000005', 'marital_status', 'separated', 'Separated', 5, true),
  ('MAR_RE', '10000000-0000-0000-0000-000000000005', 'marital_status', 'in_relationship', 'In a Relationship', 6, true),
  ('MAR_PN', '10000000-0000-0000-0000-000000000005', 'marital_status', 'prefer_not_to_say', 'Prefer not to say', 7, true)
ON CONFLICT (question_id, value) DO NOTHING;

-- Has Children options
INSERT INTO public.question_answer_options (short_id, question_id, question_short_id, value, label, display_order, is_active)
VALUES
  ('CHLD_Y', '10000000-0000-0000-0000-000000000006', 'has_children', 'yes', 'Yes', 1, true),
  ('CHLD_N', '10000000-0000-0000-0000-000000000006', 'has_children', 'no', 'No', 2, true),
  ('CHLD_P', '10000000-0000-0000-0000-000000000006', 'has_children', 'prefer_not_to_say', 'Prefer not to say', 3, true)
ON CONFLICT (question_id, value) DO NOTHING;

-- Number of Children options
INSERT INTO public.question_answer_options (short_id, question_id, question_short_id, value, label, display_order, is_active)
VALUES
  ('NCHD_1', '10000000-0000-0000-0000-000000000007', 'number_of_children', '1', '1 child', 1, true),
  ('NCHD_2', '10000000-0000-0000-0000-000000000007', 'number_of_children', '2', '2 children', 2, true),
  ('NCHD_3', '10000000-0000-0000-0000-000000000007', 'number_of_children', '3', '3 children', 3, true),
  ('NCHD_4', '10000000-0000-0000-0000-000000000007', 'number_of_children', '4', '4 children', 4, true),
  ('NCHD_5', '10000000-0000-0000-0000-000000000007', 'number_of_children', '5_or_more', '5 or more', 5, true)
ON CONFLICT (question_id, value) DO NOTHING;

-- Household Size options
INSERT INTO public.question_answer_options (short_id, question_id, question_short_id, value, label, display_order, is_active)
VALUES
  ('HHS_1', '10000000-0000-0000-0000-000000000008', 'household_size', '1', '1 person', 1, true),
  ('HHS_2', '10000000-0000-0000-0000-000000000008', 'household_size', '2', '2 people', 2, true),
  ('HHS_3', '10000000-0000-0000-0000-000000000008', 'household_size', '3', '3 people', 3, true),
  ('HHS_4', '10000000-0000-0000-0000-000000000008', 'household_size', '4', '4 people', 4, true),
  ('HHS_5', '10000000-0000-0000-0000-000000000008', 'household_size', '5', '5 people', 5, true),
  ('HHS_6', '10000000-0000-0000-0000-000000000008', 'household_size', '6_or_more', '6 or more', 6, true)
ON CONFLICT (question_id, value) DO NOTHING;

-- Shopping Frequency options
INSERT INTO public.question_answer_options (short_id, question_id, question_short_id, value, label, display_order, is_active)
VALUES
  ('SHOP_D', '10000000-0000-0000-0000-000000000009', 'shopping_frequency', 'daily', 'Daily', 1, true),
  ('SHOP_2', '10000000-0000-0000-0000-000000000009', 'shopping_frequency', '2_3_times_week', '2-3 times per week', 2, true),
  ('SHOP_W', '10000000-0000-0000-0000-000000000009', 'shopping_frequency', 'weekly', 'Weekly', 3, true),
  ('SHOP_B', '10000000-0000-0000-0000-000000000009', 'shopping_frequency', 'biweekly', 'Every 2 weeks', 4, true),
  ('SHOP_M', '10000000-0000-0000-0000-000000000009', 'shopping_frequency', 'monthly', 'Monthly', 5, true)
ON CONFLICT (question_id, value) DO NOTHING;

-- Online Shopping Frequency options
INSERT INTO public.question_answer_options (short_id, question_id, question_short_id, value, label, display_order, is_active)
VALUES
  ('ONLN_N', '10000000-0000-0000-0000-000000000010', 'online_shopping_frequency', 'never', 'Never', 1, true),
  ('ONLN_R', '10000000-0000-0000-0000-000000000010', 'online_shopping_frequency', 'rarely', 'Rarely', 2, true),
  ('ONLN_M', '10000000-0000-0000-0000-000000000010', 'online_shopping_frequency', 'monthly', 'Monthly', 3, true),
  ('ONLN_W', '10000000-0000-0000-0000-000000000010', 'online_shopping_frequency', 'weekly', 'Weekly', 4, true),
  ('ONLN_D', '10000000-0000-0000-0000-000000000010', 'online_shopping_frequency', 'daily', 'Daily', 5, true)
ON CONFLICT (question_id, value) DO NOTHING;

-- Preferred Shopping Time options
INSERT INTO public.question_answer_options (short_id, question_id, question_short_id, value, label, display_order, is_active)
VALUES
  ('TIME_WM', '10000000-0000-0000-0000-000000000011', 'preferred_shopping_time', 'weekday_morning', 'Weekday Morning', 1, true),
  ('TIME_WA', '10000000-0000-0000-0000-000000000011', 'preferred_shopping_time', 'weekday_afternoon', 'Weekday Afternoon', 2, true),
  ('TIME_WE', '10000000-0000-0000-0000-000000000011', 'preferred_shopping_time', 'weekday_evening', 'Weekday Evening', 3, true),
  ('TIME_SM', '10000000-0000-0000-0000-000000000011', 'preferred_shopping_time', 'weekend_morning', 'Weekend Morning', 4, true),
  ('TIME_SA', '10000000-0000-0000-0000-000000000011', 'preferred_shopping_time', 'weekend_afternoon', 'Weekend Afternoon', 5, true),
  ('TIME_SE', '10000000-0000-0000-0000-000000000011', 'preferred_shopping_time', 'weekend_evening', 'Weekend Evening', 6, true),
  ('TIME_NP', '10000000-0000-0000-0000-000000000011', 'preferred_shopping_time', 'no_preference', 'No Preference', 7, true)
ON CONFLICT (question_id, value) DO NOTHING;

-- Primary Transport options
INSERT INTO public.question_answer_options (short_id, question_id, question_short_id, value, label, display_order, is_active)
VALUES
  ('TRAN_OC', '10000000-0000-0000-0000-000000000012', 'primary_transport', 'own_car', 'Own Car', 1, true),
  ('TRAN_PT', '10000000-0000-0000-0000-000000000012', 'primary_transport', 'public_transport', 'Public Transport', 2, true),
  ('TRAN_TX', '10000000-0000-0000-0000-000000000012', 'primary_transport', 'taxi', 'Taxi', 3, true),
  ('TRAN_RS', '10000000-0000-0000-0000-000000000012', 'primary_transport', 'ride_sharing', 'Ride Sharing (Uber/Bolt)', 4, true),
  ('TRAN_BI', '10000000-0000-0000-0000-000000000012', 'primary_transport', 'bicycle', 'Bicycle', 5, true),
  ('TRAN_WK', '10000000-0000-0000-0000-000000000012', 'primary_transport', 'walking', 'Walking', 6, true),
  ('TRAN_MC', '10000000-0000-0000-0000-000000000012', 'primary_transport', 'motorcycle', 'Motorcycle', 7, true)
ON CONFLICT (question_id, value) DO NOTHING;

-- Internet Access options (multiselect)
INSERT INTO public.question_answer_options (short_id, question_id, question_short_id, value, label, display_order, is_active)
VALUES
  ('INET_HW', '10000000-0000-0000-0000-000000000013', 'internet_access', 'home_wifi', 'Home WiFi', 1, true),
  ('INET_MD', '10000000-0000-0000-0000-000000000013', 'internet_access', 'mobile_data', 'Mobile Data', 2, true),
  ('INET_WW', '10000000-0000-0000-0000-000000000013', 'internet_access', 'work_wifi', 'Work WiFi', 3, true),
  ('INET_PW', '10000000-0000-0000-0000-000000000013', 'internet_access', 'public_wifi', 'Public WiFi', 4, true),
  ('INET_NO', '10000000-0000-0000-0000-000000000013', 'internet_access', 'none', 'No Internet Access', 5, true)
ON CONFLICT (question_id, value) DO NOTHING;

-- Hobbies/Interests options (multiselect)
INSERT INTO public.question_answer_options (short_id, question_id, question_short_id, value, label, display_order, is_active)
VALUES
  ('HOBB_SP', '10000000-0000-0000-0000-000000000014', 'hobbies', 'sports', 'Sports', 1, true),
  ('HOBB_RD', '10000000-0000-0000-0000-000000000014', 'hobbies', 'reading', 'Reading', 2, true),
  ('HOBB_CK', '10000000-0000-0000-0000-000000000014', 'hobbies', 'cooking', 'Cooking', 3, true),
  ('HOBB_MU', '10000000-0000-0000-0000-000000000014', 'hobbies', 'music', 'Music', 4, true),
  ('HOBB_MV', '10000000-0000-0000-0000-000000000014', 'hobbies', 'movies', 'Movies', 5, true),
  ('HOBB_GM', '10000000-0000-0000-0000-000000000014', 'hobbies', 'gaming', 'Gaming', 6, true),
  ('HOBB_TR', '10000000-0000-0000-0000-000000000014', 'hobbies', 'travel', 'Travel', 7, true),
  ('HOBB_FT', '10000000-0000-0000-0000-000000000014', 'hobbies', 'fitness', 'Fitness', 8, true),
  ('HOBB_AR', '10000000-0000-0000-0000-000000000014', 'hobbies', 'arts_crafts', 'Arts & Crafts', 9, true),
  ('HOBB_TC', '10000000-0000-0000-0000-000000000014', 'hobbies', 'technology', 'Technology', 10, true),
  ('HOBB_FA', '10000000-0000-0000-0000-000000000014', 'hobbies', 'fashion', 'Fashion', 11, true),
  ('HOBB_GD', '10000000-0000-0000-0000-000000000014', 'hobbies', 'gardening', 'Gardening', 12, true),
  ('HOBB_PH', '10000000-0000-0000-0000-000000000014', 'hobbies', 'photography', 'Photography', 13, true)
ON CONFLICT (question_id, value) DO NOTHING;

-- ============================================================================
-- END OF SEED DATA
-- ============================================================================
