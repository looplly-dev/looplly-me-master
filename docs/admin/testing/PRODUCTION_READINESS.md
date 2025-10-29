---
id: "testing-production-readiness"
title: "Production Readiness Checklist"
category: "Testing & QA"
description: "Complete pre-deployment checklist for transitioning from mock to production authentication"
audience: "admin"
tags: ["testing", "production", "deployment", "readiness"]
status: "published"
version: "1.0"
created_at: "2024-01-15"
updated_at: "2024-01-15"
---

# Production Readiness Checklist

Last Updated: 2025-01-26
Version: 1.0

## Overview

This document outlines ALL steps required to migrate Looplly from development (mock authentication) to production (real Notify API integration).

---

## Current State (Development)

### ✅ Implemented Mock Systems

1. **Mock Authentication Edge Functions**
   - `mock-looplly-register` - Creates users in `profiles` table only (NOT `auth.users`)
   - `mock-looplly-login` - Returns custom JWT tokens
   - `mock-looplly-verify-otp` - Uses hardcoded OTP `12345`

2. **Custom JWT Authentication**
   - `LOOPLLY_JWT_SECRET` secret configured
   - JWT tokens stored in `localStorage` (`looplly_auth_token`, `looplly_user`)
   - Tokens expire after 24 hours (login) or 1 hour (simulator)
   - Tokens signed with HS256 algorithm

3. **Frontend Integration**
   - `src/utils/auth.ts` - Calls mock edge functions
   - `src/hooks/useAuth.ts` - Prioritizes custom JWT over Supabase Auth
   - `src/components/auth/MobileVerification.tsx` - Uses mock OTP

4. **Simulator Integration**
   - Test users created in `profiles` only (NOT `auth.users`)
   - Simulator sessions use custom JWT tokens
   - Same authentication flow as production users
   - Password: `Test123!` (bcrypt hashed)

### ⚠️ Development Stubs

- **OTP**: Hardcoded `12345` accepted for all verifications
- **Notify API**: Not integrated (stub console logs only)
- **Mobile Validation**: Uses `libphonenumber-js` (already production-ready)

---

## Production Migration Path

### Phase 1: Obtain Notify Credentials

**Required**:
- Notify API Base URL (e.g., `https://api.notify.example.com`)
- Notify API Key / Bearer Token
- Notify Endpoints:
  - `POST /send-otp` - Send OTP to mobile number
  - `POST /verify-otp` - Verify OTP code

**Action**:
```bash
# Add Notify secrets to Supabase
NOTIFY_API_KEY = <your_api_key_here>
NOTIFY_BASE_URL = <notify_base_url>
```

---

### Phase 2: Update Edge Functions

#### 2.1 Update `mock-looplly-register`

**File**: `supabase/functions/mock-looplly-register/index.ts`

**Find this code** (around lines 71-78):
```typescript
// DEV STUB: Return mock success message
// TODO Phase 2: Replace with actual Notify API call to send real OTP
console.log('[NOTIFY STUB] Would send OTP to mobile:', normalizedMobile);
console.log('[NOTIFY STUB] In production, call Notify API here');
```

**Replace with**:
```typescript
// PRODUCTION: Send real OTP via Notify API
const notifyApiKey = Deno.env.get('NOTIFY_API_KEY');
const notifyBaseUrl = Deno.env.get('NOTIFY_BASE_URL');

if (!notifyApiKey || !notifyBaseUrl) {
  console.error('Missing Notify credentials');
  // Still return success for user creation
} else {
  try {
    const otpResponse = await fetch(`${notifyBaseUrl}/send-otp`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notifyApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mobile: normalizedMobile,
        message: `Your Looplly verification code is: {{otp}}`
      })
    });

    if (!otpResponse.ok) {
      console.error('Failed to send OTP:', await otpResponse.text());
      // Still return success for user creation, but log error
    } else {
      console.log('OTP sent successfully to:', normalizedMobile);
    }
  } catch (error) {
    console.error('Error calling Notify API:', error);
  }
}
```

**Update return message** (around line 88):
```typescript
// BEFORE:
message: 'Registration successful. Use OTP: 12345 to verify (dev stub)'

// AFTER:
message: 'Registration successful. Please check your mobile for OTP.'
```

#### 2.2 Update `mock-looplly-verify-otp`

**File**: `supabase/functions/mock-looplly-verify-otp/index.ts`

**Find this code** (around lines 17-28):
```typescript
console.log('[MOCK VERIFY OTP] Verifying OTP for user:', user_id, 'OTP:', otp);

// DEV STUB: Accept hardcoded OTP
if (otp !== '12345') {
  return new Response(
    JSON.stringify({ error: 'Invalid OTP code' }), 
    {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

// TODO Phase 2: Call real Notify API to verify OTP
console.log('[NOTIFY STUB] Would verify OTP for user', user_id);
```

**Replace with**:
```typescript
console.log('[VERIFY OTP] Verifying OTP for user:', user_id);

const notifyApiKey = Deno.env.get('NOTIFY_API_KEY');
const notifyBaseUrl = Deno.env.get('NOTIFY_BASE_URL');

// Fetch user's mobile from profiles
const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('mobile')
  .eq('user_id', user_id)
  .single();

if (profileError || !profile) {
  return new Response(JSON.stringify({ error: 'User not found' }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// PRODUCTION: Verify OTP with Notify API
const verifyResponse = await fetch(`${notifyBaseUrl}/verify-otp`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${notifyApiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    mobile: profile.mobile,
    otp: otp
  })
});

if (!verifyResponse.ok) {
  const errorText = await verifyResponse.text();
  console.error('OTP verification failed:', errorText);
  return new Response(JSON.stringify({ error: 'Invalid OTP code' }), {
    status: 400,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

console.log('OTP verified successfully for user:', user_id);
```

#### 2.3 Optional: Rename Functions

To remove "mock-" prefix for clarity in production:

**Edge Function Folders:**
```bash
# Rename:
supabase/functions/mock-looplly-register → supabase/functions/looplly-register
supabase/functions/mock-looplly-login → supabase/functions/looplly-login
supabase/functions/mock-looplly-verify-otp → supabase/functions/looplly-verify-otp
```

**Update Frontend Calls** in `src/utils/auth.ts`:
```typescript
// Find and replace:
'mock-looplly-register' → 'looplly-register'
'mock-looplly-login' → 'looplly-login'
```

**Update Mobile Verification** in `src/components/auth/MobileVerification.tsx`:
```typescript
// Find and replace:
'mock-looplly-verify-otp' → 'looplly-verify-otp'
```

---

### Phase 3: Testing Strategy

#### 3.1 Production-Like Testing (Pre-Launch)

**Staging Environment Checklist**:
- [ ] Add `NOTIFY_API_KEY` and `NOTIFY_BASE_URL` secrets to staging
- [ ] Deploy updated edge functions to staging
- [ ] Test with **real mobile numbers** (your team's phones)

**Test Registration Flow**:
1. Register new user with real mobile number
2. Verify OTP is received via SMS within 30 seconds
3. Enter actual OTP code
4. Confirm `profiles.is_verified = true` in database
5. Verify user can access earning opportunities

**Test Login Flow**:
1. Login with mobile + password
2. Receive custom JWT token in localStorage
3. Verify session persists across page refresh
4. Confirm dashboard loads correctly
5. Test logout clears tokens

**Test Mobile Verification (Level 2)**:
1. Complete Level 2 profile questions
2. Verify mobile verification modal appears
3. Click "Resend Code" - confirm SMS received
4. Enter real OTP from SMS
5. Confirm earning opportunities unlock
6. Check `profiles.is_verified = true`

**Test Edge Cases**:
- [ ] Invalid OTP (wrong code) - should show error
- [ ] Expired OTP (if Notify has timeout) - should show error
- [ ] Resend OTP multiple times - should work
- [ ] Login before mobile verified - should work, but no earning access
- [ ] Complete Level 2 after already verified - should not show modal

#### 3.2 Production Launch Testing

**Day 1 Checklist**:
- [ ] Monitor edge function logs for errors
- [ ] Verify OTP delivery rate (target: >95%)
- [ ] Check `profiles.is_verified` conversion rate
- [ ] Monitor JWT token expiry/refresh behavior
- [ ] Track authentication error rates
- [ ] Monitor Notify API response times

**Week 1 Checklist**:
- [ ] Review user feedback on OTP delivery speed
- [ ] Analyze authentication failure patterns
- [ ] Optimize OTP resend logic if needed
- [ ] Monitor custom JWT token security (failed verifications)
- [ ] Check for any mobile number format issues
- [ ] Review audit logs for suspicious activity

---

## Security Considerations

### JWT Token Security

**Current Implementation**:
- Tokens signed with `LOOPLLY_JWT_SECRET` (HS256)
- 24-hour expiry for user sessions
- 1-hour expiry for simulator sessions
- Stored in `localStorage` (survives page refresh)

**Production Recommendations**:

1. **Rotate JWT Secret Regularly**
   - Update `LOOPLLY_JWT_SECRET` every 90 days
   - Use strong random value (64+ characters)
   - Store rotation schedule in documentation

2. **Monitor Token Abuse**
   - Log JWT verification failures
   - Alert on >10 failed verifications per user per hour
   - Investigate patterns of expired tokens

3. **Implement Token Revocation**
   - Create `token_blacklist` table for compromised tokens
   - Add `jti` (JWT ID) to payload for tracking
   - Check blacklist on sensitive operations

4. **Consider HttpOnly Cookies**
   - Migrate from `localStorage` to `httpOnly` cookies
   - Better protection against XSS attacks
   - Requires backend cookie parsing

### Password Security

**Current Implementation**:
- Passwords hashed with bcrypt (cost factor 10)
- Never transmitted in plain text
- Never logged or stored in plain text
- Stored in `profiles.password_hash`

**Production Recommendations**:

1. **Password Complexity Enforcement**
   - Minimum 8 characters
   - At least 1 uppercase letter
   - At least 1 lowercase letter
   - At least 1 number
   - Special characters optional

2. **Rate Limiting**
   - Implement failed login attempt throttling
   - 5 failed attempts per 15 minutes per mobile
   - Exponential backoff: 1min → 5min → 15min
   - Log attempts to audit table

3. **Password Reset Flow**
   - Add secure password reset via Notify OTP
   - Require OTP verification before allowing reset
   - Invalidate all sessions on password change
   - Send notification of password change

### Mobile Number Security

**Current Implementation**:
- Mobile numbers normalized to E.164 format
- Unique constraint enforced in database
- Validated with `libphonenumber-js`
- Stored with country code

**Production Recommendations**:

1. **Phone Number Privacy**
   - Never expose full mobile in frontend
   - Mask as `+27 *** *** *395`
   - Only show full number to user themselves
   - Redact in logs and error messages

2. **SIM Swap Protection**
   - Monitor for suspicious mobile number changes
   - Require OTP verification before updating mobile
   - Lock account for 24h after mobile change
   - Alert user via email of mobile update

3. **OTP Rate Limiting**
   - Limit OTP requests: max 3 per 15 minutes per mobile
   - Limit OTP requests: max 10 per day per mobile
   - Block users exceeding limits for 24 hours
   - Log all OTP requests to audit table

---

## Rollback Plan

If Notify integration fails in production:

### Emergency Rollback Steps

**1. Revert Edge Functions** (15 minutes)
```bash
# In each edge function, restore mock OTP logic:
# mock-looplly-verify-otp/index.ts

// Re-add hardcoded OTP check
if (otp !== '12345') {
  return new Response(JSON.stringify({ error: 'Invalid OTP code' }), {
    status: 400,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Comment out Notify API calls
// const verifyResponse = await fetch(...);

# Deploy updated functions
```

**2. User Communication** (immediate)
- Display banner in app: "SMS verification temporarily unavailable. Use code **12345** to verify your mobile."
- Update status page: "Mobile verification experiencing delays"
- Email support team to manually verify urgent users
- Post on social media if widespread impact

**3. Database Cleanup** (manual)
```sql
-- Identify users stuck in unverified state (registered in last 24h)
SELECT user_id, mobile, first_name, created_at
FROM profiles
WHERE is_verified = false
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- After manual verification (support ticket, phone call, etc.):
UPDATE profiles
SET is_verified = true
WHERE user_id = '<verified_user_id>';
```

**4. Root Cause Analysis** (within 2 hours)
- Check Notify API dashboard for errors
- Verify `NOTIFY_API_KEY` is correct (not expired)
- Test Notify API directly (Postman/curl):
  ```bash
  curl -X POST https://notify-api.example.com/send-otp \
    -H "Authorization: Bearer $NOTIFY_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"mobile": "+27123456789", "message": "Test OTP: {{otp}}"}'
  ```
- Review edge function error logs
- Check Notify API rate limits
- Verify Notify account billing status

**5. Re-deploy** (after fix confirmed)
- Test Notify integration in staging again
- Deploy to production during low-traffic period
- Monitor closely for 1 hour post-deployment
- Gradually remove emergency banner

---

## Deployment Checklist

### Pre-Deployment

**Secrets & Configuration**:
- [ ] `NOTIFY_API_KEY` secret added to production Supabase
- [ ] `NOTIFY_BASE_URL` secret added to production Supabase
- [ ] `LOOPLLY_JWT_SECRET` rotated (if using same dev secret)
- [ ] Verify Notify account has sufficient credits/balance
- [ ] Confirm Notify API rate limits match traffic projections

**Code Updates**:
- [ ] Edge functions updated with Notify API calls
- [ ] Hardcoded `12345` OTP removed from verification logic
- [ ] Frontend function names updated (if renamed from `mock-*`)
- [ ] All console.log stubs removed or converted to proper logging
- [ ] Error messages updated (no "dev stub" references)

**Testing**:
- [ ] All tests passing (registration, login, verification)
- [ ] Staging environment tested with real mobile numbers
- [ ] Test users from 3+ countries verified working
- [ ] Load testing completed (expected concurrent users)
- [ ] Security scan completed (no high/critical issues)

**Monitoring**:
- [ ] Notify API webhook configured (delivery status)
- [ ] Error alerting configured (edge functions)
- [ ] Dashboard created for OTP metrics
- [ ] On-call rotation schedule confirmed

### Deployment

**Pre-Flight** (30 minutes before):
- [ ] Notify support team on standby
- [ ] Team in Slack/Teams war room
- [ ] Database backup completed
- [ ] Traffic monitoring dashboard open
- [ ] Rollback plan printed and ready

**Deploy** (15 minutes):
1. Deploy edge functions to production
2. Verify secrets are set correctly in environment
3. Test one complete journey (register → verify → login)
4. Monitor edge function logs for first 5 minutes
5. Test from 2+ countries (different Notify regions)

**Post-Deploy** (60 minutes monitoring):
- [ ] Monitor OTP delivery success rate (target: >95%)
- [ ] Track authentication error rate (target: <2%)
- [ ] Verify edge function latency <500ms (p95)
- [ ] Check for any Notify API errors
- [ ] Confirm no increase in support tickets

### Post-Deployment

**First 24 Hours**:
- [ ] Monitor OTP delivery success rate (target: >95%)
- [ ] Track authentication error rate (target: <2%)
- [ ] Review user feedback on SMS delivery times
- [ ] Check Notify API usage vs. projections
- [ ] Document any issues encountered
- [ ] Update runbook based on learnings

**First Week**:
- [ ] Analyze OTP delivery times by country
- [ ] Review authentication failure patterns
- [ ] Optimize OTP resend logic if needed
- [ ] Check for mobile number format edge cases
- [ ] Verify JWT token security (no breaches)
- [ ] Update this checklist based on experience

**First Month**:
- [ ] Review Notify API costs vs. budget
- [ ] Analyze user verification conversion funnel
- [ ] Identify opportunities for UX improvements
- [ ] Plan for JWT secret rotation
- [ ] Conduct security audit

---

## Monitoring & Alerting

### Key Metrics to Track

**OTP Delivery**:
- Delivery success rate (target: >95%)
- Average delivery time (target: <30 seconds)
- Failed deliveries by country
- Retry attempts per user

**Authentication**:
- Registration success rate
- Login success rate
- OTP verification success rate
- Failed authentication attempts
- Session duration (average)

**Performance**:
- Edge function response time (p50, p95, p99)
- Database query time
- Notify API response time

**Security**:
- Failed login attempts per user
- JWT verification failures
- Suspicious activity patterns
- Rate limit violations

### Alert Thresholds

**Critical (Page On-Call)**:
- OTP delivery success rate <90%
- Edge function error rate >5%
- Notify API down (5 consecutive failures)
- JWT secret compromised (manual trigger)

**Warning (Slack Notification)**:
- OTP delivery success rate <95%
- Edge function error rate >2%
- Edge function latency p95 >1s
- Failed login rate >10%

**Info (Dashboard Only)**:
- OTP delivery time >60s
- Edge function latency p95 >500ms
- Daily active users milestone

---

## Support Contacts

### Notify API Support
- **Email**: support@notify.example.com
- **Phone**: [support phone number]
- **SLA**: 4-hour response time (business hours)
- **Emergency**: [emergency hotline]
- **Dashboard**: https://dashboard.notify.example.com

### Internal Escalation
- **Technical Lead**: [name/email/phone]
- **Product Manager**: [name/email/phone]
- **On-Call Engineer**: [rotation schedule/pager]
- **Security Team**: [contact for JWT issues]

### External Dependencies
- **Supabase Support**: support@supabase.io
- **DNS Provider**: [contact]
- **Cloud Hosting**: [contact]

---

## Appendix A: Test Scenarios

### Test Scenario 1: Happy Path
1. User registers with mobile `+27823093959`
2. User receives OTP within 30 seconds
3. User enters correct OTP
4. `profiles.is_verified = true`
5. User can access earning opportunities

### Test Scenario 2: Wrong OTP
1. User registers with mobile
2. User receives OTP
3. User enters wrong code (e.g., `11111`)
4. Error: "Invalid OTP code"
5. User clicks "Resend Code"
6. User receives new OTP
7. User enters correct OTP
8. Verification succeeds

### Test Scenario 3: Expired OTP
1. User registers with mobile
2. User receives OTP
3. Wait 10 minutes (if Notify has 5-min expiry)
4. User enters expired OTP
5. Error: "OTP has expired"
6. User clicks "Resend Code"
7. User enters new OTP
8. Verification succeeds

### Test Scenario 4: Rate Limiting
1. User attempts verification 4 times with wrong OTP
2. 5th attempt shows: "Too many attempts. Try again in 15 minutes."
3. User waits 15 minutes
4. User can attempt again

### Test Scenario 5: Mobile Change
1. Verified user wants to update mobile
2. User enters new mobile number
3. System sends OTP to new mobile
4. User verifies new mobile
5. Old mobile becomes inactive
6. All sessions invalidated (logout)

---

## Appendix B: Notify API Examples

### Send OTP Example

**Request**:
```bash
curl -X POST https://api.notify.example.com/send-otp \
  -H "Authorization: Bearer $NOTIFY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "+27823093959",
    "message": "Your Looplly verification code is: {{otp}}",
    "expiry": 300,
    "length": 5
  }'
```

**Response**:
```json
{
  "success": true,
  "message_id": "msg_abc123",
  "mobile": "+27823093959",
  "expiry": 300,
  "cost": 0.05
}
```

### Verify OTP Example

**Request**:
```bash
curl -X POST https://api.notify.example.com/verify-otp \
  -H "Authorization: Bearer $NOTIFY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "+27823093959",
    "otp": "12345"
  }'
```

**Response (Success)**:
```json
{
  "success": true,
  "mobile": "+27823093959",
  "verified": true
}
```

**Response (Failure)**:
```json
{
  "success": false,
  "error": "Invalid OTP code",
  "attempts_remaining": 2
}
```

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-01-26 | Initial production readiness document | AI Assistant |

---

## Next Steps

1. **Schedule Production Readiness Meeting**
   - Review this document with team
   - Assign responsibilities
   - Set deployment date

2. **Obtain Notify Credentials**
   - Sign up for Notify account
   - Add payment method
   - Get API keys

3. **Set Up Staging Environment**
   - Add Notify secrets to staging
   - Test with real mobile numbers
   - Validate entire flow

4. **Plan Deployment**
   - Choose low-traffic deployment window
   - Confirm on-call schedule
   - Print rollback plan

5. **Deploy to Production**
   - Follow deployment checklist
   - Monitor metrics closely
   - Document lessons learned
