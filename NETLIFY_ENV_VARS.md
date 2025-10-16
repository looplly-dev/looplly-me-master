# Netlify Environment Variables Setup

## Required Environment Variables for Netlify Deployment

Set these exact variables in your Netlify Dashboard:
**Site Settings → Environment variables**

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://chlqpvzreztzxmjjdjpk.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobHFwdnpyZXp0enhtampkanBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MDUzOTcsImV4cCI6MjA3NTk4MTM5N30.2Gh1mfj43B4b_n78WEEPD9_8uS8eUgpl0AIEFC5T5_I
VITE_SUPABASE_PROJECT_ID=chlqpvzreztzxmjjdjpk

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
- **Current/Correct**: chlqpvzreztzxmjjdjpk (unified project)
- **Old/Incorrect**: kzqcfrubjccxrwfkkrze (was in development)

Make sure to use the **Current/Correct** project ID in all Netlify environment variables.