-- Create mapping table for custom auth to Supabase auth
CREATE TABLE IF NOT EXISTS looplly_user_auth_mapping (
  looplly_user_id UUID PRIMARY KEY,
  supabase_auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mobile TEXT NOT NULL,
  country_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE looplly_user_auth_mapping ENABLE ROW LEVEL SECURITY;

-- Admins can manage mappings
CREATE POLICY "Admins can manage auth mappings"
ON looplly_user_auth_mapping
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Users can view their own mapping
CREATE POLICY "Users can view own auth mapping"
ON looplly_user_auth_mapping
FOR SELECT
TO authenticated
USING (supabase_auth_id = auth.uid());

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_auth_mapping_looplly_user ON looplly_user_auth_mapping(looplly_user_id);
CREATE INDEX IF NOT EXISTS idx_auth_mapping_supabase_auth ON looplly_user_auth_mapping(supabase_auth_id);
CREATE INDEX IF NOT EXISTS idx_auth_mapping_mobile ON looplly_user_auth_mapping(mobile);