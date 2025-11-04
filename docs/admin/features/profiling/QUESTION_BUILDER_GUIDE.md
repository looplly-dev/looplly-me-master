---
id: "profiling-question-builder"
title: "Question Builder Guide"
category: "Profiling System"
description: "Comprehensive guide for creating and editing profiling questions in the admin portal"
audience: "admin"
tags: ["profiling", "admin", "questions", "builder"]
status: "published"
version: "1.0"
created_at: "2024-01-15"
updated_at: "2024-01-15"
---

# Question Builder Guide

## Overview

The Question Builder is the admin interface for creating, editing, and managing profiling questions. This guide covers best practices, step-by-step workflows, and common scenarios.

## Accessing the Question Builder

**Navigation:** Admin Portal → Profile Questions → Add Question (or Edit existing)

## Question Types

### 1. Text Input (`text`)
Short, single-line text responses.

**Best For:**
- Job titles
- City names
- Short descriptive answers

**Configuration:**
```json
{
  "maxLength": 100,
  "minLength": 2,
  "pattern": "^[a-zA-Z0-9\\s]+$"
}
```

**Example:**
- Question: "What is your job title?"
- Type: `text`
- Validation: Min 2 chars, max 100 chars

---

### 2. Textarea (`textarea`)
Multi-line text for longer responses.

**Best For:**
- Open-ended opinions
- Detailed descriptions
- Comments

**Configuration:**
```json
{
  "maxLength": 500,
  "minLength": 10,
  "rows": 4
}
```

**Example:**
- Question: "Tell us about your hobbies and interests"
- Type: `textarea`
- Validation: Min 10 chars, max 500 chars

---

### 3. Select (`select`)
Single-choice dropdown menu.

**Best For:**
- Employment status
- Marital status
- Education level
- Gender

**Configuration:**
- Requires `options` array
- Each option has `label` and `value`

**Example:**
```json
{
  "question_text": "What is your employment status?",
  "question_type": "select",
  "options": [
    {"label": "Employed full-time", "value": "employed_fulltime"},
    {"label": "Employed part-time", "value": "employed_parttime"},
    {"label": "Self-employed", "value": "self_employed"},
    {"label": "Unemployed", "value": "unemployed"},
    {"label": "Student", "value": "student"},
    {"label": "Retired", "value": "retired"}
  ]
}
```

---

### 4. Multiselect (`multiselect`)
Multiple-choice checkboxes.

**Best For:**
- Interests and hobbies (select all that apply)
- Brand awareness (which brands have you heard of?)
- Media consumption (which platforms do you use?)

**Configuration:**
- Requires `options` array
- Optional: `minSelections` and `maxSelections`

**Example:**
```json
{
  "question_text": "Which social media platforms do you use regularly?",
  "question_type": "multiselect",
  "options": [
    {"label": "Facebook", "value": "facebook"},
    {"label": "Instagram", "value": "instagram"},
    {"label": "Twitter/X", "value": "twitter"},
    {"label": "TikTok", "value": "tiktok"},
    {"label": "LinkedIn", "value": "linkedin"},
    {"label": "YouTube", "value": "youtube"}
  ],
  "validation_rules": {
    "minSelections": 1,
    "maxSelections": 10
  }
}
```

---

### 5. Date (`date`)
Date picker for calendar dates.

**Best For:**
- Date of birth
- Employment start date
- Important milestones

**Configuration:**
```json
{
  "minDate": "1924-01-01",
  "maxDate": "2010-01-01"
}
```

**Example:**
- Question: "What is your date of birth?"
- Type: `date`
- Validation: Must be between 18-100 years old

---

### 6. Address Autocomplete (`address`)
Google Places API integration with geographic restriction to user's registered country.

**Best For:**
- Home address
- Work address  
- Delivery addresses

**Geographic Restriction:**
- Address suggestions are **automatically filtered** to the user's registered country
- Country is determined from the user's mobile verification during registration
- Users **cannot** select addresses from other countries
- Country field is **read-only** and auto-populated

**Configuration:**
- Automatically geocodes location
- Stores formatted address and components
- Requires Google Places API integration
- **Enforces country matching** with mobile registration country

**Data Storage:**
The address is stored as a JSON object with these components:
- `street_number` - House/building number
- `route` - Street name
- `locality` - City/town
- `administrative_area_level_1` - Province/state
- `administrative_area_level_2` - County/district (if applicable)
- `country` - Country name (forced to match profile)
- `postal_code` - ZIP/postal code
- `sublocality` - Neighborhood/suburb (if applicable)

**Example:**
- Question: "What is your home address?"
- Type: `address`
- User Country: South Africa (from mobile +27)
- Autocomplete Results: Only South African addresses shown
- Country Field Display: "🇿🇦 South Africa" (read-only badge)

**Security Note:**
This geographic restriction prevents data inconsistencies and ensures addresses match the user's verified country. The country cannot be changed or overridden, even through Google Places autocomplete.

**Validation Rules:**
- Country must match user's `profiles.country_code` (from mobile verification)
- All address components must be present (except `administrative_area_level_2` and `sublocality` which are optional)
- Postal code format is validated (when available)

**User Experience:**
1. User types address in search field
2. Google Places API returns suggestions **filtered by country**
3. User selects from dropdown
4. Address components auto-populate
5. Country badge displays (read-only, non-editable)
6. If wrong country somehow selected, validation error shown

**Error Messages:**
- "Address must be in [Country Name]. Selected address is in [Other Country]."
- "Country not detected. Please contact support."

---

### 7. Number (`number`)
Numeric input with min/max constraints.

**Best For:**
- Household size
- Years of experience
- Age (if not using date picker)

**Configuration:**
```json
{
  "min": 1,
  "max": 20,
  "step": 1
}
```

**Example:**
- Question: "How many people live in your household?"
- Type: `number`
- Validation: Min 1, max 20

---

### 8. Phone (`phone`)
International phone number with country code selector.

**Best For:**
- Mobile number
- Alternate contact number

**Configuration:**
- Validates format per country
- Stores normalized international format

**Example:**
- Question: "What is your mobile number?"
- Type: `phone`
- Validation: Country-specific format check

## Creating a Question: Step-by-Step

### Step 1: Basic Information

**Question Key:**
- Unique identifier (e.g., `employment_status`)
- Lowercase, underscores only
- Cannot be changed after creation (breaks existing answers)
- Use descriptive, semantic keys

**Question Text:**
- User-facing prompt
- Clear, concise, neutral wording
- Avoid jargon or technical terms
- Use 8th grade reading level

**Example:**
```
✅ Good: "What is your current employment status?"
❌ Bad: "Pls select ur job situation"
❌ Bad: "What best describes your current labor force participation status?"
```

---

### Step 2: Question Type & Options

**Select Type:**
Choose from dropdown: `text`, `textarea`, `select`, `multiselect`, `date`, `address`, `number`, `phone`

**Add Options (for select/multiselect only):**
1. Click "Add Option"
2. Enter label (user-facing text)
3. Enter value (stored data)
4. Set display order
5. Add metadata if needed (e.g., `{"color": "red"}`)
6. Repeat for all options

**Best Practices:**
- Provide comprehensive option coverage
- Include "Other" or "Prefer not to say" when appropriate
- Keep labels short and clear
- Use consistent terminology across questions

---

### Step 3: Categorization

**Level:**
- Select 1, 2, or 3 based on importance and detail level
- See [Level Strategy](LEVEL_STRATEGY.md) for guidance

**Category:**
- Select parent category from dropdown
- Create new category if none fit

**Display Order:**
- Determines question sequence within category
- Lower numbers appear first
- Leave gaps (10, 20, 30) for easier reordering later

**Required:**
- Toggle on/off
- Required questions must be answered to complete the level
- Use sparingly (too many requirements = high drop-off)

---

### Step 4: Country Configuration

**Applicability:**

**Global (Default):**
- Same question for all countries
- Use when question is universally relevant

**Country-Specific:**
- Different per country (or different answer options)
- Use for questions with localized context

**Country Codes:**
If country-specific, add ISO 2-letter codes:
- `ZA` - South Africa
- `NG` - Nigeria
- `KE` - Kenya
- `GB` - United Kingdom
- `US` - United States

**Country Options:**
- Manage answer options per country in **Country Options** tab
- Use AI generation for bulk creation
- See [Country Question Management](COUNTRY_QUESTION_MANAGEMENT.md)

---

### Step 5: Advanced Settings

**Help Text:**
- Tooltip shown next to question
- Use for clarification or examples
- Example: "Select your primary occupation. If you have multiple jobs, choose the one where you work the most hours."

**Placeholder:**
- Grayed-out hint text in input field
- Example: "e.g., Marketing Manager"

**Validation Rules:**
```json
{
  "minLength": 2,
  "maxLength": 100,
  "pattern": "^[a-zA-Z\\s]+$",
  "minSelections": 1,
  "maxSelections": 5,
  "min": 18,
  "max": 99
}
```

**Targeting Tags:**
- Keywords for survey matching algorithm
- Example: For "preferred smartphone brand" → `["tech", "mobile", "consumer_electronics"]`

**Question Group:**
- Logical grouping for related questions
- Example: All automotive questions → `"automotive"`

---

### Step 6: Decay Configuration

**Select Decay Config:**
- `immutable` - Never expires
- `short_term` - 30 days
- `medium_term` - 180 days
- `long_term` - 365 days

**Mark as Immutable:**
- Toggle on for questions that never change (e.g., date_of_birth)
- Overrides decay config

See [Decay System](DECAY_SYSTEM.md) for detailed guidance.

---

### Step 7: Save & Test

**Save Options:**
- **Save Draft** - Not visible to users, can continue editing
- **Save & Activate** - Immediately live for users

**Testing:**
1. Enable badge preview mode on test account
2. Navigate to Profile tab
3. Verify question appears in correct category
4. Test all input types and validation
5. Check mobile and desktop views

## Editing Existing Questions

### Safe Edits (No Data Loss)
- Question text (rewording)
- Help text
- Placeholder
- Display order
- Active/inactive status
- Decay configuration
- Adding new options (to select/multiselect)

### Risky Edits (Can Break Data)
- Question key (NEVER change this!)
- Question type (e.g., text → select)
- Removing options that users have selected
- Changing option values

**Before Risky Edits:**
1. Check how many users have answered
2. Export existing answers
3. Create new question if major change needed
4. Deprecate old question gracefully

### Bulk Editing

**Scenario:** Update display order for all questions in a category

**Process:**
1. Export questions to CSV
2. Edit display_order column in spreadsheet
3. Re-import CSV
4. Verify changes in admin portal

## Common Question Patterns

### Employment Series

```json
[
  {
    "question_key": "employment_status",
    "question_text": "What is your employment status?",
    "type": "select",
    "level": 2
  },
  {
    "question_key": "job_title",
    "question_text": "What is your job title?",
    "type": "text",
    "level": 2,
    "conditional": "employment_status IN ['employed_fulltime', 'employed_parttime', 'self_employed']"
  },
  {
    "question_key": "industry_sector",
    "question_text": "What industry do you work in?",
    "type": "select",
    "level": 2,
    "conditional": "employment_status IN ['employed_fulltime', 'employed_parttime', 'self_employed']"
  }
]
```

### Brand Awareness Series

```json
[
  {
    "question_key": "smartphone_brand_owned",
    "question_text": "What brand is your primary smartphone?",
    "type": "select",
    "level": 2
  },
  {
    "question_key": "smartphone_brands_considered",
    "question_text": "Which smartphone brands would you consider for your next purchase?",
    "type": "multiselect",
    "level": 3
  },
  {
    "question_key": "smartphone_purchase_timeline",
    "question_text": "When do you plan to purchase your next smartphone?",
    "type": "select",
    "level": 3
  }
]
```

## Validation Best Practices

### Text Input
```json
{
  "validation_rules": {
    "minLength": 2,
    "maxLength": 100,
    "pattern": "^[a-zA-Z0-9\\s\\-']+$",
    "required": true
  }
}
```

### Email
```json
{
  "validation_rules": {
    "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    "required": true
  }
}
```

### Phone Number
Handled automatically by `phone` type, but custom validation:
```json
{
  "validation_rules": {
    "minLength": 10,
    "maxLength": 15,
    "pattern": "^\\+?[0-9\\s\\-()]+$"
  }
}
```

### Date of Birth
```json
{
  "validation_rules": {
    "minDate": "1924-01-01",
    "maxDate": "2010-01-01",
    "required": true
  }
}
```

## Accessibility Considerations

### Screen Readers
- Use semantic HTML (handled automatically by components)
- Provide clear labels and help text
- Include ARIA attributes for complex widgets

### Keyboard Navigation
- Ensure tab order is logical
- Support Enter key for submission
- Support arrow keys for dropdowns

### Color Contrast
- Use design system tokens
- Avoid red/green only indicators
- Provide text labels, not just colors

## Performance Optimization

### Lazy Loading
- Don't load all questions at once
- Load categories on demand
- Paginate long option lists

### Caching
- Cache question metadata (5 min stale time)
- Cache user answers locally
- Invalidate on answer save

### Indexing
Ensure database indexes on:
- `profile_questions.level`
- `profile_questions.is_active`
- `profile_questions.category_id`
- `profile_answers(user_id, question_id)`

## Troubleshooting

**Question Not Appearing:**
- Check `is_active` status
- Verify level matches user's profile level
- Confirm category is active
- Check country applicability

**Validation Not Working:**
- Verify JSON syntax in validation_rules
- Check regex pattern is escaped properly
- Test with various inputs

**Options Not Showing:**
- Confirm options array is populated
- Check country-specific options configuration
- Verify options are marked active

**Answers Not Saving:**
- Check RLS policies on profile_answers table
- Verify question_id is correct UUID
- Check validation rules aren't too restrictive

## Advanced Features

### Conditional Logic (Future)
Questions that appear based on previous answers:

```json
{
  "question_key": "pet_breed",
  "conditional_logic": {
    "show_if": "owns_pet === 'yes' AND pet_type === 'dog'"
  }
}
```

### Dynamic Option Generation (Future)
Options loaded from external API:

```json
{
  "question_key": "favorite_streaming_service",
  "options_source": "api",
  "options_endpoint": "/api/streaming-services"
}
```

### Multi-Language Support (Future)
Questions and options translated per user language:

```json
{
  "question_text": {
    "en": "What is your occupation?",
    "es": "¿Cuál es tu ocupación?",
    "fr": "Quelle est votre profession?"
  }
}
```

## Checklists

### Pre-Launch Checklist
- [ ] Question key is unique and semantic
- [ ] Question text is clear and neutral
- [ ] Question type matches expected answer format
- [ ] Options are comprehensive and mutually exclusive
- [ ] Validation rules are appropriate
- [ ] Decay configuration is set
- [ ] Targeting tags are added
- [ ] Help text provides clarity
- [ ] Tested on mobile and desktop
- [ ] Reviewed by stakeholder
- [ ] Added to appropriate category
- [ ] Display order is correct

### Post-Launch Monitoring
- [ ] Track completion rate
- [ ] Monitor skip rate
- [ ] Review user feedback
- [ ] Check answer distribution
- [ ] Verify data quality
- [ ] Analyze survey match improvement

## Additional Resources

- [Admin Guide](ADMIN_GUIDE.md) - General admin portal usage
- [Country Question Management](COUNTRY_QUESTION_MANAGEMENT.md) - Country-specific options
- [Architecture](ARCHITECTURE.md) - Technical implementation
- [Level Strategy](LEVEL_STRATEGY.md) - Question level design

## Support

For technical assistance with the Question Builder, contact the development team or submit a ticket through the admin support channel.
