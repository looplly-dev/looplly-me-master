-- Create earning_rules table for business rule configuration
CREATE TABLE IF NOT EXISTS public.earning_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_key TEXT UNIQUE NOT NULL,
  rule_name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}',
  tenant_id UUID REFERENCES public.tenants(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.earning_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage earning rules"
  ON public.earning_rules
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view active earning rules"
  ON public.earning_rules
  FOR SELECT
  USING (is_active = true);

-- Add updated_at trigger
CREATE TRIGGER update_earning_rules_updated_at
  BEFORE UPDATE ON public.earning_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed default earning rules
INSERT INTO public.earning_rules (rule_key, rule_name, description, config) VALUES
  ('mobile_verification_gate', 'Mobile Verification Gate', 'Require mobile verification before accessing earning activities', 
   '{"enabled": true, "stages": ["stage1"], "message": "Please verify your mobile number to continue"}'::jsonb),
  ('stage2_unlock_threshold', 'Stage 2 Unlock Threshold', 'Minimum reputation required to unlock Stage 2 earning activities',
   '{"enabled": true, "min_reputation": 100, "message": "Reach 100 reputation points to unlock Stage 2"}'::jsonb),
  ('profile_completion_bonus', 'Profile Completion Bonus', 'Award reputation points for completing profile levels',
   '{"enabled": true, "level2_bonus": 50, "level3_bonus": 100}'::jsonb),
  ('daily_activity_limit', 'Daily Activity Limit', 'Maximum number of activities per day by stage',
   '{"enabled": false, "stage1_limit": 10, "stage2_limit": 20}'::jsonb)
ON CONFLICT (rule_key) DO NOTHING;