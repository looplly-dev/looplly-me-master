export type IntegrationStatus = 'active' | 'mock' | 'configured' | 'not_configured' | 'error';

export type IntegrationCategory = 'analytics' | 'maps' | 'backend' | 'payments' | 'communications';

export interface IntegrationConfig {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  isRequired: boolean;
  configKeys: string[];
  configuredKeys: string[];
  features?: string[];
  documentationUrl?: string;
  setupGuideUrl?: string;
  healthCheck?: boolean;
  lastChecked?: Date;
  metadata?: Record<string, any>;
}

export interface IntegrationStatusResponse {
  integrations: IntegrationConfig[];
  summary: {
    total: number;
    active: number;
    mock: number;
    notConfigured: number;
    error: number;
  };
  lastUpdated: Date;
}
