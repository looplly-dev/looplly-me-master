---
title: "Edge Functions Guide"
slug: "edge-functions-guide"
category: "technical"
tags: ["edge-functions", "jwt", "authentication", "api", "custom-auth", "backend"]
author: "Nadia Gaspari"
technical_content: "AI-Generated with Human Review"
version: 1.0
status: "published"
last_updated: "2025-10-27"
change_summary: "Initial comprehensive edge functions guide documenting all edge functions including authentication requirements, input/output schemas, JWT implementation, and usage examples."
---

# Edge Functions Guide

## Table of Contents

1. [Overview & Architecture](#overview--architecture)
2. [Authentication in Edge Functions](#authentication-in-edge-functions)
3. [Authentication Functions](#authentication-functions)
4. [User Management Functions](#user-management-functions)
5. [Simulator Functions](#simulator-functions)
6. [Feature Functions](#feature-functions)
7. [Common Patterns](#common-patterns)
8. [Testing Edge Functions](#testing-edge-functions)
9. [Deployment & Monitoring](#deployment--monitoring)
10. [Troubleshooting](#troubleshooting)

---

## Overview & Architecture

Looplly uses **Supabase Edge Functions** (Deno runtime) to implement:
- **Custom JWT authentication** for regular users
- **User management** for admin operations
- **Simulator session management** for testing
- **AI-powered features** (badge generation, question generation)
- **External API integrations** (future: Cint surveys, payment providers)

**Key Technologies**:
- **Runtime**: Deno (TypeScript, secure by default)
- **Authentication**: JWT (jsonwebtoken library) + bcrypt (password hashing)
- **Database**: Supabase Client (RLS policies enforced)
- **Secrets**: Environment variables (`Deno.env.get()`)

**Edge Function Location**: `supabase/functions/<function-name>/index.ts`

---

## Authentication in Edge Functions

### JWT Secret Management

All JWT operations use the `LOOPLLY_JWT_SECRET` environment variable:

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = Deno.env.get('LOOPLLY_JWT_SECRET')!;

// Sign token
const token = jwt.sign(payload, JWT_SECRET, { 
  algorithm: 'HS256', 
  expiresIn: '24h' 
});

// Verify token
const decoded = jwt.verify(token, JWT_SECRET);
```

### User Type Detection

Edge functions can detect user type from JWT payload:

```typescript
// Regular user JWT
{
  userId: "uuid",
  mobile: "+1234567890",
  countryCode: "+1",
  userType: "looplly_user",
  iat: 1234567890,
  exp: 1234654290
}

// Test user JWT
{
  userId: "uuid",
  mobile: "+1234567890",
  stage: "stage_2_registered",
  isTestAccount: true,
  iat: 1234567890,
  exp: 1234571490
}
```

### RLS Policy Enforcement

Edge functions use `createClient()` with service role key to bypass RLS where needed, but should validate user permissions manually:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Manual permission check
if (requestingUserId !== targetUserId && !isAdmin) {
  return new Response('Unauthorized', { status: 403 });
}
```

---

## Authentication Functions

### `mock-looplly-register`

**Purpose**: Register new regular users with Custom JWT authentication.

**Method**: POST  
**Public**: Yes (`verify_jwt = false` in config.toml)

**Input Schema**:
```typescript
{
  firstName: string,
  lastName: string,
  mobile: string,
  countryCode: string,
  dateOfBirth: string,  // YYYY-MM-DD
  password: string
}
```

**Process**:
1. Validates required fields
2. Normalizes mobile number (removes spaces, dashes)
3. Checks for existing user by mobile + countryCode
4. Generates bcrypt password hash (10 salt rounds)
5. Creates UUID for new user
6. Inserts profile into `public.profiles` table
7. Generates JWT token (24h expiry)
8. Returns token + user data

**Output Schema**:
```typescript
{
  success: true,
  token: "eyJhbGc...",
  user: {
    user_id: "uuid",
    first_name: string,
    last_name: string,
    mobile: string,
    country_code: string,
    date_of_birth: string,
    profile_level: 1,
    level_2_complete: false,
    is_verified: false,
    user_type: "looplly_user"
  }
}
```

**Error Responses**:
- `400`: Missing required fields
- `409`: User already exists (mobile + countryCode)
- `500`: Server error

**Database Changes**:
- Inserts into `public.profiles` with `password_hash`
- Does NOT touch `auth.users` table

**Example Usage**:
```typescript
const { data, error } = await supabase.functions.invoke('mock-looplly-register', {
  body: {
    firstName: 'John',
    lastName: 'Doe',
    mobile: '+1234567890',
    countryCode: '+1',
    dateOfBirth: '1990-01-01',
    password: 'SecureP@ss123'
  }
});

if (!error) {
  localStorage.setItem('looplly_auth_token', data.token);
  localStorage.setItem('looplly_user', JSON.stringify(data.user));
}
```

---

### `mock-looplly-login`

**Purpose**: Authenticate regular users and issue JWT tokens.

**Method**: POST  
**Public**: Yes (`verify_jwt = false` in config.toml)

**Input Schema**:
```typescript
{
  mobile: string,
  countryCode: string,
  password: string
}
```

**Process**:
1. Normalizes mobile number
2. Queries `profiles` table for user by mobile + countryCode
3. Validates password using `bcrypt.compareSync()`
4. Generates JWT token (24h expiry) with user data
5. Returns token + user profile

**Output Schema**:
```typescript
{
  success: true,
  token: "eyJhbGc...",
  user: {
    user_id: "uuid",
    first_name: string,
    last_name: string,
    mobile: string,
    country_code: string,
    email: string | null,
    profile_level: number,
    level_2_complete: boolean,
    is_verified: boolean,
    user_type: "looplly_user"
  }
}
```

**Error Responses**:
- `400`: Missing required fields
- `401`: Invalid credentials (user not found or password mismatch)
- `500`: Server error

**Security**:
- Uses `bcrypt.compareSync()` for constant-time password comparison
- JWT token includes userId, mobile, countryCode, userType
- Token expires after 24 hours (no refresh token)

**Example Usage**:
```typescript
const { data, error } = await supabase.functions.invoke('mock-looplly-login', {
  body: {
    mobile: '+1234567890',
    countryCode: '+1',
    password: 'SecureP@ss123'
  }
});

if (!error) {
  localStorage.setItem('looplly_auth_token', data.token);
  localStorage.setItem('looplly_user', JSON.stringify(data.user));
}
```

---

### `mock-looplly-verify-otp`

**Purpose**: Verify mobile number OTP codes.

**Method**: POST  
**Public**: Yes (`verify_jwt = false` in config.toml)

**Input Schema**:
```typescript
{
  mobile: string,
  countryCode: string,
  code: string
}
```

**Current Implementation**: Development stub (accepts code `12345`)

**Planned Production Flow**:
1. Validate code against stored OTP in database/cache
2. Check expiration (5-10 minutes)
3. Mark user as verified (`is_verified = true`)
4. Invalidate OTP code
5. Return success

**Output Schema**:
```typescript
{
  success: true,
  message: "Mobile verified successfully"
}
```

**Error Responses**:
- `400`: Missing fields or invalid code
- `404`: No OTP found for mobile
- `410`: OTP expired
- `500`: Server error

---

## User Management Functions

### `create-team-member`

**Purpose**: Create Looplly team members (admin users) via Supabase Auth.

**Method**: POST  
**Authentication**: Requires Super Admin role  
**Public**: No (requires JWT with super_admin role)

**Input Schema**:
```typescript
{
  email: string,        // Must be @looplly.me
  firstName: string,
  lastName: string,
  role: 'super_admin' | 'admin' | 'tester',
  tempPassword: string
}
```

**Process**:
1. Validates Super Admin permission
2. Validates `@looplly.me` email domain
3. Creates user in `auth.users` via Supabase Auth
4. Creates profile in `public.profiles` with `user_type = 'looplly_team_user'`
5. Assigns role in `user_roles` table
6. Sets `must_change_password = true`
7. Sends invitation email (optional)

**Output Schema**:
```typescript
{
  success: true,
  userId: "uuid",
  email: string,
  role: string
}
```

**Error Responses**:
- `403`: Unauthorized (not super_admin)
- `400`: Invalid email domain (must be @looplly.me)
- `409`: User already exists
- `500`: Server error

---

### `reset-team-member-password`

**Purpose**: Reset password for team members (admin forced reset).

**Method**: POST  
**Authentication**: Requires Super Admin role  
**Public**: No

**Input Schema**:
```typescript
{
  userId: string,
  newPassword: string
}
```

**Process**:
1. Validates Super Admin permission
2. Validates target user is team member
3. Updates password in Supabase Auth
4. Sets `must_change_password = true`
5. Sends password reset notification

**Output Schema**:
```typescript
{
  success: true,
  message: "Password reset successfully"
}
```

---

## Simulator Functions

### `create-simulator-session`

**Purpose**: Create test user sessions for simulator.

**Method**: POST  
**Authentication**: Requires Tester role or higher (Tester, Admin, Super Admin)  
**Public**: No

**Input Schema**:
```typescript
{
  stage: 'stage_1_fresh' | 'stage_2_registered' | 'stage_3_full_profile' | 
         'stage_4_first_survey' | 'stage_5_established' | 'stage_6_vip',
  userId?: string  // Optional: use specific test user
}
```

**Process**:
1. Validates tester-or-higher role (tester, admin, super_admin)
2. Selects or creates test user for stage
3. Seeds appropriate data for stage
4. Generates JWT token (1h expiry)
5. Returns token + user snapshot

**Output Schema**:
```typescript
{
  success: true,
  token: "eyJhbGc...",
  userSnapshot: {
    user_id: "uuid",
    stage: string,
    profile: {...},
    balances: {...},
    reputation: {...}
  }
}
```

**JWT Payload**:
```typescript
{
  userId: "uuid",
  mobile: "+1234567890",
  stage: "stage_2_registered",
  isTestAccount: true,
  iat: 1234567890,
  exp: 1234571490  // 1 hour
}
```

---

### `seed-test-users`

**Purpose**: Create multiple test users for simulator stages.

**Method**: POST  
**Authentication**: Requires Admin role  
**Public**: No

**Input Schema**:
```typescript
{
  stages: string[],  // Array of stage names
  count: number      // Users per stage (default: 1)
}
```

**Process**:
1. Validates admin permission
2. For each stage, creates N test users
3. Seeds stage-appropriate data
4. Returns user IDs

**Output Schema**:
```typescript
{
  success: true,
  created: {
    stage_1_fresh: ["uuid1", "uuid2"],
    stage_2_registered: ["uuid3"],
    // ...
  }
}
```

---

## Feature Functions

### `badge-service-api`

**Purpose**: Badge operations (award, revoke, query).

**Method**: POST  
**Authentication**: Varies by operation  
**Public**: No

**Input Schema**:
```typescript
{
  operation: 'award' | 'revoke' | 'query',
  userId: string,
  badgeId?: string,
  reason?: string
}
```

---

### `auto-generate-country-options`

**Purpose**: AI-powered generation of country-specific profiling question options.

**Method**: POST  
**Authentication**: Requires Admin role  
**Public**: No

**Input Schema**:
```typescript
{
  questionId: string,
  countryCode: string,
  aiProvider: 'openai' | 'anthropic'
}
```

**Process**:
1. Validates admin permission
2. Fetches question details
3. Calls AI API with prompt
4. Parses AI response
5. Inserts into `country_question_options`

**Output Schema**:
```typescript
{
  success: true,
  options: [...],
  confidence: number
}
```

---

### `generate-badge-image`

**Purpose**: AI-powered badge image generation.

**Method**: POST  
**Authentication**: Requires Admin role  
**Public**: No

---

### `seed-badges`

**Purpose**: Seed badge catalog with predefined badges.

**Method**: POST  
**Authentication**: Requires Admin role  
**Public**: No

---

### `seed-documentation`

**Purpose**: Seed knowledge center documentation.

**Method**: POST  
**Authentication**: Requires Admin role  
**Public**: No

---

## Common Patterns

### CORS Headers

All edge functions must include CORS headers for web app access:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle OPTIONS request
if (req.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}

// Include in all responses
return new Response(JSON.stringify(data), {
  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
});
```

### Error Handling

```typescript
try {
  // Function logic
} catch (error) {
  console.error('[function-name] Error:', error);
  return new Response(
    JSON.stringify({ 
      success: false, 
      error: error.message 
    }),
    { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}
```

### JWT Validation

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = Deno.env.get('LOOPLLY_JWT_SECRET')!;

function validateJWT(authHeader: string) {
  const token = authHeader?.replace('Bearer ', '');
  if (!token) throw new Error('No token provided');
  
  const decoded = jwt.verify(token, JWT_SECRET);
  if (decoded.exp < Date.now() / 1000) {
    throw new Error('Token expired');
  }
  
  return decoded;
}
```

---

## Testing Edge Functions

### Local Testing

```bash
# Start Supabase locally
supabase start

# Serve functions locally
supabase functions serve <function-name> --env-file .env

# Test with curl
curl -X POST http://localhost:54321/functions/v1/mock-looplly-login \
  -H "Content-Type: application/json" \
  -d '{"mobile": "+1234567890", "countryCode": "+1", "password": "test"}'
```

### Frontend Testing

```typescript
// In React components
const { data, error } = await supabase.functions.invoke('mock-looplly-login', {
  body: {
    mobile: testMobile,
    countryCode: testCountryCode,
    password: testPassword
  }
});

console.log('Response:', data);
console.log('Error:', error);
```

---

## Deployment & Monitoring

### Deployment

Edge functions are deployed automatically when code is pushed (Lovable Cloud handles this).

### Monitoring

View edge function logs in Lovable Cloud:
- Click "View Backend" button
- Navigate to Edge Functions section
- Select function to view logs
- Filter by error level, time range

### Performance Metrics

- **Response Time**: Target <500ms for auth functions
- **Error Rate**: Target <1%
- **Timeout**: Default 10 seconds (configurable)

---

## Troubleshooting

### JWT Token Errors

**Symptom**: `JsonWebTokenError: invalid signature`

**Solutions**:
- Verify `LOOPLLY_JWT_SECRET` is set correctly in environment
- Ensure same secret used for signing and verification
- Check token hasn't been modified in transit

---

**Symptom**: `TokenExpiredError: jwt expired`

**Solutions**:
- Token expired (regular users: 24h, test users: 1h)
- User must re-login
- Frontend should handle 401 responses and clear localStorage

---

### CORS Errors

**Symptom**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solutions**:
- Ensure `corsHeaders` included in all responses
- Add OPTIONS method handler
- Check `Access-Control-Allow-Headers` includes all required headers

---

### bcrypt Errors

**Symptom**: `Invalid salt version` or `Error: Illegal arguments`

**Solutions**:
- Verify `password_hash` stored correctly in database
- Check bcrypt version compatibility (use `bcrypt@5.0.0` or compatible)
- Ensure password is string, not null/undefined

---

### RLS Policy Violations

**Symptom**: `new row violates row-level security policy`

**Solutions**:
- Use service role key for operations that bypass RLS
- Manually validate permissions in edge function
- Check RLS policies allow operation for user type

---

## Related Documentation

- [Authentication Architecture](./AUTHENTICATION_ARCHITECTURE.md) - Full auth system overview
- [API Authentication](./API_AUTHENTICATION.md) - API auth patterns
- [Simulator Architecture](./SIMULATOR_ARCHITECTURE.md) - Test user system
- [User Classification](./USER_CLASSIFICATION.md) - User types and authentication methods

---

**Last Updated**: 2025-10-27  
**Version**: 1.0  
**Author**: Nadia Gaspari
