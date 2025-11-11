-- Add privacy and compliance fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS privacy_policy_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cookie_consent_given_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cookie_consent_preferences JSONB DEFAULT '{"analytics": false, "marketing": false}'::jsonb,
ADD COLUMN IF NOT EXISTS age_verified_at TIMESTAMP WITH TIME ZONE;

-- Create data export requests table
CREATE TABLE IF NOT EXISTS public.data_export_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  export_data JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed'))
);

-- Enable RLS
ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for data export requests
CREATE POLICY "Users can view their own export requests"
ON public.data_export_requests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own export requests"
ON public.data_export_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_data_export_requests_user_id ON public.data_export_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_export_requests_status ON public.data_export_requests(status);