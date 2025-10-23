# User Type Management Guide

## What are User Types?

User types classify platform users for feature access and business logic. Unlike **roles** (which control admin access), **types** control what features users see and how they interact with the platform.

```
User Types (user_types table)
├── office_user ───> B2B customers, partner employees
└── looplly_user ──> Direct B2C users (default)
```

---

## Office Users vs. Looplly Users

### Office User (`office_user`)

**Who are they?**
- Employees of partner companies (e.g., Acme Corp)
- B2B customers using Looplly for employee engagement
- Users invited via enterprise accounts

**Features & Benefits**:
- ✅ May skip certain KYC requirements (verified by employer)
- ✅ Custom earning caps or rules
- ✅ Access to company-specific surveys
- ✅ Different dashboard views
- ✅ Possible bulk payouts to company

**Example Use Case**:
> Acme Corp partners with Looplly to provide surveys to their 500 employees. All Acme employees are marked as `office_user` and see Acme-branded surveys with higher rewards.

---

### Looplly User (`looplly_user`)

**Who are they?**
- Direct B2C sign-ups (default)
- Users who found Looplly via marketing, app stores, referrals
- Standard platform users

**Features**:
- ✅ Standard KYC requirements
- ✅ Standard earning rules
- ✅ Full survey marketplace access
- ✅ Standard referral program
- ✅ Standard redemption options

**Example Use Case**:
> Jane downloads Looplly from the app store, signs up, and starts earning. She's automatically a `looplly_user` with access to all standard features.

---

## When to Change User Types

### Convert Looplly User → Office User

**Scenarios**:
1. **Enterprise partnership**: Company signs contract, their employees join platform
2. **Bulk invitation**: Company invites employees via CSV import
3. **User requests**: User asks to link their account to their employer

**Process**:
1. Go to **Admin → Users**
2. Search for user by email/mobile
3. Click **⋮** menu → **Change User Type**
4. Select **Office User**
5. Add metadata (company name, employee ID, etc.)
6. Confirm

**Important**: Notify the user of the change! They may see different features.

---

### Convert Office User → Looplly User

**Scenarios**:
1. **User leaves company**: No longer eligible for office user benefits
2. **Contract ends**: Company partnership expires
3. **User requests**: User wants standard access instead

**Process**:
Same as above, but select **Looplly User**

**Important**: This may affect their earning cap, survey access, and KYC requirements.

---

## How to Manage User Types

### Via Admin Portal

#### Step 1: Navigate to User Management
1. Log in as admin or super admin
2. Click **Admin** in top navigation
3. Click **Users** in sidebar

#### Step 2: Filter by User Type
- Click **Office User** toggle to show only office users
- Click **Looplly User** toggle to show only looplly users
- Click both to see all users

#### Step 3: Change User Type
1. Find user in table
2. Click **⋮** (three dots) menu
3. Select **Change User Type**
4. Dialog appears:
   ```
   ┌────────────────────────────────────┐
   │ Change User Type                   │
   ├────────────────────────────────────┤
   │ User: john@example.com             │
   │ Current Type: Looplly User         │
   │                                    │
   │ New Type:                          │
   │ ○ Office User                      │
   │ ○ Looplly User                     │
   │                                    │
   │ [Cancel]  [Change Type]            │
   └────────────────────────────────────┘
   ```
5. Select new type
6. Click **Change Type**

---

## User Type Metadata

Each user type can store custom metadata in JSONB format.

### Office User Metadata Examples

```json
{
  "company_name": "Acme Corp",
  "employee_id": "EMP-12345",
  "department": "Engineering",
  "joined_via": "csv_import",
  "special_earning_cap": 5000,
  "kyc_verified_by": "employer"
}
```

### Looplly User Metadata Examples

```json
{
  "signup_source": "app_store",
  "referral_code": "ABC123",
  "initial_country": "ZA"
}
```

---

## Impact on Features

### Survey Access

**Office Users**:
- May see company-specific surveys (higher rewards)
- May have access to exclusive B2B surveys
- Survey matching considers company metadata

**Looplly Users**:
- See all public surveys
- Standard matching algorithm
- No company-specific surveys

### Earning Caps

**Office Users**:
- Custom caps per company agreement (stored in metadata)
- May have higher/lower limits than standard
- Company may cover transaction fees

**Looplly Users**:
- Standard earning cap (per reputation system)
- Standard transaction fees
- Standard redemption minimums

### KYC Requirements

**Office Users**:
- May skip certain KYC if employer verified
- Faster onboarding
- Less friction for payouts

**Looplly Users**:
- Full KYC required for payouts
- Standard verification flow
- Standard limits until verified

### Dashboard Views

**Office Users**:
- May see company branding
- Company-specific leaderboards
- Team challenges (if enabled)

**Looplly Users**:
- Standard Looplly branding
- Global leaderboards
- Individual challenges

---

## Bulk Operations

### Bulk Import Office Users

**Use Case**: Company signs up 500 employees

**Process**:
1. Go to **Admin → Users → Bulk Import**
2. Upload CSV:
   ```csv
   email,first_name,last_name,employee_id,department
   john@acme.com,John,Doe,EMP-001,Engineering
   jane@acme.com,Jane,Smith,EMP-002,Marketing
   ```
3. Select **User Type**: Office User
4. Set metadata:
   - Company Name: Acme Corp
   - Verification Source: employer
5. Click **Import**

**Result**:
- All users created as `office_user`
- Metadata attached automatically
- Invitation emails sent

### Bulk Change User Types

**Use Case**: Company contract ends, convert 500 office users to looplly users

**Process**:
1. Go to **Admin → Users**
2. Filter by **Office User**
3. Filter by metadata: `company_name = "Acme Corp"`
4. Select all users (checkbox at top)
5. Click **Bulk Actions** → **Change User Type**
6. Select **Looplly User**
7. Confirm

**Result**:
- All selected users converted to `looplly_user`
- Metadata preserved (for audit trail)
- Users notified of change

---

## Database Queries

### Count Users by Type

```sql
SELECT 
  user_type,
  COUNT(*) as user_count
FROM user_types
GROUP BY user_type;
```

**Example Result**:
```
user_type     | user_count
--------------+-----------
office_user   | 523
looplly_user  | 12,847
```

### Find Office Users by Company

```sql
SELECT 
  p.email,
  p.first_name,
  p.last_name,
  ut.metadata->>'company_name' as company
FROM user_types ut
JOIN profiles p ON p.user_id = ut.user_id
WHERE ut.user_type = 'office_user'
  AND ut.metadata->>'company_name' = 'Acme Corp';
```

### Find Users Without Type (Error Detection)

```sql
SELECT p.user_id, p.email
FROM profiles p
LEFT JOIN user_types ut ON ut.user_id = p.user_id
WHERE ut.user_id IS NULL;
```

**Expected**: 0 results (trigger should auto-create type)

---

## Security Considerations

### Who Can Change User Types?

| Action | Super Admin | Admin | User |
|--------|-------------|-------|------|
| View own type | ✅ | ✅ | ✅ |
| View all types | ✅ | ✅ | ❌ |
| Change any type | ✅ | ✅ | ❌ |
| Bulk change types | ✅ | ✅ | ❌ |

### RLS Enforcement

```sql
-- Super admins can do everything
CREATE POLICY "Super admins can manage all user types"
ON user_types FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Admins can view and update
CREATE POLICY "Admins can view all user types"
ON user_types FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update user types"
ON user_types FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Users can only view their own
CREATE POLICY "Users can view own type"
ON user_types FOR SELECT
USING (user_id = auth.uid());
```

---

## Troubleshooting

**Q: User signed up but has no user_type**
A: Check if trigger is working:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_profile_created_user_type';
```

**Q: Changed user type but features didn't update**
A: User may need to log out and back in. Check cache invalidation.

**Q: How do I see all office users from a specific company?**
A: Use metadata filter in Admin → Users, or SQL query above.

**Q: Can a user be both office_user and looplly_user?**
A: No, each user has exactly one type. But metadata can track historical types.

---

## Best Practices

### 1. Document Type Changes
When changing user types, always add note in metadata:
```json
{
  "type_history": [
    {"from": "looplly_user", "to": "office_user", "date": "2025-01-15", "reason": "Joined Acme Corp"}
  ]
}
```

### 2. Notify Users
Always send email when changing user type:
- Explain what changed
- Highlight new features
- Provide support contact

### 3. Audit Trail
Log all type changes in `audit_logs` table for compliance.

### 4. Test Before Bulk Changes
Test bulk operations on 1-2 users first, verify everything works, then proceed with full batch.

---

## Related Documentation
- [Role Architecture](ROLE_ARCHITECTURE.md)
- [Warren's Admin Guide](WARREN_ADMIN_GUIDE.md)
- [Admin Setup Instructions](../ADMIN_SETUP_INSTRUCTIONS.md)
