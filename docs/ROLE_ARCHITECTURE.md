# Role Architecture: Dual-Table System

## Overview

Looplly uses a **dual-table architecture** to separate staff management from platform user management. This provides better security, clarity, and scalability.

```
┌─────────────────────────────────────────────────────────┐
│                   Looplly Users                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐         ┌──────────────────┐     │
│  │  user_roles      │         │  user_types      │     │
│  │  (Staff Only)    │         │  (Platform Users)│     │
│  ├──────────────────┤         ├──────────────────┤     │
│  │ • super_admin    │         │ • office_user    │     │
│  │ • admin          │         │ • looplly_user   │     │
│  └──────────────────┘         └──────────────────┘     │
│        ▲                              ▲                 │
│        │                              │                 │
│   Staff access                   User classification   │
│   to admin portal                for features          │
└─────────────────────────────────────────────────────────┘
```

---

## Why Two Tables?

### Problem with Single-Table Approach
Before, we had a single `user_roles` table that mixed staff roles (`admin`) with user types. This caused:
- ❌ Confusion between "role" (permission level) and "type" (user classification)
- ❌ Difficult to query "all admins" vs "all office users"
- ❌ Security risks (easier to accidentally grant admin access)
- ❌ Hard to scale (adding new user types affects role logic)

### Solution: Dual-Table Architecture
Now we separate concerns:
- ✅ **`user_roles`** - Staff permissions (who can access admin portal?)
- ✅ **`user_types`** - User classification (what kind of user are they?)
- ✅ Clear separation of concerns
- ✅ Better security (separate RLS policies)
- ✅ Easier to scale (add user types without affecting roles)

---

## Table 1: `user_roles` (Staff Management)

### Purpose
Controls access to the admin portal and system features.

### Schema
```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  role app_role NOT NULL DEFAULT 'user'
);

CREATE TYPE app_role AS ENUM ('super_admin', 'admin', 'user');
```

### Role Hierarchy

```
super_admin (Level 3) ─┐
                       ├─> admin (Level 2) ─┐
                                             ├─> user (Level 1)
                                             ─┘
```

#### 1. Super Admin (`super_admin`)
- **Who**: Looplly founders, CTO, Warren
- **Access**: Full system access
- **Can do**:
  - ✅ Edit Level 1 (immutable) profile questions
  - ✅ Assign/change any role (including other super admins)
  - ✅ Manage team members
  - ✅ View all users and all data
  - ✅ Access all admin features

#### 2. Admin (`admin`)
- **Who**: Looplly operations team, support staff
- **Access**: Limited admin access
- **Can do**:
  - ✅ Manage Level 2 and 3 profile questions
  - ✅ View regular platform users
  - ✅ Change user types (office ↔ looplly)
  - ✅ Suspend/unsuspend users
  - ✅ View analytics and reports
- **Cannot do**:
  - ❌ Edit Level 1 questions
  - ❌ See other admins or super admins
  - ❌ Assign super_admin role
  - ❌ Manage team members

#### 3. User (`user`)
- **Who**: Default for all accounts
- **Access**: No admin access
- **Purpose**: Explicit default role in database

### Security Functions

```sql
-- Check if user has specific role
has_role(user_id UUID, role app_role) → BOOLEAN

-- Check if user has role or higher in hierarchy
has_role_or_higher(user_id UUID, required_role app_role) → BOOLEAN
```

### RLS Policies
```sql
-- Super admins can manage all roles
CREATE POLICY "Super admins can manage all roles"
ON user_roles FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Admins can only manage user role (not other admins)
CREATE POLICY "Admins can manage user roles only"
ON user_roles FOR ALL
USING (has_role(auth.uid(), 'admin') AND role = 'user');

-- Users can view their own role
CREATE POLICY "Users can view own role"
ON user_roles FOR SELECT
USING (user_id = auth.uid());
```

---

## Table 2: `user_types` (Platform User Classification)

### Purpose
Classifies platform users for feature access and business logic.

### Schema
```sql
CREATE TABLE public.user_types (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_type user_type NOT NULL DEFAULT 'looplly_user',
  metadata JSONB DEFAULT '{}'
);

CREATE TYPE user_type AS ENUM ('office_user', 'looplly_user');
```

### User Types

#### 1. Office User (`office_user`)
- **Who**: B2B customers, employees of partner companies
- **Features**:
  - May have special survey access
  - Different earning caps or rules
  - Custom dashboard views
  - May skip certain KYC requirements (if verified by employer)

#### 2. Looplly User (`looplly_user`)
- **Who**: Direct B2C users (default)
- **Features**:
  - Standard platform access
  - Standard earning rules
  - Standard KYC requirements
  - Full survey marketplace access

### Security Functions

```sql
-- Check if user has specific type
has_user_type(user_id UUID, type user_type) → BOOLEAN

-- Get user's type
get_user_type(user_id UUID) → user_type
```

### RLS Policies
```sql
-- Super admins can manage all user types
CREATE POLICY "Super admins can manage all user types"
ON user_types FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Admins can view and update user types
CREATE POLICY "Admins can view all user types"
ON user_types FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update user types"
ON user_types FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Users can view their own type
CREATE POLICY "Users can view own type"
ON user_types FOR SELECT
USING (user_id = auth.uid());
```

---

## Admin Portal Structure

### Team Management (`/admin/team`)
**Purpose**: Manage Looplly staff

**Access**:
- ✅ Super Admins: Full control (add, edit, remove)
- ✅ Admins: Read-only view

**Features**:
- List all super admins and admins
- Change roles (super admin only)
- Add new team members (super admin only)
- Search by name/email

### User Management (`/admin/users`)
**Purpose**: Manage platform users

**Access**:
- ✅ Super Admins: Full control
- ✅ Admins: Full control (except viewing other admins)

**Features**:
- List all platform users
- Filter by user type (office / looplly)
- Filter by account status, KYC, profile completion
- Change user types
- Suspend/unsuspend users
- View full profiles

---

## Frontend Implementation

### Hooks

```typescript
// Check staff roles (admin portal access)
import { useRole } from '@/hooks/useRole';
const { role, isAdmin, isSuperAdmin } = useRole();

// Check user types (feature access)
import { useUserType } from '@/hooks/useUserType';
const { userType, isOfficeUser, isLoopllyUser } = useUserType();
```

### Protected Routes

```typescript
// Require admin role
<ProtectedRoute requiredRole="admin">
  <AdminUsers />
</ProtectedRoute>

// Require super admin role
<ProtectedRoute requiredRole="super_admin">
  <AdminTeam />
</ProtectedRoute>
```

### Conditional Rendering

```typescript
// Show feature only to super admins
{isSuperAdmin() && (
  <Button>Add Team Member</Button>
)}

// Show feature to office users
{isOfficeUser() && (
  <OfficeUserDashboard />
)}
```

---

## Security Best Practices

### 1. Never Store Roles/Types Client-Side
❌ **BAD**:
```typescript
localStorage.setItem('role', 'admin'); // NEVER DO THIS
```

✅ **GOOD**:
```typescript
// Always fetch from database via secure hooks
const { role } = useRole();
```

### 2. Always Use Security Definer Functions
❌ **BAD** (Causes infinite recursion):
```sql
CREATE POLICY "Admins can view"
ON some_table FOR SELECT
USING ((SELECT role FROM user_roles WHERE user_id = auth.uid()) = 'admin');
```

✅ **GOOD**:
```sql
CREATE POLICY "Admins can view"
ON some_table FOR SELECT
USING (has_role(auth.uid(), 'admin'));
```

### 3. Separate Concerns
- Use `user_roles` for **permissions** (can access admin?)
- Use `user_types` for **features** (office vs looplly user?)
- Don't mix them!

### 4. Enforce Database-Level Security
- All access control in RLS policies
- Frontend checks are UX only (not security)
- Never trust client-side role checks

---

## Database Triggers

### Auto-Create User Type
When a new user signs up, automatically assign them `looplly_user` type:

```sql
CREATE TRIGGER on_profile_created_user_type
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_type();
```

---

## Migration from Old System

### What Changed
- ✅ `app_role` enum updated: `moderator` → `super_admin`
- ✅ New `user_types` table created
- ✅ All existing users backfilled as `looplly_user`
- ✅ New security functions added
- ✅ RLS policies updated

### Data Migration
```sql
-- Old moderators became admins
UPDATE user_roles 
SET role = 'admin' 
WHERE role = 'moderator';

-- All existing users became looplly_user
INSERT INTO user_types (user_id, user_type)
SELECT user_id, 'looplly_user'
FROM profiles;
```

---

## Common Patterns

### Check if User is Staff
```typescript
const { isAdmin, isSuperAdmin } = useRole();
const isStaff = isAdmin() || isSuperAdmin();
```

### Check if User Can Manage Team
```typescript
const { isSuperAdmin } = useRole();
const canManageTeam = isSuperAdmin();
```

### Check if User is Office User
```typescript
const { isOfficeUser } = useUserType();
if (isOfficeUser()) {
  // Show office-specific features
}
```

---

## Future Enhancements

### Potential New User Types
- `enterprise_user` - Large B2B customers
- `partner_user` - API integration partners
- `beta_user` - Early access testers

### Potential New Roles
- `support` - Customer support team (limited admin access)
- `analyst` - Read-only analytics access
- `moderator` - Content moderation only

---

## Troubleshooting

**Q: User can't access admin portal despite having admin role**
A: Check `user_roles` table directly. Ensure `role` column is `admin` or `super_admin`.

**Q: How do I make someone a super admin?**
A: Log in as existing super admin → Admin → Team → Find user → Change Role → Super Admin

**Q: Can admins see other admins in user list?**
A: No, by design. Admins only see regular users. Super admins see everyone.

**Q: What's the difference between role and user_type?**
A: `role` = permissions (can access admin?), `user_type` = classification (office vs looplly user?)

---

## Related Documentation
- [User Type Management Guide](USER_TYPE_MANAGEMENT.md)
- [Warren's Admin Guide](WARREN_ADMIN_GUIDE.md)
- [Admin Setup Instructions](../ADMIN_SETUP_INSTRUCTIONS.md)
