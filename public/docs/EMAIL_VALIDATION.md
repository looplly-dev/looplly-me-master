---
id: "email-validation"
title: "Email Validation System"
category: "Technical Reference"
description: "Email validation and verification system"
audience: "developer"
tags: ["email", "validation", "verification"]
status: "published"
---

# Email Validation System

## Overview
Looplly's User Portal implements email validation to protect internal test emails, guide staff to correct portals, and ensure data quality.

## Key Principle: Email is OPTIONAL
- **Mobile number** is the primary identifier (REQUIRED)
- **Email** is optional and used for communication only
- If provided, email must pass validation rules

---

## Validation Rules

### 1. Blocked Domains

| Domain | Error Message | Reason |
|--------|---------------|--------|
| `@looplly-testing.internal` | "Test emails cannot be used for registration" | Reserved for Journey Simulator test users |
| `@looplly.me` | "Staff emails must use the Admin Portal" | Staff onboarding via Admin Portal only |
| `.test`, `.local`, `.localhost`, `.invalid`, `.example` | "Invalid email domain" | Common test/invalid domains |

### 2. Format Requirements
- Standard email regex: `[username]@[domain].[tld]`
- Must contain `@` symbol
- Must have domain with TLD
- Normalized to lowercase
- Trimmed of whitespace

### 3. Normalization
All emails are normalized before storage:
- **Trim whitespace**: `  user@example.com  ` → `user@example.com`
- **Lowercase**: `USER@EXAMPLE.COM` → `user@example.com`

---

## User Experience Flow

### Real-time Validation (3+ characters typed)

```
User types: "john@gmail.com"
          ↓
Validation triggered
          ↓
Domain check: "gmail.com" ✅ Allowed
          ↓
Format check: Valid ✅
          ↓
Show green border + ✓ icon
          ↓
Display: "Will be saved as: john@gmail.com"
```

### Blocked Domain Example

```
User types: "test@looplly-testing.internal"
          ↓
Validation triggered
          ↓
Domain check: "looplly-testing.internal" ❌ BLOCKED
          ↓
Show red border + ✗ icon
          ↓
Display error: "Test emails cannot be used for registration"
```

### Staff Email Example

```
User types: "john@looplly.me"
          ↓
Validation triggered
          ↓
Domain check: "looplly.me" ❌ BLOCKED
          ↓
Show red border + ✗ icon
          ↓
Display error: "Staff emails must use the Admin Portal"
```

---

## Visual Indicators

### Valid Email
- ✅ **Green border** around input field
- ✅ **Check icon (✓)** on right side
- ✅ **Preview text**: "Will be saved as: [normalized]"

### Invalid Email
- ❌ **Red border** around input field
- ❌ **X icon (✗)** on right side
- ❌ **Error message**: Specific reason with AlertCircle icon

### No Validation (< 3 characters or empty)
- ⚪ **Default border** (no color)
- ⚪ **No icon** displayed
- ⚪ **No messages** shown

---

## Business Context

### Why Block @looplly-testing.internal?

**Test User Isolation**: The Journey Simulator creates test users with `@looplly-testing.internal` emails for testing features without affecting real user data.

**Technical Details**:
- Test users are created **server-side** via edge functions
- They have `is_test_account = true` in the database
- They bypass frontend validation entirely
- Real users should never use this domain

**What Could Go Wrong Without This Block?**
1. User accidentally types `test@looplly-testing.internal`
2. Registration succeeds (valid format)
3. Database uniqueness constraint triggers "Email already exists"
4. User confused why their test email conflicts
5. Support ticket created

**With This Block?**
1. User types `test@looplly-testing.internal`
2. Immediate feedback: "Test emails cannot be used for registration"
3. User understands and uses personal email
4. No confusion, no support burden

### Why Block @looplly.me?

**Correct Onboarding Flow**: Staff members (`looplly_team_user`) must be created via the Admin Portal's "Add Team Member" function to ensure:
- Correct `user_type` assignment (`looplly_team_user` not `looplly_user`)
- Proper role assignment in `user_roles` table
- Team profile creation in `team_profiles` table
- Temporary password workflow

**What Happens Without This Block?**
1. Staff member tries to register on User Portal with `staff@looplly.me`
2. Gets "Email already exists" error (if already onboarded)
3. Or successfully registers with wrong `user_type` (if not yet onboarded)
4. Tries to login on User Portal
5. Immediately redirected: "Please use the admin portal at /admin/login"
6. Confused staff member contacts support

**With This Block?**
1. Staff member tries to register on User Portal with `staff@looplly.me`
2. Immediate feedback: "Staff emails must use the Admin Portal"
3. Clear guidance to correct portal
4. No confusion, proper onboarding flow

---

## Portal Access Flow

### User Portal (Public Registration)
```
Email domain entered
        ↓
┌───────┴───────┬──────────────┬──────────────┐
│               │              │              │
Public Email    @looplly.me    @looplly-      │
(gmail, etc)    (Staff)        testing...     │
│               │              │              │
↓               ↓              ↓              │
✅ ALLOWED      ❌ BLOCKED     ❌ BLOCKED      │
                │              │              │
Registration    Redirect to    Reserved for   │
proceeds        Admin Portal   Test Users     │
```

### Admin Portal (Staff Onboarding)
- Staff members created via "Add Team Member" function
- `user_type` set to `looplly_team_user`
- Role assigned in `user_roles` table
- `@looplly.me` email domain enforced

---

## Journey Simulator Integration

**No Impact** ✅

The Journey Simulator creates test users **server-side** and never touches the User Portal registration form:

1. `supabase/functions/seed-test-users/index.ts` creates users directly in `auth.users` table
2. `supabase/functions/create-simulator-session/index.ts` generates sessions
3. Both bypass frontend validation entirely
4. Email validation only applies to frontend form submission

**Test User Creation Flow**:
```
Simulator "Seed Test Users" button clicked
          ↓
Edge function invoked (server-side)
          ↓
Direct database insert into auth.users
          ↓
profiles.is_test_account = true
          ↓
Email: test1@looplly-testing.internal
          ↓
✅ Test user created (no frontend validation)
```

---

## Security Considerations

### Defense in Depth

**Layer 1: Client-side Validation** (This Implementation)
- Fast UX feedback
- Prevents accidental misuse
- Guides users to correct portals

**Layer 2: Database Uniqueness Constraints**
- `UNIQUE (email)` prevents duplicates
- Enforced at database level
- Cannot be bypassed by client

**Layer 3: Authentication System**
- Supabase Auth enforces email verification
- Server-side session management
- JWT token validation

**Layer 4: User Type Checking**
- Login flow validates `user_type` on both portals
- `looplly_team_user` redirected from User Portal
- `looplly_user` blocked from Admin Portal

### No Bypass Risk

Even if a user bypasses client-side validation:
- Journey Simulator test users created **server-side**
- Staff accounts created **server-side** via "Add Team Member"
- Database constraints prevent duplicate emails
- Login flow enforces user_type separation

---

## Testing Guide

### Test Cases

#### Valid Emails
| Input | Expected Normalized | Expected Result |
|-------|-------------------|-----------------|
| `john@gmail.com` | `john@gmail.com` | ✅ Valid, green border, ✓ icon |
| `SARAH@COMPANY.COM` | `sarah@company.com` | ✅ Valid, green border, ✓ icon, preview shown |
| `  user@example.org  ` | `user@example.org` | ✅ Valid, trimmed, green border, ✓ icon |
| `` (empty) | - | ✅ Valid (optional field), no validation shown |

#### Blocked Internal Emails
| Input | Expected Error | Expected UI |
|-------|---------------|-------------|
| `test1@looplly-testing.internal` | "Test emails cannot be used for registration" | ❌ Red border, ✗ icon, error message |
| `simulator@looplly-testing.internal` | "Test emails cannot be used for registration" | ❌ Red border, ✗ icon, error message |

#### Blocked Staff Emails
| Input | Expected Error | Expected UI |
|-------|---------------|-------------|
| `admin@looplly.me` | "Staff emails must use the Admin Portal" | ❌ Red border, ✗ icon, error message |
| `john.doe@looplly.me` | "Staff emails must use the Admin Portal" | ❌ Red border, ✗ icon, error message |

#### Invalid Formats
| Input | Expected Error | Expected UI |
|-------|---------------|-------------|
| `notanemail` | "Invalid email format" | ❌ Red border, ✗ icon, error message |
| `test@localhost` | "Invalid email domain" | ❌ Red border, ✗ icon, error message |
| `user@test.local` | "Invalid email domain" | ❌ Red border, ✗ icon, error message |
| `@example.com` | "Invalid email format" | ❌ Red border, ✗ icon, error message |

### Manual Testing Steps

1. **Test Optional Field**:
   - Leave email blank
   - Fill other required fields
   - Submit form
   - ✅ Should succeed without email

2. **Test Real-time Validation**:
   - Type `jo` in email field
   - ⚪ No validation shown (< 3 chars)
   - Type `h` to make `joh`
   - ⚪ Still no validation (no @ yet)
   - Type `n@gmail.com`
   - ✅ Green border + ✓ icon appears

3. **Test Blocked Domains**:
   - Type `test@looplly-testing.internal`
   - ❌ Red border + ✗ icon + error message
   - Clear field
   - Type `admin@looplly.me`
   - ❌ Red border + ✗ icon + different error message

4. **Test Normalization**:
   - Type `  USER@EXAMPLE.COM  ` (with spaces and uppercase)
   - ✅ Green border + ✓ icon
   - 📝 Preview shows: "Will be saved as: user@example.com"

5. **Test Journey Simulator**:
   - Go to Admin Simulator (`/admin/simulator`)
   - Click "Seed Test Users"
   - Verify test users created with `@looplly-testing.internal`
   - Start simulation with test user
   - ✅ Simulator works normally (no impact)

---

## Implementation Files

| File | Purpose |
|------|---------|
| `src/utils/emailValidation.ts` | Core validation logic |
| `src/components/auth/Register.tsx` | Real-time validation UI |
| `src/utils/validation.ts` | Form-level validation |
| `docs/EMAIL_VALIDATION.md` | This documentation |
| `docs/USER_CLASSIFICATION.md` | User type and email restrictions |

---

## Future Enhancements (Out of Scope)

Potential additions for future consideration:
- Disposable email detection (tempmail.com, guerrillamail.com)
- Email reputation scoring
- Typo detection and suggestions (gmial.com → gmail.com)
- Corporate domain verification for B2B clients
- Email deliverability checking (MX record validation)
- Internationalized email addresses (RFC 6531)
