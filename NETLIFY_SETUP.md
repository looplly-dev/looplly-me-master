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

### 4. NODE_ENV (Optional but recommended)
```
production
```

> **🔒 Security Note:** These Supabase credentials are **safe to expose publicly**. The publishable key is designed for client-side use and only allows operations permitted by Row Level Security (RLS) policies. Sensitive operations require authentication.

## ✅ That's It!

All API keys and secrets are stored securely in **Supabase Vault** and accessed server-side by edge functions.

## 📋 Secret Management Strategy

### Public Configuration (Netlify Environment Variables)
- `VITE_SUPABASE_URL` - Backend URL (public, safe to expose)
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Anon key (public, RLS-protected)
- `VITE_SUPABASE_PROJECT_ID` - Project identifier (public)
- `NODE_ENV` - Environment flag
- `VITE_ENABLE_ANALYTICS` - Feature flags (optional)
- `VITE_ENABLE_DEBUG` - Debug mode (optional)

### Private Secrets (Supabase Vault - Server-Side Only)
All sensitive API keys are stored in Supabase Vault and accessed only by edge functions:
- `AI_PROVIDER` - AI provider selection (openai/anthropic/google)
- `AI_PROVIDER_API_KEY` - AI service API key
- `LOVABLE_API_KEY` - Lovable service key
- Other service keys as needed

**Benefits:**
- ✅ Secrets never exposed to client-side code
- ✅ No need to manage secrets in Netlify
- ✅ Centralized secret management in backend
- ✅ Secrets accessible to all edge functions automatically

## 🔧 Troubleshooting

If the app shows a "Configuration Required" screen:
1. Double-check the 3 environment variables above are set correctly
2. Make sure there are no extra spaces or quotes
3. Redeploy the site after setting the variables

If an edge function reports missing secrets:
1. Check that secrets are configured in Lovable Cloud backend
2. Verify edge function has access to `Deno.env.get('SECRET_NAME')`
3. Redeploy edge functions if secrets were added after deployment

## 📋 What This Setup Provides

- ✅ **Minimal environment variables** - Only 3-4 required for Netlify
- ✅ **Secure secret management** - All API keys in Supabase Vault
- ✅ **Simple deployment** - No complex secret synchronization
- ✅ **Environment consistency** - Same backend for dev and production
- ✅ **Graceful fallbacks** - Mock modes for optional integrations

For detailed information about the configuration system, see [docs/DEPLOYMENT_CONFIG.md](docs/DEPLOYMENT_CONFIG.md).