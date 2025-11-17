---
id: "deployment-migration-guide"
title: "Supabase Migration Guide"
category: "Deployment & Infrastructure"
description: "Database migration procedures, best practices, and rollback strategies for Supabase"
audience: "admin"
tags: ["deployment", "database", "migrations", "supabase"]
status: "published"
version: "1.0"
created_at: "2024-01-15"
updated_at: "2024-01-15"
---

# Supabase Migration Guide: From Lovable Cloud to Self-Hosted

## Overview

This guide provides a comprehensive analysis and step-by-step process for migrating from Lovable Cloud to your own Supabase instance with GitHub integration.

## Current Architecture

### Lovable Cloud Setup
- **Backend**: Lovable-managed Supabase instance
- **Project ID**: `chlqpvzreztzxmjjdjpk`
- **Deployment**: Automatic via Lovable platform
- **Edge Functions**: Auto-deployed from `supabase/functions/`
- **Database**: Managed schema with automatic migrations

### Key Dependencies
```json
{
  "@supabase/supabase-js": "^2.75.0",
  "@tanstack/react-query": "^5.83.0"
}
```

## Pre-Migration Requirements Analysis

### 1. Database Schema Export
**Required Actions:**
- Export complete schema from current instance
- Document all tables, policies, and functions
- Export data for migration (users, profiles, badges, etc.)

**Tables to Migrate:**
- `profiles` - User profile data
- `team_profiles` - Team member profiles
- `user_roles` - Role assignments
- `badge_catalog` - Badge definitions
- `user_badges` - Awarded badges
- `earning_activities` - User earning history
- `user_balances` - Financial data
- `profile_questions` - Profiling system
- `profile_answers` - User answers
- `profile_categories` - Question categories
- `documentation` - Knowledge base
- `audit_logs` - System audit trail
- `ai_agents` - AI agent configurations
- And 30+ additional tables

### 2. Storage Buckets
**Required Setup:**
- `badges` - Badge image storage
- `avatars` - User profile images (if implemented)
- Configure appropriate RLS policies for each bucket

### 3. Edge Functions Inventory
**Current Functions:**
```
- auto-generate-country-options
- badge-service-api
- create-b2b-user
- create-simulator-session
- create-team-member
- delete-user
- generate-badge-image
- reset-team-member-password
- seed-badges
- seed-documentation
- seed-test-users
- test-ai-provider
- undo-team-dual-accounts
```

### 4. Authentication Configuration
**Current Settings:**
- Auto-confirm email: Enabled (for development)
- JWT expiry: Default
- Rate limiting: Default
- OAuth providers: None configured

### 5. Environment Variables
**Frontend (React):**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

**Edge Functions:**
- Access to same variables automatically
- No additional API keys currently required

### 6. Session Isolation Architecture (CRITICAL)

**Lovable Cloud Implementation:**
The platform uses a **dual Supabase client architecture** to isolate simulator sessions from admin/user sessions:

- **Main Client** (`src/integrations/supabase/client.ts`)
  - Storage: localStorage
  - Key: 'admin_auth' (admin) or 'auth' (users)
  - Used by: Admin portal, user portal

- **Simulator Client** (`src/integrations/supabase/simulatorClient.ts`)
  - Storage: sessionStorage (ephemeral, iframe-only)
  - Key: 'simulator'
  - Used by: Simulator iframe only

- **Active Client Selector** (`src/integrations/supabase/activeClient.ts`)
  - Dynamically returns correct client based on path
  - Used by: Most hooks and utilities

**Migration Requirements:**
1. ✅ Preserve all three client files exactly as-is
2. ✅ Maintain path-detection logic in activeClient.ts
3. ✅ Do NOT consolidate to single client (breaks isolation)
4. ✅ Verify simulator session isolation post-migration
5. ✅ Test admin login persists during simulation

See [Simulator Architecture](SIMULATOR_ARCHITECTURE.md) for complete technical details.

### 7. Secrets Management
**Current Secrets:**
- Review what secrets are configured
- Document any API keys used by edge functions
- Identify which need to be migrated

## Migration Steps

### Phase 1: Prepare New Supabase Project

#### 1.1 Create New Supabase Project
```bash
# Option A: Via Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Configure project settings
4. Note down project URL and anon key

# Option B: Via CLI
npx supabase init
npx supabase start
```

#### 1.2 Install Supabase CLI
```bash
npm install -g supabase
supabase --version
```

#### 1.3 Link to New Project
```bash
supabase link --project-ref your-project-ref
```

### Phase 2: Schema Migration

#### 2.1 Export Current Schema
```bash
# From Lovable Cloud (if CLI access available)
supabase db dump --db-url "postgresql://..." > schema.sql

# Or manually via SQL editor in Lovable backend
# Export all table definitions, RLS policies, functions
```

#### 2.2 Apply Schema to New Instance
```bash
# Review and clean exported schema
# Remove any Lovable-specific configurations
# Apply to new instance
supabase db push

# Or via SQL editor
# Copy and execute schema.sql
```

#### 2.3 Verify Schema
```bash
supabase db diff
# Should show no differences after successful migration
```

### Phase 3: Data Migration

#### 3.1 Export Data
```sql
-- Export users and profiles
COPY (SELECT * FROM profiles) TO '/tmp/profiles.csv' CSV HEADER;
COPY (SELECT * FROM team_profiles) TO '/tmp/team_profiles.csv' CSV HEADER;

-- Export critical business data
COPY (SELECT * FROM badge_catalog) TO '/tmp/badges.csv' CSV HEADER;
COPY (SELECT * FROM user_badges) TO '/tmp/user_badges.csv' CSV HEADER;
COPY (SELECT * FROM earning_activities) TO '/tmp/activities.csv' CSV HEADER;

-- Export configuration
COPY (SELECT * FROM profile_questions) TO '/tmp/questions.csv' CSV HEADER;
COPY (SELECT * FROM documentation) TO '/tmp/docs.csv' CSV HEADER;
```

#### 3.2 Import Data to New Instance
```sql
-- Import in correct order (respecting foreign keys)
COPY profiles FROM '/tmp/profiles.csv' CSV HEADER;
COPY team_profiles FROM '/tmp/team_profiles.csv' CSV HEADER;
COPY badge_catalog FROM '/tmp/badges.csv' CSV HEADER;
-- Continue for all tables
```

#### 3.3 Verify Data Integrity
```sql
-- Check record counts
SELECT 'profiles' as table_name, COUNT(*) FROM profiles
UNION ALL
SELECT 'badges', COUNT(*) FROM badge_catalog;

-- Verify foreign key relationships
SELECT * FROM user_badges ub
LEFT JOIN profiles p ON ub.user_id = p.user_id
WHERE p.user_id IS NULL;
```

### Phase 4: Storage Migration

#### 4.1 Create Storage Buckets
```bash
supabase storage create badges --public
# Configure RLS policies via dashboard or SQL
```

#### 4.2 Migrate Files
```bash
# Download from Lovable Cloud storage
# Upload to new Supabase storage
# Update URLs in database if needed
```

### Phase 5: Edge Functions Migration

#### 5.1 Deploy Functions
```bash
# All functions are in supabase/functions/
supabase functions deploy auto-generate-country-options
supabase functions deploy badge-service-api
supabase functions deploy create-b2b-user
# ... deploy all functions

# Or deploy all at once
supabase functions deploy --all
```

#### 5.2 Configure Function Secrets
```bash
# Set required secrets
supabase secrets set OPENAI_API_KEY=your_key
supabase secrets set ANTHROPIC_API_KEY=your_key
# Add any other required secrets
```

#### 5.3 Update Function URLs
```typescript
// Update any hardcoded URLs in frontend
const FUNCTIONS_URL = process.env.VITE_SUPABASE_URL + '/functions/v1';
```

### Phase 6: Update Application Configuration

#### 6.1 Update Environment Variables
```env
# .env.production
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_new_anon_key
VITE_SUPABASE_PROJECT_ID=your_new_project_id
```

#### 6.2 Update Supabase Client
```typescript
// Should automatically pick up new env vars
// No code changes needed if using env vars properly
import { supabase } from '@/integrations/supabase/client';
```

#### 6.3 Regenerate Types
```bash
supabase gen types typescript --local > src/integrations/supabase/types.ts
# Or from linked project
supabase gen types typescript --linked > src/integrations/supabase/types.ts
```

#### 6.4 Validate Session Isolation
```bash
# After updating environment variables, test session isolation
1. Log in to admin portal
2. Navigate to /admin/simulator
3. Start a simulation
4. Verify admin session remains active (no logout)
5. Hard refresh simulator iframe
6. Verify test user session persists in iframe
```

See [Simulator Architecture](SIMULATOR_ARCHITECTURE.md) for troubleshooting.

### Phase 7: GitHub Integration

#### 7.1 Create GitHub Repository
```bash
git init
git remote add origin https://github.com/your-org/your-repo.git
git add .
git commit -m "Initial commit - migrated from Lovable Cloud"
git push -u origin main
```

#### 7.2 Set Up GitHub Actions (Optional)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Supabase
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: supabase/setup-cli@v1
      - run: supabase functions deploy --all
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
```

#### 7.3 Configure Branch Protection
- Enable PR reviews
- Require status checks
- Protect main branch

### Phase 8: Testing & Validation

#### 8.1 Run Test Suite
```bash
npm test
npm run test:coverage
```

#### 8.2 Test Critical Flows
- [ ] User registration and authentication
- [ ] Profile completion and updates
- [ ] Badge awarding
- [ ] Earning activities
- [ ] Admin functions
- [ ] Edge functions

#### 8.3 Performance Testing
- Load test critical endpoints
- Verify edge function response times
- Check database query performance

### Phase 9: Deployment

#### 9.1 Deploy to Staging
```bash
npm run build
# Deploy to staging environment
# Full QA testing
```

#### 9.2 Deploy to Production
```bash
# Update production environment variables
# Deploy application
npm run build
# Deploy to production hosting (Netlify, Vercel, etc.)
```

#### 9.3 DNS & SSL
- Update DNS records if needed
- Verify SSL certificates
- Test all endpoints

### Phase 10: Post-Migration

#### 10.1 Monitor
- Set up error tracking (Sentry, etc.)
- Monitor database performance
- Watch edge function logs

#### 10.2 Backup Strategy
```bash
# Set up automated backups
supabase db dump > backup_$(date +%Y%m%d).sql
```

#### 10.3 Documentation
- Update all documentation with new endpoints
- Document deployment process
- Create runbooks for common tasks

## Rollback Plan

### Immediate Rollback
1. Revert environment variables to Lovable Cloud
2. Redeploy previous version
3. No data loss (Lovable Cloud still has original data)

### Data Sync Considerations
- Implement read-only mode during migration
- Or plan for data reconciliation
- Document any data created during migration window

## Cost Comparison

### Lovable Cloud
- **Cost**: Included with Lovable subscription
- **Management**: Fully managed
- **Scaling**: Automatic

### Self-Hosted Supabase
- **Free Tier**: Up to 500MB database, 1GB file storage
- **Pro Plan**: $25/month + usage
- **Team Plan**: $599/month
- **Management**: Self-managed
- **Scaling**: Manual configuration

## Considerations

### Pros of Self-Hosted
- ✅ Full control over database
- ✅ Direct access to all features
- ✅ Can use Supabase CLI locally
- ✅ Easier local development
- ✅ Better for large teams
- ✅ More deployment flexibility

### Cons of Self-Hosted
- ❌ Additional infrastructure management
- ❌ Need to handle deployments
- ❌ Responsible for backups
- ❌ Additional costs
- ❌ More complex setup

## Recommended Approach

### Option 1: Full Migration (Recommended for Production)
- Complete all phases above
- Full ownership and control
- Best for scaling and team growth

### Option 2: Hybrid Approach
- Keep Lovable Cloud for development
- Use self-hosted for production
- Best of both worlds

### Option 3: Stay on Lovable Cloud
- If current setup meets needs
- Simplest option
- Less management overhead

## Timeline Estimate

- **Phase 1-2**: 2-3 days (Setup + Schema)
- **Phase 3-4**: 1-2 days (Data + Storage)
- **Phase 5-6**: 1-2 days (Functions + Config)
- **Phase 7**: 1 day (GitHub)
- **Phase 8**: 2-3 days (Testing)
- **Phase 9**: 1 day (Deployment)
- **Total**: 8-12 days for complete migration

## Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Migration Guide](https://supabase.com/docs/guides/platform/migrating-and-upgrading-projects)
- [Lovable Documentation](https://docs.lovable.dev)

## Conclusion

Migrating from Lovable Cloud to self-hosted Supabase is achievable but requires careful planning and execution. The comprehensive test suite now in place will help validate the migration at each step.

Consider your team's needs, resources, and timeline before deciding on the migration approach.
