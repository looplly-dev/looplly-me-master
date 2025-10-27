# Deployment Configuration

## Overview

Production deployment configuration and best practices.

## Deployment Platforms

### Lovable (Recommended)
- Automatic deployment
- Edge network
- SSL included
- Custom domains

### Manual Deployment
1. Build production bundle
2. Deploy to hosting provider
3. Configure environment variables
4. Set up SSL certificates

## Environment Configuration

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Related Documentation
- [Environment Setup](ENVIRONMENT_SETUP.md)
