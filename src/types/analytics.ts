// Google Analytics Event Types and Interfaces

export interface PageViewParams {
  page_path: string;
  page_title?: string;
  page_location?: string;
}

export interface ButtonClickParams {
  event_category: string;
  event_label?: string;
  value?: number;
}

export interface FormSubmissionParams {
  form_name: string;
  success: boolean;
  error_message?: string;
}

export interface ErrorParams {
  error_message: string;
  fatal?: boolean;
  error_location?: string;
}

export interface ReferralParams {
  action: 'copy' | 'share' | 'generate';
  referral_code?: string;
}

export interface TransactionParams {
  transaction_id: string;
  value: number;
  currency?: string;
  items?: Array<{
    item_id: string;
    item_name: string;
    price: number;
  }>;
}

export interface AuthEventParams {
  method: string;
  success?: boolean;
}

export interface SurveyEventParams {
  action: 'view' | 'start' | 'complete' | 'abandon';
  survey_id?: string;
  survey_title?: string;
  reward_amount?: number;
}

export interface NavigationParams {
  from_page: string;
  to_page: string;
  nav_type: 'bottom_nav' | 'menu' | 'button' | 'link';
}

export interface EarningActivityParams {
  activity_type: 'survey' | 'video' | 'task' | 'data_sharing';
  activity_title?: string;
  reward_amount?: number;
  provider?: string;
}

export interface DataSharingParams {
  data_type: string;
  opted_in: boolean;
  monthly_value?: number;
}

export type AnalyticsEvent =
  | 'page_view'
  | 'button_click'
  | 'form_submit'
  | 'login_attempt'
  | 'login_success'
  | 'login_failure'
  | 'signup_start'
  | 'signup_complete'
  | 'signup_failure'
  | 'otp_submit'
  | 'otp_resend'
  | 'otp_success'
  | 'otp_failure'
  | 'referral_link_copy'
  | 'referral_link_share'
  | 'referral_code_generate'
  | 'survey_click'
  | 'survey_start'
  | 'survey_complete'
  | 'video_click'
  | 'task_click'
  | 'data_sharing_toggle'
  | 'profile_complete'
  | 'profile_update'
  | 'settings_save'
  | 'navigation_click'
  | 'community_post_create'
  | 'daily_checkin'
  | 'error'
  | 'transaction';
