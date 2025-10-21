import { supabase } from '@/integrations/supabase/client';
import type { IntegrationConfig, IntegrationStatusResponse, IntegrationStatus } from '@/types/integrations';

class IntegrationStatusService {
  private checkGoogleAnalytics(): IntegrationConfig {
    const isEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
    const hasGtag = typeof window !== 'undefined' && 'gtag' in window;
    
    const status: IntegrationStatus = isEnabled && hasGtag ? 'active' : 'not_configured';
    
    return {
      id: 'google-analytics',
      name: 'Google Analytics',
      description: 'User behavior tracking and analytics',
      category: 'analytics',
      status,
      isRequired: false,
      configKeys: ['VITE_ENABLE_ANALYTICS'],
      configuredKeys: isEnabled ? ['VITE_ENABLE_ANALYTICS'] : [],
      metadata: {
        trackingId: 'G-S726PDNXJQ',
        eventsTracked: 15
      },
      documentationUrl: '/docs/ANALYTICS.md',
      healthCheck: hasGtag,
      lastChecked: new Date()
    };
  }

  private checkGooglePlaces(): IntegrationConfig {
    const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
    const useMock = import.meta.env.VITE_USE_MOCK_PLACES === 'true';
    
    let status: IntegrationStatus;
    if (apiKey && !useMock) {
      status = 'active';
    } else if (useMock || !apiKey) {
      status = 'mock';
    } else {
      status = 'not_configured';
    }
    
    return {
      id: 'google-places',
      name: 'Google Places API',
      description: 'Address autocomplete and geolocation services',
      category: 'maps',
      status,
      isRequired: false,
      configKeys: ['VITE_GOOGLE_PLACES_API_KEY', 'VITE_USE_MOCK_PLACES'],
      configuredKeys: apiKey ? ['VITE_GOOGLE_PLACES_API_KEY'] : [],
      features: ['Address Autocomplete', 'Place Details', 'Geocoding'],
      metadata: {
        mockMode: useMock || !apiKey,
        note: !apiKey ? 'Currently using mock data for development' : undefined
      },
      healthCheck: true,
      lastChecked: new Date()
    };
  }

  private checkLovableCloud(): IntegrationConfig {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    
    const isConfigured = !!(supabaseUrl && supabaseKey && projectId);
    
    return {
      id: 'lovable-cloud',
      name: 'Lovable Cloud',
      description: 'Backend infrastructure (Database, Auth, Storage, Edge Functions)',
      category: 'backend',
      status: isConfigured ? 'active' : 'error',
      isRequired: true,
      configKeys: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY', 'VITE_SUPABASE_PROJECT_ID'],
      configuredKeys: isConfigured ? ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY', 'VITE_SUPABASE_PROJECT_ID'] : [],
      features: [
        'User Authentication',
        'PostgreSQL Database',
        'File Storage',
        'Edge Functions',
        'Realtime Updates'
      ],
      metadata: {
        projectId: projectId ? `${projectId.substring(0, 8)}...` : 'Not configured',
        url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'Not configured'
      },
      healthCheck: isConfigured,
      lastChecked: new Date()
    };
  }

  private checkEmailService(): IntegrationConfig {
    return {
      id: 'email-service',
      name: 'Email Service',
      description: 'Transactional email delivery (Resend)',
      category: 'communications',
      status: 'not_configured',
      isRequired: false,
      configKeys: ['RESEND_API_KEY'],
      configuredKeys: [],
      features: ['Transactional Emails', 'Email Templates', 'Delivery Tracking'],
      metadata: {
        note: 'Configure in edge functions for email functionality'
      },
      healthCheck: false,
      lastChecked: new Date()
    };
  }

  private checkPaymentGateway(): IntegrationConfig {
    return {
      id: 'payment-gateway',
      name: 'Payment Gateway',
      description: 'Payment processing for redemptions (Stripe/Razorpay)',
      category: 'payments',
      status: 'not_configured',
      isRequired: false,
      configKeys: ['STRIPE_SECRET_KEY', 'RAZORPAY_KEY_ID'],
      configuredKeys: [],
      features: ['Payment Processing', 'Refunds', 'Webhooks', 'Subscription Management'],
      metadata: {
        note: 'Required for redemption functionality'
      },
      healthCheck: false,
      lastChecked: new Date()
    };
  }

  private checkSMSService(): IntegrationConfig {
    return {
      id: 'sms-service',
      name: 'SMS Service',
      description: 'OTP and SMS notifications (Twilio)',
      category: 'communications',
      status: 'not_configured',
      isRequired: false,
      configKeys: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN'],
      configuredKeys: [],
      features: ['OTP Delivery', 'SMS Notifications', 'Two-Factor Authentication'],
      metadata: {
        note: 'Optional for enhanced security'
      },
      healthCheck: false,
      lastChecked: new Date()
    };
  }

  private checkAIProvider(): IntegrationConfig {
    const apiKey = import.meta.env.VITE_AI_PROVIDER_API_KEY;
    const useMock = import.meta.env.VITE_USE_MOCK_AI === 'true';
    const provider = import.meta.env.VITE_AI_PROVIDER || 'not_set';
    
    let status: IntegrationStatus;
    if (apiKey && !useMock) {
      status = 'active';
    } else if (useMock || !apiKey) {
      status = 'mock';
    } else {
      status = 'not_configured';
    }
    
    return {
      id: 'ai-provider',
      name: 'AI Provider',
      description: 'AI model for generating country-specific profiling options',
      category: 'ai',
      status,
      isRequired: false,
      configKeys: ['VITE_AI_PROVIDER_API_KEY', 'VITE_AI_PROVIDER', 'VITE_USE_MOCK_AI'],
      configuredKeys: apiKey ? ['VITE_AI_PROVIDER_API_KEY', 'VITE_AI_PROVIDER'] : [],
      features: ['Country Options Generation', 'Income Range Research', 'Brand Research', 'Market Data Localization'],
      metadata: {
        mockMode: useMock || !apiKey,
        provider: provider,
        note: !apiKey ? 'Currently using mock data for development' : undefined
      },
      documentationUrl: '/docs/PROFILING/AI_GENERATION_PROMPTS.md',
      healthCheck: true,
      lastChecked: new Date()
    };
  }

  private async checkEarningRules(): Promise<IntegrationConfig> {
    try {
      const { data, error } = await supabase
        .from('earning_rules')
        .select('id, rule_key, rule_name, is_active, updated_at')
        .eq('is_active', true);

      if (error) throw error;

      const activeCount = data?.length || 0;
      const lastUpdated = data?.[0]?.updated_at 
        ? new Date(data[0].updated_at).toLocaleDateString()
        : 'Never';

      return {
        id: 'earning-rules',
        name: 'Earning Rules',
        description: 'Business rules controlling how users earn points and unlock features',
        category: 'rulesets',
        status: activeCount > 0 ? 'active' : 'not_configured',
        isRequired: true,
        configKeys: [],
        configuredKeys: [],
        features: ['Mobile Verification Gates', 'Stage Unlock Thresholds', 'Profile Completion Bonuses', 'Activity Limits'],
        metadata: {
          activeRules: activeCount,
          lastUpdated,
          manageUrl: '/admin/earning-rules'
        },
        setupGuideUrl: '/admin/earning-rules',
        healthCheck: true,
        lastChecked: new Date()
      };
    } catch (error) {
      console.error('Failed to check earning rules:', error);
      return {
        id: 'earning-rules',
        name: 'Earning Rules',
        description: 'Business rules controlling how users earn points and unlock features',
        category: 'rulesets',
        status: 'error',
        isRequired: true,
        configKeys: [],
        configuredKeys: [],
        metadata: {
          error: 'Failed to load earning rules'
        },
        healthCheck: false,
        lastChecked: new Date()
      };
    }
  }

  private async checkStreakConfig(): Promise<IntegrationConfig> {
    try {
      const { data, error } = await supabase
        .from('streak_unlock_config')
        .select('id, stage, config_key, is_active, updated_at')
        .eq('is_active', true);

      if (error) throw error;

      const activeCount = data?.length || 0;
      const stages = [...new Set(data?.map(d => d.stage) || [])];
      const lastUpdated = data?.[0]?.updated_at 
        ? new Date(data[0].updated_at).toLocaleDateString()
        : 'Never';

      return {
        id: 'streak-config',
        name: 'Streak Configuration',
        description: 'Configure streak-based unlocks and stage progression rules',
        category: 'rulesets',
        status: activeCount > 0 ? 'active' : 'not_configured',
        isRequired: true,
        configKeys: [],
        configuredKeys: [],
        features: ['Stage Unlock Rules', 'Streak Milestones', 'Grace Periods', 'Progression Thresholds'],
        metadata: {
          activeConfigs: activeCount,
          stages: stages.join(', '),
          lastUpdated,
          manageUrl: '/admin/streak-config'
        },
        setupGuideUrl: '/admin/streak-config',
        healthCheck: true,
        lastChecked: new Date()
      };
    } catch (error) {
      console.error('Failed to check streak config:', error);
      return {
        id: 'streak-config',
        name: 'Streak Configuration',
        description: 'Configure streak-based unlocks and stage progression rules',
        category: 'rulesets',
        status: 'error',
        isRequired: true,
        configKeys: [],
        configuredKeys: [],
        metadata: {
          error: 'Failed to load streak configuration'
        },
        healthCheck: false,
        lastChecked: new Date()
      };
    }
  }

  private async checkProfileDecay(): Promise<IntegrationConfig> {
    try {
      const { data, error } = await supabase
        .from('profile_decay_config')
        .select('id, config_key, interval_type, interval_days, is_active, updated_at')
        .eq('is_active', true);

      if (error) throw error;

      const activeCount = data?.length || 0;
      const intervalTypes = [...new Set(data?.map(d => d.interval_type) || [])];
      const lastUpdated = data?.[0]?.updated_at 
        ? new Date(data[0].updated_at).toLocaleDateString()
        : 'Never';

      return {
        id: 'profile-decay',
        name: 'Profile Decay Configuration',
        description: 'Manage data freshness rules and automatic profile data expiration',
        category: 'rulesets',
        status: activeCount > 0 ? 'active' : 'not_configured',
        isRequired: false,
        configKeys: [],
        configuredKeys: [],
        features: ['Data Freshness Rules', 'Automatic Staleness Detection', 'Decay Intervals', 'Profile Refresh Prompts'],
        metadata: {
          activeConfigs: activeCount,
          intervalTypes: intervalTypes.join(', '),
          lastUpdated,
          manageUrl: '/admin/profile-decay'
        },
        setupGuideUrl: '/admin/profile-decay',
        healthCheck: true,
        lastChecked: new Date()
      };
    } catch (error) {
      console.error('Failed to check profile decay config:', error);
      return {
        id: 'profile-decay',
        name: 'Profile Decay Configuration',
        description: 'Manage data freshness rules and automatic profile data expiration',
        category: 'rulesets',
        status: 'error',
        isRequired: false,
        configKeys: [],
        configuredKeys: [],
        metadata: {
          error: 'Failed to load profile decay configuration'
        },
        healthCheck: false,
        lastChecked: new Date()
      };
    }
  }

  async getIntegrationStatus(): Promise<IntegrationStatusResponse> {
    const integrations: IntegrationConfig[] = [
      this.checkGoogleAnalytics(),
      this.checkGooglePlaces(),
      this.checkLovableCloud(),
      this.checkAIProvider(),
      this.checkEmailService(),
      this.checkPaymentGateway(),
      this.checkSMSService(),
      await this.checkEarningRules(),
      await this.checkStreakConfig(),
      await this.checkProfileDecay()
    ];

    const summary = {
      total: integrations.length,
      active: integrations.filter(i => i.status === 'active').length,
      mock: integrations.filter(i => i.status === 'mock').length,
      notConfigured: integrations.filter(i => i.status === 'not_configured').length,
      error: integrations.filter(i => i.status === 'error').length
    };

    return {
      integrations,
      summary,
      lastUpdated: new Date()
    };
  }

  async testConnection(integrationId: string): Promise<{ success: boolean; message: string }> {
    switch (integrationId) {
      case 'lovable-cloud':
        try {
          const { error } = await supabase.from('profiles').select('count').limit(1);
          if (error) throw error;
          return { success: true, message: 'Connection successful' };
        } catch (error) {
          return { success: false, message: 'Connection failed' };
        }
      
      case 'google-analytics':
        const hasGtag = typeof window !== 'undefined' && 'gtag' in window;
        return {
          success: hasGtag,
          message: hasGtag ? 'Analytics loaded successfully' : 'Analytics not loaded'
        };
      
      default:
        return { success: false, message: 'Test not implemented for this integration' };
    }
  }
}

export const integrationStatusService = new IntegrationStatusService();
