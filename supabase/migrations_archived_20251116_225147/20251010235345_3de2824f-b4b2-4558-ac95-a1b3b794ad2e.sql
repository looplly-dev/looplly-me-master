-- Create app_role enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
  END IF;
END $$;

-- Ensure user_roles table exists for admin checks (BEFORE the function)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Create has_role function AFTER the table exists
CREATE OR REPLACE FUNCTION public.has_role(p_user_id UUID, p_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = p_user_id AND role = p_role::public.app_role
  )
$$;

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_roles
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Users can view own role') THEN
    CREATE POLICY "Users can view own role" ON public.user_roles
      FOR SELECT USING (user_id = auth.uid());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Admins can manage roles') THEN
    CREATE POLICY "Admins can manage roles" ON public.user_roles
      FOR ALL USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Create the badges storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('badges', 'badges', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to badges
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Public can view badges') THEN
    CREATE POLICY "Public can view badges"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'badges');
  END IF;
END $$;

-- Allow admins to upload badges
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Admins can upload badges') THEN
    CREATE POLICY "Admins can upload badges"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'badges' 
      AND auth.uid() IN (
        SELECT user_id FROM public.user_roles WHERE role = 'admin'::public.app_role
      )
    );
  END IF;
END $$;

-- Allow admins to update badges
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Admins can update badges') THEN
    CREATE POLICY "Admins can update badges"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'badges' 
      AND auth.uid() IN (
        SELECT user_id FROM public.user_roles WHERE role = 'admin'::public.app_role
      )
    );
  END IF;
END $$;

-- Allow admins to delete badges
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Admins can delete badges') THEN
    CREATE POLICY "Admins can delete badges"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'badges' 
      AND auth.uid() IN (
        SELECT user_id FROM public.user_roles WHERE role = 'admin'::public.app_role
      )
    );
  END IF;
END $$;
