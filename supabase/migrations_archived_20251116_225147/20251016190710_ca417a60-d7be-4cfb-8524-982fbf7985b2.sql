-- Add grace period tracking columns to user_streaks table
ALTER TABLE public.user_streaks 
ADD COLUMN IF NOT EXISTS consecutive_days_missed integer DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS grace_period_started_at timestamp with time zone DEFAULT NULL;