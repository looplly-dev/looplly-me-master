# Supabase Migration Guide: From Lovable Cloud to Self-Hosted

## Overview

This guide provides a comprehensive analysis and step-by-step process for migrating from Lovable Cloud to your own Supabase instance with GitHub integration.

## Current Architecture

### Lovable Cloud Setup
- **Backend**: Lovable-managed Supabase instance
- **Project ID**: `kzqcfrubjccxrwfkkrze`
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

### 1. Assess Current Usage
- **Database Size**: Determine the current database size to estimate migration time and storage requirements.
- **Traffic Patterns**: Analyze traffic patterns to ensure minimal downtime during the migration.
- **Critical Features**: Identify critical features and dependencies to prioritize testing.

### 2. Review Database Schema
- **Extensions**: List all enabled extensions (e.g., `pgcrypto`, `uuid-ossp`, `pg_trgm`).
- **Custom Functions**: Document any custom SQL functions or triggers.
- **Data Types**: Note any custom data types or enums.

### 3. Audit Authentication Setup
- **Auth Providers**: Identify all enabled authentication providers (e.g., email, Google, GitHub).
- **Custom Roles**: Document any custom user roles or permissions.
- **Policies**: Review Row Level Security (RLS) policies to ensure they are correctly configured.

### 4. Examine Edge Functions
- **Dependencies**: List all dependencies used in edge functions (check `supabase/functions/*/package.json`).
- **Environment Variables**: Document any environment variables used by edge functions.
- **Invocation Patterns**: Understand how edge functions are invoked and their performance characteristics.

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

### Phase 1: Setup New Supabase Instance
1.  **Create New Project**:
    -   Sign up at [Supabase](https://supabase.com/).
    -   Create a new project, selecting a region close to your users.
2.  **Configure Database**:
    -   Enable necessary extensions: `pgcrypto`, `uuid-ossp`, `pg_trgm`.
    ```sql
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
    ```
3.  **Set Environment Variables**:
    -   Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_SUPABASE_PROJECT_ID` to your React app.
4.  **Install Supabase CLI**:
    ```bash
    npm install -g supabase
    ```
    -   Authenticate with your Supabase account:
    ```bash
    supabase login
    ```
5.  **Initialize Local Project**:
    -   In your project directory, run:
    ```bash
    supabase init
    ```
    -   This creates a `supabase` directory with configurations.
6.  **Link to Supabase Project**:
    ```bash
    supabase link --project-id your_project_id
    ```
    -   Replace `your_project_id` with your actual Supabase project ID.

### Phase 2: Database Migration
1.  **Dump Existing Database**:
    ```bash
    supabase db dump --db-url $SUPABASE_DB_URL --schema public --file dump.sql
    ```
    -   Ensure `$SUPABASE_DB_URL` is set to your Lovable Cloud Supabase URL.
2.  **Apply Dump to New Database**:
    ```bash
    supabase db push --file dump.sql
    ```
    -   This pushes the schema and data to your new Supabase instance.
3.  **Verify Data**:
    -   Connect to the new database and verify that all tables, data, and extensions are correctly migrated.

### Phase 3: Authentication Migration
1.  **Export Auth Users**:
    -   Use the Supabase Admin API or CLI to export existing users.
    ```bash
    # Example using Supabase CLI (check for actual command syntax)
    supabase auth export --project-id your_project_id > auth_users.json
    ```
2.  **Import Auth Users**:
    -   Import the users into your new Supabase project.
    ```bash
    # Example using Supabase CLI (check for actual command syntax)
    supabase auth import --project-id your_project_id < auth_users.json
    ```
3.  **Update Auth Settings**:
    -   Configure authentication providers (e.g., Google, GitHub) in your new Supabase project.
    -   Set up any custom roles or RLS policies.

### Phase 4: Edge Functions Migration
1.  **Copy Functions**:
    -   Copy the contents of the `supabase/functions/` directory from your Lovable Cloud project to your local project.
2.  **Update Dependencies**:
    -   Review each function's `package.json` and install any missing dependencies.
    ```bash
    cd supabase/functions/your_function
    npm install
    cd ../../
    ```
3.  **Deploy Functions**:
    ```bash
    supabase functions deploy your_function
    ```
    -   Deploy each function to your new Supabase project.
4.  **Set Environment Variables**:
    -   Configure any necessary environment variables for your edge functions in the Supabase dashboard.

### Phase 5: GitHub Integration Setup
1.  **Create New Repository**:
    -   Create a new GitHub repository for your Supabase project.
2.  **Initialize Git**:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git remote add origin your_github_repo_url
    git push -u origin main
    ```
3.  **Enable Database Migrations**:
    ```bash
    supabase db diff --schema public
    ```
    -   This generates a migration file.
    ```bash
    supabase db migrate
    ```
    -   Apply the migration to your database.
4.  **Setup CI/CD**:
    -   Configure GitHub Actions to automatically deploy changes to your Supabase project.
    -   Example workflow file (`.github/workflows/supabase.yml`):
    ```yaml
    name: Supabase CI/CD
    on:
      push:
        branches: [main]
    jobs:
      deploy:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v2
          - uses: supabase/supabase-cli@v1
            with:
              supabase_url: ${{ secrets.SUPABASE_URL }}
              supabase_key: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
              args: "deploy"
    ```
    -   Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as repository secrets.

### Phase 6: Testing and Validation
1.  **Functional Testing**:
    -   Test all critical features of your application to ensure they are working correctly.
    -   Pay special attention to authentication, data access, and edge function invocations.
2.  **Performance Testing**:
    -   Run performance tests to ensure that the new Supabase instance can handle your application's traffic.
    -   Monitor database performance and edge function execution times.
3.  **Security Testing**:
    -   Review RLS policies and authentication settings to ensure that your application is secure.
    -   Test for common security vulnerabilities.

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
1. **Enable Git Linking**:
   - In the Supabase dashboard, enable Git linking for your project.
2. **Connect to Repository**:
   - Connect your Supabase project to the GitHub repository you created.
3. **Configure Branch**:
   - Specify the branch to track for database migrations (usually `main`).
4. **Review Initial Migration**:
   - Supabase will create an initial migration based on your current database schema.
   - Review this migration to ensure it matches your expectations.

### Phase 8: DNS and Traffic Migration
1.  **Update DNS Records**:
    -   Update your DNS records to point to the new Supabase instance.
    -   This may involve changing A records or CNAME records.
2.  **Monitor Traffic**:
    -   Monitor traffic to the old and new instances to ensure a smooth transition.
    -   Use analytics tools to track user behavior and identify any issues.
3.  **Switch Over**:
    -   Once you are confident that the new instance is stable, switch over all traffic.
    -   Decommission the old Lovable Cloud instance.

### Phase 9: Post-Migration Tasks
1.  **Monitor Performance**:
    -   Continuously monitor the performance of your new Supabase instance.
    -   Optimize database queries and edge function execution as needed.
2.  **Backup Strategy**:
    -   Implement a robust backup strategy for your Supabase database.
    -   Test your backup and restore procedures regularly.
3.  **Disaster Recovery**:
    -   Develop a disaster recovery plan to ensure that you can quickly recover from any outages.
    -   Test your disaster recovery plan regularly.

## Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Migration Guide](https://supabase.com/docs/guides/platform/migrating-and-upgrading-projects)
- [Lovable Documentation](https://docs.lovable.dev)
- [Simulator Architecture](SIMULATOR_ARCHITECTURE.md)

## Conclusion

Migrating from Lovable Cloud to self-hosted Supabase is achievable but requires careful planning and execution. The comprehensive test suite now in place will help validate the migration at each step.

Consider your team's needs, resources, and timeline before deciding on the migration approach.
