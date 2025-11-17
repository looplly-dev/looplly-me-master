-- Create badge_catalog table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.badge_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  tier TEXT CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  category TEXT,
  icon_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, name)
);

-- Enable RLS
ALTER TABLE public.badge_catalog ENABLE ROW LEVEL SECURITY;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_badge_catalog_tenant ON public.badge_catalog(tenant_id);
CREATE INDEX IF NOT EXISTS idx_badge_catalog_tier ON public.badge_catalog(tier);

-- Create policies if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'badge_catalog' AND policyname = 'Users can view active badges') THEN
    CREATE POLICY "Users can view active badges" ON public.badge_catalog
      FOR SELECT USING (is_active = true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'badge_catalog' AND policyname = 'Admins can manage badge catalog') THEN
    CREATE POLICY "Admins can manage badge catalog" ON public.badge_catalog
      FOR ALL USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Add new columns to badge_catalog for complete badge information
ALTER TABLE public.badge_catalog 
ADD COLUMN IF NOT EXISTS rarity text CHECK (rarity IN ('Common', 'Rare', 'Epic', 'Legendary')),
ADD COLUMN IF NOT EXISTS rep_points integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS requirement text,
ADD COLUMN IF NOT EXISTS shape text CHECK (shape IN ('circle', 'hexagon', 'star', 'diamond')),
ADD COLUMN IF NOT EXISTS icon_name text;

-- Set default values for existing badges
UPDATE public.badge_catalog 
SET 
  rarity = 'Common',
  rep_points = 10,
  requirement = 'Complete prerequisite action',
  shape = 'circle'
WHERE rarity IS NULL;