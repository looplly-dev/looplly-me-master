-- Remove Stage 3 and Stage 4 configurations
DELETE FROM streak_unlock_config WHERE stage IN (3, 4);

-- Update user_streaks to remove stage3, stage4 from unlocked_stages default
ALTER TABLE user_streaks 
ALTER COLUMN unlocked_stages 
SET DEFAULT '{"stage1": true, "stage2": false}'::jsonb;

-- Drop the daily_rep_cap_hits column (no longer needed)
ALTER TABLE user_streaks 
DROP COLUMN IF EXISTS daily_rep_cap_hits;