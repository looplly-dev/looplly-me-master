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