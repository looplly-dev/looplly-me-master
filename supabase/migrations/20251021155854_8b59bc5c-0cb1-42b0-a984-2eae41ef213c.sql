-- Phase 1: Auto-Scaling System Database Setup

-- 1. Create country_profiling_gaps table
CREATE TABLE IF NOT EXISTS public.country_profiling_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL,
  country_iso TEXT NOT NULL,
  country_name TEXT NOT NULL,
  question_id UUID NOT NULL REFERENCES public.profile_questions(id) ON DELETE CASCADE,
  question_key TEXT NOT NULL,
  question_text TEXT NOT NULL,
  
  -- AI-Generated Draft
  draft_options JSONB,
  confidence_score INTEGER CHECK (confidence_score BETWEEN 0 AND 100),
  ai_metadata JSONB,
  
  -- Review Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  admin_feedback TEXT,
  
  -- Audit
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  generated_at TIMESTAMPTZ,
  tenant_id UUID REFERENCES public.tenants(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(country_code, question_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_gaps_status ON public.country_profiling_gaps(status);
CREATE INDEX IF NOT EXISTS idx_gaps_country ON public.country_profiling_gaps(country_code);
CREATE INDEX IF NOT EXISTS idx_gaps_confidence ON public.country_profiling_gaps(confidence_score);
CREATE INDEX IF NOT EXISTS idx_gaps_tenant ON public.country_profiling_gaps(tenant_id);

-- 2. Create auto_approval_config table
CREATE TABLE IF NOT EXISTS public.auto_approval_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_key TEXT NOT NULL,
  auto_approve_enabled BOOLEAN DEFAULT false,
  confidence_threshold INTEGER DEFAULT 90 CHECK (confidence_threshold BETWEEN 0 AND 100),
  require_manual_review BOOLEAN DEFAULT true,
  tenant_id UUID REFERENCES public.tenants(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_key, tenant_id)
);

-- Insert default config for common questions
INSERT INTO public.auto_approval_config (question_key, auto_approve_enabled, confidence_threshold, require_manual_review)
VALUES 
  ('household_income', false, 85, true),
  ('beverage_brands', false, 80, true),
  ('automotive_preferences', false, 80, true)
ON CONFLICT (question_key, tenant_id) DO NOTHING;

-- 3. Add is_fallback column to country_question_options (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'country_question_options' 
    AND column_name = 'is_fallback'
  ) THEN
    ALTER TABLE public.country_question_options 
    ADD COLUMN is_fallback BOOLEAN DEFAULT false;
  END IF;
END $$;

-- 4. Insert GLOBAL fallback for household_income (if exists)
INSERT INTO public.country_question_options (question_id, country_code, options, is_fallback)
SELECT 
  id,
  'GLOBAL',
  '[
    {"value": "under-20k", "label": "Under 20,000"},
    {"value": "20k-50k", "label": "20,000 - 50,000"},
    {"value": "50k-100k", "label": "50,000 - 100,000"},
    {"value": "100k-200k", "label": "100,000 - 200,000"},
    {"value": "200k-plus", "label": "200,000+"}
  ]'::jsonb,
  true
FROM public.profile_questions
WHERE question_key = 'household_income'
ON CONFLICT (question_id, country_code) DO NOTHING;

-- 5. Enable RLS on new tables
ALTER TABLE public.country_profiling_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_approval_config ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for country_profiling_gaps
CREATE POLICY "Admins can view all gaps"
ON public.country_profiling_gaps
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage gaps"
ON public.country_profiling_gaps
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for auto_approval_config
CREATE POLICY "Admins can view config"
ON public.auto_approval_config
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage config"
ON public.auto_approval_config
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));