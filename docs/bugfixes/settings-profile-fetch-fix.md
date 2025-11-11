# Settings Page Profile Data Fetch Issue - Resolution

## Issue Description

The `/settings` page was not displaying the correct profile details that users had submitted through the profile completion flow.

## Root Cause

There was a **data source mismatch** between where profile data was being saved and where it was being read:

### Data Flow Problem:
1. **Profile Submission Flow**: When users complete their profile through the profile completion questions, answers are saved to the `profile_answers` table
2. **Settings Page Read**: The Settings page was only reading from the `profiles` table columns via `authState.user.profile`
3. **Missing Sync**: There was no mechanism syncing data from `profile_answers` to the `profiles` table columns

### Technical Details:

```typescript
// BEFORE: Settings page only read from authState.user.profile
const [formData, setFormData] = useState({
  firstName: authState.user?.firstName || '',
  lastName: authState.user?.lastName || '',
  address: authState.user?.profile?.address || '', // Only from profiles table
  gender: authState.user?.profile?.gender || '',
  // ... etc
});
```

The `authState.user.profile` object is populated from the `profiles` table columns:
- `profiles.first_name`
- `profiles.last_name`
- `profiles.address`
- `profiles.gender`
- etc.

However, when users answer profile questions, the data goes to:
- `profile_answers.answer_value`
- `profile_answers.answer_json`
- With a foreign key to `profile_questions.question_key`

## Solution Implemented

### 1. Created New Hook: `useFetchProfileAnswers`

**File**: `src/hooks/useFetchProfileAnswers.ts`

This hook:
- Fetches all profile answers for the current user from `profile_answers` table
- Joins with `profile_questions` to get question keys
- Returns a map of `question_key -> answer_value` for easy lookup
- Uses React Query for caching and automatic refetching

```typescript
export const useFetchProfileAnswers = () => {
  const { authState } = useAuth();
  const userId = authState.user?.id;

  return useQuery({
    queryKey: ['profile-answers', userId],
    queryFn: async () => {
      // Fetch answers with question keys
      const { data } = await supabase
        .from('profile_answers')
        .select(`
          question_id,
          answer_value,
          answer_json,
          profile_questions!inner(question_key)
        `)
        .eq('user_id', userId);
      
      // Return as key-value map
      return transformToMap(data);
    }
  });
};
```

### 2. Updated `SettingsTab` Component

**File**: `src/components/dashboard/SettingsTab.tsx`

Changes made:
1. **Import the new hook**
2. **Fetch profile answers on component mount**
3. **Sync answers to form data** via `useEffect`
4. **Update `handleSave`** to persist changes to `profiles` table
5. **Update `handleCancel`** to reset from profile answers

```typescript
// Now reads from both sources with priority
const { data: profileAnswers, isLoading } = useFetchProfileAnswers();

useEffect(() => {
  if (profileAnswers && !answersLoading) {
    setFormData({
      firstName: profileAnswers.first_name?.answer_value || authState.user?.firstName || '',
      lastName: profileAnswers.last_name?.answer_value || authState.user?.lastName || '',
      // Profile answers take priority, fall back to profiles table
    });
  }
}, [profileAnswers, answersLoading]);
```

### 3. Persist Changes to Database

The `handleSave` function now:
- Updates the `profiles` table with edited values
- Calls `refreshUserProfile()` to update auth state
- Provides user feedback via toast notifications

```typescript
const handleSave = async () => {
  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: formData.firstName,
      last_name: formData.lastName,
      address: formData.address,
      gender: formData.gender,
      // ... etc
    })
    .eq('user_id', authState.user.id);
  
  await refreshUserProfile(); // Sync auth state
};
```

## Data Flow After Fix

```
User Profile Submission
    ↓
profile_answers table
    ↓
useFetchProfileAnswers hook ← Settings Page
    ↓
Display in form fields
    ↓
User edits and saves
    ↓
profiles table ← handleSave
    ↓
refreshUserProfile() ← Update auth state
    ↓
Settings page reflects changes
```

## Files Modified

1. **Created**: `src/hooks/useFetchProfileAnswers.ts`
   - New hook to fetch profile answers from database

2. **Modified**: `src/components/dashboard/SettingsTab.tsx`
   - Added profile answers fetching
   - Synced form data with answers
   - Updated save/cancel handlers
   - Made save function persist to database

## Testing Recommendations

1. **Test Profile Answer Display**:
   - Complete profile questions
   - Navigate to Settings page
   - Verify all submitted answers appear correctly

2. **Test Profile Editing**:
   - Edit profile fields in Settings
   - Click Save
   - Verify changes persist after page refresh

3. **Test Cancel Functionality**:
   - Edit profile fields
   - Click Cancel
   - Verify form resets to original values

4. **Test Fallback Behavior**:
   - Create user with data only in `profiles` table
   - Verify Settings page still works
   - Create user with data in both tables
   - Verify `profile_answers` takes priority

## Future Improvements

### Option 1: Database Trigger
Create a Postgres trigger that automatically syncs `profile_answers` to `profiles` table columns when answers are inserted/updated:

```sql
CREATE OR REPLACE FUNCTION sync_profile_answers_to_profiles()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET 
    first_name = CASE WHEN NEW.question_key = 'first_name' THEN NEW.answer_value ELSE first_name END,
    last_name = CASE WHEN NEW.question_key = 'last_name' THEN NEW.answer_value ELSE last_name END,
    -- ... etc
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Option 2: Materialized View
Create a materialized view that combines `profiles` and `profile_answers` for optimized reads:

```sql
CREATE MATERIALIZED VIEW user_profile_complete AS
SELECT 
  p.*,
  pa.answer_values
FROM profiles p
LEFT JOIN LATERAL (
  SELECT jsonb_object_agg(question_key, answer_value) as answer_values
  FROM profile_answers pa2
  JOIN profile_questions pq ON pa2.question_id = pq.id
  WHERE pa2.user_id = p.user_id
) pa ON true;
```

### Option 3: Application-Level Sync
Create a service function that's called after profile completion to sync all answers to the `profiles` table:

```typescript
export const syncProfileAnswersToProfiles = async (userId: string) => {
  // Fetch all answers
  // Map to profile columns
  // Update profiles table
};
```

## Related Documentation

- Profile Questions System: `docs/admin/features/profiling/ARCHITECTURE.md`
- Profile Completion Flow: `docs/user-guides/completing-profile.md`
- Auth State Management: `src/hooks/useAuth.ts`

## Resolution Date

2025-11-09

## Contributors

- AI Agent (Warp)
