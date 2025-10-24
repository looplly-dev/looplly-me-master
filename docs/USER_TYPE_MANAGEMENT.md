# User Type Management

## Overview

Looplly supports two distinct user types with different access patterns and permissions: **Looplly Users** (B2C consumers) and **Office Users** (B2B team members).

## User Types

### Looplly Users (B2C)

**Definition**: End consumers who use the platform to complete surveys, earn money, and engage with the community.

**Characteristics:**
- Register via public registration flow
- Complete profile progressively (Levels 1-3)
- Earn reputation points
- Have wallet/earnings
- Can refer other Looplly users
- Access consumer-facing features

**Database Identifier:**
```sql
profiles.user_type = 'looplly_user'
```

**Access:**
- Dashboard
- Profile completion
- Surveys & earning activities
- Wallet & redemptions
- Community
- Referrals

### Office Users (B2B)

**Definition**: Business users who access the platform on behalf of an organization (admin, support, content managers).

**Characteristics:**
- Created by admin (not self-registration)
- Minimal profile requirements (name, email, role)
- No reputation points or earnings
- Cannot refer users
- Access admin/management features

**Database Identifier:**
```sql
profiles.user_type = 'office_user'
```

**Access:**
- Admin portal
- User management
- Content management
- Analytics & reporting
- System configuration

**Roles Available:**
- Super Admin
- Content Admin
- Support Admin
- Analytics Admin

## Database Schema

### Profiles Table

```sql
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  user_type TEXT CHECK (user_type IN ('looplly_user', 'office_user')),
  
  -- Looplly user fields
  mobile TEXT,
  country_code TEXT,
  date_of_birth DATE,
  profile_completion_level INTEGER DEFAULT 0,
  reputation_points INTEGER DEFAULT 0,
  
  -- Office user fields
  office_role TEXT, -- 'super_admin', 'content_admin', etc.
  office_department TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for user type filtering
CREATE INDEX idx_profiles_user_type ON profiles(user_type);
```

### User Roles Table (Office Users Only)

```sql
CREATE TABLE office_user_roles (
  user_id UUID PRIMARY KEY REFERENCES profiles(user_id),
  role TEXT NOT NULL,
  permissions JSONB, -- Granular permissions
  ip_whitelist TEXT[], -- Optional IP restrictions
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT check_office_user CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = office_user_roles.user_id 
        AND user_type = 'office_user'
    )
  )
);
```

## User Type Detection

### Frontend

```typescript
// src/hooks/useUserType.ts

export function useUserType() {
  return useQuery({
    queryKey: ['user-type'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type, office_role')
        .eq('user_id', user.user.id)
        .single();
      
      return profile;
    }
  });
}

// Usage in components
function Dashboard() {
  const { data: userType } = useUserType();
  
  if (userType?.user_type === 'office_user') {
    // Show admin interface
    return <AdminDashboard />;
  }
  
  // Show consumer interface
  return <UserDashboard />;
}
```

### Backend (RLS Policies)

```sql
-- Only Looplly users can access their own profile data
CREATE POLICY "looplly_users_select_own"
  ON profiles FOR SELECT
  USING (
    auth.uid() = user_id 
    AND user_type = 'looplly_user'
  );

-- Only office users can view all profiles
CREATE POLICY "office_users_view_all"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
        AND user_type = 'office_user'
    )
  );
```

## Creating Users

### Looplly User (Self-Registration)

**Flow:**
1. Navigate to `/register`
2. Enter email, password, mobile
3. Verify OTP
4. Complete Level 1 profile
5. Account activated

**Implementation:**

```typescript
// src/components/auth/Register.tsx

async function registerLoopllyUser(data: RegistrationData) {
  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.fullName,
        mobile: data.mobile,
        country_code: data.countryCode
      }
    }
  });
  
  if (authError) throw authError;
  
  // 2. Create profile (automatic via trigger)
  // The trigger sets user_type = 'looplly_user' by default
  
  // 3. Redirect to Level 1 profile setup
  router.push('/profile-setup');
}
```

### Office User (Admin-Created)

**Flow:**
1. Admin navigates to **Admin → Team**
2. Click **"Add Team Member"**
3. Enter details (email, name, role)
4. Send invitation email
5. User sets password via link

**Implementation:**

```typescript
// src/components/admin/team/AddTeamMemberModal.tsx

async function createOfficeUser(data: {
  email: string;
  fullName: string;
  role: string;
}) {
  // Call edge function to create office user
  const { data: result, error } = await supabase.functions.invoke(
    'create-team-member',
    {
      body: {
        email: data.email,
        full_name: data.fullName,
        office_role: data.role
      }
    }
  );
  
  if (error) throw error;
  
  toast.success(`Invitation sent to ${data.email}`);
}
```

**Edge Function:**

```typescript
// supabase/functions/create-team-member/index.ts

const { email, full_name, office_role } = await req.json();

// 1. Create auth user with temporary password
const { data: authData, error: authError } = await adminAuthClient.createUser({
  email,
  password: generateTemporaryPassword(),
  email_confirm: true
});

if (authError) throw authError;

// 2. Create profile with office_user type
const { error: profileError } = await supabase
  .from('profiles')
  .insert({
    user_id: authData.user.id,
    email,
    full_name,
    user_type: 'office_user',
    office_role
  });

if (profileError) throw profileError;

// 3. Send password reset email
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${APP_URL}/admin/reset-password`
});

return new Response(JSON.stringify({ success: true }), {
  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
});
```

## Access Control

### Route Protection

```typescript
// src/components/auth/ProtectedRoute.tsx

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireUserType?: 'looplly_user' | 'office_user';
  requireRole?: string;
}

export function ProtectedRoute({
  children,
  requireUserType,
  requireRole
}: ProtectedRouteProps) {
  const { data: user } = useAuth();
  const { data: profile } = useUserType();
  
  // Check authentication
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Check user type
  if (requireUserType && profile?.user_type !== requireUserType) {
    return <Navigate to="/unauthorized" />;
  }
  
  // Check role (office users only)
  if (requireRole && profile?.office_role !== requireRole) {
    return <Navigate to="/unauthorized" />;
  }
  
  return <>{children}</>;
}

// Usage
<Route
  path="/admin/*"
  element={
    <ProtectedRoute requireUserType="office_user">
      <AdminLayout />
    </ProtectedRoute>
  }
/>

<Route
  path="/dashboard"
  element={
    <ProtectedRoute requireUserType="looplly_user">
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### API Access Control

```typescript
// Edge function: Verify user type
async function verifyOfficeUser(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) throw new Error('No authorization header');
  
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) throw new Error('Invalid token');
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type, office_role')
    .eq('user_id', user.id)
    .single();
  
  if (profile?.user_type !== 'office_user') {
    throw new Error('Unauthorized: Office users only');
  }
  
  return { user, profile };
}
```

## Feature Availability Matrix

| Feature | Looplly User | Office User |
|---------|--------------|-------------|
| Profile Completion (Levels 1-3) | ✅ | ❌ |
| Surveys & Earning | ✅ | ❌ |
| Wallet & Redemptions | ✅ | ❌ |
| Reputation Points | ✅ | ❌ |
| Streaks | ✅ | ❌ |
| Referrals | ✅ | ❌ |
| Community | ✅ | ❌ |
| Admin Portal | ❌ | ✅ |
| User Management | ❌ | ✅ (role-based) |
| Content Management | ❌ | ✅ (role-based) |
| Analytics | ❌ | ✅ (role-based) |
| System Config | ❌ | ✅ (Super Admin only) |

## User Type Conversion

### Looplly User → Office User (Not Supported)

This conversion is not supported due to:
- Different data models
- Conflicting permissions
- Reputation/earnings complications

**Workaround**: Create new office user account with different email.

### Office User → Looplly User (Not Supported)

Same reasons as above.

**Workaround**: Create new Looplly user account.

## Monitoring & Analytics

### User Type Distribution

```sql
SELECT 
  user_type,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM profiles
GROUP BY user_type;
```

### Office User Activity

```sql
SELECT 
  p.full_name,
  p.office_role,
  COUNT(al.id) as actions_count,
  MAX(al.created_at) as last_activity
FROM profiles p
LEFT JOIN audit_log al ON al.performed_by = p.user_id
WHERE p.user_type = 'office_user'
GROUP BY p.user_id, p.full_name, p.office_role
ORDER BY last_activity DESC;
```

## Related Documentation

- [Role Architecture](ROLE_ARCHITECTURE.md)
- [Admin Guide](WARREN_ADMIN_GUIDE.md)
- [Account Management](ACCOUNT_MANAGEMENT.md)
- [Data Isolation](DATA_ISOLATION_QUICK_REFERENCE.md)
