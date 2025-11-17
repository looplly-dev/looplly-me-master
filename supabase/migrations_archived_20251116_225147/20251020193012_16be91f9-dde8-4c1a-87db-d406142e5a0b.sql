-- Add is_draft column to profile_questions table
ALTER TABLE profile_questions 
ADD COLUMN is_draft BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN profile_questions.is_draft IS 
  'Draft questions are invisible to users until published. Used for testing Level 2 changes without affecting production.';