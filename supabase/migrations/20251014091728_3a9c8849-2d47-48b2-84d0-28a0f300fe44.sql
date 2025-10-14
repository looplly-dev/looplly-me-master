-- Create enum for agent status
CREATE TYPE public.agent_status AS ENUM ('active', 'inactive', 'testing');

-- Create enum for dependency types
CREATE TYPE public.dependency_type AS ENUM ('triggers', 'requires', 'observes');

-- Create enum for execution status
CREATE TYPE public.execution_status AS ENUM ('success', 'failure', 'timeout', 'cancelled');

-- Create enum for config data types
CREATE TYPE public.config_data_type AS ENUM ('string', 'number', 'boolean', 'json');

-- Create ai_agents table
CREATE TABLE public.ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  purpose TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  status agent_status NOT NULL DEFAULT 'active',
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  is_system BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create agent_configs table
CREATE TABLE public.agent_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  config_key TEXT NOT NULL,
  config_value JSONB NOT NULL DEFAULT '{}',
  is_secret BOOLEAN NOT NULL DEFAULT false,
  data_type config_data_type NOT NULL DEFAULT 'string',
  description TEXT,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(agent_id, config_key, tenant_id)
);

-- Create agent_executions table
CREATE TABLE public.agent_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  execution_id TEXT NOT NULL UNIQUE,
  status execution_status NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_data JSONB DEFAULT '{}',
  response_time_ms INTEGER,
  api_calls_made INTEGER DEFAULT 0,
  api_cost_usd NUMERIC(10, 6) DEFAULT 0.00,
  error_type TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create agent_dependencies table
CREATE TABLE public.agent_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  dependent_agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  dependency_type dependency_type NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(parent_agent_id, dependent_agent_id, dependency_type)
);

-- Enable RLS
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_dependencies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_agents
CREATE POLICY "Admins can manage agents"
  ON public.ai_agents
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view active agents"
  ON public.ai_agents
  FOR SELECT
  USING (status = 'active');

-- RLS Policies for agent_configs
CREATE POLICY "Admins can manage configs"
  ON public.agent_configs
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for agent_executions
CREATE POLICY "Admins can view all executions"
  ON public.agent_executions
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own executions"
  ON public.agent_executions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service can insert executions"
  ON public.agent_executions
  FOR INSERT
  WITH CHECK (true);

-- RLS Policies for agent_dependencies
CREATE POLICY "Admins can manage dependencies"
  ON public.agent_dependencies
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view dependencies"
  ON public.agent_dependencies
  FOR SELECT
  USING (true);

-- Create indexes
CREATE INDEX idx_agent_executions_agent_id ON public.agent_executions(agent_id);
CREATE INDEX idx_agent_executions_created_at ON public.agent_executions(created_at DESC);
CREATE INDEX idx_agent_executions_status ON public.agent_executions(status);
CREATE INDEX idx_agent_configs_agent_id ON public.agent_configs(agent_id);
CREATE INDEX idx_agent_dependencies_parent ON public.agent_dependencies(parent_agent_id);
CREATE INDEX idx_agent_dependencies_dependent ON public.agent_dependencies(dependent_agent_id);

-- Get default tenant for seeding
DO $$
DECLARE
  default_tenant_id UUID;
BEGIN
  SELECT id INTO default_tenant_id FROM public.tenants WHERE slug = 'looplly-internal' LIMIT 1;

  -- Seed the 12 AI agents
  INSERT INTO public.ai_agents (name, slug, purpose, description, category, icon_name, status, tenant_id) VALUES
  ('Guardian', 'guardian', 'Fraud Detection & Trust Scoring', 'Protects the ecosystem by identifying fake, duplicate, or low-quality participants through device fingerprints, IPs, and behaviour pattern analysis.', 'Security', 'Shield', 'active', default_tenant_id),
  ('Messenger', 'messenger', 'Communication Orchestration', 'Delivers messages, survey invites, and reward notifications across SMS, WhatsApp, email, and push notifications with optimal channel selection.', 'Communication', 'MessageSquare', 'active', default_tenant_id),
  ('Rewarder', 'rewarder', 'Rewards Distribution Engine', 'Distributes earnings safely and instantly via DTOne, Tremendous, PayPal, M-Pesa, or crypto once funds are approved by The Accountant.', 'Finance', 'Gift', 'active', default_tenant_id),
  ('The Accountant', 'accountant', 'Financial Governance & Settlement', 'Holds all rewards until client/vendor payments clear, ensuring Looplly never pays out before being paid.', 'Finance', 'Calculator', 'active', default_tenant_id),
  ('Profiler', 'profiler', 'User Data & Segmentation', 'Maintains dynamic, multidimensional profiles of users for targeting and analytics with Data Tree-style taxonomy.', 'Analytics', 'Users', 'active', default_tenant_id),
  ('YieldMaster', 'yieldmaster', 'Sample Yield & Revenue Optimization', 'Maximizes profit and response rates by matching users to optimal surveys and rotating supply across providers.', 'Revenue', 'TrendingUp', 'active', default_tenant_id),
  ('Scout', 'scout', 'User Acquisition & Referrals', 'Drives growth through incentivized referrals and organic recruitment with fraud detection.', 'Growth', 'UserPlus', 'active', default_tenant_id),
  ('Rep', 'rep', 'Reputation & Engagement', 'Gamifies engagement and rewards trustworthy participation through reputation scores, streaks, and achievements.', 'Engagement', 'Award', 'active', default_tenant_id),
  ('Scribe', 'scribe', 'Content & Offer Monetization', 'Generates revenue from content consumption, ad networks, and affiliate offers with attribution tracking.', 'Revenue', 'FileText', 'active', default_tenant_id),
  ('Anchor', 'anchor', 'Session & Device Integrity', 'Keeps user sessions stable and secure in low-connectivity environments with fingerprint management and offline caching.', 'Security', 'Anchor', 'active', default_tenant_id),
  ('Keymaster', 'keymaster', 'Identity & KYC Verification', 'Authenticates user identity through SIM, ID, biometric, or community verification with Soulbound Token issuance.', 'Security', 'Key', 'active', default_tenant_id),
  ('Sensei', 'sensei', 'AI Optimization Brain', 'Central intelligence layer improving targeting, engagement, and operations through predictive analytics and A/B testing.', 'Intelligence', 'Brain', 'active', default_tenant_id);

  -- Seed agent dependencies
  INSERT INTO public.agent_dependencies (parent_agent_id, dependent_agent_id, dependency_type) 
  SELECT 
    g.id, k.id, 'triggers'
  FROM public.ai_agents g, public.ai_agents k 
  WHERE g.slug = 'guardian' AND k.slug = 'keymaster';

  INSERT INTO public.agent_dependencies (parent_agent_id, dependent_agent_id, dependency_type) 
  SELECT 
    g.id, r.id, 'triggers'
  FROM public.ai_agents g, public.ai_agents r 
  WHERE g.slug = 'guardian' AND r.slug = 'rep';

  INSERT INTO public.agent_dependencies (parent_agent_id, dependent_agent_id, dependency_type) 
  SELECT 
    a.id, rw.id, 'triggers'
  FROM public.ai_agents a, public.ai_agents rw 
  WHERE a.slug = 'accountant' AND rw.slug = 'rewarder';

  INSERT INTO public.agent_dependencies (parent_agent_id, dependent_agent_id, dependency_type) 
  SELECT 
    p.id, y.id, 'observes'
  FROM public.ai_agents p, public.ai_agents y 
  WHERE p.slug = 'profiler' AND y.slug = 'yieldmaster';

  INSERT INTO public.agent_dependencies (parent_agent_id, dependent_agent_id, dependency_type) 
  SELECT 
    p.id, s.id, 'observes'
  FROM public.ai_agents p, public.ai_agents s 
  WHERE p.slug = 'profiler' AND s.slug = 'sensei';

  INSERT INTO public.agent_dependencies (parent_agent_id, dependent_agent_id, dependency_type) 
  SELECT 
    sc.id, g.id, 'requires'
  FROM public.ai_agents sc, public.ai_agents g 
  WHERE sc.slug = 'scout' AND g.slug = 'guardian';

  INSERT INTO public.agent_dependencies (parent_agent_id, dependent_agent_id, dependency_type) 
  SELECT 
    m.id, p.id, 'observes'
  FROM public.ai_agents m, public.ai_agents p 
  WHERE m.slug = 'messenger' AND p.slug = 'profiler';

  INSERT INTO public.agent_dependencies (parent_agent_id, dependent_agent_id, dependency_type) 
  SELECT 
    sen.id, y.id, 'observes'
  FROM public.ai_agents sen, public.ai_agents y 
  WHERE sen.slug = 'sensei' AND y.slug = 'yieldmaster';
END $$;