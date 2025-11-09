# Country Code Fix - Quick Start Guide

## 🎯 What This Fixes
Users getting "Country not detected. Please contact support." error on address question page.

## 🚀 Quick Fix (3 Steps)

### Step 1: Run the Database Migration
```bash
./scripts/migrate-country-codes.sh
```

Choose option 1 for local development, or option 2 for production.

### Step 2: Refresh Your App
The frontend code changes are already in place. Just reload the page.

### Step 3: Test
Navigate to `/profile/complete?level=2` and verify:
- ✅ Country auto-detects (shows flag emoji)
- ✅ "Continue to Next Question" button works after filling Province/State

## 📋 What Was Changed

### Database
- **Migration**: `supabase/migrations/20251109050645_0b08c576-2a7d-4cae-92b3-3c6e7e55d213.sql`
- **Action**: Extracts country code from mobile numbers for profiles with NULL country_code
- **Impact**: Backfills missing data for existing users

### Frontend
- **QuestionRenderer**: `src/components/dashboard/profile/QuestionRenderer.tsx`
  - Added fallback to extract country code from mobile if missing
  - Auto-updates profile with extracted code
  - Better error handling and logging

- **AddressFieldsInput**: `src/components/ui/address-fields-input.tsx`
  - Added debug logging
  - Auto-populates country when code becomes available
  - Better user feedback during loading

## 🔍 Verification

After applying the fix, check browser console for:
```
[QuestionRenderer] User country code from profile: +27
[AddressFieldsInput] Country detection: { userCountryCode: "+27", ... }
```

Or, if extraction was needed:
```
[QuestionRenderer] No country_code, extracting from mobile: +27821234567
[QuestionRenderer] Extracted country code: +27
[QuestionRenderer] Successfully updated country_code in profile
```

## 📚 Documentation

- **Full Fix Details**: `docs/fixes/PROFILE_ADDRESS_COUNTRY_VALIDATION_FIX.md`
- **Migration Guide**: `supabase/migrations/README_20251109_country_code_backfill.md`

## 🆘 Troubleshooting

### Migration fails
```bash
# Check if Supabase is running
supabase status

# If not, start it
supabase start

# Try again
./scripts/migrate-country-codes.sh
```

### Country still not detected
1. Check console logs for errors
2. Verify mobile number is in E.164 format (+27...)
3. Run verification query:
   ```sql
   SELECT user_id, mobile, country_code 
   FROM profiles 
   WHERE country_code IS NULL AND mobile IS NOT NULL;
   ```

### Button still disabled
- Make sure Province/State field is filled
- Check that country shows with flag emoji
- Look for "Loading country information..." on button

## ✅ Success Checklist

- [ ] Migration ran successfully
- [ ] No WARNING messages in migration logs
- [ ] App refreshed
- [ ] Test user profile has country_code set
- [ ] Address page shows country with flag
- [ ] Can fill in address fields
- [ ] "Continue" button works after filling required fields

## 🎉 Done!

Your country code detection should now work correctly. The fix includes both:
1. **Immediate frontend fallback** - Works even before migration runs
2. **Database backfill** - Fixes all existing profiles permanently

Future users won't experience this issue thanks to the improved registration flow.
