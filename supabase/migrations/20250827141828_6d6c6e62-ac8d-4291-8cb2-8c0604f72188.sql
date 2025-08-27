-- Create table for Cint survey sessions
CREATE TABLE public.cint_survey_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  survey_id TEXT NOT NULL,
  cint_session_id TEXT NOT NULL,
  survey_url TEXT NOT NULL,
  estimated_reward NUMERIC NOT NULL,
  estimated_duration INTEGER,
  status TEXT NOT NULL DEFAULT 'started',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  terminated_reason TEXT,
  actual_reward NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cint_survey_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own survey sessions" 
ON public.cint_survey_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own survey sessions" 
ON public.cint_survey_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update survey sessions" 
ON public.cint_survey_sessions 
FOR UPDATE 
USING (true);

-- Create table for Cint configuration
CREATE TABLE public.cint_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for admin access only
ALTER TABLE public.cint_config ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access (assuming admin role exists)
CREATE POLICY "Admin can manage cint config" 
ON public.cint_config 
FOR ALL 
USING (public.get_current_user_role() = 'admin');

-- Add triggers for timestamp updates
CREATE TRIGGER update_cint_survey_sessions_updated_at
BEFORE UPDATE ON public.cint_survey_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cint_config_updated_at
BEFORE UPDATE ON public.cint_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_cint_survey_sessions_user_id ON public.cint_survey_sessions(user_id);
CREATE INDEX idx_cint_survey_sessions_status ON public.cint_survey_sessions(status);
CREATE INDEX idx_cint_survey_sessions_survey_id ON public.cint_survey_sessions(survey_id);