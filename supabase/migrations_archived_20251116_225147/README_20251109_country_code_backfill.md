# Country Code Backfill Migration

## Overview
**Migration File**: `20251109050645_0b08c576-2a7d-4cae-92b3-3c6e7e55d213.sql`  
**Date**: 2025-11-09  
**Type**: Data Migration (Backfill)  
**Impact**: Low Risk - Read and update only

## Problem Statement
Some user profiles have mobile numbers stored but the `country_code` column is NULL. This causes issues when users try to complete address questions, as the system cannot auto-detect their country for address validation.

### Root Cause
This situation can occur when:
1. Users were created before `country_code` was a required field
2. The registration process had a bug that didn't set the country code
3. Data was migrated from a legacy system without proper mapping

## Solution
This migration extracts the country code (dial code) from existing mobile numbers and backfills the `country_code` column.

Since mobile numbers are stored in E.164 format (e.g., `+27821234567`), we can reliably extract the country code using regex pattern matching.

## What the Migration Does

1. **Identifies Affected Profiles**
   - Finds profiles where `country_code IS NULL`
   - But `mobile IS NOT NULL`
   - And mobile matches E.164 format (`^\+\d{1,4}`)

2. **Extracts Country Code**
   - Uses regex to extract the dial code (e.g., `+27`, `+1`, `+44`)
   - Pattern: `^\+\d{1,4}` (matches 1-4 digits after +)

3. **Updates Profiles**
   - Sets `country_code` to the extracted value
   - Updates `updated_at` timestamp

4. **Performance Optimization**
   - Creates an index on `country_code` for faster queries

5. **Documentation**
   - Adds comments to the table and column for clarity

## Safety Features

- **Idempotent**: Safe to run multiple times (uses `IF NOT EXISTS` for index)
- **Logging**: Comprehensive NOTICE and WARNING messages
- **Validation**: Only updates profiles with valid E.164 mobile numbers
- **Reporting**: Shows sample results and warns about any problematic profiles

## Expected Results

### Success Case
```
NOTICE: Starting country_code backfill migration...
NOTICE: Found 15 profiles with NULL country_code but valid mobile numbers
NOTICE: Successfully updated 15 profiles with extracted country codes
NOTICE: Sample: User abc-123 (John Doe) - mobile: +27821234567, country_code: +27
NOTICE: All profiles with mobile numbers now have country_code set!
```

### Warning Case
If some profiles have invalid mobile formats:
```
WARNING: Still have 2 profiles with NULL country_code - may need manual intervention
WARNING: Needs manual fix: User xyz-789 (Jane Smith) - mobile: 0821234567
```

## Running the Migration

### Option 1: Use the Helper Script (Recommended)
```bash
./scripts/migrate-country-codes.sh
```

This interactive script will:
- Check if the migration file exists
- Show you what will be changed
- Let you choose local or remote environment
- Confirm before applying
- Show detailed results

### Option 2: Using Supabase CLI

**Local Development:**
```bash
supabase db reset --local
```

**Remote (Production):**
```bash
supabase db push
```

### Option 3: Manual SQL Execution
If you need to run manually via SQL editor:
```sql
-- Copy and paste the contents of the migration file
-- into your Supabase SQL editor
```

## Verification

After running the migration, verify the results:

```sql
-- Check total profiles and those fixed
SELECT 
  COUNT(*) as total_profiles,
  COUNT(country_code) as profiles_with_country_code,
  COUNT(CASE WHEN country_code IS NULL AND mobile IS NOT NULL THEN 1 END) as still_need_fixing
FROM profiles;

-- View sample of updated profiles
SELECT 
  user_id,
  first_name,
  last_name,
  mobile,
  country_code,
  updated_at
FROM profiles
WHERE country_code IS NOT NULL 
  AND mobile IS NOT NULL
ORDER BY updated_at DESC
LIMIT 10;

-- Check for any remaining issues
SELECT 
  user_id,
  first_name,
  last_name,
  mobile
FROM profiles
WHERE country_code IS NULL 
  AND mobile IS NOT NULL;
```

## Rollback Plan

If you need to revert this migration (unlikely but possible):

```sql
-- Option 1: Set country_codes back to NULL (not recommended)
UPDATE profiles
SET country_code = NULL
WHERE updated_at >= '2025-11-09 05:06:45';  -- Adjust timestamp

-- Option 2: Restore from backup
-- Use your backup from before the migration
```

**Note**: You probably don't want to roll this back, as it fixes a real issue. If there are problems, it's better to fix forward.

## Related Files

- **Frontend Fix**: `src/components/dashboard/profile/QuestionRenderer.tsx`
  - Added fallback logic to extract country code client-side
  - Auto-updates profile if extraction succeeds
  
- **UI Component**: `src/components/ui/address-fields-input.tsx`
  - Enhanced to handle missing country codes gracefully
  - Shows "Loading country information..." during fetch

- **Documentation**: `docs/fixes/PROFILE_ADDRESS_COUNTRY_VALIDATION_FIX.md`
  - Complete fix documentation
  - Testing checklist
  - Data flow explanation

## Future Prevention

To prevent this issue from happening again:

1. **Application Level**: Registration process now ensures country_code is always set
2. **Frontend Fallback**: Address questions can extract country code if missing
3. **Database Level**: Consider adding the check constraint (commented out in migration):
   ```sql
   ALTER TABLE profiles 
     ADD CONSTRAINT check_country_code_when_mobile_set 
     CHECK (
       (mobile IS NULL) OR 
       (mobile IS NOT NULL AND country_code IS NOT NULL)
     );
   ```

## Testing Checklist

After applying this migration:

- [ ] Run verification queries to check affected profiles
- [ ] Test address question page at `/profile/complete?level=2`
- [ ] Verify country auto-detects with flag emoji
- [ ] Check browser console for successful country detection logs
- [ ] Confirm "Continue to Next Question" button works
- [ ] Test with multiple country codes if possible
- [ ] Monitor for any error reports from users

## Support

If you encounter issues:

1. Check the migration logs for WARNINGS
2. Run the verification queries above
3. Check application logs for any RLS policy errors
4. Verify Supabase connection and permissions

For profiles that couldn't be auto-fixed:
- The mobile number might not be in E.164 format
- Manual intervention may be needed
- Check the WARNING logs for specific user IDs

## Questions?

See the main fix documentation at:
`docs/fixes/PROFILE_ADDRESS_COUNTRY_VALIDATION_FIX.md`
