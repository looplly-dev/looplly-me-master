import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Remote Configuration Service
 * 
 * This service fetches configuration values from Supabase when local environment 
 * variables are not available (e.g., in production deployments).
 */
export class RemoteConfigService {
  private static instance: RemoteConfigService;
  private supabaseClient: SupabaseClient | null = null;
  private configCache: Record<string, string> = {};
  private cacheExpiry: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): RemoteConfigService {
    if (!RemoteConfigService.instance) {
      RemoteConfigService.instance = new RemoteConfigService();
    }
    return RemoteConfigService.instance;
  }

  /**
   * Initialize the service with minimal Supabase connection details
   */
  public initialize(url: string, anonKey: string): void {
    if (!this.supabaseClient) {
      this.supabaseClient = createClient(url, anonKey);
    }
  }

  /**
   * Get configuration value with fallback hierarchy:
   * 1. Local environment variable
   * 2. Cached remote config
   * 3. Fresh remote config fetch
   * 4. Default value
   */
  public async getConfig(key: string, defaultValue?: string): Promise<string | undefined> {
    // Try local environment first
    const localValue = this.getLocalEnvVar(key);
    if (localValue !== undefined) {
      return localValue;
    }

    // Try cache if not expired
    if (this.isCacheValid() && this.configCache[key]) {
      return this.configCache[key];
    }

    // Fetch from remote
    try {
      await this.refreshConfig();
      return this.configCache[key] || defaultValue;
    } catch (error) {
      console.warn(`Failed to fetch remote config for ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Get all configuration values as an object
   */
  public async getAllConfig(): Promise<Record<string, string>> {
    // Start with local environment variables
    const localConfig = this.getAllLocalEnvVars();

    // If cache is valid, merge with cached values
    if (this.isCacheValid()) {
      return { ...this.configCache, ...localConfig };
    }

    // Fetch fresh remote config
    try {
      await this.refreshConfig();
      return { ...this.configCache, ...localConfig };
    } catch (error) {
      console.warn('Failed to fetch remote config:', error);
      return localConfig;
    }
  }

  /**
   * Force refresh the configuration cache
   */
  public async refreshConfig(): Promise<void> {
    if (!this.supabaseClient) {
      throw new Error('RemoteConfigService not initialized. Call initialize() first.');
    }

    const environment = this.getEnvironment();
    
    const { data, error } = await this.supabaseClient
      .rpc('get_public_app_secrets', { p_environment: environment });

    if (error) {
      throw new Error(`Failed to fetch remote config: ${error.message}`);
    }

    // Update cache
    this.configCache = {};
    if (data) {
      for (const row of data) {
        this.configCache[row.key] = row.value;
      }
    }
    
    this.cacheExpiry = Date.now() + this.CACHE_TTL;
  }

  /**
   * Clear the configuration cache
   */
  public clearCache(): void {
    this.configCache = {};
    this.cacheExpiry = 0;
  }

  private getLocalEnvVar(key: string): string | undefined {
    // In Vite, environment variables are available via import.meta.env
    const value = (import.meta.env as any)[key];
    return value !== undefined ? String(value) : undefined;
  }

  private getAllLocalEnvVars(): Record<string, string> {
    const env = import.meta.env;
    const result: Record<string, string> = {};
    
    // Only include VITE_ prefixed variables and NODE_ENV
    for (const [key, value] of Object.entries(env)) {
      if (key.startsWith('VITE_') || key === 'NODE_ENV') {
        result[key] = String(value);
      }
    }
    
    return result;
  }

  private isCacheValid(): boolean {
    return Date.now() < this.cacheExpiry;
  }

  private getEnvironment(): string {
    return this.getLocalEnvVar('NODE_ENV') || 'production';
  }
}

// Export singleton instance
export const remoteConfig = RemoteConfigService.getInstance();

/**
 * Convenience function to get a config value
 */
export async function getConfig(key: string, defaultValue?: string): Promise<string | undefined> {
  return await remoteConfig.getConfig(key, defaultValue);
}

/**
 * Convenience function to get all config values
 */
export async function getAllConfig(): Promise<Record<string, string>> {
  return await remoteConfig.getAllConfig();
}