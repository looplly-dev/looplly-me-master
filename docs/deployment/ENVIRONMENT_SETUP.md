# Environment Setup

## Overview

Configuration guide for local development and production environments.

## Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id

# App
VITE_APP_URL=http://localhost:5173
```

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test
```

## Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Related Documentation
- [Deployment Config](DEPLOYMENT_CONFIG.md)
