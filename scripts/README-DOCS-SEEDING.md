# Automated Documentation Seeding System

## Overview

The Knowledge Centre now uses **automated documentation seeding** that dynamically discovers and syncs all markdown files from `public/docs/`.

## How It Works

### 1. Build-Time Seeding (Primary)
Every deployment automatically seeds documentation:
```bash
npm run build
# Automatically runs: npm run postbuild → seed-docs-after-build.js
```

### 2. Manual Seeding (Testing)
Admins can manually trigger seeding via Admin Portal → Knowledge Centre → "Seed Database" button

### 3. Manual CLI Seeding
```bash
npm run seed:docs
```

## Architecture

```
public/docs/*.md
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
category: "Core Systems"
description: "Brief description"
audience: "all"
tags: ["tag1", "tag2"]
status: "published"
---
```

## Adding New Documentation

1. Create `public/docs/YOUR_DOC.md`
2. Add frontmatter (see format above)
3. Write content in Markdown
4. Deploy (auto-seeds) or click "Seed Database" button

**That's it!** No hardcoded lists to maintain.

## Benefits

✅ **Automatic** - Seeding happens on every deployment
✅ **Dynamic** - Discovers all `.md` files automatically  
✅ **Single Source of Truth** - Frontmatter in each file
✅ **No Manual Work** - Zero maintenance required
✅ **Always In Sync** - Knowledge Centre reflects actual files

## Troubleshooting

**Seeding fails during build:**
- Check edge function logs
- Verify SUPABASE_SERVICE_ROLE_KEY is set
- Ensure all files have valid frontmatter

**Document not appearing:**
- Verify frontmatter `status: "published"`
- Check `id` is unique
- Re-run manual seed button
