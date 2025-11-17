#!/usr/bin/env bash
# ============================================================================
# Reset Local Database to Fresh Start
# ============================================================================
# This script resets your local Supabase database to use the consolidated
# migration instead of the 119 individual migrations.
#
# WARNING: This will DELETE all local data!
# ============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║   LOOPLLY.ME DATABASE RESET SCRIPT                    ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Confirm this is intentional
echo -e "${RED}⚠️  WARNING: This will DELETE all local database data!${NC}"
echo -e "${RED}⚠️  This ONLY affects your local Supabase instance.${NC}"
echo ""
read -p "Are you sure you want to continue? (type 'yes' to confirm): " confirm

if [ "$confirm" != "yes" ]; then
  echo -e "${YELLOW}Aborted. No changes made.${NC}"
  exit 0
fi

echo ""
echo -e "${GREEN}Starting database reset...${NC}"
echo ""

# Step 1: Stop local Supabase (if running)
echo "📌 Step 1: Stopping local Supabase..."
if supabase status &>/dev/null; then
  supabase stop
  echo -e "${GREEN}✓ Supabase stopped${NC}"
else
  echo -e "${YELLOW}⚠ Supabase not running${NC}"
fi

# Step 2: Archive old migrations
echo ""
echo "📌 Step 2: Archiving old migrations..."
MIGRATION_DIR="supabase/migrations"
ARCHIVE_DIR="supabase/migrations_archived_$(date +%Y%m%d_%H%M%S)"

if [ -d "$MIGRATION_DIR" ]; then
  mkdir -p "$ARCHIVE_DIR"
  
  # Move all migrations EXCEPT the consolidated one
  find "$MIGRATION_DIR" -maxdepth 1 -type f -name "*.sql" ! -name "00000000000000_fresh_start.sql" -exec mv {} "$ARCHIVE_DIR/" \;
  
  # Move any README files
  find "$MIGRATION_DIR" -maxdepth 1 -type f -name "*.md" -exec mv {} "$ARCHIVE_DIR/" \;
  
  echo -e "${GREEN}✓ Old migrations archived to: $ARCHIVE_DIR${NC}"
  echo -e "${GREEN}✓ Consolidated migration retained: 00000000000000_fresh_start.sql${NC}"
else
  echo -e "${RED}✗ Migration directory not found!${NC}"
  exit 1
fi

# Step 3: Reset Supabase database
echo ""
echo "📌 Step 3: Resetting database..."
supabase db reset
echo -e "${GREEN}✓ Database reset complete${NC}"

# Step 4: Verify migration applied
echo ""
echo "📌 Step 4: Verifying migration..."
MIGRATION_COUNT=$(supabase migration list 2>/dev/null | grep -c "00000000000000_fresh_start" || echo "0")

if [ "$MIGRATION_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✓ Consolidated migration applied successfully${NC}"
else
  echo -e "${RED}✗ Migration verification failed${NC}"
  exit 1
fi

# Step 5: Generate TypeScript types
echo ""
echo "📌 Step 5: Generating TypeScript types..."
supabase gen types typescript --linked > src/integrations/supabase/types.ts
echo -e "${GREEN}✓ Types generated${NC}"

# Step 6: Show summary
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   DATABASE RESET COMPLETE ✓                           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "📊 Summary:"
echo "  • Old migrations archived: $ARCHIVE_DIR"
echo "  • Active migration: 00000000000000_fresh_start.sql"
echo "  • TypeScript types: src/integrations/supabase/types.ts"
echo ""
echo "🚀 Next steps:"
echo "  1. Start Supabase: supabase start"
echo "  2. Seed data (if needed): npm run seed"
echo "  3. Start dev server: npm run dev"
echo ""
