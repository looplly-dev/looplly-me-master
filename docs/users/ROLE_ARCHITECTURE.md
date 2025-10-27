# Role Architecture

## Overview

Looplly implements a **security-first role-based access control (RBAC)** system for team members with granular permissions. All role checks are enforced server-side via database queries to prevent client-side manipulation.

## Security-First Design Principle

⚠️ **CRITICAL SECURITY RULE**: All role checks MUST happen server-side via database queries. Client-side role checks (e.g., `useRole` hook) are for **UI display only** and provide zero security guarantees.

**Why This Matters:**
- ❌ Client-side checks can be bypassed by modifying JavaScript, localStorage, or network requests
- ✅ Database RLS policies are enforced at the Postgres level and cannot be bypassed
- ✅ `has_role()` security definer function queries the `user_roles` table directly
- ✅ Even if an attacker modifies frontend code, the database will reject unauthorized queries

**Implementation:**
```sql
-- ✅ CORRECT: Server-side role check via RLS policy
CREATE POLICY "admins_view_all_users"
  ON profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- ❌ NEVER: Client-side role check (display purposes only)
if (useRole().isAdmin()) {
  // This is for UI visibility, NOT security enforcement
  return <AdminButton />;
}
```

---

## Role Hierarchy

### **Super Admin**
- **Access Level:** Full system access (Level 3)
- **Capabilities:**
  - All admin features
  - User and team management
  - **Role assignment and management** (only super_admin can assign roles)
  - Journey Simulator access (hierarchical)
  - System configuration
  - Integration management
  - Analytics and reporting

**Use Cases:**
- Platform owners
- Technical administrators
- System-level configuration changes

---

### **Admin**
- **Access Level:** Extensive administrative access (Level 2)
- **Capabilities:**
  - All admin features (users, content, analytics, integrations)
  - Journey Simulator access (hierarchical, testing user flows)
  - Team member management (view, edit, password reset)
  - Profile questions and badge management
  - **Cannot assign or change roles** (security boundary)

**Use Cases:**
- Product managers
- Content administrators
- Customer support leads

---

### **Tester**
- **Access Level:** Testing and QA tools (Level 1.5)
- **Capabilities:**
  - Journey Simulator access (primary tool for testing)
  - Test user management
  - Knowledge Centre access
  - View documentation
  - **Limited admin portal access** (testing-focused features only)
  - Cannot manage real users, content, or system config

**Use Cases:**
- QA engineers
- Product testers
- UX researchers testing flows

---

## Permissions Matrix

| Feature | Super Admin | Admin | Tester | User |
|---------|------------|-------|--------|------|
| Journey Simulator | ✅ | ✅ | ✅ | ❌ |
| Assign Roles | ✅ | ❌ | ❌ | ❌ |
| User Management | ✅ | ✅ | ❌ | ❌ |
| Team Management | ✅ | ✅ | ❌ | ❌ |
| Profile Questions | ✅ | ✅ | ❌ | ❌ |
| Badges & Content | ✅ | ✅ | ❌ | ❌ |
| Integrations | ✅ | ✅ | ❌ | ❌ |
| Analytics Dashboard | ✅ | ✅ | ❌ | ❌ |
| Knowledge Centre | ✅ | ✅ | ✅ | ❌ |
| View Own Profile | ✅ | ✅ | ✅ | ✅ |

**Hierarchical Access:**
- `super_admin` can do everything `admin` can do, plus role management
- `admin` can do everything `tester` can do, plus user/content management
- `tester` has limited access focused on testing tools

---

## Security Implementation

### ⚠️ **CRITICAL**: Separate Role Storage Table

**Rule:** Roles MUST be stored in a separate `user_roles` table. Absolutely do NOT store roles on the `profiles` or `auth.users` table.

**Why?**
- **Privilege Escalation Prevention:** Separating roles from user-editable data prevents users from modifying their own permissions
- **Audit Trail:** Dedicated table allows tracking who assigned which roles and when
- **Multi-Role Support:** Users can have multiple roles (future-proofing)
- **RLS Isolation:** Role checks don't cause recursive RLS policy issues

**Schema:**

```sql
-- 1. Define role enum (immutable set of allowed values)
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'tester', 'user');

-- 2. Create separate user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE (user_id, role)  -- Prevent duplicate role assignments
);

-- 3. Enable RLS on the roles table itself
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. RLS: Users can view their own roles (for UI display)
CREATE POLICY "users_view_own_roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- 5. RLS: Only super_admins can assign/modify roles
CREATE POLICY "super_admins_manage_roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
```

---

### Security Definer Function (Server-Side Role Check)

**Purpose:** Provide a secure, non-recursive way to check roles in RLS policies.

**Key Properties:**
- `SECURITY DEFINER`: Executes with owner's privileges, bypassing RLS recursion
- `STABLE`: Can be used in RLS policies and indexes
- `set search_path = public`: Prevents schema injection attacks

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;
```

**Usage in RLS Policies:**

```sql
-- Example: Admins can view all user profiles
CREATE POLICY "admins_view_all_profiles"
  ON profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Example: Only super_admins can delete users
CREATE POLICY "super_admins_delete_users"
  ON profiles FOR DELETE
  USING (public.has_role(auth.uid(), 'super_admin'));
```

---

### Frontend Role Hook (Display Purposes ONLY)

**File:** `src/hooks/useRole.ts`

**Purpose:** Fetch user roles for **UI visibility control** (showing/hiding buttons, menu items). This is NOT for security enforcement.

**Key Points:**
- ✅ Queries `user_roles` table via authenticated Supabase client
- ✅ Provides helper functions for role checks (`hasRole`, `hasExactRole`, `isAdmin`)
- ❌ **NOT a security boundary** - can be bypassed by modifying JavaScript
- ✅ All actual data access is still protected by RLS policies

**Implementation:**

```typescript
// Fetches roles from database (for UI display)
const { data } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', authState.user!.id);

// Resolve highest role for display
const allRoles = (data || []).map(r => r.role);
const primaryRole = allRoles.includes('super_admin') 
  ? 'super_admin' 
  : allRoles.includes('admin') 
    ? 'admin' 
    : allRoles.includes('tester') 
      ? 'tester' 
      : 'user';
```

**Usage in Components:**

```typescript
import { useRole } from '@/hooks/useRole';

function AdminSidebar() {
  const { hasRole } = useRole();
  
  return (
    <nav>
      {hasRole('tester') && <Link to="/admin/simulator">Journey Simulator</Link>}
      {hasRole('admin') && <Link to="/admin/users">User Management</Link>}
      {hasRole('super_admin') && <Link to="/admin/team">Team & Roles</Link>}
    </nav>
  );
}
```

**⚠️ Remember:** These checks only control UI visibility. The database RLS policies still enforce actual data access.

---

## Journey Simulator Access

**Updated Access Rules:**
- ✅ **Tester** - Primary use case (testing user flows)
- ✅ **Admin** - Can access for testing and validation
- ✅ **Super Admin** - Full access to all testing tools

**Previous Behavior:** Simulator was tester-only (exact role match)
**Current Behavior:** Hierarchical access (tester-or-higher)

**Implementation:**
- Sidebar visibility: `hasRole('tester')` - shows for tester, admin, super_admin
- Route protection: `ProtectedRoute requiredRole="tester"` - allows hierarchical access
- Edge function auth: Validates tester-or-higher role via `has_role()`

**Security Note:**
All role checks are enforced server-side via database queries. Frontend role checks only control UI visibility (showing/hiding the simulator link). Even if a user bypasses the frontend, the backend will block unauthorized access.

---

## Attack Scenarios & Mitigations

### Scenario 1: User Modifies localStorage to Set Admin Role

**Attack:**
```javascript
// Attacker tries to fake admin role in localStorage
localStorage.setItem('user_role', 'admin');
```

**Mitigation:**
- Frontend may show admin UI elements, but...
- Database queries fail due to RLS policies
- `has_role(auth.uid(), 'admin')` returns FALSE (role not in database)
- Result: Attacker sees UI but cannot access any data

**Why It Fails:**
- RLS policies check `user_roles` table, not localStorage
- Supabase client sends JWT token (not localStorage data)
- JWT does NOT contain role information (roles fetched from database)

---

### Scenario 2: Attacker Tries to Insert Own Role

**Attack:**
```javascript
// Attacker tries to insert admin role for themselves
await supabase
  .from('user_roles')
  .insert({ user_id: attackerUserId, role: 'admin' });
```

**Mitigation:**
- RLS policy on `user_roles` table blocks INSERT unless user is super_admin
- Query fails with "new row violates row-level security policy"
- Attacker cannot modify their own role

**Why It Fails:**
```sql
-- Only super_admins can insert roles
CREATE POLICY "super_admins_manage_roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
```

---

### Scenario 3: Admin Tries to Assign Super Admin Role

**Attack:**
Admin user (not super admin) tries to promote themselves via UI or API call.

**Mitigation:**
- RLS policy requires caller to have `super_admin` role
- Admin's role check fails (they have `admin`, not `super_admin`)
- Database rejects the INSERT/UPDATE operation
- Audit log records the failed attempt

**Why It Fails:**
- `WITH CHECK (public.has_role(auth.uid(), 'super_admin'))` blocks non-super-admins
- Edge functions also validate role before role assignment

---

## Related Documentation

- [User Type Management](USER_TYPE_MANAGEMENT.md)
- [Data Isolation](../technical/DATA_ISOLATION.md)
- [Admin Platform Guide](../admin/PLATFORM_GUIDE.md)
- [Authentication Architecture](../authentication/ARCHITECTURE.md)
