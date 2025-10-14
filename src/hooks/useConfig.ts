import { useState, useEffect, useCallback } from 'react';
import { configService } from '@/services/configService';

export interface UseConfigOptions {
  fallback?: string;
  refreshInterval?: number; // in milliseconds
}

/**
 * Hook to get a single configuration value from Supabase
 */
export function useConfig(key: string, options: UseConfigOptions = {}) {
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const configValue = await configService.getConfig(key, options.fallback);
      setValue(configValue);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch config'));
      setValue(options.fallback || null);
    } finally {
      setLoading(false);
    }
  }, [key, options.fallback]);

  useEffect(() => {
    fetchConfig();

    // Set up refresh interval if specified
    let interval: NodeJS.Timeout | undefined;
    if (options.refreshInterval && options.refreshInterval > 0) {
      interval = setInterval(fetchConfig, options.refreshInterval);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [fetchConfig, options.refreshInterval]);

  return { value, loading, error, refresh: fetchConfig };
}

/**
 * Hook to get multiple configuration values from Supabase
 */
export function useConfigs(keys: string[]) {
  const [values, setValues] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConfigs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const configValues = await configService.getConfigs(keys);
      setValues(configValues);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch configs'));
      const fallbackValues: Record<string, string | null> = {};
      keys.forEach(key => fallbackValues[key] = null);
      setValues(fallbackValues);
    } finally {
      setLoading(false);
    }
  }, [keys]);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  return { values, loading, error, refresh: fetchConfigs };
}

/**
 * Hook to get boolean configuration value
 */
export function useBooleanConfig(key: string, fallback: boolean = false) {
  const [value, setValue] = useState<boolean>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        setError(null);
        const configValue = await configService.getBooleanConfig(key, fallback);
        setValue(configValue);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch boolean config'));
        setValue(fallback);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [key, fallback]);

  return { value, loading, error };
}

/**
 * Hook to get number configuration value
 */
export function useNumberConfig(key: string, fallback: number = 0) {
  const [value, setValue] = useState<number>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        setError(null);
        const configValue = await configService.getNumberConfig(key, fallback);
        setValue(configValue);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch number config'));
        setValue(fallback);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [key, fallback]);

  return { value, loading, error };
}

/**
 * Hook to get enhanced configuration (environment variables + Supabase config)
 */
export function useEnhancedConfig() {
  const [config, setConfig] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEnhancedConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const enhancedConfig = await configService.getEnhancedConfig();
      setConfig(enhancedConfig);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch enhanced config'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnhancedConfig();
  }, [fetchEnhancedConfig]);

  return { config, loading, error, refresh: fetchEnhancedConfig };
}