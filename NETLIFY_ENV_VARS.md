# Netlify Environment Variables Setup

## Required Environment Variables for Netlify Deployment

Set these exact variables in your Netlify Dashboard:
**Site Settings → Environment variables**

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://kzqcfrubjccxrwfkkrze.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6cWNmcnViamNjeHJ3ZmtrcnplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNjI4ODEsImV4cCI6MjA3NTYzODg4MX0.yCLjMC7QcM-RNHFxOdQb7O0C7yq0D9e3bP7kyrL0u3E
VITE_SUPABASE_PROJECT_ID=kzqcfrubjccxrwfkkrze

# Application Environment
NODE_ENV=production

# Optional Feature Flags
VITE_ENABLE_ANALYTICS=true
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
6. **Add the new variables** listed above
7. **Clear deploy cache** (Site Settings → Build & Deploy → Clear cache)
8. **Trigger new deployment** (either push code changes or manual deploy)

## Troubleshooting:

If you still see authentication errors:
- Verify the Supabase project is active and not paused
- Check that the publishable key hasn't expired
- Ensure all three VITE_SUPABASE_* variables are set correctly
- Clear browser cache after deployment

## Project IDs Found:
- **Current/Correct**: kzqcfrubjccxrwfkkrze (in local .env)
- **Old/Incorrect**: chilqvzreetzamijdjqk (was in Netlify deployment)

Make sure to use the **Current/Correct** project ID in all Netlify environment variables.