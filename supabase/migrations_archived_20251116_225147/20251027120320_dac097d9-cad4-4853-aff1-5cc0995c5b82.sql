-- Feedback tracking
CREATE TABLE IF NOT EXISTS public.documentation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  rating INTEGER CHECK (rating IN (1, -1)),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.documentation_feedback ENABLE ROW LEVEL SECURITY;

-- Users can view all feedback (for admins)
CREATE POLICY "Admins can view all feedback"
ON public.documentation_feedback
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role IN ('admin', 'super_admin')
));

-- Users can create their own feedback
CREATE POLICY "Users can create feedback"
ON public.documentation_feedback
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Reading progress tracking
CREATE TABLE IF NOT EXISTS public.documentation_reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  progress_percent INTEGER CHECK (progress_percent >= 0 AND progress_percent <= 100),
  last_position TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(document_id, user_id)
);

-- Enable RLS
ALTER TABLE public.documentation_reading_progress ENABLE ROW LEVEL SECURITY;

-- Users can view and manage their own progress
CREATE POLICY "Users can view own progress"
ON public.documentation_reading_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
ON public.documentation_reading_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
ON public.documentation_reading_progress
FOR UPDATE
USING (auth.uid() = user_id);

-- Community Q&A
CREATE TABLE IF NOT EXISTS public.documentation_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  question TEXT NOT NULL,
  section TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.documentation_questions ENABLE ROW LEVEL SECURITY;

-- Anyone can view questions
CREATE POLICY "Anyone can view questions"
ON public.documentation_questions
FOR SELECT
USING (true);

-- Authenticated users can create questions
CREATE POLICY "Users can create questions"
ON public.documentation_questions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own questions
CREATE POLICY "Users can update own questions"
ON public.documentation_questions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.documentation_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.documentation_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  answer TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  is_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.documentation_answers ENABLE ROW LEVEL SECURITY;

-- Anyone can view answers
CREATE POLICY "Anyone can view answers"
ON public.documentation_answers
FOR SELECT
USING (true);

-- Authenticated users can create answers
CREATE POLICY "Users can create answers"
ON public.documentation_answers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own answers
CREATE POLICY "Users can update own answers"
ON public.documentation_answers
FOR UPDATE
USING (auth.uid() = user_id);

-- Search analytics enhancement
ALTER TABLE public.documentation_access_log 
ADD COLUMN IF NOT EXISTS result_count INTEGER,
ADD COLUMN IF NOT EXISTS clicked_result_id TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_documentation_feedback_document_id ON public.documentation_feedback(document_id);
CREATE INDEX IF NOT EXISTS idx_documentation_feedback_user_id ON public.documentation_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_documentation_reading_progress_user_id ON public.documentation_reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_documentation_questions_document_id ON public.documentation_questions(document_id);
CREATE INDEX IF NOT EXISTS idx_documentation_answers_question_id ON public.documentation_answers(question_id);