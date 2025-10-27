# Account Management

## Overview

This guide covers user account management operations including creation, modification, deletion, and troubleshooting.

## Account Types

### Looplly Users (B2C)

**Characteristics:**
- Self-registration via public signup
- Complete multi-level profile
- Earn reputation and money
- Access consumer features

See [User Type Management](USER_TYPE_MANAGEMENT.md) for details.

### Office Users (B2B)

**Characteristics:**
- Admin-created accounts
- Access admin portal
- Role-based permissions
- No earnings or reputation

See [User Type Management](USER_TYPE_MANAGEMENT.md) for details.

## User Registration

### Standard Registration Flow

**For Looplly Users:**

1. **Navigate to `/register`**

2. **Enter Details:**
   - Full name
   - Email address
   - Password (min 8 characters)
   - Mobile number
   - Country

3. **OTP Verification:**
   - OTP sent via SMS
   - User enters 6-digit code
   - Mobile number verified

4. **Level 1 Profile:**
   - Date of birth
   - Gender
   - City/region
   - Accept terms & conditions

5. **Account Activated:**
   - User redirected to dashboard
   - Welcome email sent
   - +50 reputation points awarded

### Registration Validation

**Frontend Validation:**

```typescript
// src/utils/validation.ts

export const registrationSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number'),
  mobile: z.string().refine(
    (val) => isValidPhoneNumber(val),
    'Invalid mobile number'
  ),
  countryCode: z.string().length(2),
  dateOfBirth: z.date()
    .refine(
      (date) => calculateAge(date) >= 18,
      'Must be 18 years or older'
    ),
  termsAccepted: z.boolean().refine(val => val === true)
});
```

**Backend Validation:**

```sql
-- Age verification trigger
CREATE FUNCTION check_minimum_age() RETURNS TRIGGER AS $$
BEGIN
  IF EXTRACT(YEAR FROM AGE(NEW.date_of_birth)) < 18 THEN
    RAISE EXCEPTION 'User must be 18 years or older';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_age_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_minimum_age();
```

## Account Modification

### User Self-Service

**Editable Fields:**
- Full name
- Profile picture
- Password
- Mobile number (requires re-verification)
- Email (requires verification)
- Communication preferences
- Profile answers

**Non-Editable Fields:**
- Date of birth
- User ID
- Registration date
- User type

### Admin Modifications

**Allowed Operations:**
- Edit any profile field
- Reset password
- Adjust reputation points
- Change user status (active/suspended/banned)
- View full activity history

**Restricted Operations:**
- Cannot modify user_id
- Cannot change user_type
- Cannot delete financial records

### Password Changes

**User-Initiated:**

```typescript
// src/components/dashboard/SettingsTab.tsx

async function changePassword(currentPassword: string, newPassword: string) {
  // Verify current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword
  });
  
  if (signInError) {
    throw new Error('Current password is incorrect');
  }
  
  // Update to new password
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });
  
  if (error) throw error;
  
  toast.success('Password updated successfully');
}
```

**Admin-Initiated (Password Reset):**

```typescript
// Edge function: reset-team-member-password

const { userId } = await req.json();

// Send password reset email
const { error } = await supabase.auth.admin.resetPasswordForEmail(
  user.email,
  {
    redirectTo: `${APP_URL}/reset-password`
  }
);

if (error) throw error;

// Log action
await logAuditAction({
  action: 'password_reset',
  performed_by: adminUserId,
  target_user: userId,
  description: 'Admin initiated password reset'
});

return new Response(JSON.stringify({ success: true }));
```

## Account Suspension & Banning

### Suspension

**Temporary restriction (reversible)**

**Reasons:**
- Suspicious activity
- TOS violation (minor)
- Payment investigation
- Fraud investigation

**Implementation:**

```typescript
async function suspendAccount(userId: string, reason: string, duration: number) {
  const suspendUntil = new Date();
  suspendUntil.setDate(suspendUntil.getDate() + duration);
  
  await supabase
    .from('profiles')
    .update({
      account_status: 'suspended',
      suspended_until: suspendUntil.toISOString(),
      suspension_reason: reason
    })
    .eq('user_id', userId);
  
  // Notify user
  await sendEmail(userId, 'account_suspended', {
    reason,
    until: suspendUntil
  });
  
  // Log action
  await logAuditAction({
    action: 'account_suspended',
    target_user: userId,
    metadata: { reason, duration, until: suspendUntil }
  });
}
```

**User Experience:**
- Cannot login
- Shows suspension notice with reason
- Can appeal via support

### Banning

**Permanent restriction (irreversible)**

**Reasons:**
- Severe TOS violation
- Fraud confirmed
- Multiple suspension violations
- Legal requirement

**Implementation:**

```typescript
async function banAccount(userId: string, reason: string) {
  await supabase
    .from('profiles')
    .update({
      account_status: 'banned',
      banned_at: new Date().toISOString(),
      ban_reason: reason
    })
    .eq('user_id', userId);
  
  // Disable auth
  await supabase.auth.admin.updateUserById(userId, {
    ban_duration: 'none' // Permanent
  });
  
  // Notify user
  await sendEmail(userId, 'account_banned', { reason });
  
  // Log action
  await logAuditAction({
    action: 'account_banned',
    target_user: userId,
    metadata: { reason }
  });
}
```

**User Experience:**
- Cannot login
- Shows ban notice
- No appeals (contact support for extreme cases)

## Account Deletion

### User-Initiated Deletion (GDPR)

**Process:**

1. User navigates to **Settings → Account**
2. Clicks **"Delete Account"**
3. Confirms with password
4. Optionally provides reason
5. Account marked for deletion

**Implementation:**

```typescript
async function requestAccountDeletion(userId: string, password: string) {
  // Verify password
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password
  });
  
  if (authError) throw new Error('Incorrect password');
  
  // Mark for deletion (30-day grace period)
  const deleteAt = new Date();
  deleteAt.setDate(deleteAt.getDate() + 30);
  
  await supabase
    .from('profiles')
    .update({
      account_status: 'pending_deletion',
      delete_requested_at: new Date().toISOString(),
      delete_scheduled_at: deleteAt.toISOString()
    })
    .eq('user_id', userId);
  
  // Send confirmation email
  await sendEmail(userId, 'deletion_requested', {
    deleteDate: deleteAt
  });
  
  // Sign out user
  await supabase.auth.signOut();
}
```

**30-Day Grace Period:**
- User can cancel deletion within 30 days
- If cancelled, account restored fully
- After 30 days, deletion is permanent

**What Gets Deleted:**
- Profile data
- Profile answers
- Community posts/comments
- Activity history
- Financial records (anonymized, not deleted)

**What Remains:**
- Anonymized transaction history (compliance)
- Aggregated analytics (no PII)
- Audit logs (no PII)

### Admin-Initiated Deletion

**Process:**

1. Admin navigates to user profile
2. Clicks **"Delete Account"**
3. Enters reason (required)
4. Confirms deletion
5. Immediate deletion (no grace period)

**Implementation:**

```typescript
// Edge function: delete-user

const { userId, reason } = await req.json();

// Call deletion function
const { error } = await supabase.rpc('delete_user_account', {
  p_user_id: userId,
  p_reason: reason,
  p_performed_by: adminUserId
});

if (error) throw error;

// Log action
await logAuditAction({
  action: 'account_deleted',
  performed_by: adminUserId,
  target_user: userId,
  metadata: { reason }
});

return new Response(JSON.stringify({ success: true }));
```

**Database Function:**

```sql
CREATE FUNCTION delete_user_account(
  p_user_id UUID,
  p_reason TEXT,
  p_performed_by UUID
) RETURNS VOID AS $$
BEGIN
  -- Delete profile data
  DELETE FROM profile_answers WHERE user_id = p_user_id;
  DELETE FROM user_reputation WHERE user_id = p_user_id;
  DELETE FROM user_streaks WHERE user_id = p_user_id;
  
  -- Anonymize financial records (don't delete)
  UPDATE transactions 
  SET user_id = NULL, 
      anonymized = true 
  WHERE user_id = p_user_id;
  
  -- Delete profile
  DELETE FROM profiles WHERE user_id = p_user_id;
  
  -- Delete auth user
  -- Note: This must be done via admin API, not SQL
  
  -- Log deletion
  INSERT INTO audit_log (
    action_type,
    performed_by,
    target_entity_type,
    target_entity_id,
    description
  ) VALUES (
    'user_deleted',
    p_performed_by,
    'user',
    p_user_id,
    p_reason
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Account Recovery

### Password Recovery

**Flow:**

1. User clicks **"Forgot Password"**
2. Enters email
3. Receives password reset link
4. Clicks link → redirected to reset page
5. Enters new password
6. Password updated → logged in

**Implementation:**

```typescript
// src/components/auth/ForgotPassword.tsx

async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });
  
  if (error) throw error;
  
  toast.success('Password reset link sent to your email');
}
```

### Account Recovery (Locked Out)

**Scenarios:**
- Forgot password AND no access to email
- Lost mobile device (2FA)
- Account suspended by mistake

**Process:**

1. User contacts support
2. Provides identity verification:
   - Full name
   - Date of birth
   - Last transaction details
   - Registered mobile number
3. Support verifies identity
4. Support unlocks account or resets password
5. User notified via alternative contact method

## Duplicate Account Prevention

### Detection

```sql
-- Find potential duplicates by email
SELECT email, COUNT(*) 
FROM profiles 
GROUP BY email 
HAVING COUNT(*) > 1;

-- Find potential duplicates by mobile
SELECT mobile, COUNT(*) 
FROM profiles 
GROUP BY mobile 
HAVING COUNT(*) > 1;

-- Find potential duplicates by name + DOB
SELECT full_name, date_of_birth, COUNT(*) 
FROM profiles 
GROUP BY full_name, date_of_birth 
HAVING COUNT(*) > 1;
```

### Prevention

**Database Constraints:**

```sql
-- Unique email
ALTER TABLE profiles ADD CONSTRAINT unique_email UNIQUE (email);

-- Unique mobile (per country)
ALTER TABLE profiles 
ADD CONSTRAINT unique_mobile_per_country 
UNIQUE (mobile, country_code);
```

**Registration Check:**

```typescript
async function checkDuplicateAccount(email: string, mobile: string) {
  const { data: existing } = await supabase
    .from('profiles')
    .select('user_id')
    .or(`email.eq.${email},mobile.eq.${mobile}`)
    .single();
  
  if (existing) {
    throw new Error('Account already exists with this email or mobile');
  }
}
```

### Merging Accounts

If duplicate accounts are created by mistake:

1. **Identify primary account** (higher reputation, more activity)
2. **Merge data** from secondary account:
   - Profile answers
   - Reputation points
   - Transaction history
3. **Delete secondary account**
4. **Notify user**

## Audit Logging

All account operations are logged:

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL,
  performed_by UUID REFERENCES profiles(user_id),
  target_entity_type TEXT,
  target_entity_id UUID,
  description TEXT,
  metadata JSONB,
  ip_address INET,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for querying
CREATE INDEX idx_audit_log_user ON audit_log(performed_by);
CREATE INDEX idx_audit_log_target ON audit_log(target_entity_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);
```

**Logged Actions:**
- Account creation
- Profile updates
- Password changes
- Account suspension/ban
- Account deletion
- Admin modifications
- Permission changes

## Troubleshooting

### User Can't Register

**Check:**
1. Email already registered?
2. Mobile number already registered?
3. Country blocked?
4. Under 18 years old?
5. Invalid email/mobile format?

### User Can't Login

**Check:**
1. Correct email/password?
2. Account suspended/banned?
3. Email verified? (if required)
4. Account deleted?

### User Can't Access Feature

**Check:**
1. Profile completion level?
2. Reputation tier?
3. Account status?
4. Feature enabled for country?

## Related Documentation

- [User Type Management](USER_TYPE_MANAGEMENT.md)
- [Role Architecture](ROLE_ARCHITECTURE.md)
- [Admin Guide](../admin/PLATFORM_GUIDE.md)
- [Data Isolation](DATA_ISOLATION_QUICK_REFERENCE.md)
