-- Clean up duplicate earning activities, keeping only the most recent one per user per title
WITH ranked_activities AS (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY user_id, title ORDER BY created_at DESC) as rn
  FROM earning_activities
)
DELETE FROM earning_activities 
WHERE id IN (
  SELECT id FROM ranked_activities WHERE rn > 1
);