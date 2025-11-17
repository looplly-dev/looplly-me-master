-- Fix profile_answers table - add missing columns and ensure RLS policies work correctly

-- 1. Add missing columns if they don't exist
ALTER TABLE public.profile_answers 
  ADD COLUMN IF NOT EXISTS answer_normalized TEXT,
  ADD COLUMN IF NOT EXISTS selected_option_short_id TEXT;

-- 2. Drop existing RLS policies on profile_answers to recreate them
DROP POLICY IF EXISTS "Users can view own answers" ON public.profile_answers;
DROP POLICY IF EXISTS "Users can insert own answers" ON public.profile_answers;
DROP POLICY IF EXISTS "Users can update own answers" ON public.profile_answers;
DROP POLICY IF EXISTS "Admins can view all answers" ON public.profile_answers;
DROP POLICY IF EXISTS "Admins can manage answers" ON public.profile_answers;

-- 3. Recreate RLS policies with proper permissions
-- Allow users to SELECT their own answers
CREATE POLICY "Users can view own answers"
  ON public.profile_answers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow users to INSERT their own answers
CREATE POLICY "Users can insert own answers"
  ON public.profile_answers FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow users to UPDATE their own answers
CREATE POLICY "Users can update own answers"
  ON public.profile_answers FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Allow users to DELETE their own answers (for cleanup)
CREATE POLICY "Users can delete own answers"
  ON public.profile_answers FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Admin policies (if has_role function exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'has_role') THEN
    EXECUTE '
      CREATE POLICY "Admins can view all answers"
        ON public.profile_answers FOR SELECT
        TO authenticated
        USING (has_role(auth.uid(), ''admin''));
      
      CREATE POLICY "Admins can manage all answers"
        ON public.profile_answers FOR ALL
        TO authenticated
        USING (has_role(auth.uid(), ''admin''));
    ';
  END IF;
END $$;

-- 4. Create index on new columns for better performance
CREATE INDEX IF NOT EXISTS idx_profile_answers_normalized ON public.profile_answers(answer_normalized);
CREATE INDEX IF NOT EXISTS idx_profile_answers_option_short_id ON public.profile_answers(selected_option_short_id);
