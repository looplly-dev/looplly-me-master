import { z } from 'zod';

/**
 * Hybrid Environment Configuration System
 * 
 * Simplified two-tier configuration:
 * 1. Public config: Netlify environment variables (VITE_* and NODE_ENV)
 * 2. Private secrets: Supabase Vault (accessed server-side in edge functions only)
 * 
 * This system removes the complexity of app_secrets table and remote config,
 * standardizing on Supabase Vault for all sensitive API keys.
 */

// Core Supabase configuration (required for bootstrap)
const coreSupabaseSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  VITE_SUPABASE_PROJECT_ID: z.string().min(1),
});

// Extended configuration schema with defaults and transformations
const extendedConfigSchema = z.object({
  // Core Supabase (required)
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  VITE_SUPABASE_PROJECT_ID: z.string().min(1),
  
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  
  // Feature flags
  VITE_ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('false'),
  VITE_ENABLE_DEBUG: z.string().transform(val => val === 'true').default('false'),
  
  // API configuration
  VITE_API_BASE_URL: z.string().url().optional(),
  VITE_API_TIMEOUT: z.string().transform(Number).default('30000'),
  
  // Capacitor
  VITE_CAPACITOR_PLATFORM: z.enum(['web', 'ios', 'android']).default('web'),
  
  // Google Places (optional, can use mock mode)
  VITE_GOOGLE_PLACES_API_KEY: z.string().optional(),
  VITE_USE_MOCK_PLACES: z.string().transform(val => val === 'true').default('false'),
  
  // AI Provider (optional, can use mock mode)
  VITE_AI_PROVIDER: z.enum(['openai', 'anthropic', 'google']).optional(),
  VITE_AI_PROVIDER_API_KEY: z.string().optional(),
  VITE_USE_MOCK_AI: z.string().transform(val => val === 'true').default('false'),
});

export type HybridConfig = z.infer<typeof extendedConfigSchema>;

/**
 * Hybrid Environment Configuration Manager
 * Simplified to use only local environment variables and Supabase Vault
 */
class HybridEnvironmentConfig {
  private static instance: HybridEnvironmentConfig;
  private config: HybridConfig | null = null;
  private coreConfig: z.infer<typeof coreSupabaseSchema> | null = null;

  private constructor() {}

  public static getInstance(): HybridEnvironmentConfig {
    if (!HybridEnvironmentConfig.instance) {
      HybridEnvironmentConfig.instance = new HybridEnvironmentConfig();
    }
    return HybridEnvironmentConfig.instance;
  }

  /**
   * Bootstrap core Supabase configuration (synchronous)
   * This is called immediately on module load
   */
  public bootstrapCore(): z.infer<typeof coreSupabaseSchema> {
    if (this.coreConfig) return this.coreConfig;

    const rawEnv = {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      VITE_SUPABASE_PROJECT_ID: import.meta.env.VITE_SUPABASE_PROJECT_ID,
    };

    const result = coreSupabaseSchema.safeParse(rawEnv);
    
    if (!result.success) {
      console.error('Core Supabase configuration validation failed:', result.error.format());
      throw new Error(
        'Missing required Supabase configuration. Please ensure VITE_SUPABASE_URL, ' +
        'VITE_SUPABASE_PUBLISHABLE_KEY, and VITE_SUPABASE_PROJECT_ID are set.'
      );
    }

    this.coreConfig = result.data;
    return this.coreConfig;
  }

  /**
   * Initialize full configuration (async)
   * Loads from local environment variables only
   */
  public async initialize(): Promise<HybridConfig> {
    if (this.config) return this.config;

    try {
      // Gather all environment variables
      const localEnv = this.getAllLocalEnvVars();

      // Validate and transform
      const result = extendedConfigSchema.safeParse(localEnv);
      
      if (!result.success) {
        console.error('Configuration validation failed:', result.error.format());
        throw new Error('Invalid configuration. Check console for details.');
      }

      this.config = result.data;
      console.log('✅ Configuration loaded successfully');
      return this.config;

    } catch (error) {
      console.error('Failed to initialize configuration:', error);
      
      // Fallback: Use core config + defaults
      const coreConfig = this.bootstrapCore();
      const fallbackConfig = extendedConfigSchema.parse({
        ...coreConfig,
        NODE_ENV: 'production',
      });
      
      this.config = fallbackConfig;
      console.warn('⚠️ Using fallback configuration');
      return this.config;
    }
  }

  /**
   * Get current configuration (initializes if needed)
   */
  public async get(): Promise<HybridConfig> {
    if (!this.config) {
      return await this.initialize();
    }
    return this.config;
  }

  /**
   * Force refresh configuration
   */
  public async refresh(): Promise<HybridConfig> {
    this.config = null;
    return await this.initialize();
  }

  /**
   * Helper: Check if development mode
   */
  public isDevelopment(): boolean {
    return this.config?.NODE_ENV === 'development';
  }

  /**
   * Helper: Check if production mode
   */
  public isProduction(): boolean {
    return this.config?.NODE_ENV === 'production';
  }

  /**
   * Helper: Get Supabase configuration
   */
  public getSupabaseConfig() {
    const config = this.coreConfig || this.bootstrapCore();
    return {
      url: config.VITE_SUPABASE_URL,
      publishableKey: config.VITE_SUPABASE_PUBLISHABLE_KEY,
      projectId: config.VITE_SUPABASE_PROJECT_ID,
    };
  }

  /**
   * Helper: Get feature flags
   */
  public async getFeatureFlags() {
    const config = await this.get();
    return {
      analyticsEnabled: config.VITE_ENABLE_ANALYTICS,
      debugEnabled: config.VITE_ENABLE_DEBUG,
      useMockPlaces: config.VITE_USE_MOCK_PLACES,
      useMockAI: config.VITE_USE_MOCK_AI,
    };
  }

  /**
   * Helper: Get API configuration
   */
  public async getApiConfig() {
    const config = await this.get();
    return {
      baseUrl: config.VITE_API_BASE_URL,
      timeout: config.VITE_API_TIMEOUT,
    };
  }

  private getAllLocalEnvVars(): Record<string, any> {
    const env = import.meta.env;
    const result: Record<string, any> = {};
    
    // Include all VITE_ prefixed variables and NODE_ENV
    for (const [key, value] of Object.entries(env)) {
      if (key.startsWith('VITE_') || key === 'NODE_ENV') {
        result[key] = value;
      }
    }
    
    return result;
  }
}

// Export singleton instance
export const hybridEnv = HybridEnvironmentConfig.getInstance();

// Bootstrap core config immediately (synchronous, required for Supabase client)
export const coreSupabaseConfig = hybridEnv.bootstrapCore();
