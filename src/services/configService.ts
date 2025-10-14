import { supabase } from '@/integrations/supabase/client';

export interface AppConfig {
  key: string;
  value: string | null;
  description: string | null;
  environment: string;
  is_secret: boolean;
  is_active: boolean;
}

export class ConfigService {
  private static instance: ConfigService;
  private configCache: Map<string, AppConfig> = new Map();
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes
  private lastCacheTime: number = 0;

  private constructor() {}

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  /**
   * Get configuration value from Supabase
   */
  public async getConfig(key: string, fallback?: string): Promise<string | null> {
    await this.ensureCacheUpdated();
    
    const config = this.configCache.get(key);
    if (config && config.is_active) {
      return config.value;
    }
    
    return fallback || null;
  }

  /**
   * Get multiple configuration values at once
   */
  public async getConfigs(keys: string[]): Promise<Record<string, string | null>> {
    await this.ensureCacheUpdated();
    
    const result: Record<string, string | null> = {};
    keys.forEach(key => {
      const config = this.configCache.get(key);
      result[key] = config && config.is_active ? config.value : null;
    });
    
    return result;
  }

  /**
   * Get all active configuration values (non-secret only for client-side)
   */
  public async getAllConfigs(includeSecrets: boolean = false): Promise<Record<string, string | null>> {
    await this.ensureCacheUpdated();
    
    const result: Record<string, string | null> = {};
    this.configCache.forEach((config, key) => {
      if (config.is_active && (!config.is_secret || includeSecrets)) {
        result[key] = config.value;
      }
    });
    
    return result;
  }

  /**
   * Set configuration value (requires appropriate permissions)
   */
  public async setConfig(
    key: string, 
    value: string, 
    options: {
      description?: string;
      environment?: string;
      is_secret?: boolean;
      is_active?: boolean;
    } = {}
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('app_config')
        .upsert({
          key,
          value,
          description: options.description,
          environment: options.environment || 'production',
          is_secret: options.is_secret || false,
          is_active: options.is_active !== false,
        });

      if (error) {
        console.error('Error setting config:', error);
        return false;
      }

      // Update cache
      this.configCache.set(key, {
        key,
        value,
        description: options.description || null,
        environment: options.environment || 'production',
        is_secret: options.is_secret || false,
        is_active: options.is_active !== false,
      });

      return true;
    } catch (error) {
      console.error('Error setting config:', error);
      return false;
    }
  }

  /**
   * Delete configuration value
   */
  public async deleteConfig(key: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('app_config')
        .delete()
        .eq('key', key);

      if (error) {
        console.error('Error deleting config:', error);
        return false;
      }

      // Remove from cache
      this.configCache.delete(key);
      return true;
    } catch (error) {
      console.error('Error deleting config:', error);
      return false;
    }
  }

  /**
   * Refresh cache from Supabase
   */
  public async refreshCache(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('app_config')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching config:', error);
        return;
      }

      // Update cache
      this.configCache.clear();
      data?.forEach(config => {
        this.configCache.set(config.key, config);
      });

      this.lastCacheTime = Date.now();
    } catch (error) {
      console.error('Error refreshing config cache:', error);
    }
  }

  /**
   * Get configuration value with type conversion
   */
  public async getBooleanConfig(key: string, fallback: boolean = false): Promise<boolean> {
    const value = await this.getConfig(key);
    if (value === null) return fallback;
    return value.toLowerCase() === 'true';
  }

  public async getNumberConfig(key: string, fallback: number = 0): Promise<number> {
    const value = await this.getConfig(key);
    if (value === null) return fallback;
    const num = parseInt(value, 10);
    return isNaN(num) ? fallback : num;
  }

  /**
   * Merge with environment variables for seamless integration
   */
  public async getEnhancedConfig(): Promise<Record<string, string | null>> {
    const supabaseConfigs = await this.getAllConfigs();
    
    // Merge with existing environment variables, giving priority to Supabase config
    const enhancedConfig: Record<string, string | null> = {
      // Environment variables
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      VITE_SUPABASE_PROJECT_ID: import.meta.env.VITE_SUPABASE_PROJECT_ID,
      NODE_ENV: import.meta.env.NODE_ENV,
      
      // Override with Supabase configs
      ...supabaseConfigs,
    };

    return enhancedConfig;
  }

  /**
   * Ensure cache is updated if expired
   */
  private async ensureCacheUpdated(): Promise<void> {
    if (Date.now() - this.lastCacheTime > this.cacheExpiry || this.configCache.size === 0) {
      await this.refreshCache();
    }
  }
}

// Export singleton instance
export const configService = ConfigService.getInstance();