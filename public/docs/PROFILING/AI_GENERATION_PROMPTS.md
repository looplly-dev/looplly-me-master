---
id: "profiling-ai-generation"
title: "AI Generation Prompts"
category: "Admin Guides"
description: "AI prompt templates for generating profile questions"
audience: "admin"
tags: ["profiling", "ai", "generation", "prompts"]
status: "published"
---

# AI Generation Prompts

## Overview

This document contains AI prompt templates used by the Looplly admin portal to auto-generate country-specific answer options for profiling questions.

## Core Prompt Template

### Base Prompt Structure

```
You are an expert market researcher specializing in [COUNTRY_NAME] consumer markets.

Generate answer options for the following profiling question:

**Question**: [QUESTION_TEXT]
**Country**: [COUNTRY_NAME] ([COUNTRY_CODE])
**Category**: [CATEGORY]
**Target Audience**: General consumers aged 18+

Requirements:
1. Provide 8-12 answer options
2. Include market-leading brands/options relevant to [COUNTRY_NAME]
3. Use official brand names with correct spelling and capitalization
4. Focus on brands with >5% market share
5. Add "Other" as the last option
6. Return as a simple list, one option per line
7. Do not include explanations or numbering

Example format:
Brand A
Brand B
Brand C
Other
```

## Category-Specific Prompts

### Banking & Financial Services

```
You are a financial services expert specializing in [COUNTRY_NAME].

Generate a list of major retail banks for this profiling question:

**Question**: Which bank do you primarily use?
**Country**: [COUNTRY_NAME] ([COUNTRY_CODE])

Requirements:
- Include top 8-10 retail banks by customer base
- Use official bank names (e.g., "Standard Bank" not "Standard")
- Include both local and international banks operating in the country
- Exclude business-only or investment-only banks
- Add "Other bank" and "No bank account" as final options

Format: Simple list, one per line, no numbering.
```

### Mobile Network Providers

```
You are a telecommunications expert for [COUNTRY_NAME].

Generate a list of mobile network operators for:

**Question**: Which mobile network do you use?
**Country**: [COUNTRY_NAME] ([COUNTRY_CODE])

Requirements:
- Include all major mobile network operators (MNOs)
- Include top 2-3 MVNOs if they have >3% market share
- Use official brand names (e.g., "MTN South Africa" not just "MTN")
- Order by market share (largest first)
- Add "Other" as the last option

Format: Simple list, one per line.
```

### Retail Brands

```
You are a retail market analyst for [COUNTRY_NAME].

Generate answer options for this retail brand question:

**Question**: [QUESTION_TEXT]
**Country**: [COUNTRY_NAME] ([COUNTRY_CODE])
**Retail Category**: [e.g., Supermarkets, Electronics, Fashion]

Requirements:
- Include 8-12 major retail brands in this category
- Focus on brands with physical stores or strong e-commerce presence
- Include both local and international brands
- Use official brand names
- Consider regional shopping preferences
- Add "Other" as the last option

Format: Simple list, one per line.
```

### Food & Beverage Brands

```
You are a consumer goods expert for [COUNTRY_NAME].

Generate brand options for this question:

**Question**: [QUESTION_TEXT]
**Country**: [COUNTRY_NAME] ([COUNTRY_CODE])
**Product Category**: [e.g., Soft Drinks, Fast Food, Snacks]

Requirements:
- Include 10-15 popular brands in [COUNTRY_NAME]
- Mix of international and local brands
- Focus on brands available nationwide
- Consider cultural preferences and consumption habits
- Use exact brand names (check spelling)
- Add "Other" and "None" options at the end

Format: Simple list, one per line.
```

### Media & Entertainment

```
You are a media industry expert for [COUNTRY_NAME].

Generate options for this media consumption question:

**Question**: [QUESTION_TEXT]
**Country**: [COUNTRY_NAME] ([COUNTRY_CODE])
**Media Type**: [e.g., TV Channels, Streaming Services, Radio Stations]

Requirements:
- Include 8-12 major media brands/channels
- Consider both traditional and digital media
- Include local and international options
- Focus on platforms with significant audience share
- Use official brand names
- Add "Other" option

Format: Simple list, one per line.
```

### Automotive Brands

```
You are an automotive industry analyst for [COUNTRY_NAME].

Generate car brand options for:

**Question**: What brand of car do you drive?
**Country**: [COUNTRY_NAME] ([COUNTRY_CODE])

Requirements:
- Include 15-20 major automotive brands sold in [COUNTRY_NAME]
- Order by market share/popularity
- Include both economy and premium brands
- Use official brand names (e.g., "Volkswagen" not "VW")
- Add "Other brand" and "I don't own a car" options

Format: Simple list, one per line.
```

### E-Commerce Platforms

```
You are an e-commerce expert for [COUNTRY_NAME].

Generate options for this online shopping question:

**Question**: Which online shopping platforms do you use?
**Country**: [COUNTRY_NAME] ([COUNTRY_CODE])

Requirements:
- Include 8-12 major e-commerce platforms available in [COUNTRY_NAME]
- Include both local and international platforms
- Consider platforms for general merchandise (not specialized)
- Use official platform names
- Add "Other" and "I don't shop online" options

Format: Simple list, one per line.
```

## Advanced Prompt Techniques

### Validation Prompt

After generating options, validate them with:

```
Review the following answer options for quality and accuracy:

**Question**: [QUESTION_TEXT]
**Country**: [COUNTRY_NAME]
**Generated Options**:
[LIST_OF_OPTIONS]

Check for:
1. Spelling and capitalization errors
2. Brands not available in [COUNTRY_NAME]
3. Outdated or defunct brands
4. Missing major players (>10% market share)
5. Duplicate or very similar options

Provide:
- Corrected list (if needed)
- Brief explanation of changes
```

### Market Context Prompt

For nuanced questions, add market context:

```
Before generating options, provide brief market context:

**Country**: [COUNTRY_NAME]
**Category**: [CATEGORY]

Answer these questions:
1. What are the top 3 market leaders?
2. Are there any dominant local brands?
3. How strong is international brand presence?
4. Any recent market changes (mergers, new entrants)?

Then generate the answer options based on this context.
```

## Prompt Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `COUNTRY_NAME` | Full country name | "South Africa" |
| `COUNTRY_CODE` | ISO 3166-1 alpha-2 | "ZA" |
| `QUESTION_TEXT` | Full question text | "Which bank do you use?" |
| `CATEGORY` | Question category | "Banking & Finance" |

### Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `TARGET_DEMOGRAPHIC` | Specific audience | "Urban millennials" |
| `PRODUCT_CATEGORY` | Subcategory | "Premium smartphones" |
| `MARKET_SEGMENT` | Market focus | "Budget-conscious consumers" |

## Prompt Engineering Tips

### 1. Be Specific About Format

❌ Bad: "Generate some options"
✅ Good: "Generate 8-12 options, one per line, no numbering"

### 2. Specify Market Relevance

❌ Bad: "List popular brands"
✅ Good: "List brands with >5% market share in [COUNTRY]"

### 3. Handle Edge Cases

```
Include edge cases:
- "Other" option for unlisted answers
- "None" option if not applicable
- "Prefer not to say" for sensitive questions
```

### 4. Provide Examples

```
Example output format:
Vodacom
MTN South Africa
Cell C
Telkom Mobile
Other
```

### 5. Request Verification

```
Verify all brands are:
✓ Currently operating in [COUNTRY]
✓ Accessible to general consumers
✓ Correctly spelled and capitalized
```

## AI Model Selection

### Recommended Models

1. **GPT-4** - Best for nuanced market understanding
2. **Claude** - Good for detailed market research
3. **Gemini Pro** - Fast generation with good accuracy

### Model-Specific Adjustments

**For GPT-4:**
- Add: "Be concise and factual"
- Works well with complex prompts

**For Claude:**
- Add: "Think step-by-step about market leaders"
- Better at explaining reasoning

**For Gemini Pro:**
- Keep prompts shorter
- Add explicit formatting examples

## Testing & Quality Assurance

### Manual Review Checklist

After AI generation, verify:

- [ ] All brands exist in target country
- [ ] Spelling/capitalization is correct
- [ ] No defunct/outdated brands
- [ ] Market leaders are included
- [ ] "Other" option is present
- [ ] No duplicates or near-duplicates

### Automated Validation

Run automated checks for:
- Minimum/maximum option count
- Presence of "Other" option
- No empty strings
- No duplicate entries
- Character length limits

## Related Documentation

- [Admin Auto-Generation Guide](ADMIN_AUTO_GENERATION_GUIDE.md)
- [Auto-Scaling System](AUTO_SCALING_SYSTEM.md)
- [Country Question Management](COUNTRY_QUESTION_MANAGEMENT.md)
