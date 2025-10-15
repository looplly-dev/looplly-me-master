# Deployment Configuration Guide

This application uses a **hybrid configuration system** that works seamlessly across development, staging, and production environments without requiring extensive environment variable management.

## How It Works

### 🔄 **Hybrid Configuration System**

1. **Local Environment Variables** (highest priority)
   - Used in development
   - Loaded from `.env` files
   - Takes precedence over remote config

2. **Remote Configuration** (fallback)
   - Stored securely in Supabase `app_secrets` table
   - Loaded dynamically at runtime
   - Cached for performance (5-minute TTL)

3. **Sensible Defaults** (last resort)
   - Built-in fallback values
   - Ensures app continues to work even if config fails

### 🎯 **Benefits**

- ✅ **Minimal Netlify setup** - only 3 environment variables needed
- ✅ **Secure secret management** - sensitive data stored in database, not deployment platform
- ✅ **Dynamic configuration** - change settings without redeployment
- ✅ **Environment-specific** - different configs for dev/staging/production
- ✅ **Graceful fallbacks** - app continues working even if remote config fails

## Netlify Deployment Setup

### Required Environment Variables

Add these **3 variables** in Netlify Site Settings → Environment Variables:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
VITE_SUPABASE_PROJECT_ID=your-project-id
```

### Optional Variables

```bash
NODE_ENV=production  # Usually set automatically by Netlify
```

**That's it!** All other configuration is handled automatically.

## Managing Remote Configuration

### Viewing Current Config

```sql
-- View all public configuration
SELECT key, value, environment 
FROM public.app_secrets 
WHERE is_public = true 
ORDER BY environment, key;
```

### Adding New Configuration

```sql
-- Add a new public configuration value
INSERT INTO public.app_secrets (key, value, description, is_public, environment, tenant_id)
VALUES (
  'VITE_NEW_FEATURE_FLAG',
  'true',
  'Enable new feature',
  true,  -- public (non-sensitive)
  'production',
  (SELECT id FROM public.tenants WHERE slug = 'looplly-internal')
);
```

### Environment-Specific Configuration

```sql
-- Different values for different environments
INSERT INTO public.app_secrets (key, value, is_public, environment, tenant_id) VALUES
('VITE_API_TIMEOUT', '30000', true, 'production', (SELECT id FROM public.tenants WHERE slug = 'looplly-internal')),
('VITE_API_TIMEOUT', '60000', true, 'development', (SELECT id FROM public.tenants WHERE slug = 'looplly-internal'));
```

## Configuration Schema

### Public Configuration (Non-Sensitive)
Stored with `is_public = true`, accessible to client-side code:

- `VITE_ENABLE_ANALYTICS` - Enable analytics tracking
- `VITE_ENABLE_DEBUG` - Enable debug mode
- `VITE_API_TIMEOUT` - API request timeout (ms)
- `VITE_CAPACITOR_PLATFORM` - Target platform (web/ios/android)

### Private Configuration (Sensitive)
Stored with `is_public = false`, only accessible to admins/service role:

- API keys
- Service endpoints
- Private feature flags
- Internal configuration

## Development Setup

### Local Development

1. Create `.env` file with local values:
```bash
cp .env.example .env
# Edit .env with your local Supabase credentials
```

2. The app will use local `.env` values in development
3. Remote config serves as backup/fallback

### Testing Production Config

To test production configuration locally:

```bash
# Temporarily remove .env file
mv .env .env.backup

# Start development server
npm run dev

# The app will now load config from Supabase like in production
# Restore .env when done
mv .env.backup .env
```

## Troubleshooting

### App Shows "Configuration Required" Screen

This means the core Supabase environment variables are missing:

1. **Local Development**: Check your `.env` file
2. **Netlify Deployment**: Add the 3 required variables in Site Settings → Environment Variables

### Configuration Not Loading

1. Check browser console for errors
2. Verify Supabase connection works
3. Check if `app_secrets` table exists and has data:

```sql
SELECT COUNT(*) FROM public.app_secrets;
```

### Environment-Specific Issues

The app detects environment from `NODE_ENV`:
- `development` - Uses local `.env` + remote fallback
- `production` - Uses remote config + minimal local env vars
- `test` - Uses test-specific configuration

### Cache Issues

Configuration is cached for 5 minutes. To force refresh:

```javascript
// In browser console
import { hybridEnv } from '/src/config/hybridEnv.ts';
await hybridEnv.refresh();
```

## Security Considerations

### ✅ **What's Safe**

- Supabase URL, Project ID, Anon Key are public by design
- Public configuration flags (analytics, debug, timeouts)
- Feature flags and UI settings

### ⚠️ **What to Keep Private**

- Service role keys (never set `is_public = true`)
- Third-party API keys
- Internal service URLs
- Database connection strings

### 🔒 **Security Model**

- Public config: Accessible to anyone via `get_public_app_secrets()`
- Private config: Only accessible to authenticated admins via `get_app_secrets()`
- RLS policies enforce access control
- Configuration is cached client-side but refreshed regularly

## Migration from .env-only System

If you're migrating from a system that only used `.env` files:

1. **Identify current environment variables** from `.env.example`
2. **Categorize them** as public/private and environment-specific
3. **Insert public config** into `app_secrets` table
4. **Keep only core Supabase variables** in deployment environment
5. **Test the migration** by temporarily removing `.env` in development

This migration reduces deployment complexity while improving security and flexibility.