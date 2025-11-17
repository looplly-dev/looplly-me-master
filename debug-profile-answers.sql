-- Find potentially corrupted answer data
-- Look for answers that might contain storage references or malformed JSON

SELECT 
  pa.id,
  pa.user_id,
  pa.question_id,
  pq.question_key,
  pq.question_type,
  pa.answer_value,
  pa.answer_json,
  pa.created_at
FROM profile_answers pa
JOIN profile_questions pq ON pq.id = pa.question_id
WHERE 
  -- Look for answers with 'Co2z2p' pattern
  pa.answer_value LIKE '%Co2z2p%'
  OR pa.answer_json::text LIKE '%Co2z2p%'
  -- Or look for answers that might be storage paths
  OR pa.answer_value LIKE '%supabase.co/storage%'
  OR pa.answer_json::text LIKE '%supabase.co/storage%'
ORDER BY pa.created_at DESC;

-- Check for answers with invalid JSON structure for address type
SELECT 
  pa.id,
  pa.user_id,
  pa.question_id,
  pq.question_key,
  pq.question_type,
  pa.answer_json
FROM profile_answers pa
JOIN profile_questions pq ON pq.id = pa.question_id
WHERE pq.question_type = 'address'
  AND pa.answer_json IS NOT NULL
ORDER BY pa.created_at DESC;
