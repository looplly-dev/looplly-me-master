# User Classification System

## Database Architecture

### Tables for `looplly_user` ONLY
- `profiles` (with profiling data like gender, DOB, SEC, address)
- `profile_answers`
- `profile_categories`
- `profile_questions`
- `address_components`
- `user_reputation`
- `user_balances`
- `earning_activities`
- `user_badges`
- `transactions`
- `user_referrals`

### Tables for `looplly_team_user` ONLY
- `team_profiles` (email, name, company_name, company_role)
- `user_roles` (role assignments)
- `team_activity_log` (optional activity tracking)

### Shared/System Tables
- `tenants`
- `documentation`
- `ai_agents`
- `audit_logs` (for logging all user actions)
- Configuration tables

**CRITICAL**: Team users and regular users have completely separate data structures. Team users:
- Do NOT complete profiling questionnaires
- Do NOT have reputation scores
- Do NOT earn rewards
- Do NOT have balance/wallet functionality
- Are stored in separate `team_profiles` table

Regular users (`looplly_user`) cannot access admin functionality and have no entries in `user_roles` table.

See [TABLE_ARCHITECTURE.md](./TABLE_ARCHITECTURE.md) for detailed architecture documentation.

---

## Overview
Looplly has 3 distinct user types, each with different purposes and access levels.

## 1. `looplly_user` (Regular Users)
**Purpose:** The main user base - people who use Looplly to earn rewards

**Characteristics:**
- Never see admin portal
- Go through full onboarding: OTP → Profile Questions → Communication Preferences
- Default user type for all signups
- No access to admin features

**Profile Fields:**
- `user_type = 'looplly_user'`
- No entry in `user_roles` table (or role = 'user')
- Complete profile with demographic data

**Flow:**
1. Sign up via mobile/email
2. Verify OTP
3. Complete profile questions (multi-level)
4. Set communication preferences
5. Access dashboard (Earn, Wallet, Profile, etc.)

---

## 2. `looplly_team_user` (Looplly Staff)
**Purpose:** People who manage, build, and operate Looplly

**Characteristics:**
- Access to admin portal
- Assigned staff roles: `super_admin`, `admin`, `tester`
- Created by super admins via "Add Team Member" function
- Receive temporary password that must be changed on first login
- Skip regular user onboarding

**Profile Fields:**
- `user_type = 'looplly_team_user'`
- Entry in `user_roles` table with role
- `company_name` = Team name (e.g., "Looplly Core Team")
- `company_role` = Job title (e.g., "Product Manager")

**Staff Roles:**
- `super_admin`: Full system access, can create other team members
- `admin`: Manage users, content, settings, view analytics
- `tester`: Limited admin access for QA/testing purposes

**Flow:**
1. Super admin creates team member via admin portal
2. Team member receives email + temp password
3. First login → Forced password reset
4. After reset → Access admin portal

---

## 3. `client_user` (B2B Clients - Future)
**Purpose:** Companies/partners using Looplly's services

**Characteristics:**
- NOT YET IMPLEMENTED
- Will have separate onboarding flow
- Access to client-specific features
- May have own mini-admin portal

**Profile Fields:**
- `user_type = 'client_user'`
- Role TBD (may use separate role table)
- `company_name` = Actual company name
- `company_role` = Role at company

**Flow:** TBD

---

## Important: `user_type` vs `role`

### `user_type` (stored in `profiles.user_type`)
**Purpose:** Defines WHICH features a user can access
- Controls portal access (user dashboard vs admin portal vs client portal)
- Determines onboarding flow
- 3 values: `looplly_user`, `looplly_team_user`, `client_user`

### `role` (stored in `user_roles.role`)
**Purpose:** Defines PERMISSION LEVEL within those features
- Controls what actions you can perform
- Only applies to `looplly_team_user` (staff)
- 4 values: `super_admin`, `admin`, `tester`, `user`

**Example:**
- `user_type = 'looplly_team_user'` + `role = 'admin'` = Staff member who can manage users
- `user_type = 'looplly_team_user'` + `role = 'tester'` = Staff member with limited admin access
- `user_type = 'looplly_user'` + `role = 'user'` = Regular user (no admin access at all)

---

## Security Rules

1. **Admin Portal Access:**
   - MUST have `user_type = 'looplly_team_user'`
   - MUST have `role` in `user_roles` table (admin or higher)
   - Both conditions required (defense in depth)

2. **User Creation:**
   - Only `super_admin` can create `looplly_team_user`
   - Anyone can sign up as `looplly_user`
   - `client_user` creation flow TBD

3. **Role Assignment:**
   - Roles stored in separate `user_roles` table (NOT in profiles)
   - Prevents privilege escalation attacks
   - Uses `has_role()` security definer function for checks

---

## Migration History

**Previous Terminology (DEPRECATED):**
- ❌ "B2C users" → Use `looplly_user` instead
- ❌ "B2B users" → Was confusing, referred to staff (now `looplly_team_user`)
- ❌ "office_user" → Renamed to `client_user` (for future B2B clients)

**File Renames:**
- `create-b2b-user` → `create-team-member`
- `AddB2BUserModal` → `AddTeamMemberModal`

**Data Migration:**
- All existing `office_user` records migrated to `looplly_team_user`
- Enum value `office_user` renamed to `client_user`

---

## Related Files

- Database migration: `supabase/migrations/*_fix_user_type_classification.sql`
- Edge function: `supabase/functions/create-team-member/index.ts`
- UI component: `src/components/admin/team/AddTeamMemberModal.tsx`
- Hook: `src/hooks/useUserType.ts`
- Type definitions: `src/types/auth.ts`
