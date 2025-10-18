# Data Isolation Quick Reference

## 🎯 Core Principle

**Every query MUST filter by `country_code` to prevent cross-country data pollution.**

---

## ✅ Quick Checks

### Verify User's Country
```sql
SELECT user_id, country_code, first_name, last_name 
FROM profiles 
WHERE user_id = 'YOUR_USER_ID';
```

### Count Users Per Country
```sql
SELECT country_code, COUNT(*) as user_count 
FROM profiles 
GROUP BY country_code 
ORDER BY user_count DESC;
```

### Verify Answer Isolation
```sql
-- Check that income ranges are country-specific
SELECT p.country_code, pa.answer_normalized, COUNT(*) 
FROM profile_answers pa
JOIN profiles p ON p.user_id = pa.user_id
JOIN profile_questions pq ON pq.id = pa.question_id
WHERE pq.question_key = 'household_income'
GROUP BY p.country_code, pa.answer_normalized
ORDER BY p.country_code, pa.answer_normalized;
```

---

## 📊 Common Queries

### Nigerian Income Distribution
```sql
SELECT 
  pa.answer_normalized as income_bracket,
  COUNT(*) as users
FROM profile_answers pa
JOIN profiles p ON p.user_id = pa.user_id
JOIN profile_questions pq ON pq.id = pa.question_id
WHERE p.country_code = 'NG'
  AND pq.question_key = 'household_income'
GROUP BY pa.answer_normalized
ORDER BY users DESC;
```

### Target Specific Income Group
```sql
SELECT * FROM find_users_by_criteria(
  'NG',
  '{"household_income": ["3000001-6000000", "6000001-12000000"]}'::jsonb
);
```

### Export Country Dataset
```sql
COPY (
  SELECT 
    p.user_id,
    p.country_code,
    pq.question_key,
    pa.answer_normalized
  FROM profile_answers pa
  JOIN profiles p ON p.user_id = pa.user_id
  JOIN profile_questions pq ON pq.id = pa.question_id
  WHERE p.country_code = 'NG'
) TO '/tmp/nigeria_data.csv' WITH CSV HEADER;
```

---

## ❌ Common Mistakes

### WRONG: No Country Filter
```sql
-- BAD: Mixes all countries
SELECT answer_normalized, COUNT(*) 
FROM profile_answers pa
JOIN profile_questions pq ON pq.id = pa.question_id
WHERE pq.question_key = 'household_income'
GROUP BY answer_normalized;
```

### CORRECT: Country Filter
```sql
-- GOOD: Nigeria only
SELECT answer_normalized, COUNT(*) 
FROM profile_answers pa
JOIN profiles p ON p.user_id = pa.user_id
JOIN profile_questions pq ON pq.id = pa.question_id
WHERE p.country_code = 'NG'
  AND pq.question_key = 'household_income'
GROUP BY answer_normalized;
```

---

## 🔒 Isolation Guarantees

| Layer | Mechanism | Protection |
|-------|-----------|------------|
| **User** | `profiles.country_code` (immutable) | User assigned to one country |
| **Answer** | `profile_answers.user_id` → `profiles.country_code` | Answers linked to user's country |
| **Query** | `find_users_by_criteria(country_code, ...)` | Function enforces country filter |

---

## 🚀 Performance Tips

1. **Always use indexes**:
   ```sql
   -- Check if index is used
   EXPLAIN ANALYZE SELECT * FROM profiles WHERE country_code = 'NG';
   -- Should show: "Index Scan using idx_profiles_country"
   ```

2. **Filter early**:
   ```sql
   -- GOOD: Filter by country first
   WITH nigeria_users AS (
     SELECT user_id FROM profiles WHERE country_code = 'NG'
   )
   SELECT pa.* 
   FROM profile_answers pa
   WHERE pa.user_id IN (SELECT user_id FROM nigeria_users);
   ```

3. **Use targeting functions**:
   ```sql
   -- Built-in country isolation + performance optimization
   SELECT * FROM find_users_by_criteria('NG', '{...}'::jsonb);
   ```

---

## 🧪 Data Quality Checks

### Check for Orphaned Answers
```sql
-- Should return 0 rows
SELECT COUNT(*) as orphaned_count
FROM profile_answers pa
JOIN profiles p ON p.user_id = pa.user_id
JOIN profile_questions pq ON pq.id = pa.question_id
WHERE pq.applicability = 'country_specific'
  AND NOT (p.country_code = ANY(pq.country_codes));
```

### Verify Answer Normalization
```sql
-- Check that answer_normalized is populated
SELECT 
  COUNT(*) as total_answers,
  COUNT(answer_normalized) as normalized_answers,
  ROUND(100.0 * COUNT(answer_normalized) / COUNT(*), 2) as percentage
FROM profile_answers;
-- Should be close to 100%
```

---

## 📚 Related Documentation

- **Full Guide**: [docs/COUNTRY_QUESTION_MANAGEMENT.md](./COUNTRY_QUESTION_MANAGEMENT.md)
- **Architecture**: [docs/PROFILE_SYSTEM_ARCHITECTURE.md](./PROFILE_SYSTEM_ARCHITECTURE.md)
- **Migration SQL**: `supabase/migrations/..._targeting-functions.sql`

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Query returns users from wrong country | Add `WHERE p.country_code = 'XX'` to JOIN with profiles |
| Income ranges look wrong | Verify you're using country-specific options (check `country_question_options` table) |
| Slow queries | Ensure `country_code` filter uses index (`EXPLAIN ANALYZE`) |
| No results for targeting query | Check that users exist in that country AND have answered the required questions |

---

## 💡 Pro Tips

1. **Always JOIN profiles table** when querying `profile_answers` to access `country_code`
2. **Use `find_users_by_criteria()`** for targeting - it has isolation built-in
3. **Verify country filter** in your WHERE clause before running expensive queries
4. **Export per-country datasets** for ML - never train models on mixed-country data
5. **Monitor data quality** with orphaned answer checks weekly

---

**Remember**: One country per query = Clean data = Accurate insights 🎯
