-- Fix handle_new_user trigger to use UPSERT instead of INSERT
-- This prevents errors when creating Supabase Auth users for existing mobile users

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
  
  -- Use UPSERT to handle existing profiles (e.g., from mobile registration)
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
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now()
  WHERE profiles.email IS NULL OR profiles.email = '';
  
  RETURN NEW;
END;
$function$;