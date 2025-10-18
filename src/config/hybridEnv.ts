import { z } from 'zod';
import { remoteConfig } from '../services/remoteConfig';

/**
 * Hybrid Environment Configuration
 * 
 * This configuration system tries to load environment variables from:
 * 1. Local environment variables (import.meta.env)
 * 2. Remote configuration stored in Supabase
 * 3. Sensible defaults
 * 
 * This ensures the app works in all deployment scenarios.
 */

// Core Supabase config that must be available locally for bootstrap
const coreSupabaseSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().regex(/^eyJ[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*$/),
  VITE_SUPABASE_PROJECT_ID: z.string().regex(/^[a-z0-9]{20}$/),
});

// Extended configuration schema including optional values
const extendedConfigSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string(),
  VITE_SUPABASE_PROJECT_ID: z.string(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  VITE_SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  VITE_ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('false'),
  VITE_ENABLE_DEBUG: z.string().transform(val => val === 'true').default('false'),
  VITE_API_BASE_URL: z.string().url().optional(),
  VITE_API_TIMEOUT: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1000).max(120000)).default('30000'),
  VITE_CAPACITOR_PLATFORM: z.enum(['web', 'ios', 'android']).default('web'),
  VITE_GOOGLE_PLACES_API_KEY: z.string().optional(),
  VITE_USE_MOCK_PLACES: z.string().transform(val => val === 'true').default('true'),
});

export type HybridConfig = z.infer<typeof extendedConfigSchema>;

export class HybridEnvironmentConfig {
  private static instance: HybridEnvironmentConfig;
  private coreConfig: z.infer<typeof coreSupabaseSchema> | null = null;
  private fullConfig: HybridConfig | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): HybridEnvironmentConfig {
    if (!HybridEnvironmentConfig.instance) {
      HybridEnvironmentConfig.instance = new HybridEnvironmentConfig();
    }
    return HybridEnvironmentConfig.instance;
  }

  /**
   * Initialize with minimal config needed to bootstrap Supabase connection
   */
  public bootstrapCore(): z.infer<typeof coreSupabaseSchema> {
    if (this.coreConfig) {
      return this.coreConfig;
    }

    try {
      const env = {
        VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
        VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        VITE_SUPABASE_PROJECT_ID: import.meta.env.VITE_SUPABASE_PROJECT_ID,
      };

      this.coreConfig = coreSupabaseSchema.parse(env);
      
      // Initialize remote config service with core credentials
      remoteConfig.initialize(this.coreConfig.VITE_SUPABASE_URL, this.coreConfig.VITE_SUPABASE_PUBLISHABLE_KEY);
      
      return this.coreConfig;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        throw new Error(
          `Core Supabase configuration missing or invalid. Please ensure these environment variables are set in your deployment:\n${errorMessages.join('\n')}\n\nFor Netlify, add these in Site Settings > Environment Variables.`
        );
      }
      throw error;
    }
  }

  /**
   * Initialize full configuration (async, loads from remote if needed)
   */
  public async initialize(): Promise<HybridConfig> {
    if (this.fullConfig && this.isInitialized) {
      return this.fullConfig;
    }

    if (this.initializationPromise) {
      await this.initializationPromise;
      return this.fullConfig!;
    }

    this.initializationPromise = this._initializeAsync();
    await this.initializationPromise;
    return this.fullConfig!;
  }

  private async _initializeAsync(): Promise<void> {
    try {
      // Ensure core config is bootstrapped
      const coreConfig = this.bootstrapCore();

      // Get all configuration values (local + remote)
      const allConfig = await remoteConfig.getAllConfig();
      
      // Merge with defaults and validate
      const configToValidate = {
        ...allConfig,
        VITE_SUPABASE_URL: coreConfig.VITE_SUPABASE_URL,
        VITE_SUPABASE_PUBLISHABLE_KEY: coreConfig.VITE_SUPABASE_PUBLISHABLE_KEY,
        VITE_SUPABASE_PROJECT_ID: coreConfig.VITE_SUPABASE_PROJECT_ID,
      };

      this.fullConfig = extendedConfigSchema.parse(configToValidate);
      this.isInitialized = true;
      
      console.log('✅ Hybrid environment configuration initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize hybrid environment configuration:', error);
      
      // Fallback to core config with defaults
      const coreConfig = this.bootstrapCore();
      this.fullConfig = {
        ...coreConfig,
        NODE_ENV: (import.meta.env.NODE_ENV as any) || 'production',
        VITE_ENABLE_ANALYTICS: false,
        VITE_ENABLE_DEBUG: import.meta.env.NODE_ENV === 'development',
        VITE_API_TIMEOUT: 30000,
        VITE_CAPACITOR_PLATFORM: 'web' as const,
      };
      
      console.warn('⚠️ Using fallback configuration due to initialization failure');
    }
  }

  /**
   * Get the current configuration (may be incomplete if not fully initialized)
   */
  public getCurrent(): HybridConfig | null {
    return this.fullConfig;
  }

  /**
   * Get core Supabase configuration (always available after bootstrap)
   */
  public getCore(): z.infer<typeof coreSupabaseSchema> {
    if (!this.coreConfig) {
      return this.bootstrapCore();
    }
    return this.coreConfig;
  }

  /**
   * Get configuration, initializing if necessary
   */
  public async get(): Promise<HybridConfig> {
    if (!this.fullConfig || !this.isInitialized) {
      return await this.initialize();
    }
    return this.fullConfig;
  }

  /**
   * Force refresh configuration from remote
   */
  public async refresh(): Promise<HybridConfig> {
    this.isInitialized = false;
    this.initializationPromise = null;
    remoteConfig.clearCache();
    return await this.initialize();
  }

  // Convenience methods
  public async isDevelopment(): Promise<boolean> {
    const config = await this.get();
    return config.NODE_ENV === 'development';
  }

  public async isProduction(): Promise<boolean> {
    const config = await this.get();
    return config.NODE_ENV === 'production';
  }

  public async isTest(): Promise<boolean> {
    const config = await this.get();
    return config.NODE_ENV === 'test';
  }

  public async getSupabaseConfig() {
    const config = await this.get();
    return {
      url: config.VITE_SUPABASE_URL,
      publishableKey: config.VITE_SUPABASE_PUBLISHABLE_KEY,
      projectId: config.VITE_SUPABASE_PROJECT_ID,
      serviceRoleKey: config.VITE_SUPABASE_SERVICE_ROLE_KEY,
    };
  }

  public async getFeatureFlags() {
    const config = await this.get();
    return {
      enableAnalytics: config.VITE_ENABLE_ANALYTICS,
      enableDebug: config.VITE_ENABLE_DEBUG,
    };
  }

  public async getApiConfig() {
    const config = await this.get();
    return {
      baseUrl: config.VITE_API_BASE_URL ?? config.VITE_SUPABASE_URL,
      timeout: config.VITE_API_TIMEOUT,
    };
  }
}

// Export singleton instance
export const hybridEnv = HybridEnvironmentConfig.getInstance();

// Bootstrap core configuration immediately (synchronous)
export const coreSupabaseConfig = hybridEnv.getCore();