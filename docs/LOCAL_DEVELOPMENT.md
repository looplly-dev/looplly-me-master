# Local Development Guide

This guide explains how to run the Looplly.me application with a local Supabase instance for development.

## Prerequisites

- Node.js 22+
- Supabase CLI installed (`npm install -g supabase` or `brew install supabase/tap/supabase`)
- Docker Desktop running (required for local Supabase)

## Quick Start

### Option 1: Automatic Setup (Recommended)

```bash
# Start local Supabase and dev server in one command
npm run dev:local
```

This will:
1. Start local Supabase instance
2. Apply all migrations
3. Start the Vite dev server on http://localhost:8080
4. Automatically connect to local Supabase
5. Display a **green banner** at the top showing you're in local mode

### Option 2: Manual Setup

```bash
# 1. Start local Supabase
npm run supabase:start

# 2. In a separate terminal, start the dev server
npm run dev
```

### Option 3: Use Remote Supabase

```bash
# Connect to remote/production Supabase instance
npm run dev:remote
```

## Visual Environment Indicator

When running in development mode, you'll see a **colored banner** at the top of the app:

- 🟢 **Green Banner (LOCAL DEVELOPMENT)**: Connected to local Supabase at `127.0.0.1:54321`
  - Safe to make changes
  - No risk to production data
  - Quick links to Studio Dashboard and Email Testing

- 🟠 **Amber/Orange Banner (REMOTE DEVELOPMENT)**: Connected to remote Supabase
  - ⚠️ Warning displayed
  - Changes may affect production
  - Recommended to switch to local mode

**Banner Features:**
- Click the expand button (▼) to see full environment details
- Click the X button to dismiss for 1 hour
- Shows current mode, Supabase URL, and quick links (local only)
- Automatically hidden in production builds

## Environment Configuration

### Local Development (.env.local)

The `.env.local` file is pre-configured with local Supabase credentials:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=chlqpvzreztzxmjjdjpk
NODE_ENV=development
VITE_ENABLE_DEBUG=true
```

**By default, `npm run dev` uses .env.local automatically.**

### Remote Development (.env)

For remote/production Supabase, copy `.env.example` to `.env`:

```bash
npm run env:setup
```

Then update the values with your remote Supabase credentials.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with **local** Supabase (default) |
| `npm run dev:remote` | Start dev server with **remote** Supabase |
| `npm run dev:local` | Start local Supabase + dev server |
| `npm run supabase:start` | Start local Supabase instance |
| `npm run supabase:stop` | Stop local Supabase instance |
| `npm run supabase:status` | Check local Supabase status |

## Local Supabase Services

When running `npm run supabase:start`, the following services are available:

| Service | URL |
|---------|-----|
| API Gateway | http://127.0.0.1:54321 |
| Database | postgresql://postgres:postgres@127.0.0.1:54322/postgres |
| Studio (Dashboard) | http://127.0.0.1:54323 |
| Inbucket (Email) | http://127.0.0.1:54324 |
| Edge Functions | http://127.0.0.1:54321/functions/v1 |

### Database Credentials

```
Host: 127.0.0.1
Port: 54322
User: postgres
Password: postgres
Database: postgres
```

## Working with Local Supabase

### View Local Dashboard

```bash
# Open Supabase Studio
open http://127.0.0.1:54323
```

### Run Migrations

```bash
# Apply new migrations
supabase db push

# Reset database (⚠️ destroys all data)
supabase db reset

# Create new migration
supabase migration new <migration-name>
```

### Deploy Edge Functions Locally

```bash
# Deploy a single function
supabase functions deploy <function-name> --local

# Test function locally
curl http://127.0.0.1:54321/functions/v1/<function-name>
```

### View Local Logs

```bash
# View all logs
supabase logs

# View function logs
supabase functions logs <function-name>

# View database logs
supabase logs --database
```

## Troubleshooting

### "Supabase is not running"

```bash
# Check Docker is running
docker ps

# Start Supabase
npm run supabase:start
```

### Migration Errors

If you see duplicate table errors:

```bash
# Stop Supabase
npm run supabase:stop

# Clear Docker volumes
docker volume prune -f

# Restart Supabase (applies migrations fresh)
npm run supabase:start
```

### Port Conflicts

If ports 54321-54324 are in use:

```bash
# Stop conflicting services
lsof -ti:54321 | xargs kill -9

# Or modify ports in supabase/config.toml
```

### Environment Variables Not Loading

```bash
# Verify .env.local exists
cat .env.local

# Copy .env.local to .env if needed
npm run env:setup:local

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

## Dual Authentication System

⚠️ **CRITICAL**: This project uses TWO separate authentication systems:

1. **User Portal**: Custom JWT (localStorage key: `'auth'`)
2. **Admin Portal**: Supabase Auth (localStorage key: `'admin_auth'`)

When testing locally:
- User login: Uses edge function `mock-looplly-login`
- Admin login: Uses Supabase Auth with `adminClient`
- Sessions are isolated; never mix clients

## Testing with Local Supabase

### Create Test Users

```bash
# Use the simulator to create test data
# Navigate to: http://localhost:8080/admin/simulator
```

Or seed via SQL:

```sql
-- In Supabase Studio SQL Editor
INSERT INTO auth.users (id, email) 
VALUES (gen_random_uuid(), 'test@example.com');

INSERT INTO public.profiles (id, email, username)
VALUES (auth.uid(), 'test@example.com', 'testuser');
```

### Test Edge Functions

```bash
# Test mock login function
curl -X POST http://127.0.0.1:54321/functions/v1/mock-looplly-login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "test@example.com", "password": "password123"}'
```

## Switching Between Local and Remote

### Switch to Local

```bash
npm run env:setup:local  # Copy .env.local to .env
npm run dev              # Runs in local mode by default
```

### Switch to Remote

```bash
npm run env:setup        # Copy .env.example to .env
# Edit .env with remote credentials
npm run dev:remote       # Explicitly use remote mode
```

## Best Practices

1. **Always use local Supabase for development** - Prevents production data corruption
2. **Commit `.env.local`** - Safe to commit (no secrets)
3. **Never commit `.env`** - Contains production credentials
4. **Reset local DB regularly** - Keeps migrations clean
5. **Test migrations locally first** - Before deploying to remote

## Migration Development Workflow

```bash
# 1. Create new migration
supabase migration new add_new_feature

# 2. Edit the migration file
# supabase/migrations/<timestamp>_add_new_feature.sql

# 3. Test locally
npm run supabase:start

# 4. Verify in Studio
open http://127.0.0.1:54323

# 5. Deploy to remote (when ready)
supabase db push --linked
```

## Related Documentation

- [WARP.md](../WARP.md) - AI agent guidance
- [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) - Environment configuration
- [EDGE_FUNCTIONS_GUIDE.md](./EDGE_FUNCTIONS_GUIDE.md) - Edge function development

## Support

For issues:
1. Check [Supabase CLI docs](https://supabase.com/docs/guides/cli)
2. Review local Supabase logs: `supabase logs`
3. Check Docker logs: `docker logs supabase_db_chlqpvzreztzxmjjdjpk`
