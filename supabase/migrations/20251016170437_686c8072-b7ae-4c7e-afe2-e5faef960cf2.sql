-- Create streak_unlock_config table
CREATE TABLE public.streak_unlock_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stage integer NOT NULL CHECK (stage BETWEEN 1 AND 4),
  config_key text NOT NULL,
  config_value jsonb NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  tenant_id uuid REFERENCES public.tenants(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(stage, config_key, tenant_id)
);

CREATE INDEX idx_streak_unlock_config_stage ON public.streak_unlock_config(stage);
CREATE INDEX idx_streak_unlock_config_active ON public.streak_unlock_config(is_active) WHERE is_active = true;

ALTER TABLE public.streak_unlock_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active configs"
  ON public.streak_unlock_config FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage configs"
  ON public.streak_unlock_config FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_streak_unlock_config_updated_at
  BEFORE UPDATE ON public.streak_unlock_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default configuration
INSERT INTO public.streak_unlock_config (stage, config_key, config_value, description, tenant_id) 
SELECT 1, 'enabled', 'true'::jsonb, 'Stage 1 is always unlocked', id
FROM public.tenants WHERE slug = 'looplly-internal'
ON CONFLICT DO NOTHING;

INSERT INTO public.streak_unlock_config (stage, config_key, config_value, description, tenant_id) 
SELECT 2, 'required_badges', 
  '{"category":"coreVerification","required":4,"total":5,"excludedBadgeIds":["crypto_token"],"message":"Complete 4 of 5 core verification badges"}'::jsonb,
  'Badge requirements for Stage 2', id
FROM public.tenants WHERE slug = 'looplly-internal'
ON CONFLICT DO NOTHING;

INSERT INTO public.streak_unlock_config (stage, config_key, config_value, description, tenant_id) 
SELECT 3, 'daily_rep_cap_days',
  '{"requiredDays":29,"message":"Hit daily rep cap 29 days"}'::jsonb,
  'Rep cap requirement for Stage 3', id
FROM public.tenants WHERE slug = 'looplly-internal'
ON CONFLICT DO NOTHING;

INSERT INTO public.streak_unlock_config (stage, config_key, config_value, description, tenant_id) 
SELECT 4, 'sms_unlock_payment',
  '{"requiredAmount":1.00,"currency":"USD","message":"Pay $1 via SMS"}'::jsonb,
  'SMS payment for Stage 4', id
FROM public.tenants WHERE slug = 'looplly-internal'
ON CONFLICT DO NOTHING;

-- Add progress tracking to user_streaks
ALTER TABLE public.user_streaks
ADD COLUMN IF NOT EXISTS unlocked_stages jsonb NOT NULL DEFAULT '{"stage1":true,"stage2":false,"stage3":false,"stage4":false}'::jsonb,
ADD COLUMN IF NOT EXISTS stage_unlock_history jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS daily_rep_cap_hits jsonb DEFAULT '[]'::jsonb;