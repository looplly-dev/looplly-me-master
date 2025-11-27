-- Fix RLS policies for user_streaks to allow users to insert their own records
DROP POLICY IF EXISTS "Users can insert own streaks" ON user_streaks;

CREATE POLICY "Users can insert own streaks"
ON user_streaks
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Fix RLS policies for audit_logs to allow authenticated users to insert
DROP POLICY IF EXISTS "Users can insert own audit logs" ON audit_logs;

CREATE POLICY "Users can insert own audit logs"
ON audit_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);