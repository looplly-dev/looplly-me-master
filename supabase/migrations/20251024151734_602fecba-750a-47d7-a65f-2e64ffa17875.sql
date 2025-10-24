-- PHASE 4: ADD AUDIT LOGGING FOR DOCUMENTATION ACCESS

CREATE TABLE IF NOT EXISTS public.documentation_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  document_id text,
  action TEXT NOT NULL CHECK (action IN ('view', 'search', 'download')),
  ip_address inet,
  user_agent TEXT,
  search_query TEXT,
  accessed_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_doc_access_user ON documentation_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_doc_access_time ON documentation_access_log(accessed_at DESC);

-- Enable RLS
ALTER TABLE public.documentation_access_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Admins can view access logs"
ON public.documentation_access_log
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Allow authenticated users to insert their own logs
CREATE POLICY "Users can insert own access logs"
ON public.documentation_access_log
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());