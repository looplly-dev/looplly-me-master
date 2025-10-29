---
title: "Admin Setup Instructions"
slug: "admin-setup-instructions"
category: "Admin Portal"
description: "Step-by-step guide for setting up admin access, roles, and testing the admin portal"
audience: "admin"
tags: ["setup", "installation", "admin-portal", "roles", "security"]
status: "published"
version: "1.0.0"
last_updated: "2025-01-29"
author: "System"
---

# Admin Setup Instructions

## Phase 1: Security & Database Setup ✅

### Step 1: Run the User Roles Migration

1. Go to your Lovable Cloud tab (or Supabase if using external connection)
2. Navigate to the SQL Editor
3. Copy and paste the entire contents of `supabase/migrations/20250110000000_create_user_roles.sql`
4. Run the migration

This will:
- Create the `app_role` enum with values: 'super_admin', 'admin', 'user'
- Create the `user_roles` table with proper RLS policies
- Add the `has_role()` and `has_role_or_higher()` security definer functions to prevent RLS recursion
- Set up secure role-based access control with hierarchy

### Step 2: Grant Super Admin Role to nadia@looplly.me

After running the migration, you need to grant the super admin role. Follow these steps:

1. **First, find the user_id for nadia@looplly.me:**
   ```sql
   SELECT id, email FROM auth.users WHERE email = 'nadia@looplly.me';
   ```
   Copy the `id` value (it will be a UUID like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

2. **Then, insert the super_admin role:**
   ```sql
   INSERT INTO public.user_roles (user_id, role) 
   VALUES ('PASTE_USER_ID_HERE', 'super_admin');
   ```
   Replace `PASTE_USER_ID_HERE` with the actual user_id from step 1.

**Note**: Super admins have the highest level of access, including the ability to:
- Edit Level 1 (immutable) profile questions
- Assign any role including other super_admins
- View and manage all users regardless of their role

3. **Verify the role was granted:**
   ```sql
   SELECT * FROM public.user_roles WHERE role = 'super_admin';
   ```

### Step 3: Test Admin Access

1. Log out if you're currently logged in
2. Log in with `nadia@looplly.me`
3. Navigate to `/admin` - you should see the new admin dashboard with sidebar
4. Try accessing different admin pages:
   - `/admin` - Dashboard
   - `/admin/team` - Team Management (staff only: super_admins and admins)
   - `/admin/users` - User Management (platform users only)
   - `/admin/content` - Content Creation
   - `/admin/badges` - Badge Generator
   - `/admin/questions` - Profile Questions Management
   - `/admin/redemptions` - Redemption Management
   - `/admin/analytics` - Analytics

## Phase 2: Admin Layout & Navigation ✅

### What's New

1. **Unified Admin Layout** with collapsible sidebar navigation
2. **Protected Routes** - All admin pages now require 'admin' or 'super_admin' role
3. **Breadcrumb Navigation** - Shows current location in admin panel
4. **Dual-Table Role System** - Separate tables for staff roles and user types
5. **Seven Admin Sections:**
   - **Dashboard** - Overview stats and quick actions
   - **Team** - Manage staff members (super_admins and admins)
   - **Users** - Search and manage platform users (office_user, looplly_user)
   - **Content** - Create surveys, videos, and tasks
   - **Badges** - AI-powered badge generator
   - **Questions** - Profile questions and decay configuration
   - **Redemptions** - Approve/reject user redemption requests
   - **Analytics** - Platform metrics and insights

### Navigation Features

- **Sidebar Toggle** - Click the toggle button to collapse/expand
- **Active Route Highlighting** - Current page is highlighted in sidebar
- **Breadcrumbs** - Shows your current location path
- **Keyboard Shortcut** - Press `Cmd+B` (Mac) or `Ctrl+B` (Windows) to toggle sidebar

## Security Features

✅ **Role-based access control** - Only users with 'admin' or 'super_admin' role can access admin pages
✅ **Role hierarchy** - super_admin > admin > user with proper privilege escalation protection
✅ **Protected routes** - Unauthorized users see "Access Denied" message
✅ **Secure role checking** - Uses security definer functions to prevent RLS issues
✅ **Dual-table architecture** - Separate tables for staff roles and user types
✅ **Audit-ready** - All admin actions can be logged (Phase 3)

## Related Documentation

- [Role Architecture](docs/admin/users/ROLE_ARCHITECTURE.md) - Understanding the dual-table role system
- [User Type Management](docs/admin/users/TYPE_MANAGEMENT.md) - Managing office vs Looplly users
- [Warren's Admin Guide](docs/admin/WARREN_ADMIN_GUIDE.md) - Plain-English admin guide
- [Profile System Admin Guide](docs/admin/features/profiling/ADMIN_GUIDE.md) - Managing profile questions and decay
- [Profiling System Docs](docs/admin/features/profiling/README.md) - Complete profiling documentation

## Next Steps (Phase 3 & 4)

These features are planned but not yet implemented:

- Connect to real database tables for users, content, redemptions
- Implement user search with autocomplete
- Add content creation workflows (surveys, videos, tasks)
- Build redemption approval system
- Create analytics dashboards with charts
- Add audit logging for admin actions
- Implement granular permissions (moderator role)

## Troubleshooting

### "Access Denied" when visiting /admin

**Problem:** You're not logged in as an admin user.

**Solution:** 
1. Make sure you completed Step 2 above
2. Log out and log back in
3. Check that the role was inserted correctly with the verify query

### "Authentication Required"

**Problem:** Not logged in at all.

**Solution:** Log in first, then navigate to `/admin`

### Still can't access after granting role

**Problem:** The role might not be properly associated.

**Solution:**
```sql
-- Check if the role exists
SELECT * FROM public.user_roles WHERE user_id = 'YOUR_USER_ID';

-- If not, insert it again
INSERT INTO public.user_roles (user_id, role) 
VALUES ('YOUR_USER_ID', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

## Security Notes

⚠️ **Important:** Never store admin roles in localStorage or client-side storage. This implementation uses server-side validation with Supabase RLS policies, which is secure.

⚠️ **Important:** The `has_role()` function uses `SECURITY DEFINER` to prevent infinite recursion in RLS policies. Do not remove this attribute.

⚠️ **Important:** Always use the `has_role()` function when checking roles in RLS policies, never query the `user_roles` table directly in policies.
