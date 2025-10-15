-- Create app_secrets table for storing environment variables securely
CREATE TABLE IF NOT EXISTS public.app_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false, -- true for non-sensitive config, false for secrets
  environment TEXT NOT NULL DEFAULT 'production' CHECK (environment IN ('production', 'staging', 'development')),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(key, environment, tenant_id)
);

-- Enable RLS
ALTER TABLE public.app_secrets ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_app_secrets_key ON public.app_secrets(key);
CREATE INDEX IF NOT EXISTS idx_app_secrets_environment ON public.app_secrets(environment);
CREATE INDEX IF NOT EXISTS idx_app_secrets_tenant ON public.app_secrets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_app_secrets_public ON public.app_secrets(is_public);

-- RLS Policies
-- Allow public read access to public (non-sensitive) configuration
CREATE POLICY "Public can read public app secrets"
  ON public.app_secrets
  FOR SELECT
  USING (is_public = true);

-- Allow service role to read all secrets (for server-side operations)
CREATE POLICY "Service role can read all app secrets"
  ON public.app_secrets
  FOR SELECT
  TO service_role
  USING (true);

-- Allow admins to manage all secrets
CREATE POLICY "Admins can manage app secrets"
  ON public.app_secrets
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Insert default public configuration values
DO $$
DECLARE
  default_tenant_id UUID;
BEGIN
  SELECT id INTO default_tenant_id FROM public.tenants WHERE slug = 'looplly-internal' LIMIT 1;
  
  -- Insert public configuration (non-sensitive)
  INSERT INTO public.app_secrets (key, value, description, is_public, environment, tenant_id) VALUES
  ('VITE_ENABLE_ANALYTICS', 'false', 'Enable analytics tracking', true, 'production', default_tenant_id),
  ('VITE_ENABLE_DEBUG', 'false', 'Enable debug mode', true, 'production', default_tenant_id),
  ('VITE_API_TIMEOUT', '30000', 'API request timeout in milliseconds', true, 'production', default_tenant_id),
  ('VITE_CAPACITOR_PLATFORM', 'web', 'Target platform for Capacitor builds', true, 'production', default_tenant_id),
  
  -- Development environment overrides
  ('VITE_ENABLE_DEBUG', 'true', 'Enable debug mode in development', true, 'development', default_tenant_id)
  
  ON CONFLICT (key, environment, tenant_id) DO NOTHING;
END $$;

-- Create function to get app secrets by environment
CREATE OR REPLACE FUNCTION public.get_app_secrets(p_environment TEXT DEFAULT 'production')
RETURNS TABLE(
  key TEXT,
  value TEXT,
  is_public BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    s.key,
    s.value,
    s.is_public
  FROM public.app_secrets s
  WHERE s.environment = p_environment
  AND (
    s.is_public = true 
    OR 
    -- Allow service role to access all secrets
    auth.role() = 'service_role'
    OR
    -- Allow admins to access all secrets
    has_role(auth.uid(), 'admin')
  )
  ORDER BY s.key;
$$;

-- Create function to get public app secrets (for client-side use)
CREATE OR REPLACE FUNCTION public.get_public_app_secrets(p_environment TEXT DEFAULT 'production')
RETURNS TABLE(
  key TEXT,
  value TEXT
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT 
    s.key,
    s.value
  FROM public.app_secrets s
  WHERE s.environment = p_environment
  AND s.is_public = true
  ORDER BY s.key;
$$;