#!/bin/bash

# Script: Apply country_code backfill migration
# Description: Extract country codes from mobile numbers for profiles with NULL country_code
# Date: 2025-11-09

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MIGRATION_FILE="$PROJECT_ROOT/supabase/migrations/20251109050645_0b08c576-2a7d-4cae-92b3-3c6e7e55d213.sql"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Country Code Backfill Migration${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}ERROR: Migration file not found at:${NC}"
    echo "$MIGRATION_FILE"
    exit 1
fi

echo -e "${GREEN}✓${NC} Migration file found"
echo ""

# Show what the migration will do
echo -e "${YELLOW}This migration will:${NC}"
echo "  1. Find all profiles with NULL country_code but valid mobile numbers"
echo "  2. Extract country code from mobile number (E.164 format)"
echo "  3. Update profiles with the extracted country code"
echo "  4. Create an index on country_code for better performance"
echo "  5. Add documentation comments"
echo ""

# Ask for confirmation
echo -e "${YELLOW}Which environment do you want to apply this to?${NC}"
echo "  1) Local development (default)"
echo "  2) Remote (Supabase project)"
echo ""
read -p "Enter choice [1-2]: " choice
choice=${choice:-1}

case $choice in
    1)
        ENV="local"
        echo -e "${BLUE}Applying to LOCAL development database...${NC}"
        
        # Check if Supabase is running locally
        if ! command -v supabase &> /dev/null; then
            echo -e "${RED}ERROR: Supabase CLI not found. Please install it first.${NC}"
            echo "Visit: https://supabase.com/docs/guides/cli/getting-started"
            exit 1
        fi
        
        # Check if local Supabase is running
        if ! supabase status &> /dev/null; then
            echo -e "${RED}ERROR: Local Supabase is not running.${NC}"
            echo "Start it with: supabase start"
            exit 1
        fi
        
        echo ""
        echo -e "${GREEN}✓${NC} Supabase CLI found and local instance is running"
        echo ""
        
        # Show current profiles count
        echo -e "${BLUE}Checking current state...${NC}"
        supabase db execute "
            SELECT 
                COUNT(*) as total_profiles,
                COUNT(CASE WHEN country_code IS NULL AND mobile IS NOT NULL THEN 1 END) as needs_fixing
            FROM profiles;
        " --local || true
        echo ""
        
        # Confirm
        read -p "Apply migration to LOCAL database? [y/N]: " confirm
        if [[ $confirm != [yY] ]]; then
            echo "Migration cancelled."
            exit 0
        fi
        
        echo ""
        echo -e "${BLUE}Applying migration...${NC}"
        
        # Apply the migration
        if supabase db reset --local; then
            echo ""
            echo -e "${GREEN}✓ Migration applied successfully!${NC}"
        else
            echo ""
            echo -e "${RED}✗ Migration failed. Check the error messages above.${NC}"
            exit 1
        fi
        ;;
        
    2)
        ENV="remote"
        echo -e "${YELLOW}⚠ CAUTION: You are about to apply this to your REMOTE Supabase project!${NC}"
        echo ""
        
        # Extra confirmation for production
        read -p "Are you ABSOLUTELY sure? Type 'yes' to continue: " confirm
        if [[ $confirm != "yes" ]]; then
            echo "Migration cancelled."
            exit 0
        fi
        
        echo ""
        echo -e "${BLUE}Applying to REMOTE database...${NC}"
        
        # Check if linked to a project
        if ! supabase projects list &> /dev/null; then
            echo -e "${RED}ERROR: Not logged in to Supabase. Run: supabase login${NC}"
            exit 1
        fi
        
        # Apply the migration
        if supabase db push; then
            echo ""
            echo -e "${GREEN}✓ Migration applied successfully to remote database!${NC}"
        else
            echo ""
            echo -e "${RED}✗ Migration failed. Check the error messages above.${NC}"
            exit 1
        fi
        ;;
        
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Migration Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Check the migration logs above for any warnings"
echo "  2. Test the address question page at /profile/complete"
echo "  3. Verify country codes are now auto-detected"
echo ""
echo "If you see warnings about profiles that still need fixing,"
echo "those may require manual intervention."
