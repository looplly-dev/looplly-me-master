// Google Analytics (gtag) Utility
// Provides type-safe analytics tracking functions

import {
  PageViewParams,
  ButtonClickParams,
  FormSubmissionParams,
  ErrorParams,
  ReferralParams,
  TransactionParams,
  AuthEventParams,
  SurveyEventParams,
  NavigationParams,
  EarningActivityParams,
  DataSharingParams,
  AnalyticsEvent
} from '@/types/analytics';

// Check if gtag is loaded
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

const isGtagLoaded = (): boolean => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

// Check if analytics is enabled (production or explicit enable)
const isAnalyticsEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check environment variable
  const enableAnalytics = import.meta.env.VITE_ENABLE_ANALYTICS;
  if (enableAnalytics === 'false') return false;
  
  // Enable in production or if explicitly enabled
  return import.meta.env.PROD || enableAnalytics === 'true';
};

// Base gtag wrapper
const gtag = (...args: any[]): void => {
  if (!isAnalyticsEnabled() || !isGtagLoaded()) {
    console.log('[Analytics Debug]', ...args);
    return;
  }
  
  window.gtag?.(...args);
};

// Page View Tracking
export const trackPageView = (path: string, title?: string): void => {
  gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href,
  });
};

// Button/CTA Click Tracking
export const trackButtonClick = (
  action: string,
  category: string,
  label?: string,
  value?: number
): void => {
  gtag('event', 'button_click', {
    event_category: category,
    event_label: label || action,
    event_action: action,
    value,
  });
};

// Form Submission Tracking
export const trackFormSubmission = (
  formName: string,
  success: boolean,
  errorMessage?: string
): void => {
  gtag('event', 'form_submit', {
    form_name: formName,
    success,
    error_message: errorMessage,
  });
};

// Error Tracking
export const trackError = (
  error: string,
  fatal: boolean = false,
  location?: string
): void => {
  gtag('event', 'error', {
    error_message: error,
    fatal,
    error_location: location,
  });
};

// Authentication Events
export const trackLogin = (method: string, success: boolean = true): void => {
  const event: AnalyticsEvent = success ? 'login_success' : 'login_failure';
  gtag('event', event, {
    method,
    success,
  });
};

export const trackLoginAttempt = (method: string = 'email'): void => {
  gtag('event', 'login_attempt', {
    method,
  });
};

export const trackSignup = (method: string, success: boolean = true): void => {
  const event: AnalyticsEvent = success ? 'signup_complete' : 'signup_failure';
  gtag('event', event, {
    method,
    success,
  });
};

export const trackSignupStart = (method: string = 'email'): void => {
  gtag('event', 'signup_start', {
    method,
  });
};

// OTP Events
export const trackOTPSubmit = (success: boolean = false): void => {
  const event: AnalyticsEvent = success ? 'otp_success' : 'otp_failure';
  gtag('event', event, {
    success,
  });
};

export const trackOTPResend = (): void => {
  gtag('event', 'otp_resend');
};

// Referral Events
export const trackReferral = (
  action: 'copy' | 'share' | 'generate',
  code?: string
): void => {
  const eventMap = {
    copy: 'referral_link_copy',
    share: 'referral_link_share',
    generate: 'referral_code_generate',
  };
  
  gtag('event', eventMap[action], {
    action,
    referral_code: code,
  });
};

// Earning Activity Events
export const trackEarningActivity = (
  activityType: 'survey' | 'video' | 'task' | 'data_sharing',
  action: 'click' | 'start' | 'complete',
  title?: string,
  rewardAmount?: number,
  provider?: string
): void => {
  const eventMap = {
    survey: `survey_${action}`,
    video: `video_${action}`,
    task: `task_${action}`,
    data_sharing: 'data_sharing_toggle',
  };
  
  gtag('event', eventMap[activityType] as AnalyticsEvent, {
    activity_type: activityType,
    activity_title: title,
    reward_amount: rewardAmount,
    provider,
  });
};

// Data Sharing Events
export const trackDataSharing = (
  dataType: string,
  optedIn: boolean,
  monthlyValue?: number
): void => {
  gtag('event', 'data_sharing_toggle', {
    data_type: dataType,
    opted_in: optedIn,
    monthly_value: monthlyValue,
  });
};

// Profile Events
export const trackProfileComplete = (): void => {
  gtag('event', 'profile_complete');
};

export const trackProfileUpdate = (section?: string): void => {
  gtag('event', 'profile_update', {
    section,
  });
};

// Settings Events
export const trackSettingsSave = (section?: string): void => {
  gtag('event', 'settings_save', {
    section,
  });
};

// Navigation Events
export const trackNavigation = (
  fromPage: string,
  toPage: string,
  navType: 'bottom_nav' | 'menu' | 'button' | 'link' = 'button'
): void => {
  gtag('event', 'navigation_click', {
    from_page: fromPage,
    to_page: toPage,
    nav_type: navType,
  });
};

// Community Events
export const trackCommunityPost = (action: 'create' | 'like' | 'comment'): void => {
  gtag('event', `community_post_${action}`);
};

// Daily Check-in
export const trackDailyCheckin = (streak: number, repGained: number): void => {
  gtag('event', 'daily_checkin', {
    streak_days: streak,
    rep_gained: repGained,
  });
};

// Transaction Events
export const trackTransaction = (
  transactionId: string,
  value: number,
  currency: string = 'USD',
  items?: Array<{ item_id: string; item_name: string; price: number }>
): void => {
  gtag('event', 'transaction', {
    transaction_id: transactionId,
    value,
    currency,
    items,
  });
};

// Custom Event (for any other events)
export const trackCustomEvent = (
  eventName: string,
  params?: Record<string, any>
): void => {
  gtag('event', eventName, params);
};

// Export all tracking functions
export const analytics = {
  trackPageView,
  trackButtonClick,
  trackFormSubmission,
  trackError,
  trackLogin,
  trackLoginAttempt,
  trackSignup,
  trackSignupStart,
  trackOTPSubmit,
  trackOTPResend,
  trackReferral,
  trackEarningActivity,
  trackDataSharing,
  trackProfileComplete,
  trackProfileUpdate,
  trackSettingsSave,
  trackNavigation,
  trackCommunityPost,
  trackDailyCheckin,
  trackTransaction,
  trackCustomEvent,
};
