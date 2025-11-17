# Local Development Setup - Summary of Changes

## Overview

The `npm run dev` command and associated configurations have been updated to automatically connect to **local Supabase** by default, improving development workflow and preventing accidental changes to production data.

## What Changed

### 1. New Files Created

#### `.env.local` (NEW)
- Pre-configured with local Supabase connection details
- Safe to commit (contains no secrets, only localhost URLs)
- Used automatically when running `npm run dev`

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=<local-anon-key>
VITE_SUPABASE_PROJECT_ID=chlqpvzreztzxmjjdjpk
```

#### `docs/LOCAL_DEVELOPMENT.md` (NEW)
- Comprehensive guide for local Supabase development
- Troubleshooting tips
- Best practices
- Migration workflow

#### `src/components/layout/EnvironmentIndicator.tsx` (NEW)
- Visual banner showing current environment (local vs remote)
- Green banner for local development
- Amber/orange banner for remote development with warning
- Expandable details panel with mode, URL, and quick links
- Dismissible (hides for 1 hour)
- Automatically hidden in production

### 2. Updated Files

#### `package.json`
**New Scripts:**
```json
{
  "dev": "vite --mode local",           // Uses .env.local (default)
  "dev:remote": "vite --mode development", // Uses .env (remote)
  "dev:local": "npm run supabase:start && npm run dev",
  "supabase:start": "supabase start && echo 'Local Supabase running'",
  "supabase:stop": "supabase stop",
  "supabase:status": "supabase status",
  "env:setup:local": "cp .env.local .env"
}
```

#### `vite.config.ts`
- Added `loadEnv` import for environment-aware configuration
- Supports multiple environment modes (local, development, production)
- Properly loads `.env.local` in local mode

#### `.env.example`
- Added documentation about local vs remote development
- Clear instructions for choosing environment setup

#### `.gitignore`
- Explicitly allows `.env.local` to be committed (safe, no secrets)
- Still ignores `.env` (contains production credentials)

#### `README.md`
- Updated quick start instructions to recommend local development
- Added link to comprehensive local development guide

## How to Use

### Starting Fresh (New Developer)

```bash
# Clone the repo
git clone <repo-url>
cd looplly-me-master

# Install dependencies
npm i

# Start local Supabase + dev server (all-in-one)
npm run dev:local
```

The app will automatically connect to local Supabase at `http://127.0.0.1:54321`.

### Day-to-Day Development

```bash
# Just run dev (local Supabase must be running)
npm run dev
```

If Supabase isn't running, you'll see connection errors. Start it with:
```bash
npm run supabase:start
```

### Switching Between Local and Remote

**Switch to Local:**
```bash
npm run env:setup:local  # Copy .env.local to .env
npm run dev              # Already uses local mode
```

**Switch to Remote:**
```bash
npm run env:setup        # Copy .env.example to .env
# Edit .env with remote credentials
npm run dev:remote       # Explicitly use remote
```

## Environment Modes

| Mode | Command | Environment File | Supabase Target |
|------|---------|------------------|-----------------|
| **local** (default) | `npm run dev` | `.env.local` | Local (127.0.0.1:54321) |
| development | `npm run dev:remote` | `.env` | Remote project |
| production | `npm run build` | `.env` | Remote project |

## Visual Environment Indicator

The app now displays a **visual banner** at the top to show which environment you're connected to:

### 🟢 Local Development (Green Banner)
- Displayed when connected to `127.0.0.1:54321`
- Pulsing database icon
- "LOCAL DEVELOPMENT" label
- Expandable to show:
  - Current mode (local)
  - Dev server status
  - Supabase URL
  - Quick links to Studio Dashboard and Email Testing
- Safe to make changes

### 🟠 Remote Development (Amber/Orange Banner)
- Displayed when connected to remote Supabase
- Globe icon
- "REMOTE DEVELOPMENT" label with warning
- Shows alert about production data risk
- Recommends switching to local mode

**Banner Controls:**
- **Expand (▼)**: View full environment details
- **Dismiss (X)**: Hide banner for 1 hour
- **Auto-hide**: Automatically hidden in production builds

## Benefits

1. ✅ **Safe by default** - No accidental production changes
2. ✅ **Visual feedback** - Clear indicator of current environment
3. ✅ **Fast setup** - Pre-configured local credentials
4. ✅ **Easy testing** - Isolated test environment
5. ✅ **Migration testing** - Test DB changes locally first
6. ✅ **Edge function dev** - Test functions without deployment
7. ✅ **Consistent** - Same local environment for all devs
8. ✅ **Quick access** - Direct links to Studio and Email Testing

## Local Supabase Services

When `npm run supabase:start` completes, you get:

| Service | URL |
|---------|-----|
| **API** | http://127.0.0.1:54321 |
| **Database** | postgresql://postgres:postgres@127.0.0.1:54322/postgres |
| **Studio** | http://127.0.0.1:54323 |
| **Email Testing** | http://127.0.0.1:54324 |
| **Edge Functions** | http://127.0.0.1:54321/functions/v1 |

## Troubleshooting

### "Cannot connect to Supabase"
```bash
# Check if Supabase is running
npm run supabase:status

# Start if not running
npm run supabase:start
```

### "Migration errors on startup"
```bash
# Reset local database
npm run supabase:stop
docker volume prune -f
npm run supabase:start
```

### "Wrong environment variables"
```bash
# Verify which env file is active
cat .env

# Should show local URLs if in local mode
# If not, run:
npm run env:setup:local
```

## Migration Workflow

```bash
# 1. Create migration locally
supabase migration new add_feature

# 2. Edit migration file
# supabase/migrations/<timestamp>_add_feature.sql

# 3. Test locally
npm run supabase:start

# 4. Verify in Studio
open http://127.0.0.1:54323

# 5. When ready, deploy to remote
supabase db push --linked
```

## Key Reminders

- **Default is now LOCAL** - `npm run dev` uses local Supabase
- **`.env.local` is safe to commit** - No secrets, just localhost config
- **`.env` still gitignored** - Contains production credentials
- **Use `dev:remote` for remote testing** - When you need actual production data
- **Always test migrations locally** - Before pushing to remote

## Additional Resources

- [Full Local Development Guide](docs/LOCAL_DEVELOPMENT.md)
- [Environment Setup](docs/ENVIRONMENT_SETUP.md)
- [Edge Functions Guide](docs/EDGE_FUNCTIONS_GUIDE.md)
- [WARP.md](WARP.md) - AI agent guidance

## Support

If you encounter issues:
1. Check Docker is running: `docker ps`
2. Check Supabase status: `npm run supabase:status`
3. View logs: `supabase logs`
4. Refer to [LOCAL_DEVELOPMENT.md](docs/LOCAL_DEVELOPMENT.md) troubleshooting section
