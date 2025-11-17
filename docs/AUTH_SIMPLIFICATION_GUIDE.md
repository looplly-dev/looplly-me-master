# Authentication Simplification Guide

## Overview

This guide outlines the migration from **custom JWT authentication** to **standard Supabase Auth**, simplifying the authentication system and improving reliability.

---

## 🎯 **Goals**

1. **Remove custom JWT authentication** (mock-looplly-login, mock-looplly-register)
2. **Use standard Supabase Auth** for all authentication
3. **Maintain mobile-based login** while using email as the primary identifier
4. **Simplify codebase** by removing custom auth logic
5. **Improve performance** by eliminating edge function bottlenecks

---

## 📊 **Current Architecture Problems**

### Custom Auth Issues
- **Complex edge functions** with timeouts (bcrypt, user creation, mapping)
- **Dual authentication systems** (custom JWT + Supabase Auth)
- **Performance bottlenecks** in mock-looplly-login function
- **Maintenance overhead** maintaining two auth systems
- **Session management complexity** with custom tokens + Supabase sessions

### Tables Involved
- `profiles` - Contains `password_hash` (to be removed)
- `looplly_user_auth_mapping` - Maps custom users to Supabase Auth (to be removed)
- `otp_verifications` - OTP system (can be kept for phone verification)
- `auth.users` - Standard Supabase auth table

---

## ✅ **New Simplified Architecture**

### How It Works

1. **Registration**:
   - User provides: Email, Password, Mobile, Personal Info
   - System calls: `supabase.auth.signUp()` with email/password
   - Mobile stored in: `user_metadata.mobile` and `profiles.mobile`
   - Profile created via database trigger on `auth.users` insert

2. **Login**:
   - **Email login**: Direct `supabase.auth.signInWithPassword(email, password)`
   - **Mobile login**: 
     - Lookup mobile in `profiles` table → get `user_id`
     - Get email from `auth.users` via RPC
     - Sign in with `supabase.auth.signInWithPassword(email, password)`

3. **Session Management**:
   - Single Supabase Auth session
   - No custom JWT tokens
   - No synthetic emails
   - No mapping table needed

### Benefits

✅ **Performance**: No edge function timeouts  
✅ **Simplicity**: One auth system, not two  
✅ **Reliability**: Battle-tested Supabase Auth  
✅ **Security**: Built-in session management  
✅ **Maintainability**: Less custom code to maintain  

---

## 🔧 **Migration Steps**

### Phase 1: Database Schema Changes

#### 1.1 Remove Custom Auth Columns
```sql
-- Remove password_hash from profiles (now in auth.users)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS password_hash;

-- Drop mapping table if exists
DROP TABLE IF EXISTS public.looplly_user_auth_mapping;
```

#### 1.2 Update Profiles Table
```sql
-- Ensure profiles table links to auth.users
-- (Already exists: profiles.user_id references auth.users.id)

-- Add email column to profiles for convenience (optional)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
```

#### 1.3 Create Database Function for Mobile Login
```sql
-- Function to get email from user_id (for mobile login)
CREATE OR REPLACE FUNCTION public.get_user_email(user_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_uuid;
  
  RETURN user_email;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_email(UUID) TO authenticated, anon;
```

#### 1.4 Update Profile Creation Trigger
```sql
-- Trigger to create profile when auth.users record is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    mobile,
    country_code,
    first_name,
    last_name,
    date_of_birth,
    gps_enabled,
    email,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'mobile',
    NEW.raw_user_meta_data->>'country_code',
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    (NEW.raw_user_meta_data->>'date_of_birth')::DATE,
    COALESCE((NEW.raw_user_meta_data->>'gps_enabled')::BOOLEAN, false),
    NEW.email,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Phase 2: Code Changes

#### 2.1 Replace auth.ts
```bash
# Backup current auth.ts
cp src/utils/auth.ts src/utils/auth-OLD-BACKUP.ts

# Replace with simplified version
cp src/utils/auth-simplified.ts src/utils/auth.ts
```

#### 2.2 Update Registration Component
**File**: `src/components/auth/Register.tsx`

Replace edge function call with standard Supabase Auth:
```typescript
// OLD: Custom edge function
await supabase.functions.invoke('looplly-register', { body: {...} })

// NEW: Standard Supabase Auth
await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { mobile, country_code, first_name, last_name, ... }
  }
})
```

#### 2.3 Update Login Component
**File**: `src/components/auth/Login.tsx`

Simplify login logic:
```typescript
// OLD: Custom JWT edge function
await supabase.functions.invoke('mock-looplly-login', { body: {...} })

// NEW: Standard Supabase Auth
if (mobile) {
  // Lookup email from mobile
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('mobile', normalizedMobile)
    .single();
  
  const { data: email } = await supabase.rpc('get_user_email', { user_uuid: profile.user_id });
  
  await supabase.auth.signInWithPassword({ email, password });
} else {
  await supabase.auth.signInWithPassword({ email, password });
}
```

#### 2.4 Update useAuth Hook
**File**: `src/hooks/useAuth.ts`

Remove custom JWT logic:
- Remove `looplly_auth_token` localStorage checks
- Remove synthetic email logic
- Remove session mapping logic
- Use only `supabase.auth.onAuthStateChange()`

#### 2.5 Update Register Form
**File**: `src/components/auth/Register.tsx`

Add email field to registration form (if not already present).

### Phase 3: Remove Custom Auth Edge Functions

#### 3.1 Archive Old Edge Functions
```bash
mkdir -p supabase/functions/_archived
mv supabase/functions/mock-looplly-login supabase/functions/_archived/
mv supabase/functions/mock-looplly-register supabase/functions/_archived/
mv supabase/functions/looplly-register supabase/functions/_archived/
```

#### 3.2 Update config.toml
Remove function entries from `supabase/config.toml`:
```toml
# Remove or comment out:
# [functions.mock-looplly-login]
# [functions.mock-looplly-register]
# [functions.looplly-register]
```

### Phase 4: Update Environment Variables

#### 4.1 Remove Custom JWT Secret
No longer need `LOOPLLY_JWT_SECRET` in:
- Netlify environment variables
- Supabase secrets
- Local `.env` files

### Phase 5: Testing

#### 5.1 Test Registration
```bash
# Start local Supabase
supabase start

# Start dev server
npm run dev

# Test:
1. Navigate to /register
2. Fill in form with email AND mobile
3. Submit registration
4. Check auth.users table for new user
5. Check profiles table for new profile
```

#### 5.2 Test Login
```bash
# Test email login
1. Navigate to /login
2. Enter email + password
3. Verify successful login

# Test mobile login
1. Navigate to /login
2. Enter mobile + password
3. Verify successful login (via email lookup)
```

#### 5.3 Test Session Management
```bash
# Verify:
1. Session persists across page refreshes
2. Logout works correctly
3. Protected routes work
4. RLS policies work (check database queries)
```

---

## 📝 **File Changes Summary**

### Files to Modify
- ✏️ `src/utils/auth.ts` - Replace with simplified version
- ✏️ `src/hooks/useAuth.ts` - Remove custom JWT logic
- ✏️ `src/components/auth/Login.tsx` - Simplify login logic
- ✏️ `src/components/auth/Register.tsx` - Add email field, use signUp
- ✏️ `supabase/migrations/YYYYMMDDHHMMSS_simplify_auth.sql` - Database changes
- ✏️ `supabase/config.toml` - Remove custom function entries

### Files to Archive
- 📦 `supabase/functions/mock-looplly-login/` → `_archived/`
- 📦 `supabase/functions/mock-looplly-register/` → `_archived/`
- 📦 `supabase/functions/looplly-register/` → `_archived/`
- 📦 `src/utils/auth.ts` → `auth-OLD-BACKUP.ts`

### Files to Remove (After Testing)
- ❌ `looplly_user_auth_mapping` table
- ❌ `profiles.password_hash` column
- ❌ Custom JWT token logic in useAuth
- ❌ `LOOPLLY_JWT_SECRET` environment variable

---

## ⚠️ **Migration Risks & Mitigation**

### Risk 1: Existing Users Can't Login
**Mitigation**: Create data migration script to:
1. For each profile with mobile:
2. Check if auth.users record exists
3. If not, create with synthetic email pattern
4. Link to existing profile

### Risk 2: Breaking Changes During Migration
**Mitigation**:
- Test on local environment first
- Use feature flags if needed
- Have rollback plan ready
- Deploy during low-traffic period

### Risk 3: Mobile Lookup Performance
**Mitigation**:
- Add index on `profiles.mobile` (already exists)
- Cache email lookups if needed
- Consider adding `profiles.email` column for faster lookups

---

## 🎉 **Post-Migration Benefits**

1. **Faster login** - No edge function timeouts
2. **Simpler codebase** - One auth system
3. **Better debugging** - Standard Supabase Auth logs
4. **Easier onboarding** - Developers understand standard patterns
5. **More reliable** - Battle-tested authentication
6. **Better security** - Supabase's built-in security features
7. **Easier maintenance** - Less custom code to maintain

---

## 📚 **Reference**

### Standard Supabase Auth Documentation
- [Sign Up](https://supabase.com/docs/reference/javascript/auth-signup)
- [Sign In](https://supabase.com/docs/reference/javascript/auth-signinwithpassword)
- [Auth State](https://supabase.com/docs/reference/javascript/auth-onauthstatechange)
- [Session Management](https://supabase.com/docs/guides/auth/sessions)

### Key Differences

| Feature | Custom Auth | Standard Auth |
|---------|-------------|---------------|
| Token Storage | localStorage (custom JWT) | httpOnly cookie (Supabase) |
| Session Management | Manual sync | Automatic |
| Password Hashing | Edge function bcrypt | Supabase built-in |
| User Lookup | Edge function | RPC function |
| Performance | Slow (edge function) | Fast (built-in) |
| Maintenance | High | Low |

---

**Last Updated**: 2025-11-16  
**Status**: Ready for implementation
