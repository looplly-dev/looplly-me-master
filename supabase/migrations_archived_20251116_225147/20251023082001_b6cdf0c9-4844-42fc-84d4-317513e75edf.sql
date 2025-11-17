-- Create documentation table for secure IP storage
CREATE TABLE IF NOT EXISTS public.documentation (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] NOT NULL,
  description TEXT NOT NULL,
  audience TEXT NOT NULL,
  parent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.documentation ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read documentation
CREATE POLICY "Authenticated users can read docs"
ON public.documentation
FOR SELECT
TO authenticated
USING (true);

-- Admins can manage documentation
CREATE POLICY "Admins can manage docs"
ON public.documentation
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_documentation_category ON public.documentation(category);
CREATE INDEX IF NOT EXISTS idx_documentation_audience ON public.documentation(audience);

-- Add updated_at trigger
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.documentation
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();