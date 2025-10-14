-- Add is_suspended field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_suspended boolean DEFAULT false;

-- Add policy for admins to update suspension status
CREATE POLICY "Admins can suspend users"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::text));