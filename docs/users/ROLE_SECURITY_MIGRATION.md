---
id: "users-role-security-migration"
title: "Role Security Migration Guide"
category: "User Management"
description: "Migration guide from insecure role storage to secure RLS-enforced role architecture"
audience: "all"
tags: ["users", "roles", "security", "migration"]
status: "published"
version: "1.0"
created_at: "2024-01-15"
updated_at: "2024-01-15"
---

# Role Security Migration Guide

## Overview

This guide explains how to migrate from insecure role storage (roles on profiles, localStorage, or JWT claims) to the secure role architecture using a separate `user_roles` table with RLS enforcement.

## Why Migrate?

**Current Risk:** Roles stored in insecure locations can be manipulated by users, leading to privilege escalation attacks.

**Solution:** Store roles in a dedicated `user_roles` table enforced by database RLS policies.

---

## Migration Steps

### Step 1: Audit Current Role Storage

**Check where roles are currently stored:**

```sql
-- Check profiles table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name LIKE '%role%';

-- Check auth.users metadata
SELECT raw_user_meta_data 
FROM auth.users 
LIMIT 5;
```

**Common Anti-Patterns to Remove:**
- ❌ `profiles.role` column
- ❌ `auth.users.raw_user_meta_data.role`
- ❌ localStorage/sessionStorage role storage
- ❌ JWT custom claims with role information
- ❌ Hardcoded admin email lists in frontend code

---

### Step 2: Create Secure Role Infrastructure

**2.1: Create Role Enum**
```sql
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'tester', 'user');
```

**2.2: Create user_roles Table**
```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
```

**2.3: Create Security Definer Function**
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

**2.4: Add RLS Policies on user_roles**
```sql
-- Users can view their own roles
CREATE POLICY "users_view_own_roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Only super_admins can manage roles
CREATE POLICY "super_admins_manage_roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
```

---

### Step 3: Migrate Existing Roles

**3.1: Export Current Roles**
```sql
-- If roles are on profiles table
SELECT user_id, role 
FROM profiles 
WHERE role IS NOT NULL;
```

**3.2: Import to user_roles Table**
```sql
-- Migrate from profiles table
INSERT INTO public.user_roles (user_id, role, assigned_at)
SELECT user_id, role::app_role, created_at
FROM profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Set assigned_by to first super_admin (or NULL if unknown)
UPDATE public.user_roles
SET assigned_by = (SELECT user_id FROM user_roles WHERE role = 'super_admin' LIMIT 1)
WHERE assigned_by IS NULL;
```

**3.3: Verify Migration**
```sql
-- Count roles before migration
SELECT role, COUNT(*) 
FROM profiles 
WHERE role IS NOT NULL 
GROUP BY role;

-- Count roles after migration
SELECT role, COUNT(*) 
FROM user_roles 
GROUP BY role;

-- Should match!
```

---

### Step 4: Update RLS Policies

**4.1: Identify Policies Using Old Role Checks**
```sql
-- Find policies referencing profiles.role
SELECT schemaname, tablename, policyname, qual
FROM pg_policies
WHERE qual LIKE '%profiles.role%' OR qual LIKE '%user_metadata%';
```

**4.2: Replace with has_role() Function**

**Before (Insecure):**
```sql
CREATE POLICY "admins_view_all"
  ON profiles FOR SELECT
  USING ((SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin');
  -- ❌ Causes infinite recursion!
```

**After (Secure):**
```sql
CREATE POLICY "admins_view_all"
  ON profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
  -- ✅ No recursion, secure
```

**4.3: Test Each Policy**
```sql
-- Test as regular user (should only see own data)
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "regular-user-uuid"}';
SELECT * FROM profiles;  -- Should return 1 row

-- Test as admin (should see all data)
SET LOCAL "request.jwt.claims" = '{"sub": "admin-user-uuid"}';
SELECT * FROM profiles;  -- Should return all rows
```

---

### Step 5: Update Frontend Code

**5.1: Remove Insecure Role Checks**

**Before (Insecure):**
```typescript
// ❌ BAD: Role from localStorage (user-controlled)
const userRole = localStorage.getItem('user_role');
if (userRole === 'admin') {
  return <AdminPanel />;
}
```

**After (Secure):**
```typescript
// ✅ GOOD: Role from user_roles table via useRole hook
import { useRole } from '@/hooks/useRole';

function AdminPanel() {
  const { hasRole, isLoading } = useRole();
  
  if (isLoading) return <Skeleton />;
  
  // UI visibility only (not security boundary)
  if (!hasRole('admin')) return null;
  
  return <AdminPanel />;
}
```

**5.2: Update useRole Hook**

Ensure `useRole` queries `user_roles` table:
```typescript
const { data } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', authState.user!.id);
```

---

### Step 6: Clean Up Old Role Storage

**After verifying everything works:**

```sql
-- Remove role column from profiles
ALTER TABLE profiles DROP COLUMN IF EXISTS role;
```

---

### Step 7: Security Verification

**Checklist:**

- [ ] All roles stored in `user_roles` table (not profiles, auth.users, or localStorage)
- [ ] `has_role()` function exists and uses `SECURITY DEFINER`
- [ ] All RLS policies use `has_role()` for role checks
- [ ] Frontend `useRole` hook queries `user_roles` table
- [ ] No role information in JWT claims or localStorage
- [ ] Test: Can regular user fake admin role? (Should fail)
- [ ] Test: Can admin assign super_admin role? (Should fail via RLS)
- [ ] Test: Do RLS policies block unauthorized queries? (Should succeed)

**Manual Security Test:**
```javascript
// 1. Open browser DevTools as regular user
localStorage.setItem('fake_role', 'super_admin');

// 2. Try to query admin-only table
const { data, error } = await supabase.from('user_roles').select('*');

// Expected: Empty array or only your own role (not all roles)
// If you see all roles, RLS policies are broken!
```

---

## Rollback Plan

If migration fails:

1. **Keep old role storage** until confident in new system
2. **Parallel Run:** Query both systems, log discrepancies
3. **Gradual Cutover:** Migrate one feature at a time
4. **Monitoring:** Track RLS policy denials (should be rare)

```sql
-- Rollback: Re-add role column to profiles (temporary)
ALTER TABLE profiles ADD COLUMN role_backup TEXT;

-- Copy roles back from user_roles
UPDATE profiles p
SET role_backup = ur.role::TEXT
FROM user_roles ur
WHERE p.user_id = ur.user_id;
```

---

## Post-Migration Monitoring

**Track Role Changes:**
```sql
-- Create audit log table
CREATE TABLE public.role_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  old_role app_role,
  new_role app_role,
  changed_by UUID,
  changed_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger to log role changes
CREATE OR REPLACE FUNCTION log_role_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role) THEN
    INSERT INTO role_audit_log (user_id, old_role, new_role, changed_by)
    VALUES (NEW.user_id, OLD.role, NEW.role, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER role_change_audit
AFTER UPDATE ON user_roles
FOR EACH ROW
EXECUTE FUNCTION log_role_changes();
```

**Query Audit Log:**
```sql
SELECT 
  ral.changed_at,
  p1.email AS user_email,
  ral.old_role,
  ral.new_role,
  p2.email AS changed_by_email
FROM role_audit_log ral
JOIN profiles p1 ON p1.user_id = ral.user_id
LEFT JOIN profiles p2 ON p2.user_id = ral.changed_by
ORDER BY ral.changed_at DESC
LIMIT 50;
```

---

## Related Documentation

- [Role Architecture](ROLE_ARCHITECTURE.md)
- [Data Isolation](../technical/DATA_ISOLATION.md)
- [Admin Platform Guide](../admin/PLATFORM_GUIDE.md)
