-- Improve signup sync: use phone from auth.users or fallback to user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  default_tenant_id UUID;
  v_mobile text;
  v_country_code text;
BEGIN
  SELECT id INTO default_tenant_id FROM public.tenants WHERE slug = 'looplly-internal' LIMIT 1;

  -- Prefer auth.users.phone; fallback to user metadata 'mobile'
  v_mobile := COALESCE(NULLIF(NEW.phone, ''), NULLIF(NEW.raw_user_meta_data->>'mobile', ''));
  v_country_code := NULLIF(NEW.raw_user_meta_data->>'country_code', '');
  
  INSERT INTO public.profiles (
    user_id, email, first_name, last_name, mobile, country_code, tenant_id
  ) VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    v_mobile,
    v_country_code,
    default_tenant_id
  );
  RETURN NEW;
END;
$function$;

-- Backfill existing profiles from auth.users (phone or metadata.mobile)
UPDATE public.profiles p
SET 
  mobile = COALESCE(NULLIF(au.phone, ''), NULLIF(au.raw_user_meta_data->>'mobile', '')),
  country_code = COALESCE(NULLIF(au.raw_user_meta_data->>'country_code', ''), p.country_code)
FROM auth.users au
WHERE p.user_id = au.id
  AND (p.mobile IS NULL OR p.mobile = '');