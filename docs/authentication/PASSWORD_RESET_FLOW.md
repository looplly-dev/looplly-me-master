---
id: "authentication-password-reset"
title: "Password Reset Flow"
category: "Authentication & Access"
description: "Secure password recovery mechanisms for users and team members using mobile-based verification"
audience: "all"
tags: ["authentication", "password", "recovery", "security"]
status: "published"
version: "1.0"
created_at: "2024-01-15"
updated_at: "2024-01-15"
---

# Password Reset Flow

Password management and recovery system documentation for both regular users and team members.

## Overview

The password reset system provides secure password recovery mechanisms for all user types. **For regular users, mobile number is the PRIMARY recovery method** (not email, which is optional). Team members receive temporary passwords and must change them on first login.

## User Password Recovery (Mobile-Based)

### Why Mobile Over Email?

**Design Decision:**
- Email is **optional** in Looplly (not collected during registration, optional in Level 2)
- Mobile number is **required** (collected during registration, verified before earning)
- Mobile provides universal coverage for all users
- More secure than email (harder to compromise)

### Password Recovery Flow

**Step 1: User Clicks "Forgot Password"**
- Prompted for mobile number (not email)
- System validates mobile number format
- Checks if mobile exists in system

**Step 2: OTP Sent**
- 6-digit code sent via SMS to registered mobile
- Code valid for 10 minutes
- User can request resend (max 3 attempts per hour)

**Step 3: Verify OTP**
- User enters 6-digit code
- System validates against Supabase Auth
- On success: Redirect to password reset form

**Step 4: Set New Password**
- User enters new password (min 8 chars)
- Confirm password field
- Password updated in Supabase Auth
- Automatic login with new credentials

### Technical Implementation

**Frontend Component:** `src/components/auth/ForgotPassword.tsx`

```typescript
// Validate mobile and send OTP
const { data, error } = await supabase.auth.resetPasswordForEmail({
  phone: normalizedMobile // Uses mobile, not email
});

// Verify OTP and reset
const { error: verifyError } = await supabase.auth.verifyOtp({
  phone: normalizedMobile,
  token: otpCode,
  type: 'sms'
});
```

### Current vs Production

**Development (Current):**
- Stub OTP code: `12345`
- No actual SMS sent
- Testing purposes only

**Production (Planned):**
- Notify API integration
- Real SMS delivery
- Rate limiting (max 3 OTP per hour)
- See [Mobile Validation](MOBILE_VALIDATION.md) for details

## Team Member Password Reset

Team member password management and reset flow for admin accounts.

## Team Member Invitation Flow

### Step 1: Admin Invites Team Member

**Admin Actions:**
1. Navigate to **Admin → Team**
2. Click "Add Team Member"
3. Fill in required fields:
   - Email (must be unique)
   - First Name
   - Last Name
   - Company Name (team name)
   - Company Role (job title)

**System Actions:**
1. Creates account in `auth.users` table
2. Creates profile in `team_profiles` table
3. Sets `must_change_password: true` flag
4. Generates temporary password (16 characters, alphanumeric + symbols)
5. Sets `temp_password_expires_at` (24 hours from invitation)
6. Sends invitation email with:
   - Login URL
   - Temporary password
   - Expiration notice
   - Instructions for first login

### Step 2: Team Member First Login

**Team Member Actions:**
1. Clicks login URL from invitation email
2. Enters email and temporary password
3. Clicks "Sign In"

**System Actions:**
1. Validates credentials
2. Checks `must_change_password` flag in database
3. Detects flag is `true`
4. **Immediately redirects** to `/admin/reset-password`
5. Blocks access to all other admin pages

### Step 3: Password Change Required

**Password Reset Page:**
- Clear heading: "Change Your Password"
- Instructions: "You must change your password before accessing the admin portal"
- Form fields:
  - Current Password (temporary password)
  - New Password (minimum 8 characters)
  - Confirm New Password
- Validation:
  - Passwords must match
  - Minimum length enforced
  - Strong password recommended

**On Successful Password Change:**
1. Updates password in `auth.users`
2. Sets `must_change_password: false` in `team_profiles`
3. Clears `temp_password_expires_at`
4. Sets `first_login_at` timestamp
5. Redirects to `/admin` dashboard
6. Shows success message

## Technical Implementation

### Database Schema

**team_profiles table:**
```sql
- must_change_password: boolean (default false)
- temp_password_expires_at: timestamp with time zone
- first_login_at: timestamp with time zone
- invitation_sent_at: timestamp with time zone
```

### Authentication Check

**Location:** `src/hooks/useAuth.ts`

```typescript
// When loading user session, check must_change_password flag
const profile = teamProfiles?.data?.[0];
if (profile?.must_change_password) {
  // Add flag to user object for ProtectedRoute to detect
  user.mustChangePassword = true;
}
```

### Route Protection

**Location:** `src/components/auth/ProtectedRoute.tsx`

```typescript
// Check both locations for backward compatibility
const mustChangePassword = authState.user?.mustChangePassword || 
                           (authState.user?.profile as any)?.must_change_password;

if (mustChangePassword) {
  // Team members must reset password before accessing portal
  if (userType === 'looplly_team_user' && 
      window.location.pathname !== '/admin/reset-password') {
    navigate('/admin/reset-password');
    return null;
  }
}
```

### Password Reset Handler

**Location:** `src/pages/AdminResetPassword.tsx`

```typescript
// After successful password change via Supabase Auth
await supabase
  .from('team_profiles')
  .update({
    must_change_password: false,
    temp_password_expires_at: null,
    first_login_at: new Date().toISOString()
  })
  .eq('user_id', user.id);
```

## Edge Function: Create Team Member

**Location:** `supabase/functions/create-team-member/index.ts`

**Key Steps:**
1. Validates admin permissions
2. Generates secure temporary password
3. Creates auth user with temporary password
4. Creates team profile with `must_change_password: true`
5. Sends invitation email with credentials
6. Logs audit event

**Security Features:**
- Password expires after 24 hours
- Strong password generation (16 chars)
- Email verification required
- Rate limiting on password reset attempts

## Troubleshooting

### Team Member Not Prompted to Change Password

**Possible Causes:**
1. `must_change_password` flag not set in database
2. Auth hook not reading flag correctly
3. ProtectedRoute not detecting flag
4. User cached in old session

**Debug Steps:**
1. Check database: `SELECT must_change_password FROM team_profiles WHERE email = '...'`
2. Verify flag is `true`
3. Log out completely and log back in
4. Check browser console for auth state
5. Verify `useAuth.ts` includes flag in user object
6. Confirm `ProtectedRoute.tsx` checks both flag locations

### Password Reset Not Working

**Possible Causes:**
1. Supabase auth update failed
2. Database update to `team_profiles` failed
3. RLS policies blocking update

**Debug Steps:**
1. Check network tab for failed requests
2. Verify Supabase auth response
3. Check `team_profiles` update query
4. Review RLS policies on `team_profiles`
5. Check edge function logs

### Temporary Password Expired

**Solution:**
1. Admin navigates to **Admin → Team**
2. Finds team member row
3. Clicks "Reset Password" action
4. System generates new temporary password
5. New invitation email sent
6. 24-hour expiration reset

## Security Best Practices

### For Admins
- Never share temporary passwords via insecure channels
- Set strong password requirements
- Monitor failed login attempts
- Regularly audit team member access
- Deactivate accounts for departed team members

### For Team Members
- Change password immediately upon receiving invitation
- Use strong, unique passwords
- Never share credentials
- Log out after each session
- Report suspicious activity immediately

## Password Requirements

**Minimum Requirements:**
- At least 8 characters
- Mix of uppercase and lowercase
- At least one number
- At least one special character

**Recommended:**
- 12+ characters
- Use a password manager
- Enable two-factor authentication (if available)
- Don't reuse passwords from other sites

## Related Documentation

- [Admin Portal Guide](./ADMIN_PORTAL_GUIDE.md) - Team management features
- [User Classification](./USER_CLASSIFICATION.md) - Understanding user types
- [Table Architecture](./TABLE_ARCHITECTURE.md) - Database schema details
- [Recent Changes](./RECENT_CHANGES.md) - Latest fixes and updates
