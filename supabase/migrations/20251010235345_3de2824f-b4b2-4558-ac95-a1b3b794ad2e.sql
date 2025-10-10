-- Create the badges storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('badges', 'badges', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to badges
CREATE POLICY "Public can view badges"
ON storage.objects FOR SELECT
USING (bucket_id = 'badges');

-- Allow admins to upload badges
CREATE POLICY "Admins can upload badges"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'badges' 
  AND auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'::public.app_role
  )
);

-- Allow admins to update badges
CREATE POLICY "Admins can update badges"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'badges' 
  AND auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'::public.app_role
  )
);

-- Allow admins to delete badges
CREATE POLICY "Admins can delete badges"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'badges' 
  AND auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'::public.app_role
  )
);