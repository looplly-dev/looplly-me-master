# Automated Documentation Seeding System

## Overview

The Knowledge Centre uses **automated documentation seeding** from a single source of truth: `docs/`.

## How It Works

### 1. Build-Time Seeding (Primary)
Every deployment automatically seeds documentation:
```bash
npm run build
# Automatically runs: npm run postbuild → seed-docs-after-build.js
```

### 2. Manual Seeding (Admin Portal)
Admins can manually trigger seeding via Admin Portal → Knowledge Centre → "Seed Database" button

### 3. Manual CLI Seeding
```bash
npm run seed:docs
```

## Architecture

```
docs/**/*.md (single source of truth)
  ↓ (frontmatter extracted)
scripts/seed-docs-after-build.js
  ↓ (POST request)
supabase/functions/seed-documentation
  ↓ (upsert to DB)
documentation table
```

## Frontmatter Format

All `.md` files must include YAML frontmatter:

```yaml
---
id: "unique-slug"
title: "Document Title"
category: "Admin"
description: "Brief description"
audience: "all"
tags: ["tag1", "tag2"]
status: "published"
---
```

## Standard Categories

Use these standardized categories for consistency:

1. **Admin** - All admin portal guides and operations
2. **Authentication** - Auth flows, security, user sessions
3. **Deployment** - Environment setup, config, migrations
4. **Features** - Feature documentation (earning, mobile, profiling, etc.)
5. **Core Systems** - Core platform architecture
6. **Technical** - Technical specs, data models, APIs
7. **Testing** - Testing strategies, simulators, QA
8. **User Guides** - End-user documentation
9. **Reputation & Rewards** - Rep system, badges, streaks
10. **Profiling System** - Profile questions, decay, targeting

## Adding New Documentation

1. Create `docs/[subdirectory]/YOUR_DOC.md`
2. Add complete frontmatter (see format above)
3. Write content in Markdown
4. Deploy (auto-seeds) or click "Seed Database" button

**That's it!** No manual lists to maintain.

## Benefits

✅ **Automatic** - Seeding happens on every deployment
✅ **Single Source** - All docs in `docs/` only (no duplicates)
✅ **Organized** - Subdirectories for logical grouping  
✅ **No Manual Work** - Zero maintenance required
✅ **Always In Sync** - Knowledge Centre reflects actual files
✅ **Consistent Categories** - Standardized naming prevents fragmentation

## Migration Completed (2025-10-29)

**Phase 2 Consolidation:**
- ✅ Deleted legacy `/public/docs` folder (43 duplicate files)
- ✅ Moved unique files to `/docs` structure
- ✅ Standardized all categories (20+ → 10 clean categories)
- ✅ Updated seeder to single source (`docs/` only)
- ✅ Fixed frontmatter inconsistencies
- ✅ Result: 0 uncategorized docs, clean category structure

See `docs/DOCUMENTATION_AUDIT_PHASE1.md` for full audit report.

## Troubleshooting

**Seeding fails during build:**
- Check edge function logs
- Verify SUPABASE_SERVICE_ROLE_KEY is set
- Ensure all files have valid frontmatter
- Check category names match standards

**Document not appearing:**
- Verify frontmatter `status: "published"`
- Check `id` is unique
- Ensure `category` uses standard name
- Re-run manual seed button

**Uncategorized documents:**
- Check frontmatter has `category` field
- Verify category name matches standard list
- Ensure no typos in category name
