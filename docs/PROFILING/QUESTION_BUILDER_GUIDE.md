# Question Builder Guide

## ⚠️ Coming Soon

The **Question Builder** feature is currently under development. This tool will allow administrators to create, edit, and manage profile questions dynamically without requiring SQL or code changes.

---

## Planned Features

### 📝 Question Creation
- Select question type from visual registry (text, select, multi-select, date, address, etc.)
- Configure validation rules (min/max length, regex patterns, required fields)
- Set decay intervals (immutable, rare, occasional, frequent)
- Assign to categories and levels
- Define country-specific options

### ✏️ Question Editing
- Modify question text and help text
- Add/remove options for select-type questions
- Adjust decay intervals
- Enable/disable questions
- Preview changes before publishing

### 🎯 Conditional Logic (Advanced)
- Show question X only if user answered Y = Z
- Skip question X if user's country = Nigeria
- Visual flow builder (no SQL required)

### 📋 Question Templates
- Pre-built templates for common questions (income, age, gender, employment)
- Country-specific templates (SEC for India, SEM for Nigeria)
- One-click deploy

---

## Current Status

**Phase 0**: Documentation restructure ✅ (Current)
**Phase 1**: Read-only question viewer 🚧 (In Progress)
**Phase 2**: Edit existing questions 📅 (Planned)
**Phase 3**: Create new questions 📅 (Planned)
**Phase 4**: Conditional logic execution 📅 (Planned)

---

## Temporary Workaround

Until the Question Builder is ready, admins can manage questions via:
1. **Admin Portal**: `/admin/profile-questions` (view-only)
2. **SQL Migrations**: Contact dev team to add new questions
3. **Manual Updates**: Update `profile_questions` table via Supabase dashboard (advanced users only)

---

## Expected Release

**Q1 2026** - Phase 1 (Read-Only Viewer)
**Q2 2026** - Phase 2 (Edit Mode)
**Q3 2026** - Phase 3 (Create Mode)

---

## Related Documentation

- [Admin Guide](ADMIN_GUIDE.md): Current question management workflows
- [Architecture](ARCHITECTURE.md): Database schema for questions
- [Country Question Management](COUNTRY_QUESTION_MANAGEMENT.md): Adding countries manually

---

**Stay tuned!** This tool will significantly simplify profile question management.
