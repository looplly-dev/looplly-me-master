# Analytics Implementation Guide

## Overview

This document describes the Google Analytics (gtag.js) implementation in Looplly, including all tracked events, metrics, and how to extend analytics tracking.

**Analytics ID:** `G-S726PDNXJQ`

## Table of Contents

1. [Architecture](#architecture)
2. [Events Tracked by Page](#events-tracked-by-page)
3. [Event Reference](#event-reference)
4. [How to Add Analytics](#how-to-add-analytics)
5. [Testing & Debugging](#testing--debugging)
6. [Configuration](#configuration)

---

## Architecture

### Core Files

#### 1. **`src/types/analytics.ts`**
TypeScript definitions for all analytics events and parameters. Provides type safety for event tracking.

Key interfaces:
- `PageViewParams` - Page view tracking
- `ButtonClickParams` - Button/CTA clicks
- `AuthEventParams` - Authentication events
- `ReferralParams` - Referral actions
- `EarningActivityParams` - Earning activities
- `DataSharingParams` - Data sharing opt-ins
- And more...

#### 2. **`src/utils/analytics.ts`**
Core analytics utility functions that wrap gtag calls. All analytics tracking goes through these functions.

Key functions:
- `trackPageView(path, title)` - Page views
- `trackButtonClick(action, category, label, value)` - Button clicks
- `trackLogin(method, success)` - Login events
- `trackSignup(method, success)` - Signup events
- `trackReferral(action, code)` - Referral events
- `trackEarningActivity(type, action, title, amount)` - Earning events
- `trackDataSharing(type, optedIn, value)` - Data sharing
- `trackDailyCheckin(streak, rep)` - Daily check-ins
- `trackNavigation(from, to, navType)` - Navigation
- And more...

#### 3. **`src/hooks/useAnalytics.ts`**
React hook that automatically tracks page views on route changes. Returns all analytics functions for manual tracking.

Usage:
```typescript
const analytics = useAnalytics();
// Page views are tracked automatically
```

#### 4. **`index.html`**
Contains the gtag.js script tag that loads Google Analytics.

---

## Events Tracked by Page

### Authentication Flow

#### **Login Page** (`src/components/auth/Login.tsx`)

| Event | Trigger | Parameters |
|-------|---------|------------|
| `login_attempt` | User clicks "Sign In" button | `method: 'email'` |
| `login_success` | Login successful | `method: 'email', success: true` |
| `login_failure` | Login failed | `method: 'email', success: false` |
| `button_click` | "Create account" link clicked | `event_category: 'authentication', event_label: 'from_login'` |
| `button_click` | "Forgot Password" clicked | `event_category: 'authentication'` |

#### **Register Page** (`src/components/auth/Register.tsx`)

| Event | Trigger | Parameters |
|-------|---------|------------|
| `signup_start` | User submits registration form | `method: 'email'` |
| `signup_complete` | Registration successful | `method: 'email', success: true` |
| `signup_failure` | Registration failed | `method: 'email', success: false` |

#### **OTP Verification** (`src/components/auth/OTPVerification.tsx`)

| Event | Trigger | Parameters |
|-------|---------|------------|
| `otp_success` | OTP verified successfully | `success: true` |
| `otp_failure` | OTP verification failed | `success: false` |
| `otp_resend` | User clicks "Resend Code" | - |

---

### Dashboard Pages

#### **Earn Tab** (`src/components/dashboard/SimplifiedEarnTab.tsx`)

| Event | Trigger | Parameters |
|-------|---------|------------|
| `daily_checkin` | User completes daily check-in | `streak_days: number, rep_gained: number` |
| `survey_click` | User clicks on a survey | `activity_type: 'survey', activity_title, reward_amount, provider` |
| `video_click` | User clicks on a video | `activity_type: 'video', activity_title, reward_amount, provider` |
| `task_click` | User clicks on a task | `activity_type: 'task', activity_title, reward_amount, provider` |
| `data_sharing_toggle` | User toggles data sharing | `data_type, opted_in: boolean, monthly_value` |
| `profile_complete` | User clicks "Complete Profile Now" | - |

**Data Sharing Types Tracked:**
- `shopping behavior` ($0.10/month)
- `app usage` ($0.08/month)
- `cookie tracking` ($0.05/month)
- `browsing behavior` ($0.12/month)
- `search history` ($0.08/month)
- `cross-site tracking` ($0.15/month)
- `advertising preferences` ($0.06/month)
- `social media activity` ($0.18/month)
- `e-commerce behavior` ($0.22/month)
- `financial behavior` ($0.25/month)
- `browser history` ($0.05/month)

#### **Wallet Tab** (`src/pages/Wallet.tsx`)

| Event | Trigger | Parameters |
|-------|---------|------------|
| `page_view` | User navigates to wallet | `page_path: '/wallet'` |

*Note: Transaction events are tracked but not yet implemented in the UI*

#### **Profile Tab** (`src/pages/Profile.tsx`)

| Event | Trigger | Parameters |
|-------|---------|------------|
| `page_view` | User navigates to profile | `page_path: '/profile'` |
| `profile_update` | User updates profile (future) | `section: string` |

#### **Refer Tab** (`src/pages/Refer.tsx`)

| Event | Trigger | Parameters |
|-------|---------|------------|
| `page_view` | User navigates to refer page | `page_path: '/refer'` |
| `referral_link_copy` | User copies referral link | `action: 'copy', referral_code` |
| `referral_link_share` | User shares referral link | `action: 'share', referral_code` |
| `referral_code_generate` | User generates new code | `action: 'generate'` |

*Note: Referral events are defined in ReferTab component*

#### **Community Tab** (`src/components/dashboard/CommunityTab.tsx`)

| Event | Trigger | Parameters |
|-------|---------|------------|
| `page_view` | User navigates to community | `page_path: '/community'` |
| `community_post_create` | User creates a new post | - |

#### **Rep Tab** (`src/pages/Rep.tsx`)

| Event | Trigger | Parameters |
|-------|---------|------------|
| `page_view` | User navigates to rep page | `page_path: '/rep'` |

---

### Settings & Support

#### **Settings Page** (`src/components/dashboard/SettingsTab.tsx`)

| Event | Trigger | Parameters |
|-------|---------|------------|
| `page_view` | User navigates to settings | `page_path: '/settings'` |
| `settings_save` | User saves settings | `section: 'profile'` |

#### **Support Page** (`src/pages/Support.tsx`)

| Event | Trigger | Parameters |
|-------|---------|------------|
| `page_view` | User navigates to support | `page_path: '/support'` |

---

### Navigation

#### **Bottom Navigation** (`src/components/dashboard/DashboardLayout.tsx`)

| Event | Trigger | Parameters |
|-------|---------|------------|
| `navigation_click` | User clicks bottom nav item | `from_page: string, to_page: string, nav_type: 'bottom_nav'` |

**Navigation Items:**
- Earn (`/`)
- Wallet (`/wallet`)
- Profile (`/profile`)
- Refer (`/refer`)
- Community (`/community`)
- Rep (`/rep`)

---

## Event Reference

### Complete Event List

| Event Name | Category | Description |
|------------|----------|-------------|
| `page_view` | Navigation | Automatic page view tracking |
| `button_click` | Interaction | Generic button/CTA clicks |
| `form_submit` | Form | Form submission events |
| `login_attempt` | Authentication | User initiates login |
| `login_success` | Authentication | Successful login |
| `login_failure` | Authentication | Failed login attempt |
| `signup_start` | Authentication | User starts registration |
| `signup_complete` | Authentication | Successful registration |
| `signup_failure` | Authentication | Failed registration |
| `otp_submit` | Authentication | OTP submission |
| `otp_success` | Authentication | OTP verified |
| `otp_failure` | Authentication | OTP verification failed |
| `otp_resend` | Authentication | OTP resend requested |
| `referral_link_copy` | Referral | Referral link copied |
| `referral_link_share` | Referral | Referral link shared |
| `referral_code_generate` | Referral | New referral code generated |
| `survey_click` | Earning | Survey clicked |
| `video_click` | Earning | Video clicked |
| `task_click` | Earning | Task clicked |
| `data_sharing_toggle` | Data Sharing | Data sharing opt-in/out |
| `profile_complete` | Profile | Profile completion prompt |
| `profile_update` | Profile | Profile updated |
| `settings_save` | Settings | Settings saved |
| `navigation_click` | Navigation | Navigation item clicked |
| `community_post_create` | Community | Community post created |
| `daily_checkin` | Engagement | Daily check-in completed |
| `error` | Error | Application error |
| `transaction` | Financial | Transaction event |

---

## How to Add Analytics

### 1. Import the analytics utility

```typescript
import { analytics } from '@/utils/analytics';
```

### 2. Track events in your component

#### Button Click Example
```typescript
<Button onClick={() => {
  analytics.trackButtonClick('submit_form', 'contact', 'footer_form');
  handleSubmit();
}}>
  Submit
</Button>
```

#### Custom Event Example
```typescript
const handleFeatureUse = () => {
  analytics.trackCustomEvent('feature_used', {
    feature_name: 'advanced_filter',
    user_level: 'premium'
  });
};
```

#### Earning Activity Example
```typescript
const handleSurveyClick = (survey) => {
  analytics.trackEarningActivity(
    'survey',
    'click',
    survey.title,
    survey.reward_amount,
    survey.provider
  );
  openSurvey(survey.id);
};
```

### 3. Page View Tracking (Automatic)

Page views are tracked automatically via the `useAnalytics()` hook in `App.tsx`. No manual tracking needed for route changes.

---

## Testing & Debugging

### Development Mode

By default, analytics is disabled in development unless explicitly enabled:

```bash
# In .env
VITE_ENABLE_ANALYTICS=true
```

In development, all analytics calls are logged to console:
```
[Analytics Debug] event page_view { page_path: '/', ... }
```

### Production Verification

1. **Browser Console**
   - Open DevTools → Console
   - Look for `gtag` calls
   - Check for errors

2. **Network Tab**
   - Open DevTools → Network
   - Filter by `google-analytics.com`
   - Verify requests are being sent

3. **GA4 DebugView**
   - Go to GA4 Dashboard → Configure → DebugView
   - Enable debug mode by adding `?debug_mode=true` to URL
   - See events in real-time

4. **Real-Time Reports**
   - GA4 Dashboard → Reports → Realtime
   - Verify events appear within 30 seconds

### Common Issues

**Issue:** Events not showing in GA4
- **Solution:** Check if `VITE_ENABLE_ANALYTICS` is set in production
- **Solution:** Verify gtag script is loaded (check network tab)
- **Solution:** Check browser ad blockers aren't blocking GA

**Issue:** Page views not tracked
- **Solution:** Ensure `useAnalytics()` is called in App.tsx
- **Solution:** Check if BrowserRouter is wrapping routes correctly

**Issue:** Events logged to console but not sent
- **Solution:** Enable analytics by setting `VITE_ENABLE_ANALYTICS=true`

---

## Configuration

### Environment Variables

```bash
# Enable/disable analytics
VITE_ENABLE_ANALYTICS=true  # Enable in production
VITE_ENABLE_ANALYTICS=false # Disable analytics
```

### Analytics Behavior

| Environment | Behavior |
|-------------|----------|
| Development | Disabled by default (console logs only) |
| Production | Enabled by default |
| Testing | Always disabled |

### Enabling in Development

To test analytics in development:

1. Add to `.env`:
   ```
   VITE_ENABLE_ANALYTICS=true
   ```

2. Restart dev server:
   ```bash
   npm run dev
   ```

3. Check browser console for analytics events

---

## Best Practices

### 1. Event Naming
- Use lowercase with underscores: `button_click`, `form_submit`
- Be specific but consistent: `referral_link_copy`, `referral_link_share`
- Include context: `login_success`, `login_failure`

### 2. Event Parameters
- Always include relevant context (category, label, value)
- Use consistent parameter names across similar events
- Include monetary values for earning-related events

### 3. Privacy & Compliance
- Never track PII (Personally Identifiable Information)
- Don't send email addresses, phone numbers, or full names
- Use user IDs if needed (handled by GA automatically)

### 4. Performance
- Analytics calls are non-blocking
- Failed analytics don't affect app functionality
- All tracking is async

---

## Future Enhancements

### Planned Events
- [ ] Survey completion tracking
- [ ] Video watch time
- [ ] Task completion rate
- [ ] Referral conversion tracking
- [ ] Payout request tracking
- [ ] Error tracking with stack traces
- [ ] Performance metrics (page load time, etc.)

### Potential Integrations
- [ ] Facebook Pixel
- [ ] LinkedIn Insight Tag
- [ ] Hotjar for heatmaps
- [ ] Custom analytics dashboard

---

## Support

For questions about analytics implementation:
1. Check this documentation
2. Review `src/utils/analytics.ts` for available functions
3. Check GA4 documentation: https://support.google.com/analytics
4. Contact development team

---

## Changelog

### v1.0.0 (Current)
- Initial implementation with Google Analytics gtag.js
- Automatic page view tracking
- Authentication flow tracking
- Earning activities tracking
- Referral tracking
- Navigation tracking
- Community engagement tracking
- Data sharing opt-in tracking
- Daily check-in tracking

---

**Last Updated:** 2025-10-21  
**Maintained by:** Development Team  
**Analytics ID:** G-S726PDNXJQ
