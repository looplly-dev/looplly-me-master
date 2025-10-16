# 🚀 Netlify Deployment Setup

## Quick Setup (3 Environment Variables)

Add these in **Netlify Dashboard** → **Site Settings** → **Environment Variables**:

### 1. VITE_SUPABASE_URL
```
https://chlqpvzreztzxmjjdjpk.supabase.co
```

### 2. VITE_SUPABASE_PUBLISHABLE_KEY  
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobHFwdnpyZXp0enhtampkanBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MDUzOTcsImV4cCI6MjA3NTk4MTM5N30.2Gh1mfj43B4b_n78WEEPD9_8uS8eUgpl0AIEFC5T5_I
```

### 3. VITE_SUPABASE_PROJECT_ID
```
chlqpvzreztzxmjjdjpk
```

> **🔒 Security Note:** These Supabase credentials are **safe to expose publicly**. The publishable key is designed for client-side use and only allows operations permitted by Row Level Security (RLS) policies. Sensitive operations require authentication.

## ✅ That's It!

All other configuration is loaded automatically from Supabase at runtime.

## 🔧 Troubleshooting

If the app shows a "Configuration Required" screen:
1. Double-check the 3 environment variables above are set correctly
2. Make sure there are no extra spaces or quotes
3. Redeploy the site after setting the variables

## 📋 What This Setup Provides

- ✅ **Automatic configuration loading** from Supabase database
- ✅ **Environment-specific settings** (dev/staging/production) 
- ✅ **Secure secret management** without exposing sensitive data
- ✅ **Dynamic configuration** - change settings without redeployment
- ✅ **Graceful fallbacks** if remote configuration fails

For detailed information about the configuration system, see [docs/DEPLOYMENT_CONFIG.md](docs/DEPLOYMENT_CONFIG.md).