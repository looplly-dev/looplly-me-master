-- Phase 1: Add dual country column system
-- This adds country_iso (derived from country_code dial code)

-- Step 1: Create immutable mapping function for dial code → ISO code
CREATE OR REPLACE FUNCTION public.get_country_iso_from_dial_code(p_dial_code text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE p_dial_code
    WHEN '+27'  THEN 'ZA'
    WHEN '+234' THEN 'NG'
    WHEN '+254' THEN 'KE'
    WHEN '+44'  THEN 'GB'
    WHEN '+91'  THEN 'IN'
    ELSE NULL
  END;
$$;

COMMENT ON FUNCTION public.get_country_iso_from_dial_code IS 
'Maps phone dial codes to ISO 3166-1 alpha-2 country codes. Source of truth: src/data/countries.ts';

-- Step 2: Add country_iso column to profiles
ALTER TABLE public.profiles 
ADD COLUMN country_iso text;

COMMENT ON COLUMN public.profiles.country_iso IS 
'ISO 3166-1 alpha-2 country code (e.g., ZA, NG). Auto-derived from country_code (dial code). Source of truth: country_code';

-- Step 3: Add check constraint for valid ISO codes
ALTER TABLE public.profiles
ADD CONSTRAINT valid_country_iso 
CHECK (country_iso IS NULL OR country_iso IN ('ZA', 'NG', 'KE', 'GB', 'IN'));

-- Step 4: Create auto-population trigger function
CREATE OR REPLACE FUNCTION public.sync_country_iso()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Auto-derive ISO code from dial code
  NEW.country_iso := public.get_country_iso_from_dial_code(NEW.country_code);
  
  -- Log warning if mapping fails
  IF NEW.country_code IS NOT NULL AND NEW.country_iso IS NULL THEN
    RAISE WARNING 'Unknown dial code: %. Cannot derive ISO code.', NEW.country_code;
  END IF;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.sync_country_iso IS
'Automatically derives country_iso from country_code (dial code → ISO code)';

-- Step 5: Apply trigger on INSERT and UPDATE
CREATE TRIGGER sync_country_iso_trigger
BEFORE INSERT OR UPDATE OF country_code ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_country_iso();

COMMENT ON TRIGGER sync_country_iso_trigger ON public.profiles IS
'Automatically derives country_iso from country_code (dial code → ISO code)';

-- Step 6: Backfill country_iso for all existing users
UPDATE public.profiles
SET country_iso = public.get_country_iso_from_dial_code(country_code)
WHERE country_code IS NOT NULL;

-- Step 7: Add indexes for query performance
CREATE INDEX idx_profiles_country_iso ON public.profiles(country_iso)
WHERE country_iso IS NOT NULL;

CREATE INDEX idx_profiles_country_tenant ON public.profiles(country_iso, tenant_id)
WHERE country_iso IS NOT NULL;