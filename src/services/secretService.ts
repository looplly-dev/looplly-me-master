/**
 * Secret Service
 * Handles interaction with Lovable Cloud secrets for API keys and sensitive configuration
 */

export type SecretName = 
  | 'VITE_GOOGLE_PLACES_API_KEY'
  | 'VITE_AI_PROVIDER_API_KEY'
  | 'VITE_AI_PROVIDER';

interface SecretMetadata {
  name: SecretName;
  description: string;
  type: 'api_key' | 'config';
}

const SECRET_METADATA: Record<SecretName, SecretMetadata> = {
  VITE_GOOGLE_PLACES_API_KEY: {
    name: 'VITE_GOOGLE_PLACES_API_KEY',
    description: 'Google Places API Key for address autocomplete',
    type: 'api_key'
  },
  VITE_AI_PROVIDER_API_KEY: {
    name: 'VITE_AI_PROVIDER_API_KEY',
    description: 'AI Provider API Key (OpenAI/Anthropic/Google)',
    type: 'api_key'
  },
  VITE_AI_PROVIDER: {
    name: 'VITE_AI_PROVIDER',
    description: 'AI Provider name (openai/anthropic/google)',
    type: 'config'
  }
};

class SecretService {
  /**
   * Check if a secret exists by checking environment variables
   */
  checkSecretExists(secretName: SecretName): boolean {
    const value = import.meta.env[secretName];
    return !!value && value !== '';
  }

  /**
   * Get the metadata for a secret
   */
  getSecretMetadata(secretName: SecretName): SecretMetadata | undefined {
    return SECRET_METADATA[secretName];
  }

  /**
   * Validate API key format
   */
  validateApiKey(provider: string, apiKey: string): { valid: boolean; error?: string } {
    if (!apiKey || apiKey.trim() === '') {
      return { valid: false, error: 'API key cannot be empty' };
    }

    switch (provider) {
      case 'google-places':
        // Google API keys typically start with AIza
        if (!apiKey.startsWith('AIza')) {
          return { valid: false, error: 'Google Places API keys typically start with "AIza"' };
        }
        break;
      
      case 'openai':
        // OpenAI keys start with sk-
        if (!apiKey.startsWith('sk-')) {
          return { valid: false, error: 'OpenAI API keys must start with "sk-"' };
        }
        break;
      
      case 'anthropic':
        // Anthropic keys start with sk-ant-
        if (!apiKey.startsWith('sk-ant-')) {
          return { valid: false, error: 'Anthropic API keys must start with "sk-ant-"' };
        }
        break;
      
      case 'google-ai':
        // Google AI keys are similar to Places
        if (!apiKey.startsWith('AIza')) {
          return { valid: false, error: 'Google AI API keys typically start with "AIza"' };
        }
        break;
    }

    return { valid: true };
  }

  /**
   * Get masked version of API key for display
   */
  getMaskedKey(apiKey: string): string {
    if (!apiKey || apiKey.length < 8) {
      return '***';
    }
    const start = apiKey.substring(0, 4);
    const end = apiKey.substring(apiKey.length - 4);
    return `${start}${'*'.repeat(12)}${end}`;
  }

  /**
   * Validate AI provider name
   */
  validateProvider(provider: string): { valid: boolean; error?: string } {
    const validProviders = ['openai', 'anthropic', 'google'];
    if (!validProviders.includes(provider.toLowerCase())) {
      return { 
        valid: false, 
        error: `Invalid provider. Must be one of: ${validProviders.join(', ')}` 
      };
    }
    return { valid: true };
  }
}

export const secretService = new SecretService();
