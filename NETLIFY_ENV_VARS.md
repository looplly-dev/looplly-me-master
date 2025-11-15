# Netlify Environment Variables Setup

## Environment Separation Strategy

This project uses **two separate Supabase projects** for development and production:

- **Development** (`kzqcfrubjccxrwfkkrze`): Used in Lovable preview environment
- **Production** (`chlqpvzreztzxmjjdjpk`): Used on Netlify deployed site (looplly.me)

### How It Works

- **Local Development & Lovable Preview**: Uses `.env` file with development credentials
- **Netlify Production**: Uses Netlify environment variables with production credentials
- **Code**: All Supabase clients use `import.meta.env` which automatically switches between environments

## Required Netlify Environment Variables (Production)

Set these exact variables in your Netlify Dashboard:
**Site Settings → Environment variables**

```bash
# Environment
NODE_ENV=production

# Supabase Configuration (PRODUCTION PROJECT)
VITE_SUPABASE_URL=https://chlqpvzreztzxmjjdjpk.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobHFwdnpyZXp0enhtampkanBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MDUzOTcsImV4cCI6MjA3NTk4MTM5N30.2Gh1mfj43B4b_n78WEEPD9_8uS8eUgpl0AIEFC5T5_I
VITE_SUPABASE_PROJECT_ID=chlqpvzreztzxmjjdjpk

# Google Places API
VITE_GOOGLE_PLACES_API_KEY=AIzaSyCJGyrNrCAEksQna8tKWtPvkC9KNVrfqoA

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=false
VITE_API_TIMEOUT=30000
VITE_CAPACITOR_PLATFORM=web
```

## Steps to Update Netlify Environment Variables:

1. **Login to Netlify Dashboard**
2. **Select your site** (looplly.me)
3. **Go to Site Settings**
4. **Navigate to Environment variables**
5. **Delete any old VITE_SUPABASE_* variables** 
6. **Add the new variables** listed above (production credentials)
7. **Clear deploy cache** (Site Settings → Build & Deploy → Clear cache)
8. **Trigger new deployment** (either push code changes or manual deploy)

## Development Environment (.env file)

The `.env` file in the repository contains development credentials and should **NOT** be modified:

```bash
NODE_ENV=development
VITE_SUPABASE_URL=https://kzqcfrubjccxrwfkkrze.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6cWNmcnViamNjeHJ3ZmtrcnplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNjI4ODEsImV4cCI6MjA3NTYzODg4MX0.yCLjMC7QcM-RNHFxOdQb7O0C7yq0D9e3bP7kyrL0u3E
VITE_SUPABASE_PROJECT_ID=kzqcfrubjccxrwfkkrze
# ... other development settings
```

## Important Notes

### Database Migrations
- **Development**: Migrations apply automatically via Lovable
- **Production**: Migrations must be applied manually to production Supabase project
- ⚠️ Always test migrations in development before applying to production

### Edge Functions
- **Development**: Edge functions deploy automatically via Lovable to development project
- **Production**: Edge functions must be deployed manually to production Supabase using Supabase CLI
- ⚠️ Ensure any secrets/environment variables are configured in both Supabase projects

### Authentication & Data Isolation
- Each environment has completely isolated auth users and data
- Test users in development will NOT exist in production
- Production users will NOT appear in development

## Troubleshooting

If you see authentication errors in production:
- Verify the production Supabase project is active and not paused
- Check that the publishable key hasn't expired
- Ensure all VITE_SUPABASE_* variables use **production** credentials
- Clear browser cache after deployment
- Verify production database has all migrations applied

If you see wrong data or users:
- Check which Supabase project ID is being used
- Development: Should see `kzqcfrubjccxrwfkkrze` in network requests
- Production: Should see `chlqpvzreztzxmjjdjpk` in network requests

## Project Reference

- **Development Project**: `kzqcfrubjccxrwfkkrze` (Lovable Cloud managed)
- **Production Project**: `chlqpvzreztzxmjjdjpk` (Your external Supabase project)