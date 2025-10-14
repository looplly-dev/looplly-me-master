-- Update the handle_new_user trigger to sync phone number from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  default_tenant_id UUID;
BEGIN
  SELECT id INTO default_tenant_id FROM public.tenants WHERE slug = 'looplly-internal' LIMIT 1;
  
  INSERT INTO public.profiles (user_id, email, first_name, last_name, mobile, tenant_id)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.phone,
    default_tenant_id
  );
  RETURN NEW;
END;
$function$;

-- Create a function to get user phone numbers from auth.users (for existing users)
CREATE OR REPLACE FUNCTION public.get_auth_users_with_phones()
RETURNS TABLE (
  user_id uuid,
  phone text,
  email text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    id as user_id,
    phone,
    email
  FROM auth.users;
$$;

-- Update existing profiles with phone numbers from auth.users
UPDATE public.profiles p
SET mobile = au.phone
FROM auth.users au
WHERE p.user_id = au.id
  AND au.phone IS NOT NULL
  AND (p.mobile IS NULL OR p.mobile = '');