# Environment Variables Setup Guide

This document provides comprehensive instructions for setting up and managing environment variables in the Looplly.me application.

## 🔐 Security Notice

**NEVER** commit actual environment files (`.env`, `.env.local`, etc.) to version control. Only commit example files (`.env.example`, `.env.production.example`).

## 📁 Environment File Structure

```
├── .env.example                 # Template with all available variables
├── .env.development            # Development environment (committed for team consistency)
├── .env.production.example     # Production template (not committed)
├── .env.test                   # Test environment configuration
└── .env                        # Your local overrides (ignored by Git)
```

## 🚀 Quick Setup

### 1. Initial Setup
```bash
# Copy the example file to create your local .env
cp .env.example .env

# Edit with your actual values
nano .env  # or use your preferred editor
```

### 2. Required Variables

These variables are **required** for the application to function:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID | `abc123defg456hijklmno` |
| `NODE_ENV` | Application environment | `development`, `production`, `test` |

### 3. Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_SUPABASE_SERVICE_ROLE_KEY` | Service role key (admin operations only) | _none_ |
| `VITE_ENABLE_ANALYTICS` | Enable analytics tracking | `false` |
| `VITE_ENABLE_DEBUG` | Enable debug mode | `true` in development |
| `VITE_API_BASE_URL` | Custom API base URL | Same as `VITE_SUPABASE_URL` |
| `VITE_API_TIMEOUT` | API timeout in milliseconds | `30000` |
| `VITE_CAPACITOR_PLATFORM` | Target platform for Capacitor | `web` |

## 🌍 Environment-Specific Configuration

### Development Environment

For development, use `.env.development` (already committed) or create a local `.env` file:

```env
NODE_ENV=development
VITE_SUPABASE_URL=https://your-dev-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-dev-anon-key
VITE_SUPABASE_PROJECT_ID=your-dev-project-id
VITE_ENABLE_DEBUG=true
VITE_ENABLE_ANALYTICS=false
```

### Production Environment

For production deployments, set these environment variables in your hosting platform:

```env
NODE_ENV=production
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-prod-anon-key
VITE_SUPABASE_PROJECT_ID=your-prod-project-id
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true
```

### Test Environment

For running tests, use `.env.test`:

```env
NODE_ENV=test
VITE_SUPABASE_URL=http://localhost:54321  # Local Supabase
VITE_SUPABASE_PUBLISHABLE_KEY=demo-key
VITE_SUPABASE_PROJECT_ID=localhost
VITE_ENABLE_DEBUG=true
VITE_ENABLE_ANALYTICS=false
```

## 🔧 Using Environment Variables

### In React Components

```typescript
import { env, supabaseConfig, featureFlags } from '@/config/env';

function MyComponent() {
  // Access individual config objects
  console.log('Supabase URL:', supabaseConfig.url);
  console.log('Debug mode:', featureFlags.enableDebug);
  
  // Access all config
  const config = env.get();
  console.log('Full config:', config);
}
```

### Environment Checks

```typescript
import { isDevelopment, isProduction, isTest } from '@/config/env';

if (isDevelopment) {
  // Development-only code
  console.log('Running in development mode');
}

if (isProduction) {
  // Production-only code
  analytics.track('page_view');
}
```

## 🛡️ Security Best Practices

### 1. Variable Naming
- Use `VITE_` prefix for variables accessed in the frontend
- Never expose sensitive keys (service role keys) in frontend code
- Use descriptive names that indicate their purpose

### 2. Key Management
- **Anon Key**: Safe to expose in frontend, used for client-side operations
- **Service Role Key**: NEVER expose in frontend, only use in secure backend operations
- **Project ID**: Safe to expose, used for identifying the Supabase project

### 3. Validation
The application automatically validates environment variables on startup using Zod schemas. Invalid configurations will prevent the app from starting.

### 4. Multiple Environments
- Use different Supabase projects for different environments
- Never use production credentials in development
- Set up staging environment for testing production-like configurations

## 🚨 Troubleshooting

### Common Issues

#### "Environment validation failed"
```
❌ VITE_SUPABASE_URL: VITE_SUPABASE_URL must be a valid Supabase URL
```

**Solution**: Ensure your `VITE_SUPABASE_URL` follows the format `https://your-project-id.supabase.co`

#### "Invalid JWT token"
```
❌ VITE_SUPABASE_PUBLISHABLE_KEY: must be a valid JWT token
```

**Solution**: Copy the exact anon key from your Supabase dashboard without modifications

#### Missing environment variables
```
❌ VITE_SUPABASE_PROJECT_ID is required
```

**Solution**: Add the missing variable to your `.env` file

### Debug Mode

Enable debug mode to see detailed environment information:

```env
VITE_ENABLE_DEBUG=true
```

This will log environment validation success/failure messages to the console.

## 📝 Example Configurations

### Local Development
```env
# .env.local (not committed)
NODE_ENV=development
VITE_SUPABASE_URL=https://abc123.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=abc123
VITE_ENABLE_DEBUG=true
VITE_ENABLE_ANALYTICS=false
```

### Vercel Deployment
Set these in your Vercel dashboard:

| Variable | Value |
|----------|--------|
| `NODE_ENV` | `production` |
| `VITE_SUPABASE_URL` | `https://your-prod-id.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `your-production-anon-key` |
| `VITE_SUPABASE_PROJECT_ID` | `your-production-project-id` |
| `VITE_ENABLE_ANALYTICS` | `true` |

### Netlify Deployment
Add to your `netlify.toml`:

```toml
[build.environment]
  NODE_ENV = "production"
  VITE_SUPABASE_URL = "https://your-prod-id.supabase.co"
  VITE_SUPABASE_PUBLISHABLE_KEY = "your-production-anon-key"
  VITE_SUPABASE_PROJECT_ID = "your-production-project-id"
  VITE_ENABLE_ANALYTICS = "true"
```

## 🔄 Migration from Old Setup

If you're migrating from the old environment setup:

1. **Backup your current `.env`** file
2. **Update imports** to use the new config system:
   ```typescript
   // Old way
   const url = import.meta.env.VITE_SUPABASE_URL;
   
   // New way
   import { supabaseConfig } from '@/config/env';
   const url = supabaseConfig.url;
   ```
3. **Replace process.env usage** with import.meta.env or the config system
4. **Add validation** by importing from `@/config/env`

## 📞 Support

If you encounter issues with environment setup:

1. Check this documentation first
2. Verify your Supabase dashboard settings
3. Check the browser console for validation errors
4. Ensure all required variables are set

## 🔗 Related Files

- [`src/config/env.ts`](../src/config/env.ts) - Environment validation and configuration
- [`src/integrations/supabase/client.ts`](../src/integrations/supabase/client.ts) - Supabase client configuration
- [`.env.example`](../.env.example) - Environment variables template
- [`.gitignore`](../.gitignore) - Files ignored by Git (includes .env files)