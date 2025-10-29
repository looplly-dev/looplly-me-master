-- RLS Policies for Documentation Audience-Based Access Control

-- Enable RLS on documentation table (if not already enabled)
ALTER TABLE public.documentation ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "public_docs_readable" ON public.documentation;
DROP POLICY IF EXISTS "admin_docs_readable" ON public.documentation;
DROP POLICY IF EXISTS "admins_can_manage_all_docs" ON public.documentation;

-- Policy 1: Allow everyone (including unauthenticated) to read public docs
CREATE POLICY "public_docs_readable" 
ON public.documentation
FOR SELECT 
USING (audience = 'all');

-- Policy 2: Only admins/super_admins/testers can read admin docs
CREATE POLICY "admin_docs_readable" 
ON public.documentation
FOR SELECT 
USING (
  audience = 'admin' 
  AND (
    has_role(auth.uid(), 'admin') 
    OR has_role(auth.uid(), 'super_admin')
    OR has_role(auth.uid(), 'tester')
  )
);

-- Policy 3: Admins can insert/update/delete all docs
CREATE POLICY "admins_can_manage_all_docs" 
ON public.documentation
FOR ALL
USING (
  has_role(auth.uid(), 'admin') 
  OR has_role(auth.uid(), 'super_admin')
)
WITH CHECK (
  has_role(auth.uid(), 'admin') 
  OR has_role(auth.uid(), 'super_admin')
);