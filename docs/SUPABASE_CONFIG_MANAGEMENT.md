# Supabase Configuration Management System

This document explains how to manage application configuration and secrets using Supabase instead of external platforms like Netlify. This approach provides better security, centralized management, and dynamic configuration updates.

## 🎯 **Why Supabase for Configuration Management?**

### Benefits:
- ✅ **Centralized Management**: All secrets stored in your Supabase database
- ✅ **Row Level Security**: Fine-grained access control using RLS policies
- ✅ **Dynamic Updates**: Change configuration without redeploying
- ✅ **Environment Separation**: Different configs for dev/staging/production
- ✅ **Audit Trail**: Track configuration changes with timestamps
- ✅ **Type Safety**: TypeScript support for configuration values

### vs External Platforms:
- ❌ **Netlify/Vercel**: Secrets stored outside your database
- ❌ **Third-party Services**: Additional dependencies and potential security risks
- ❌ **Environment Variables Only**: Static configuration requiring redeploys

## 🏗️ **Architecture Overview**

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   React Frontend    │    │  Supabase Database  │    │   Admin Interface   │
│                     │    │                     │    │                     │
│  • useConfig()      │◄──►│   app_config table  │◄──►│  • ConfigManager    │
│  • configService    │    │   • RLS policies    │    │  • Add/Edit/Delete  │
│  • Environment      │    │   • Encrypted data  │    │  • Show/Hide secrets│
│    validation       │    │                     │    │                     │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

## 📊 **Database Schema**

### `app_config` Table:
```sql
CREATE TABLE app_config (
  id BIGSERIAL PRIMARY KEY,
  key VARCHAR(255) NOT NULL UNIQUE,       -- Configuration key (e.g., 'VITE_API_URL')
  value TEXT,                             -- Configuration value
  description TEXT,                       -- Human-readable description
  environment VARCHAR(50) DEFAULT 'production', -- Target environment
  is_secret BOOLEAN DEFAULT false,        -- Whether to hide in UI
  is_active BOOLEAN DEFAULT true,         -- Whether config is active
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS) Policies:
```sql
-- Non-secret configs readable by authenticated users
CREATE POLICY "Allow authenticated users to read non-secret config" ON app_config
  FOR SELECT USING (auth.role() = 'authenticated' AND is_secret = false);

-- Only service role can manage secret configs
CREATE POLICY "Allow service role to manage secrets" ON app_config
  FOR ALL USING (auth.role() = 'service_role');
```

## 🚀 **Quick Setup**

### 1. Database Setup (Already Applied)
The `app_config` table and RLS policies have been created automatically.

### 2. Basic Usage in React Components

```typescript
import { useConfig, useBooleanConfig, useNumberConfig } from '@/hooks/useConfig';

function MyComponent() {
  const { value: apiUrl } = useConfig('VITE_API_URL', { fallback: 'https://api.example.com' });
  const { value: debugMode } = useBooleanConfig('VITE_ENABLE_DEBUG', false);
  const { value: timeout } = useNumberConfig('VITE_API_TIMEOUT', 30000);

  return (
    <div>
      <p>API URL: {apiUrl}</p>
      <p>Debug Mode: {debugMode ? 'On' : 'Off'}</p>
      <p>Timeout: {timeout}ms</p>
    </div>
  );
}
```

### 3. Configuration Service Usage

```typescript
import { configService } from '@/services/configService';

// Get single config
const apiUrl = await configService.getConfig('VITE_API_URL');

// Get multiple configs
const configs = await configService.getConfigs(['VITE_API_URL', 'VITE_ENABLE_DEBUG']);

// Set config (requires appropriate permissions)
await configService.setConfig('VITE_NEW_FEATURE', 'enabled', {
  description: 'Enable the new feature flag',
  environment: 'production',
  is_secret: false
});

// Get enhanced config (environment variables + Supabase config)
const enhancedConfig = await configService.getEnhancedConfig();
```

## 🔧 **Configuration Management**

### Admin Interface

Access the configuration manager through your admin dashboard:

```typescript
import { ConfigManager } from '@/components/admin/ConfigManager';

// Add to your admin routes
<Route path="/admin/config" element={<ConfigManager />} />
```

### Features:
- **Add New Configurations**: Create new config key-value pairs
- **Edit Existing**: Update configuration values inline
- **Environment Targeting**: Set different values for dev/staging/prod
- **Secret Management**: Mark sensitive data as secrets
- **Active/Inactive Toggle**: Enable/disable configurations
- **Show/Hide Secrets**: Toggle visibility of sensitive values

## 🔐 **Security Best Practices**

### 1. Environment Variable Classification

| Type | Example | Should be Secret | Frontend Access |
|------|---------|------------------|-----------------|
| **Public Keys** | `VITE_SUPABASE_PUBLISHABLE_KEY` | ❌ No | ✅ Yes |
| **API URLs** | `VITE_API_BASE_URL` | ❌ No | ✅ Yes |
| **Feature Flags** | `VITE_ENABLE_ANALYTICS` | ❌ No | ✅ Yes |
| **Service Keys** | `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | ❌ No |
| **Database Passwords** | `DATABASE_PASSWORD` | ✅ Yes | ❌ No |
| **JWT Secrets** | `JWT_SECRET` | ✅ Yes | ❌ No |

### 2. RLS Policy Guidelines

- **Non-Secret Data**: Accessible by authenticated users
- **Secret Data**: Only accessible by service role or admin users
- **Environment Separation**: Use policies to restrict access by environment

### 3. Frontend vs Backend Configuration

```typescript
// ✅ Safe for frontend (VITE_ prefixed, non-secret)
const publicConfig = {
  VITE_SUPABASE_URL: await configService.getConfig('VITE_SUPABASE_URL'),
  VITE_ENABLE_ANALYTICS: await configService.getBooleanConfig('VITE_ENABLE_ANALYTICS'),
};

// ❌ Never expose secrets to frontend
const secretConfig = {
  SUPABASE_SERVICE_ROLE_KEY: 'secret-key', // This should be server-side only
};
```

## 🌍 **Environment Management**

### Environment Types:
- `all` - Available in all environments
- `development` - Development only
- `production` - Production only  
- `test` - Test environment only

### Configuration Priority:
1. **Supabase Configuration** (highest priority)
2. **Environment Variables** (.env files)
3. **Default Values** (fallbacks)

### Environment-Specific Setup:

```typescript
// Development
await configService.setConfig('VITE_ENABLE_DEBUG', 'true', {
  environment: 'development',
  description: 'Enable debug mode for development'
});

// Production
await configService.setConfig('VITE_ENABLE_DEBUG', 'false', {
  environment: 'production', 
  description: 'Disable debug mode for production'
});
```

## 📝 **Migration from Environment Variables**

### Step 1: Identify Current Variables
```bash
# List current environment variables
grep -r "VITE_" .env*
grep -r "import.meta.env" src/
```

### Step 2: Migrate to Supabase
```typescript
// Old way - Static environment variables
const apiUrl = import.meta.env.VITE_API_URL;

// New way - Dynamic Supabase configuration
const { value: apiUrl } = useConfig('VITE_API_URL');
```

### Step 3: Populate Configuration Table
```sql
INSERT INTO app_config (key, value, description, environment, is_secret, is_active) VALUES
  ('VITE_APP_NAME', 'Looplly', 'Application name', 'all', false, true),
  ('VITE_ENABLE_ANALYTICS', 'true', 'Enable analytics tracking', 'production', false, true),
  ('VITE_API_TIMEOUT', '30000', 'API timeout in milliseconds', 'all', false, true);
```

## 🚀 **Deployment Configuration**

### Production Deployment

Instead of setting environment variables in Netlify/Vercel, manage them through Supabase:

1. **Core Environment Variables** (still needed in .env):
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   VITE_SUPABASE_PROJECT_ID=your-project-id
   NODE_ENV=production
   ```

2. **Application Configuration** (managed via Supabase):
   - Feature flags
   - API endpoints
   - Timeout values
   - Third-party service URLs
   - Non-sensitive application settings

### Benefits:
- **No Redeploy Required**: Change configuration without redeploying
- **Environment Consistency**: Same deployment, different configurations
- **Rollback Capability**: Easily revert configuration changes
- **A/B Testing**: Enable features for specific user segments

## 🔍 **Monitoring and Debugging**

### Configuration Validation

Your environment validation still works alongside Supabase configuration:

```bash
npm run env:validate
```

### Debug Mode

Enable debug logging to see configuration loading:

```typescript
// In your component
const { value: debugMode } = useBooleanConfig('VITE_ENABLE_DEBUG');

if (debugMode) {
  console.log('Configuration loaded:', await configService.getEnhancedConfig());
}
```

### Troubleshooting

1. **Configuration Not Loading**:
   - Check RLS policies
   - Verify user authentication
   - Check network connectivity

2. **Secrets Not Accessible**:
   - Ensure proper service role permissions
   - Check if `is_secret` flag is correctly set

3. **Cache Issues**:
   - Force refresh: `await configService.refreshCache()`
   - Check cache expiry settings

## 📋 **Examples**

### Feature Flag Implementation
```typescript
function FeatureComponent() {
  const { value: featureEnabled } = useBooleanConfig('VITE_NEW_FEATURE_ENABLED', false);
  
  if (!featureEnabled) {
    return <div>Feature not available</div>;
  }
  
  return <div>New Feature Content</div>;
}
```

### Dynamic API Configuration
```typescript
function ApiService() {
  const { value: baseUrl } = useConfig('VITE_API_BASE_URL');
  const { value: timeout } = useNumberConfig('VITE_API_TIMEOUT', 30000);
  
  return fetch(baseUrl + '/api/data', { 
    signal: AbortSignal.timeout(timeout) 
  });
}
```

### Environment-Specific Behavior
```typescript
function AnalyticsProvider() {
  const { value: analyticsEnabled } = useBooleanConfig('VITE_ENABLE_ANALYTICS');
  
  useEffect(() => {
    if (analyticsEnabled) {
      // Initialize analytics only if enabled
      initializeAnalytics();
    }
  }, [analyticsEnabled]);
}
```

## 🔗 **Related Files**

- [`src/services/configService.ts`](../src/services/configService.ts) - Configuration service implementation
- [`src/hooks/useConfig.ts`](../src/hooks/useConfig.ts) - React hooks for configuration
- [`src/components/admin/ConfigManager.tsx`](../src/components/admin/ConfigManager.tsx) - Admin interface
- [`src/config/env.ts`](../src/config/env.ts) - Environment validation (still used for core variables)

## 🎯 **Next Steps**

1. **Migrate Existing Variables**: Move application-specific variables to Supabase
2. **Set Up Admin Access**: Ensure admin users can manage configuration
3. **Configure Production**: Set up production-specific configurations
4. **Monitor Usage**: Track configuration changes and performance impact

---

This system provides a robust, secure, and flexible way to manage application configuration without relying on external platforms while maintaining the security and validation of your existing environment setup.