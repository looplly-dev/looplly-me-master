---
id: "profiling-brand-strategy"
title: "Global vs Local Brand Strategy"
category: "Profiling System"
description: "Strategic framework for balancing global and local brand options in profiling questions"
audience: "admin"
tags: ["profiling", "brands", "localization", "strategy"]
status: "published"
version: "1.0"
created_at: "2024-01-15"
updated_at: "2024-01-15"
---

# Global vs Local Brands Strategy

## Overview

When creating brand-related profiling questions, deciding between global and local brand options is critical for data quality and user experience. This guide provides a strategic framework for making these decisions.

## Core Principles

### 1. Recognition Over Availability

**Rule**: Only include brands that users can recognize and form opinions about.

❌ **Wrong**: Include every brand sold in the country
✅ **Right**: Include brands with significant market presence and awareness

### 2. Cultural Relevance

**Rule**: Respect local brand preferences and consumption patterns.

❌ **Wrong**: Force Western brands in all markets
✅ **Right**: Balance global and local brands based on market reality

### 3. Survey Utility

**Rule**: Options should enable effective survey targeting.

❌ **Wrong**: Include 50 niche brands for completeness
✅ **Right**: Include top 8-12 brands that cover 80%+ of market

## Decision Framework

### Question Analysis

Ask these questions for each brand question:

```
1. Is this product category globally standardized?
   → Examples: Tech brands, automotive brands
   → Use global options with minimal localization

2. Is this product category culturally specific?
   → Examples: Food brands, retail brands
   → Use country-specific options

3. Do global brands dominate this category?
   → Examples: Streaming services, social media
   → Use global options with local additions

4. Is brand availability highly fragmented?
   → Examples: Regional retailers, local services
   → Use fully localized options
```

### Strategy Selection Matrix

| Category | Global Brands | Local Brands | Strategy |
|----------|---------------|--------------|----------|
| **Tech (Apple, Samsung)** | Dominant | Minimal | Global + "Other" |
| **Automotive** | Strong | Moderate | Mixed (70% global, 30% local) |
| **Streaming Services** | Strong | Growing | Mixed (80% global, 20% local) |
| **Banking** | Weak | Dominant | Fully Localized |
| **Mobile Networks** | Weak | Dominant | Fully Localized |
| **Retail** | Moderate | Strong | Fully Localized |
| **Food & Beverage** | Moderate | Strong | Mixed (50/50) |
| **Media/TV** | Weak | Dominant | Fully Localized |

## Strategy Types

### 1. Global-Only Strategy

**When to Use**:
- Product category is globally standardized
- Top 5-7 brands have >80% global market share
- Local brands have minimal differentiation

**Example: Smartphone Brands**

```
Global Options (used in all countries):
├─ Apple
├─ Samsung
├─ Xiaomi
├─ OPPO
├─ Vivo
├─ Huawei
├─ Google Pixel
├─ OnePlus
├─ Motorola
└─ Other

Rationale:
✓ These brands are available globally
✓ >90% market share in most countries
✓ Users recognize these brands everywhere
✓ No need for country-specific variants
```

### 2. Fully Localized Strategy

**When to Use**:
- Product category is highly localized
- Local brands dominate market share
- Global brands have minimal presence

**Example: Banking**

```
Global Fallback (rarely used):
├─ HSBC
├─ Citibank
├─ Standard Chartered
└─ Other

Country-Specific Options:
┌─ South Africa (ZA)
│  ├─ Standard Bank
│  ├─ FNB
│  ├─ ABSA
│  ├─ Nedbank
│  ├─ Capitec
│  └─ Other
│
├─ Nigeria (NG)
│  ├─ First Bank Nigeria
│  ├─ GTBank
│  ├─ Zenith Bank
│  ├─ Access Bank
│  ├─ UBA
│  ├─ Ecobank
│  └─ Other
│
└─ Kenya (KE)
   ├─ Equity Bank
   ├─ KCB Bank
   ├─ Co-operative Bank
   ├─ Standard Chartered Kenya
   ├─ Barclays Bank Kenya
   └─ Other

Rationale:
✓ Banking is highly regulated and localized
✓ Users primarily interact with local banks
✓ Global banks have limited retail presence
✓ Brand loyalty is country-specific
```

### 3. Mixed Strategy (Recommended for Most)

**When to Use**:
- Both global and local brands have significant presence
- User preferences vary between global and local options
- Survey value comes from distinguishing brand types

**Example: Fast Food Chains**

```
South Africa (ZA):
├─ McDonald's           [Global]
├─ KFC                  [Global]
├─ Burger King          [Global]
├─ Nando's              [Local - originated in ZA]
├─ Steers               [Local]
├─ Wimpy                [Local]
├─ Chicken Licken       [Local]
├─ Spur                 [Local]
└─ Other

Nigeria (NG):
├─ KFC                  [Global]
├─ Domino's Pizza       [Global]
├─ Cold Stone           [Global]
├─ Mr. Bigg's           [Local]
├─ Chicken Republic     [Local]
├─ Tantalizers          [Local]
├─ Sweet Sensation      [Local]
└─ Other

India (IN):
├─ McDonald's           [Global]
├─ KFC                  [Global]
├─ Domino's Pizza       [Global]
├─ Pizza Hut            [Global]
├─ Café Coffee Day      [Local]
├─ Barbeque Nation      [Local]
├─ Haldiram's           [Local]
├─ Nirula's             [Local]
└─ Other

Rationale:
✓ Mix reflects actual market competition
✓ Enables targeting by brand preference type
✓ Respects local brand loyalty
✓ Covers both global and local consumers
```

## Implementation Guidelines

### Global-First Approach

For global-heavy categories:

1. **Define global core** (5-8 major brands)
2. **Add "Other"** as fallback
3. **Optionally add top 2-3 local brands** per country

```typescript
const globalOptions = [
  "Apple",
  "Samsung",
  "Google",
  "Microsoft",
  "Sony",
  "Other"
];

const countryAdditions = {
  IN: [...globalOptions, "Micromax", "Lava"],  // Add Indian brands
  CN: [...globalOptions, "Xiaomi", "OPPO", "Vivo"],  // Add Chinese brands
  default: globalOptions  // Use global-only for other countries
};
```

### Local-First Approach

For local-heavy categories:

1. **Research top 6-10 local brands per country**
2. **Add 1-2 global brands if relevant**
3. **Include "Other" and "None"**

```typescript
const bankingOptions = {
  ZA: ["Standard Bank", "FNB", "ABSA", "Nedbank", "Capitec", "Other"],
  NG: ["First Bank", "GTBank", "Zenith", "Access", "UBA", "Other"],
  KE: ["Equity Bank", "KCB", "Co-op Bank", "Barclays Kenya", "Other"],
  // Global fallback (rarely used)
  default: ["HSBC", "Citibank", "Standard Chartered", "Local bank", "Other"]
};
```

### Balanced Approach

For mixed categories:

1. **Include top 3-4 global brands**
2. **Include top 4-6 local brands**
3. **Total 8-12 options**

```typescript
const retailOptions = {
  ZA: [
    // Global
    "Woolworths", "H&M", "Zara",
    // Local
    "Pick n Pay", "Checkers", "Shoprite", "Mr Price", "Edgars",
    "Other"
  ],
  NG: [
    // Global
    "ShopRite", "Game",
    // Local
    "Jumia", "Konga", "Slot", "Yudala", "Dealdey",
    "Other"
  ]
};
```

## Edge Cases & Considerations

### Regional vs National Brands

Some "local" brands operate across multiple countries (e.g., MTN across Africa):

**Strategy**: Treat as "regional global" brands

```
Mobile Networks - Africa Region:
├─ MTN              [Regional - operates in 20+ countries]
├─ Vodacom          [Regional - South Africa + others]
├─ Orange           [Regional - Francophone Africa]
├─ Airtel           [Regional - Multiple markets]
└─ Local options per country
```

### Brand Localization

Global brands with localized names:

**Example**: KFC vs "Kentucky Fried Chicken"

```
✓ Use: "KFC" (globally recognized abbreviation)
✗ Avoid: "Kentucky Fried Chicken" (outdated full name)
✗ Avoid: "KFC India" (don't add country suffixes)
```

### Merged/Acquired Brands

Handle brand changes carefully:

**Example**: Bank mergers

```
Old: "Barclays Africa"
New: "ABSA" (rebranded in 2018)

Solution:
- Use current brand name: "ABSA"
- Monitor user feedback for confusion
- Add helper text if needed: "ABSA (formerly Barclays Africa)"
```

### Emerging Brands

Handle fast-growing brands:

**Strategy**: Add when they reach ~5% market share

```
Example: E-Commerce in India
2015: Amazon, Flipkart, Snapdeal
2020: Amazon, Flipkart, Meesho, JioMart  [Meesho & JioMart emerged]
2025: Monitor for next entrant
```

## Testing & Validation

### Pre-Launch Testing

Before deploying brand questions:

1. **Market research**: Verify top brands via public data
2. **User testing**: Survey 50-100 users in target country
3. **"Other" rate**: Should be <15% if options are comprehensive
4. **Recognition test**: 80%+ users should recognize listed brands

### Post-Launch Monitoring

Track these metrics:

```sql
-- Monitor "Other" selection rates
SELECT 
  country_code,
  COUNT(*) FILTER (WHERE answer_value = 'Other') as other_count,
  COUNT(*) as total_answers,
  ROUND(100.0 * COUNT(*) FILTER (WHERE answer_value = 'Other') / COUNT(*), 1) as other_pct
FROM profile_answers pa
JOIN profiles p ON p.user_id = pa.user_id
WHERE question_id = :brand_question_id
GROUP BY country_code
HAVING other_pct > 15  -- Flag countries with high "Other" rates
ORDER BY other_pct DESC;
```

### Feedback Loop

Collect user feedback:

```
After answering brand questions, show:

┌───────────────────────────────────────┐
│ "Were these options helpful?"        │
│ 😀 Yes  😐 Somewhat  ☹️ No            │
│                                       │
│ Missing a brand? Tell us:            │
│ [_____________________________]      │
│                                       │
│ [Skip] [Submit Feedback]             │
└───────────────────────────────────────┘
```

## Related Documentation

- [Country Question Management](COUNTRY_QUESTION_MANAGEMENT.md)
- [AI Generation Prompts](AI_GENERATION_PROMPTS.md)
- [Admin Auto-Generation Guide](ADMIN_AUTO_GENERATION_GUIDE.md)
- [Auto-Scaling System](AUTO_SCALING_SYSTEM.md)
