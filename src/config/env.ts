import { z } from 'zod';

/**
 * Environment Variables Schema
 * 
 * This schema defines and validates all environment variables used in the application.
 * It ensures type safety and provides clear error messages for missing or invalid variables.
 */
const envSchema = z.object({
  // Supabase Configuration (Required)
  VITE_SUPABASE_URL: z
    .string()
    .url('VITE_SUPABASE_URL must be a valid URL')
    .refine(
      (url) => url.includes('.supabase.co') || url.includes('.supabase.com') || url.includes('localhost'),
      'VITE_SUPABASE_URL must be a valid Supabase URL'
    ),
  
  VITE_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(1, 'VITE_SUPABASE_PUBLISHABLE_KEY is required')
    .regex(
      /^eyJ[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*$/,
      'VITE_SUPABASE_PUBLISHABLE_KEY must be a valid JWT token'
    ),
  
  VITE_SUPABASE_PROJECT_ID: z
    .string()
    .min(1, 'VITE_SUPABASE_PROJECT_ID is required')
    .regex(
      /^[a-z0-9]{20}$/,
      'VITE_SUPABASE_PROJECT_ID must be a 20-character lowercase alphanumeric string'
    ),

  // Node Environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Optional: Service Role Key (for admin operations)
  VITE_SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .regex(
      /^eyJ[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*$/,
      'VITE_SUPABASE_SERVICE_ROLE_KEY must be a valid JWT token'
    )
    .optional(),

  // Optional: Feature Flags
  VITE_ENABLE_ANALYTICS: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  
  VITE_ENABLE_DEBUG: z
    .string()
    .transform((val) => val === 'true')
    .optional(),

  // Optional: API Configuration
  VITE_API_BASE_URL: z
    .string()
    .url('VITE_API_BASE_URL must be a valid URL')
    .optional(),
  
  VITE_API_TIMEOUT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1000).max(120000))
    .optional(),

  // Optional: Capacitor Platform
  VITE_CAPACITOR_PLATFORM: z
    .enum(['web', 'ios', 'android'])
    .optional(),

  // Optional: Google Places API
  VITE_GOOGLE_PLACES_API_KEY: z
    .string()
    .min(1, 'Google Places API key is required')
    .optional(),
  
  VITE_USE_MOCK_PLACES: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),
});

/**
 * Environment Variables Type
 */
export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validated Environment Variables
 * 
 * This object contains all validated environment variables and provides
 * type-safe access throughout the application.
 */
class EnvironmentConfig {
  private static instance: EnvironmentConfig;
  private config: EnvConfig;

  private constructor() {
    this.config = this.validateEnv();
  }

  public static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }

  private validateEnv(): EnvConfig {
    try {
      // Get environment variables from Vite's import.meta.env
      const env = {
        VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
        VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        VITE_SUPABASE_PROJECT_ID: import.meta.env.VITE_SUPABASE_PROJECT_ID,
        NODE_ENV: import.meta.env.NODE_ENV,
        VITE_SUPABASE_SERVICE_ROLE_KEY: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
        VITE_ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS,
        VITE_ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG,
        VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
        VITE_API_TIMEOUT: import.meta.env.VITE_API_TIMEOUT,
        VITE_CAPACITOR_PLATFORM: import.meta.env.VITE_CAPACITOR_PLATFORM,
        VITE_GOOGLE_PLACES_API_KEY: import.meta.env.VITE_GOOGLE_PLACES_API_KEY,
        VITE_USE_MOCK_PLACES: import.meta.env.VITE_USE_MOCK_PLACES,
      };

      return envSchema.parse(env);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(
          (err) => `${err.path.join('.')}: ${err.message}`
        );
        
        throw new Error(
          `Environment validation failed:\n${errorMessages.join('\n')}`
        );
      }
      throw error;
    }
  }

  public get(): EnvConfig {
    return this.config;
  }

  public isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  public isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  public isTest(): boolean {
    return this.config.NODE_ENV === 'test';
  }

  public getSupabaseConfig() {
    return {
      url: this.config.VITE_SUPABASE_URL,
      publishableKey: this.config.VITE_SUPABASE_PUBLISHABLE_KEY,
      projectId: this.config.VITE_SUPABASE_PROJECT_ID,
      serviceRoleKey: this.config.VITE_SUPABASE_SERVICE_ROLE_KEY,
    };
  }

  public getFeatureFlags() {
    return {
      enableAnalytics: this.config.VITE_ENABLE_ANALYTICS ?? false,
      enableDebug: this.config.VITE_ENABLE_DEBUG ?? this.isDevelopment(),
    };
  }

  public getApiConfig() {
    return {
      baseUrl: this.config.VITE_API_BASE_URL ?? this.config.VITE_SUPABASE_URL,
      timeout: this.config.VITE_API_TIMEOUT ?? 30000,
    };
  }
}

// Export singleton instance
export const env = EnvironmentConfig.getInstance();

// Export individual config objects for convenience
export const supabaseConfig = env.getSupabaseConfig();
export const featureFlags = env.getFeatureFlags();
export const apiConfig = env.getApiConfig();

// Environment checks
export const isDevelopment = env.isDevelopment();
export const isProduction = env.isProduction();
export const isTest = env.isTest();

// Validate environment on module load
try {
  env.get();
  console.log('✅ Environment variables validated successfully');
} catch (error) {
  console.error('❌ Environment validation failed:', error);
  throw error;
}