-- Create function to get user email by user_id
CREATE OR REPLACE FUNCTION public.get_user_email(user_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN (
    SELECT email 
    FROM auth.users 
    WHERE id = user_uuid
  );
END;
$$;