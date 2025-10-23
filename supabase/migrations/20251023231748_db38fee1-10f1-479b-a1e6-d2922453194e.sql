-- Add foreign key constraint for user_roles to enable relationship inference
-- This allows PostgREST to understand the relationship pattern between tables

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_roles_user_id_fkey'
      AND table_name = 'user_roles'
  ) THEN
    ALTER TABLE user_roles
    ADD CONSTRAINT user_roles_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Verify RLS policy exists for user_roles (admins should be able to read)
-- This is already in place, but let's ensure it's correct
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_roles' 
      AND policyname = 'Admins can view all roles'
  ) THEN
    CREATE POLICY "Admins can view all roles"
    ON user_roles
    FOR SELECT
    USING (has_role(auth.uid(), 'admin'::text));
  END IF;
END $$;