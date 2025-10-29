---
title: "API Authentication"
slug: "api-authentication"
category: "technical"
audience: "admin"
tags: ["api", "authentication", "jwt", "edge-functions", "rls", "security"]
author: "Nadia Gaspari"
technical_content: "AI-Generated with Human Review"
version: 1.0
status: "published"
last_updated: "2025-10-27"
change_summary: "Initial comprehensive API authentication guide covering Custom JWT for regular users, Supabase Auth for admins, edge function authentication, user type detection, JWT validation, RLS policy enforcement, and security best practices."
---

# API Authentication Guide

## Table of Contents

1. [Overview](#overview)
2. [Authentication Methods by User Type](#authentication-methods-by-user-type)
3. [JWT Token Structure](#jwt-token-structure)
4. [User Type Detection in APIs](#user-type-detection-in-apis)
5. [JWT Validation & Verification](#jwt-validation--verification)
6. [RLS Policy Enforcement](#rls-policy-enforcement)
7. [Security Best Practices](#security-best-practices)
8. [Common Patterns & Examples](#common-patterns--examples)
9. [Troubleshooting](#troubleshooting)

---

## Overview

Looplly's API authentication system uses **two different authentication methods** depending on user type:

| User Type | Authentication | Token Type | Storage | Lifespan |
|-----------|---------------|------------|---------|----------|
| **Regular Users** | Custom JWT (Edge Functions) | HS256 JWT | localStorage | 24 hours |
| **Admin Users** | Supabase Auth | Supabase JWT | localStorage | 1 hour (auto-refresh) |
| **Test Users** | Custom JWT (Simulator) | HS256 JWT | sessionStorage | 1 hour |

**Key Principles**:
- Regular users **do not use Supabase Auth** - authentication is custom JWT via edge functions
- Admin users use standard Supabase Auth for full session management
- All API calls must include appropriate authentication token
- RLS policies enforce data isolation at database level

---

## Authentication Methods by User Type

### Regular Users (`looplly_user`)

**Authentication**: Custom JWT via Edge Functions

**Registration**:
```typescript
// Frontend call
const { data } = await supabase.functions.invoke('mock-looplly-register', {
  body: {
    firstName, lastName, mobile, countryCode, dateOfBirth, password
  }
});

// Response
{
  success: true,
  token: "eyJhbGc...",  // 24h JWT
  user: { user_id, first_name, last_name, mobile, ... }
}

// Storage
localStorage.setItem('looplly_auth_token', data.token);
localStorage.setItem('looplly_user', JSON.stringify(data.user));
```

**Login**:
```typescript
// Frontend call
const { data } = await supabase.functions.invoke('mock-looplly-login', {
  body: {
    mobile, countryCode, password
  }
});

// Response (same as registration)
localStorage.setItem('looplly_auth_token', data.token);
localStorage.setItem('looplly_user', JSON.stringify(data.user));
```

**API Calls** (using JWT):
```typescript
const token = localStorage.getItem('looplly_auth_token');

// Option 1: Include in edge function call
const { data } = await supabase.functions.invoke('some-function', {
  headers: {
    Authorization: `Bearer ${token}`
  },
  body: { ... }
});

// Option 2: Edge function validates JWT internally
const decoded = jwt.verify(token, LOOPLLY_JWT_SECRET);
```

---

### Admin Users (`looplly_team_user`)

**Authentication**: Supabase Auth (standard flow)

**Login**:
```typescript
// Frontend call
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@looplly.me',
  password: 'password'
});

// Storage (handled automatically by Supabase)
// localStorage: sb-${projectId}-admin_auth
```

**API Calls** (using Supabase session):
```typescript
// Supabase client automatically includes auth headers
const { data } = await supabase.from('profiles').select('*');

// Or for edge functions
const { data } = await supabase.functions.invoke('admin-function', {
  body: { ... }
});
// Supabase automatically includes auth headers
```

---

### Test Users (Simulator)

**Authentication**: Custom JWT via Simulator Session

**Session Creation** (admin creates):
```typescript
const { data } = await supabase.functions.invoke('create-simulator-session', {
  body: {
    stage: 'stage_2_registered'
  }
});

// Response
{
  success: true,
  token: "eyJhbGc...",  // 1h JWT
  userSnapshot: { user_id, stage, profile, ... }
}

// Storage
sessionStorage.setItem('simulator_auth_token', data.token);
sessionStorage.setItem('simulator_user', JSON.stringify(data.userSnapshot));
```

**API Calls** (same as regular users, but sessionStorage):
```typescript
const token = sessionStorage.getItem('simulator_auth_token');
```

---

## JWT Token Structure

### Regular User JWT

**Payload**:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "mobile": "+1234567890",
  "countryCode": "+1",
  "userType": "looplly_user",
  "iat": 1730000000,
  "exp": 1730086400
}
```

**Generation** (in `mock-looplly-login/index.ts`):
```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = Deno.env.get('LOOPLLY_JWT_SECRET')!;

const payload = {
  userId: profile.user_id,
  mobile: normalizedMobile,
  countryCode: countryCode,
  userType: 'looplly_user'
};

const token = jwt.sign(payload, JWT_SECRET, {
  algorithm: 'HS256',
  expiresIn: '24h'
});
```

**Verification**:
```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = Deno.env.get('LOOPLLY_JWT_SECRET')!;

try {
  const decoded = jwt.verify(token, JWT_SECRET);
  
  // Check expiration
  if (decoded.exp < Date.now() / 1000) {
    throw new Error('Token expired');
  }
  
  // Access user data
  const userId = decoded.userId;
  const userType = decoded.userType;
  
} catch (error) {
  console.error('JWT verification failed:', error);
  // Handle invalid/expired token
}
```

---

### Test User JWT

**Payload**:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "mobile": "+1234567890",
  "stage": "stage_2_registered",
  "isTestAccount": true,
  "iat": 1730000000,
  "exp": 1730003600
}
```

**Generation** (in `create-simulator-session/index.ts`):
```typescript
const payload = {
  userId: testUser.user_id,
  mobile: testUser.mobile,
  stage: selectedStage,
  isTestAccount: true
};

const token = jwt.sign(payload, JWT_SECRET, {
  algorithm: 'HS256',
  expiresIn: '1h'  // Shorter for test accounts
});
```

---

## User Type Detection in APIs

### In Edge Functions

```typescript
// Extract JWT from Authorization header
const authHeader = req.headers.get('Authorization');
const token = authHeader?.replace('Bearer ', '');

if (!token) {
  return new Response('Unauthorized', { 
    status: 401,
    headers: corsHeaders
  });
}

// Verify and decode JWT
const JWT_SECRET = Deno.env.get('LOOPLLY_JWT_SECRET')!;
const decoded = jwt.verify(token, JWT_SECRET);

// Detect user type
if (decoded.isTestAccount) {
  console.log('Test user detected');
  // Apply test user logic
} else if (decoded.userType === 'looplly_user') {
  console.log('Regular user detected');
  // Apply regular user logic
}

// Extract user ID for database queries
const userId = decoded.userId;
```

---

### In Frontend (useAuth Hook)

```typescript
// In useAuth.ts (lines 54-190)
useEffect(() => {
  // Priority 1: Check for simulator JWT
  const simulatorToken = sessionStorage.getItem('simulator_auth_token');
  if (simulatorToken) {
    const decoded = jwt.verify(simulatorToken, JWT_SECRET);
    setAuthState({
      user: { id: decoded.userId, ... },
      isAuthenticated: true,
      isLoading: false,
      userType: 'test'
    });
    return;
  }
  
  // Priority 2: Check for regular user JWT
  const loopllyToken = localStorage.getItem('looplly_auth_token');
  if (loopllyToken) {
    const decoded = jwt.verify(loopllyToken, JWT_SECRET);
    const user = JSON.parse(localStorage.getItem('looplly_user') || '{}');
    setAuthState({
      user: { id: decoded.userId, ...user },
      isAuthenticated: true,
      isLoading: false,
      userType: 'looplly_user'
    });
    return;
  }
  
  // Priority 3: Check for admin Supabase session
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    setAuthState({
      user: session.user,
      isAuthenticated: true,
      isLoading: false,
      userType: 'looplly_team_user'
    });
    return;
  }
  
  // No authentication found
  setAuthState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    userType: null
  });
}, []);
```

---

## JWT Validation & Verification

### Server-Side Validation (Edge Functions)

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = Deno.env.get('LOOPLLY_JWT_SECRET')!;

function validateJWT(req: Request): { userId: string, userType: string } | null {
  try {
    // Extract token
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      console.error('No token provided');
      return null;
    }
    
    // Verify signature and decode
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string,
      userType?: string,
      isTestAccount?: boolean,
      exp: number
    };
    
    // Check expiration (jwt.verify does this automatically, but explicit check)
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      console.error('Token expired');
      return null;
    }
    
    // Determine user type
    const userType = decoded.isTestAccount 
      ? 'test_account' 
      : decoded.userType || 'looplly_user';
    
    return {
      userId: decoded.userId,
      userType: userType
    };
    
  } catch (error) {
    console.error('JWT validation failed:', error);
    return null;
  }
}

// Usage in edge function
Deno.serve(async (req) => {
  const auth = validateJWT(req);
  
  if (!auth) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: corsHeaders }
    );
  }
  
  // Proceed with authenticated request
  const { userId, userType } = auth;
  // ...
});
```

---

### Client-Side Validation (Frontend)

```typescript
// In useAuth.ts or auth utility
function isTokenValid(token: string): boolean {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp > now;
  } catch {
    return false;
  }
}

// Before making API calls
const token = localStorage.getItem('looplly_auth_token');

if (!token || !isTokenValid(token)) {
  // Redirect to login
  navigate('/login');
  return;
}

// Proceed with API call
```

---

## RLS Policy Enforcement

### JWT-Compatible RLS Policies

Looplly's RLS policies work with **both Custom JWT and Supabase Auth** by using `auth.uid()`:

```sql
-- Users can view own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid());
```

**How it works**:
- **Supabase Auth (Admins)**: `auth.uid()` returns user ID from Supabase session
- **Custom JWT (Regular Users)**: Edge functions set RLS context manually

---

### Setting RLS Context in Edge Functions

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!  // Service role bypasses RLS
);

// Validate JWT
const auth = validateJWT(req);
if (!auth) {
  return new Response('Unauthorized', { status: 401 });
}

// Option 1: Manual permission check (recommended for Custom JWT)
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', auth.userId)  // Explicit filter
  .single();

// Option 2: Set RLS context (advanced)
// Note: This requires custom database function
await supabase.rpc('set_auth_context', { user_id: auth.userId });

// Now RLS policies will use this user ID
const { data } = await supabase.from('profiles').select('*');
```

---

### RLS Policy Examples

**User Data Isolation**:
```sql
-- Regular users can only see/update their own data
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (user_id = auth.uid());
```

**Admin Access**:
```sql
-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- has_role() function checks user_roles table
CREATE OR REPLACE FUNCTION has_role(user_id UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = has_role.user_id 
    AND user_roles.role = required_role::app_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Test Account Isolation**:
```sql
-- Test accounts only see test data
CREATE POLICY "Test users see test data only" 
ON public.profiles 
FOR SELECT 
USING (
  CASE 
    WHEN is_test_account = true THEN user_id = auth.uid()
    ELSE user_id = auth.uid() AND is_test_account = false
  END
);
```

---

## Security Best Practices

### 1. Secret Management

**DO**:
- ✅ Store `LOOPLLY_JWT_SECRET` in environment variables
- ✅ Use strong, randomly generated secrets (32+ characters)
- ✅ Rotate secrets periodically
- ✅ Use different secrets for dev/staging/production

**DON'T**:
- ❌ Hardcode secrets in code
- ❌ Commit secrets to version control
- ❌ Share secrets in plain text
- ❌ Use weak secrets (dictionary words, short strings)

```bash
# Generate strong secret
openssl rand -base64 32
```

---

### 2. Password Security

**DO**:
- ✅ Use bcrypt with 10+ salt rounds
- ✅ Hash passwords server-side (edge functions)
- ✅ Validate password strength (8+ chars, mix of types)
- ✅ Use constant-time comparison (`bcrypt.compareSync()`)

**DON'T**:
- ❌ Store plain-text passwords
- ❌ Hash passwords client-side
- ❌ Use weak hashing (MD5, SHA1)
- ❌ Allow weak passwords

```typescript
// In mock-looplly-register
import * as bcrypt from 'bcrypt';

const passwordHash = await bcrypt.hash(password, 10);  // 10 salt rounds

// In mock-looplly-login
const isValid = bcrypt.compareSync(password, profile.password_hash);
```

---

### 3. Token Expiration

**DO**:
- ✅ Set appropriate expiration times (24h for regular, 1h for test)
- ✅ Validate expiration on every API call
- ✅ Clear expired tokens from storage
- ✅ Redirect to login on token expiry

**DON'T**:
- ❌ Use tokens with no expiration
- ❌ Use extremely long expiration (>30 days)
- ❌ Skip expiration validation
- ❌ Allow expired tokens to work

```typescript
// Check expiration
const decoded = jwt.verify(token, JWT_SECRET);
const now = Math.floor(Date.now() / 1000);

if (decoded.exp < now) {
  localStorage.removeItem('looplly_auth_token');
  localStorage.removeItem('looplly_user');
  navigate('/login');
}
```

---

### 4. HTTPS Only

**DO**:
- ✅ Use HTTPS for all API calls
- ✅ Set secure cookies (if using cookies)
- ✅ Enable HSTS headers

**DON'T**:
- ❌ Send tokens over HTTP
- ❌ Allow mixed content (HTTP + HTTPS)

---

### 5. CORS Configuration

**DO**:
- ✅ Include CORS headers in all edge function responses
- ✅ Handle OPTIONS preflight requests
- ✅ Restrict origins in production (if possible)

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',  // Restrict in production
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle OPTIONS
if (req.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}

// Include in responses
return new Response(JSON.stringify(data), {
  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
});
```

---

## Common Patterns & Examples

### Pattern 1: Authenticated API Call

```typescript
// Frontend
async function fetchUserProfile() {
  const token = localStorage.getItem('looplly_auth_token');
  
  if (!token) {
    navigate('/login');
    return;
  }
  
  const { data, error } = await supabase.functions.invoke('get-profile', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  if (error?.message?.includes('Unauthorized')) {
    // Token expired or invalid
    localStorage.removeItem('looplly_auth_token');
    localStorage.removeItem('looplly_user');
    navigate('/login');
    return;
  }
  
  return data;
}
```

---

### Pattern 2: Permission Check in Edge Function

```typescript
// Edge function
Deno.serve(async (req) => {
  // Validate JWT
  const auth = validateJWT(req);
  if (!auth) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Parse request
  const { targetUserId, action } = await req.json();
  
  // Check permission
  if (auth.userId !== targetUserId && !auth.isAdmin) {
    return new Response('Forbidden', { status: 403 });
  }
  
  // Proceed with action
  // ...
});
```

---

### Pattern 3: Token Refresh (Regular Users)

**Note**: Regular users do NOT have refresh tokens. They must re-login after 24 hours.

```typescript
// Check token validity before API call
const token = localStorage.getItem('looplly_auth_token');

if (!token) {
  navigate('/login');
  return;
}

try {
  const decoded = jwt.verify(token, JWT_SECRET);
  const now = Math.floor(Date.now() / 1000);
  
  if (decoded.exp < now) {
    // Token expired - redirect to login
    localStorage.removeItem('looplly_auth_token');
    localStorage.removeItem('looplly_user');
    navigate('/login');
    return;
  }
  
  // Token valid - proceed
} catch {
  navigate('/login');
}
```

---

## Troubleshooting

### "JsonWebTokenError: invalid signature"

**Cause**: JWT secret mismatch between signing and verification

**Solutions**:
- Verify `LOOPLLY_JWT_SECRET` is identical in all environments
- Check token wasn't modified in transit
- Ensure edge function and frontend use same secret

---

### "TokenExpiredError: jwt expired"

**Cause**: JWT token expired (24h for regular, 1h for test)

**Solutions**:
- User must re-login
- Clear expired token from storage
- Implement automatic redirect to login

```typescript
if (error.message.includes('expired')) {
  localStorage.removeItem('looplly_auth_token');
  localStorage.removeItem('looplly_user');
  navigate('/login');
}
```

---

### "Unauthorized" on API calls

**Cause**: Missing or invalid JWT token

**Solutions**:
- Check token exists in storage
- Verify token format (Bearer <token>)
- Ensure Authorization header included in request
- Validate token hasn't expired

---

### RLS policy violation

**Cause**: RLS policy blocking database operation

**Solutions**:
- Use service role key in edge functions to bypass RLS
- Manually validate permissions in edge function
- Check RLS policies allow operation for user type

```typescript
// Use service role key
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Then manually check permissions
if (auth.userId !== targetUserId && !auth.isAdmin) {
  return new Response('Forbidden', { status: 403 });
}
```

---

## Related Documentation

- [Authentication Architecture](./AUTHENTICATION_ARCHITECTURE.md) - Full auth system overview
- [Edge Functions Guide](./EDGE_FUNCTIONS_GUIDE.md) - Edge function implementation details
- [User Classification](./USER_CLASSIFICATION.md) - User types and authentication methods
- [Security Best Practices](./PRODUCTION_READINESS.md) - Production security checklist

---

**Last Updated**: 2025-10-27  
**Version**: 1.0  
**Author**: Nadia Gaspari
