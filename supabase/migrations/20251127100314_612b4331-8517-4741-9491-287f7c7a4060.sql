-- Add missing created_at column to user_badges
ALTER TABLE user_badges 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Refresh schema cache by recreating a policy
DROP POLICY IF EXISTS "Users can view own badges" ON user_badges;
CREATE POLICY "Users can view own badges"
ON user_badges
FOR SELECT
TO authenticated
USING (user_id = auth.uid());