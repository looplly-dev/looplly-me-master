-- Update the handle_new_user function to properly capture mobile number from metadata and phone field
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, mobile, country_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'mobile', NEW.phone, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'country_code', '+1')
  );
  
  INSERT INTO public.communication_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;