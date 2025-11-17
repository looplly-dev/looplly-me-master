-- ============================================
-- Phase 1: Update RLS Policies for Level-Based Question Editing
-- ============================================

-- Drop existing blanket policy that allows all admins to edit all questions
DROP POLICY IF EXISTS "Admins can manage questions" ON profile_questions;

-- Policy 1: Super Admins can manage ALL questions (Level 1, 2, 3)
CREATE POLICY "super_admins_manage_all_questions"
  ON profile_questions FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'))
  WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Policy 2: Regular Admins can ONLY manage Level 2 and 3 questions
CREATE POLICY "admins_manage_level_2_3_questions"
  ON profile_questions FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin') 
    AND level IN (2, 3)
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin') 
    AND level IN (2, 3)
  );

-- ============================================
-- Phase 2: Add Audit Logging for Level 1 Changes
-- ============================================

-- Create audit log table for tracking Level 1 question changes
CREATE TABLE IF NOT EXISTS public.question_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES profile_questions(id),
  changed_by UUID REFERENCES auth.users(id),
  change_type TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  old_values JSONB,
  new_values JSONB,
  changed_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on audit log table
ALTER TABLE public.question_audit_log ENABLE ROW LEVEL SECURITY;

-- Only super admins can view audit logs
CREATE POLICY "super_admins_view_audit_logs"
  ON public.question_audit_log FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'));

-- System can insert logs (via security definer function)
CREATE POLICY "system_insert_audit_logs"
  ON public.question_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create audit trigger function for Level 1 questions
CREATE OR REPLACE FUNCTION audit_level_1_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only audit Level 1 questions (critical identity fields)
  IF (NEW.level = 1 OR OLD.level = 1) THEN
    INSERT INTO question_audit_log (
      question_id,
      changed_by,
      change_type,
      old_values,
      new_values
    ) VALUES (
      COALESCE(NEW.id, OLD.id),
      auth.uid(),
      TG_OP,
      row_to_json(OLD),
      row_to_json(NEW)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Attach trigger to profile_questions table
CREATE TRIGGER audit_level_1_question_changes
  AFTER INSERT OR UPDATE OR DELETE ON profile_questions
  FOR EACH ROW
  EXECUTE FUNCTION audit_level_1_changes();

-- Create index for efficient querying of audit logs
CREATE INDEX IF NOT EXISTS idx_question_audit_log_question_id ON question_audit_log(question_id);
CREATE INDEX IF NOT EXISTS idx_question_audit_log_changed_by ON question_audit_log(changed_by);
CREATE INDEX IF NOT EXISTS idx_question_audit_log_changed_at ON question_audit_log(changed_at DESC);