---
id: "profiling-admin-auto-generation"
title: "Admin Auto-Generation Guide"
category: "Profiling System"
description: "Administrator guide for using AI tools to automatically generate country-specific answer options"
audience: "all"
tags: ["profiling", "admin", "ai", "automation"]
status: "published"
version: "1.0"
created_at: "2024-01-15"
updated_at: "2024-01-15"
---

# Admin Auto-Generation Guide

## Overview

The Looplly admin portal includes AI-powered tools to automatically generate country-specific answer options for profiling questions. This dramatically reduces the manual effort required to scale profiling globally.

## Prerequisites

### Access Requirements

- **Role**: Admin or Tester
- **Portal**: Admin Portal → Profile Questions
- **Integration**: AI provider must be configured

### Supported AI Providers

- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Google (Gemini Pro)

## Step-by-Step Guide

### 1. Access Auto-Generation Tool

**Path**: Admin Portal → Profile Questions → [Select Question] → Auto-Generate Options

**Steps**:
1. Navigate to **Admin → Profile Questions**
2. Click on any question card to open details
3. Look for **"Auto-Generate Options"** button
4. Click to open the generation wizard

### 2. Select Target Countries

**Interface**: Multi-select dropdown

**Options**:
1. **Individual Countries**: Select specific countries (ZA, NG, KE, etc.)
2. **Bulk Selection**: Check "Select All Priority Countries"
3. **Custom List**: Enter comma-separated country codes

**Best Practice**: Start with 3-5 countries, review quality, then expand.

### 3. Configure Generation Settings

**Settings Panel**:

```
AI Provider: [Dropdown: GPT-4 / Claude / Gemini]
Temperature: [Slider: 0.0 - 1.0, Default: 0.3]
Max Options: [Number: 8-20, Default: 12]
Include "Other": [Checkbox: Checked by default]
```

**Recommended Settings**:
- **Temperature**: 0.3 (factual, consistent results)
- **Max Options**: 12 (good coverage without overwhelming users)
- **Include "Other"**: Always enabled

### 4. Preview Generated Options

**Interface**: Side-by-side country comparison

```
South Africa (ZA)          Nigeria (NG)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Standard Bank            ✓ First Bank Nigeria
✓ FNB                      ✓ GTBank
✓ ABSA                     ✓ Zenith Bank
✓ Nedbank                  ✓ Access Bank
✓ Capitec                  ✓ UBA
✓ Other                    ✓ Other
```

**Actions**:
- ✏️ **Edit**: Modify individual options
- 🔄 **Regenerate**: Generate new options for a country
- ❌ **Remove**: Exclude a country from batch
- ✅ **Approve**: Accept options as-is

### 5. Review & Edit Options

**Editing Interface**:

Click **Edit** next to any country to open inline editor:

```
South Africa (ZA)
─────────────────────────
[✏️ Standard Bank        ]  ❌
[✏️ FNB                  ]  ❌
[✏️ ABSA                 ]  ❌
[✏️ Nedbank              ]  ❌
[✏️ Capitec              ]  ❌
[✏️ Other                ]  ❌
[+ Add Option]

[Cancel] [Save Changes]
```

**Common Edits**:
- Fix spelling/capitalization
- Add missing major brands
- Remove inappropriate options
- Reorder by market share

### 6. Bulk Approve & Save

**Final Review Panel**:

```
Ready to save options for 5 countries:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ South Africa (ZA)     6 options
✓ Nigeria (NG)          8 options  
✓ Kenya (KE)            7 options
✓ Ghana (GH)            6 options
✓ India (IN)            12 options

Total: 39 options across 5 countries

[Cancel] [Save All Options]
```

Click **"Save All Options"** to commit changes to database.

### 7. Verify Deployment

**Post-Save Checklist**:

- [ ] Options appear in "Manage Country Options" list
- [ ] Test accounts in those countries see new options
- [ ] Global fallback still works for other countries
- [ ] No duplicate entries created

**Test Method**:
1. Navigate to **Admin → Simulator**
2. Select test user in target country
3. Open Profile tab
4. Verify question shows country-specific options

## Advanced Features

### Batch Generation Across Questions

Generate options for multiple questions at once:

1. Navigate to **Profile Questions** main page
2. Select multiple questions (checkboxes)
3. Click **"Bulk Actions" → "Auto-Generate for Countries"**
4. Select target countries
5. Review all generated options in grid view
6. Approve/reject per question-country combination

### AI-Suggested Question Creation

Use AI to suggest new questions:

1. Click **"AI Assistant"** in Profile Questions page
2. Describe the data you want to collect
3. AI suggests:
   - Question text
   - Answer options (global and country-specific)
   - Category assignment
   - Decay configuration
4. Review and edit suggestions
5. Click **"Create Question"** to add to system

### Smart Gap Detection

AI automatically detects missing country options:

**Dashboard Widget**: "Profiling Gaps"

```
High-Priority Gaps Detected:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 "Which mobile network do you use?"
   Missing: NG, KE, GH (387 users affected)
   [Generate Options]

🏦 "Which bank do you primarily use?"
   Missing: IN, PK, BD (512 users affected)
   [Generate Options]
```

Click **"Generate Options"** to auto-fill gaps.

## Best Practices

### 1. Quality Over Speed

- Review AI-generated options before saving
- Verify brand names against official sources
- Test with users in target countries when possible

### 2. Iterative Refinement

- Start with high-traffic countries
- Gather user feedback on option quality
- Refine prompts based on feedback
- Re-generate for improved results

### 3. Market Research

- Use AI generation as a starting point
- Cross-reference with market reports
- Validate with local team members
- Keep options updated as markets evolve

### 4. Consistency Across Questions

- Maintain consistent brand naming
- Use same capitalization style
- Align with existing questions
- Create style guide for manual edits

## Monitoring & Analytics

### Generation Analytics

Track AI generation performance:

```
Auto-Generation Performance (Last 30 Days)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Generations:       248
Countries Covered:       15
Questions Enhanced:      42
Manual Edits:           18%
Average Options/Gen:    11.3
User Satisfaction:      4.2/5.0
```

### Quality Metrics

Monitor option quality over time:

- **Usage Rate**: % of users selecting AI-generated options
- **"Other" Rate**: % selecting "Other" (indicates missing options)
- **Edit Frequency**: How often admins manually edit AI options
- **User Feedback**: Star ratings on option quality

## Troubleshooting

### AI Generation Fails

**Symptoms**: Error message during generation

**Solutions**:
1. Check AI provider API key is configured
2. Verify internet connectivity
3. Reduce number of target countries (try 1-2)
4. Try different AI provider
5. Check AI service status page

### Poor Quality Options

**Symptoms**: Irrelevant brands, spelling errors, outdated info

**Solutions**:
1. Adjust temperature (lower = more factual)
2. Add market context to prompt
3. Try different AI model (GPT-4 > GPT-3.5)
4. Manually edit and save as examples for future
5. Report issue to improve prompts

### Duplicate Options Created

**Symptoms**: Same options appear multiple times

**Solutions**:
1. Delete duplicates in "Manage Country Options"
2. Clear browser cache
3. Check for database constraint issues
4. Verify no concurrent edits by other admins

### Generated Options Not Appearing

**Symptoms**: Saved options don't show in user profiles

**Solutions**:
1. Verify options were saved (check database)
2. Check user's country_code field
3. Clear application cache
4. Verify question is active/published
5. Test with simulator in target country

## Cost Management

### AI Usage Costs

Auto-generation uses AI API credits:

**Estimated Costs** (per generation):
- GPT-4: ~$0.03 per country
- Claude: ~$0.02 per country  
- Gemini Pro: ~$0.01 per country

**Budget Tips**:
- Use GPT-3.5 or Gemini for routine generations
- Reserve GPT-4 for complex/nuanced questions
- Generate in batches to reduce overhead
- Cache and reuse common patterns

### Cost Tracking

Monitor AI usage in admin portal:

```
AI Generation Costs (Current Month)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generations:     124
Total Cost:      $4.68
Avg Cost/Gen:    $0.038
Budget Used:     23% of $20.00
```

## Related Documentation

- [AI Generation Prompts](AI_GENERATION_PROMPTS.md)
- [Country Question Management](COUNTRY_QUESTION_MANAGEMENT.md)
- [Auto-Scaling System](AUTO_SCALING_SYSTEM.md)
- [Admin Guide](ADMIN_GUIDE.md)
