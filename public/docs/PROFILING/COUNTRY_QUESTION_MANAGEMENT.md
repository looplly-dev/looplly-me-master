---
id: "profiling-country-questions"
title: "Country Question Management"
category: "Admin Guides"
description: "Managing country-specific profile questions"
audience: "admin"
tags: ["profiling", "country", "localization", "questions"]
status: "published"
---

# Country-Specific Question Management

## Overview

The Looplly profiling system supports country-aware questions with localized answer options. This enables accurate targeting while respecting regional differences in brands, products, and cultural contexts.

## Core Concepts

### Global Fallback Questions

Every question has a **global fallback** set of answer options that apply to all countries by default.

**Example: Employment Status**
```
Global Options:
- Full-time employed
- Part-time employed
- Self-employed
- Unemployed
- Student
- Retired
```

These options work universally and ensure the question functions in all markets.

### Country-Specific Overrides

For certain questions, you can define **country-specific options** that replace the global fallback for users in that country.

**Example: Mobile Network Provider**
```
Global Options:
- Vodafone
- Orange
- T-Mobile
- Other

South Africa (ZA):
- Vodacom
- MTN
- Cell C
- Telkom Mobile
- Rain

Nigeria (NG):
- MTN Nigeria
- Glo Mobile
- Airtel Nigeria
- 9mobile
```

### When to Use Country-Specific Options

Use country overrides for:

1. **Brand Recognition Questions**
   - Banks, mobile networks, retailers
   - Media brands, TV channels
   - Food & beverage brands

2. **Product Availability**
   - Products only sold in certain markets
   - Regional variations of products

3. **Cultural Context**
   - Income ranges (purchasing power varies)
   - Socioeconomic classifications
   - Cultural/ethnic identities

**Don't Override For:**
- Universal demographics (age, gender)
- Universal behaviors (internet usage frequency)
- Universal attitudes (product preferences)

## Managing Country-Specific Options

### Viewing Country Configuration

1. Navigate to **Admin → Profile Questions**
2. Click on any question to open details
3. Click **"Manage Country Options"** button
4. View list of configured countries

### Adding Country Options

**Manual Method:**

1. Open question details
2. Click **"Manage Country Options"**
3. Click **"Add Country"**
4. Select country from dropdown
5. Enter answer options (one per line)
6. Click **"Save"**

**AI-Generated Method:**

1. Open question details
2. Click **"Auto-Generate Options"**
3. Select target countries
4. Review AI-generated options
5. Edit if needed
6. Click **"Approve & Save"**

See [Admin Auto-Generation Guide](ADMIN_AUTO_GENERATION_GUIDE.md) for details.

### Editing Country Options

1. Open **"Manage Country Options"**
2. Find the country in the list
3. Click **"Edit"**
4. Modify options
5. Click **"Save"**

Changes apply immediately to all users in that country.

### Removing Country Options

1. Open **"Manage Country Options"**
2. Find the country
3. Click **"Delete"**
4. Confirm deletion

Users in that country will revert to the **global fallback options**.

## Best Practices

### Option Consistency

Maintain consistent option formatting across countries:

**Good:**
```
ZA: Vodacom, MTN, Cell C
NG: MTN Nigeria, Glo Mobile, Airtel Nigeria
```

**Bad:**
```
ZA: Vodacom, mtn, CELL C
NG: MTN nigeria, Glo, airtel
```

### Localization Quality

- Use official brand names (exact spelling/capitalization)
- Include market leaders (top 5-7 brands)
- Add "Other" option for edge cases
- Research before adding (don't guess)

### Avoid Over-Localization

Don't create country options unless necessary:

**Unnecessary:**
```
Q: "How often do you use the internet?"
❌ Don't need country-specific options
```

**Necessary:**
```
Q: "Which bank do you use?"
✅ Banks are country-specific
```

### Handle Multi-Country Brands

For brands operating in multiple countries, decide on strategy:

**Option 1: Global Options**
```
Global: McDonald's, KFC, Subway, Burger King
```
Use when brand recognition is universal.

**Option 2: Country Options with Global Mix**
```
ZA: McDonald's, KFC, Nando's, Steers, Wimpy
NG: McDonald's, KFC, Mr. Bigg's, Chicken Republic
```
Use when mixing global + local brands.

## Question Coverage Strategy

### Priority Countries

Focus country-specific options on primary markets:
- South Africa (ZA)
- Nigeria (NG)
- Kenya (KE)
- United Kingdom (GB)
- India (IN)

### Expansion Strategy

1. **Phase 1**: Essential questions (banks, mobile networks)
2. **Phase 2**: Major brands (food, retail, media)
3. **Phase 3**: Niche categories (automotive, travel)

### AI-Assisted Scaling

Use AI generation to rapidly expand to new countries:
1. Select high-priority questions
2. Run AI generation for target country
3. Review and approve in batches
4. Monitor user feedback

See [Auto-Scaling System](AUTO_SCALING_SYSTEM.md) for details.

## Technical Implementation

### Database Schema

```sql
-- Question with global options
profile_questions
  id: uuid
  question_key: text
  question_text: text
  global_options: text[]

-- Country-specific overrides
country_question_options
  id: uuid
  question_id: uuid (FK)
  country_code: text (e.g., 'ZA')
  options: text[]
```

### Option Resolution Logic

```typescript
function getQuestionOptions(questionId: uuid, userCountry: string): string[] {
  // Check for country-specific options
  const countryOptions = db.query(
    "SELECT options FROM country_question_options 
     WHERE question_id = ? AND country_code = ?",
    [questionId, userCountry]
  );
  
  if (countryOptions.length > 0) {
    return countryOptions; // Use country override
  }
  
  // Fallback to global options
  const globalOptions = db.query(
    "SELECT global_options FROM profile_questions WHERE id = ?",
    [questionId]
  );
  
  return globalOptions;
}
```

## Monitoring & Analytics

### Key Metrics

Track these metrics per country:
- **Coverage Rate**: % of questions with country options
- **Usage Rate**: % of answers using country vs global options
- **Option Popularity**: Most selected options per country

### Gap Detection

Automated system flags missing country options:
- High-traffic countries without options
- Questions with generic "Other" selections >20%
- Countries using global fallback for brand questions

See [Auto-Scaling System](AUTO_SCALING_SYSTEM.md).

## Troubleshooting

### Users Not Seeing Country Options

**Check:**
1. User's `country_code` field in profiles table
2. Country options exist for that question
3. Options are not empty array
4. Question is active and published

### Options Not Saving

**Causes:**
- Duplicate country entries (database constraint)
- Invalid country code format
- Empty options array
- Missing question_id reference

### Wrong Options Displaying

**Verify:**
1. User's country code matches expected
2. No typos in country_code field
3. Options not accidentally deleted
4. Cache invalidation (if applicable)

## Related Documentation

- [Admin Auto-Generation Guide](ADMIN_AUTO_GENERATION_GUIDE.md)
- [Auto-Scaling System](AUTO_SCALING_SYSTEM.md)
- [Global vs Local Brands](GLOBAL_VS_LOCAL_BRANDS.md)
- [AI Generation Prompts](AI_GENERATION_PROMPTS.md)
