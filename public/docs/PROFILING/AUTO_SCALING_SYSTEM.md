---
id: "profiling-auto-scaling"
title: "Auto-Scaling System"
category: "Technical Reference"
description: "Auto-scaling system for profile question delivery"
audience: "admin"
tags: ["profiling", "scaling", "performance", "optimization"]
status: "published"
---

# Auto-Scaling System

## Overview

The Looplly profiling system includes an AI-powered auto-scaling mechanism that automatically detects and generates missing country-specific question options as the platform expands to new markets.

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────┐
│  Gap Detection Engine                           │
│  ├─ Monitor user country distribution          │
│  ├─ Detect missing country options             │
│  └─ Prioritize gaps by impact                  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  AI Generation Engine                           │
│  ├─ Generate context-aware options             │
│  ├─ Validate against market data               │
│  └─ Format for database insertion              │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Approval Workflow                              │
│  ├─ Queue for admin review                     │
│  ├─ Auto-approve high-confidence options       │
│  └─ Deploy approved options                    │
└─────────────────────────────────────────────────┘
```

### Database Schema

```sql
-- Tracks detected gaps
CREATE TABLE country_profiling_gaps (
  id UUID PRIMARY KEY,
  question_id UUID REFERENCES profile_questions(id),
  country_code TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  user_count INTEGER, -- Users affected by this gap
  detected_at TIMESTAMP DEFAULT NOW(),
  status TEXT CHECK (status IN ('detected', 'generating', 'pending_review', 'deployed', 'dismissed')),
  generated_options TEXT[],
  ai_confidence NUMERIC(3,2), -- 0.00-1.00
  reviewed_by UUID REFERENCES profiles(user_id),
  deployed_at TIMESTAMP
);

-- Controls auto-approval
CREATE TABLE auto_approval_config (
  id UUID PRIMARY KEY,
  question_category TEXT,
  confidence_threshold NUMERIC(3,2) DEFAULT 0.85,
  require_manual_review BOOLEAN DEFAULT false,
  enabled BOOLEAN DEFAULT true
);
```

## Gap Detection

### Automated Detection

The system runs hourly checks to detect gaps:

```sql
-- Detect countries with users but no country options
SELECT 
  pq.id as question_id,
  pq.question_key,
  p.country_code,
  COUNT(DISTINCT p.user_id) as affected_users,
  CASE
    WHEN pq.question_category IN ('banking', 'mobile_network') THEN 'critical'
    WHEN COUNT(DISTINCT p.user_id) > 100 THEN 'high'
    WHEN COUNT(DISTINCT p.user_id) > 20 THEN 'medium'
    ELSE 'low'
  END as priority
FROM profile_questions pq
CROSS JOIN (
  SELECT DISTINCT country_code 
  FROM profiles 
  WHERE country_code IS NOT NULL
) p
LEFT JOIN country_question_options cqo 
  ON cqo.question_id = pq.id 
  AND cqo.country_code = p.country_code
WHERE cqo.id IS NULL  -- No country options exist
  AND pq.requires_country_specificity = true
GROUP BY pq.id, pq.question_key, p.country_code, pq.question_category
HAVING COUNT(DISTINCT p.user_id) > 5  -- At least 5 users
ORDER BY priority DESC, affected_users DESC;
```

### Priority Calculation

Gaps are prioritized using multiple factors:

| Factor | Weight | Description |
|--------|--------|-------------|
| **User Count** | 40% | Number of users affected |
| **Question Category** | 30% | Critical categories (banking, etc.) |
| **Recency** | 20% | Recently detected gaps prioritized |
| **Fallback Quality** | 10% | How well global options work |

**Priority Levels**:
- **Critical**: Essential questions (banking, mobile), 100+ users
- **High**: Important questions, 20-100 users
- **Medium**: Standard questions, 5-20 users
- **Low**: Nice-to-have questions, <5 users

## AI Generation Workflow

### Step 1: Context Gathering

Before generating options, the system gathers context:

```typescript
async function gatherGenerationContext(
  questionId: string, 
  countryCode: string
): Promise<GenerationContext> {
  return {
    question: await getQuestionDetails(questionId),
    countryInfo: await getCountryInfo(countryCode),
    similarQuestions: await findSimilarQuestions(questionId),
    existingCountries: await getCountryOptions(questionId),
    userFeedback: await getUserFeedback(questionId, countryCode)
  };
}
```

### Step 2: Prompt Construction

Dynamic prompt based on context:

```typescript
function buildGenerationPrompt(context: GenerationContext): string {
  return `
You are generating answer options for profiling question in ${context.countryInfo.name}.

Question: "${context.question.text}"
Category: ${context.question.category}
Country: ${context.countryInfo.name} (${context.countryInfo.code})

Context:
- Market type: ${context.countryInfo.economicProfile}
- Population: ${context.countryInfo.population}
- Similar questions have been answered successfully in this country

Reference examples from other countries:
${context.existingCountries.map(c => `${c.code}: ${c.options.slice(0, 3).join(', ')}`).join('\n')}

Generate 8-12 locally relevant answer options.
Focus on brands/options with significant market presence (>5% market share).
Use official brand names.
Include "Other" as the last option.

Format: Simple list, one per line, no numbering.
  `;
}
```

### Step 3: AI Generation

Call AI provider with prompt:

```typescript
async function generateOptions(
  prompt: string, 
  provider: AIProvider
): Promise<GeneratedOptions> {
  const response = await provider.complete({
    prompt,
    temperature: 0.3, // Low temperature for factual responses
    maxTokens: 500,
    stopSequences: ['\n\n']
  });
  
  const options = response.text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  return {
    options,
    confidence: calculateConfidence(response, options),
    rawResponse: response
  };
}
```

### Step 4: Validation

Validate generated options:

```typescript
function validateGeneratedOptions(options: string[]): ValidationResult {
  const checks = {
    countInRange: options.length >= 6 && options.length <= 20,
    hasOtherOption: options.some(opt => opt.toLowerCase() === 'other'),
    noEmptyStrings: options.every(opt => opt.trim().length > 0),
    noDuplicates: new Set(options).size === options.length,
    validCharacters: options.every(opt => /^[a-zA-Z0-9\s&'-]+$/.test(opt)),
    reasonableLength: options.every(opt => opt.length >= 2 && opt.length <= 100)
  };
  
  return {
    valid: Object.values(checks).every(Boolean),
    checks,
    confidence: calculateValidationConfidence(checks)
  };
}
```

## Auto-Approval System

### Confidence Scoring

AI-generated options receive a confidence score (0.00-1.00):

```typescript
function calculateConfidence(response: AIResponse, options: string[]): number {
  let score = 0.5; // Base score
  
  // Boost for validation checks
  if (options.length >= 8 && options.length <= 12) score += 0.15;
  if (options.includes('Other')) score += 0.10;
  
  // Boost for AI certainty
  if (response.logprobs && response.logprobs.avgConfidence > 0.8) score += 0.15;
  
  // Boost for known brands (check against brand database)
  const knownBrands = options.filter(opt => brandDatabase.includes(opt));
  score += (knownBrands.length / options.length) * 0.10;
  
  return Math.min(1.0, score);
}
```

### Auto-Approval Rules

Options are auto-approved if:

1. **Confidence ≥ Threshold** (default: 0.85)
2. **Question category allows auto-approval**
3. **Country is in approved list**
4. **No recent generation failures for this question**

```typescript
async function shouldAutoApprove(
  gap: ProfilingGap,
  generated: GeneratedOptions
): Promise<boolean> {
  const config = await getAutoApprovalConfig(gap.question.category);
  
  if (!config.enabled || config.requireManualReview) {
    return false;
  }
  
  if (generated.confidence < config.confidenceThreshold) {
    return false;
  }
  
  const recentFailures = await countRecentFailures(gap.questionId, 7); // 7 days
  if (recentFailures > 2) {
    return false;
  }
  
  return true;
}
```

### Approval Workflow

```typescript
async function processGeneratedOptions(
  gap: ProfilingGap,
  generated: GeneratedOptions
): Promise<void> {
  const autoApprove = await shouldAutoApprove(gap, generated);
  
  if (autoApprove) {
    // Deploy immediately
    await deployOptions(gap.questionId, gap.countryCode, generated.options);
    await updateGapStatus(gap.id, 'deployed');
    await logAuditEvent('auto_approved_deployment', { gapId: gap.id });
  } else {
    // Queue for manual review
    await queueForReview(gap.id, generated);
    await notifyAdmins('new_options_pending_review', { gapId: gap.id });
    await updateGapStatus(gap.id, 'pending_review');
  }
}
```

## Admin Review Interface

### Pending Review Dashboard

```
Pending Option Reviews
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Priority: Critical (3) | High (7) | Medium (12) | Low (5)

┌────────────────────────────────────────────────┐
│ 🏦 "Which bank do you primarily use?"         │
│ Country: Nigeria (NG)                          │
│ Affected Users: 287                            │
│ AI Confidence: 82% ⚠️ (Below auto-approve)    │
│                                                 │
│ Generated Options:                              │
│   • First Bank Nigeria                         │
│   • GTBank                                     │
│   • Zenith Bank                                │
│   • Access Bank                                │
│   • UBA                                        │
│   • Other                                      │
│                                                 │
│ [✏️ Edit] [✅ Approve & Deploy] [❌ Reject]    │
└────────────────────────────────────────────────┘
```

### Bulk Review Actions

Admins can review and approve multiple gaps at once:

1. **Select gaps** to review (checkboxes)
2. **Preview all options** in expanded view
3. **Edit any options** that need adjustment
4. **Bulk approve** all selections
5. **Deploy immediately** or schedule for later

## Monitoring & Analytics

### Key Metrics

Track system performance:

```
Auto-Scaling Performance (Last 30 Days)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Gaps Detected:           142
AI Generations:          138 (97% success rate)
Auto-Approved:           89 (64%)
Manual Reviews:          49 (36%)
Deployed Options:        134 (94%)
Avg. Time to Deploy:     4.2 hours

User Impact:
- Users with country options: 94% (+12% vs. last month)
- "Other" selection rate: 8% (-3% vs. last month)
- User satisfaction: 4.5/5.0
```

### Quality Metrics

Monitor option quality over time:

- **Acceptance Rate**: % of AI options approved by admins
- **Edit Rate**: % of options requiring manual edits
- **User Preference**: Which options users select most
- **Feedback Score**: User ratings on option quality

### Alerts & Notifications

Automated alerts for:

- **Critical gaps detected** (immediate Slack notification)
- **High-confidence options ready** for quick review
- **Generation failures** requiring investigation
- **Quality degradation** (increased edit rates)

## Configuration

### System Settings

Admins can configure auto-scaling behavior:

```yaml
# config/auto_scaling.yml
detection:
  run_interval: '1 hour'
  min_users_threshold: 5
  priority_categories: ['banking', 'mobile_network', 'retail']

generation:
  ai_provider: 'openai'  # openai | anthropic | google
  model: 'gpt-4'
  temperature: 0.3
  max_retries: 3

approval:
  auto_approve_enabled: true
  confidence_threshold: 0.85
  require_review_categories: ['sensitive', 'financial']
  
notifications:
  slack_webhook: '${SLACK_WEBHOOK_URL}'
  email_recipients: ['admin@example.com']
  notify_on: ['critical_gaps', 'deployment_failures']
```

## Best Practices

### 1. Monitor Confidence Trends

Track AI confidence over time:
- Declining confidence may indicate prompt drift
- Adjust prompts if confidence drops below 75%
- Re-train or switch models if needed

### 2. Review Auto-Approved Options

Periodically audit auto-approved options:
- Sample 10% of auto-approved options monthly
- Verify accuracy with market research
- Adjust confidence thresholds if issues found

### 3. Maintain Brand Database

Keep brand database updated:
- Add new brands as markets evolve
- Remove defunct brands
- Track brand name changes (mergers, rebrands)

### 4. User Feedback Loop

Collect and act on user feedback:
- "Was this option helpful?" survey
- Track "Other" usage rates
- Solicit suggestions for missing options

## Troubleshooting

### High "Other" Selection Rate

**Symptom**: >15% of users selecting "Other"

**Diagnosis**:
```sql
SELECT 
  pq.question_key,
  pa.answer_value,
  COUNT(*) as selection_count
FROM profile_answers pa
JOIN profile_questions pq ON pa.question_id = pq.id
WHERE pa.answer_value = 'Other'
GROUP BY pq.question_key, pa.answer_value
HAVING COUNT(*) > 50
ORDER BY selection_count DESC;
```

**Solution**:
- Review question for missing major options
- Re-generate options with higher option count
- Ask users for suggestions (feedback form)

### Low Confidence Scores

**Symptom**: Most generations scoring <0.70

**Causes**:
- Prompt quality issues
- Insufficient context
- Model not suitable for task

**Solution**:
- Refine prompts with more context
- Try different AI model
- Add market research references to prompt

### Generation Failures

**Symptom**: AI generation returns errors or empty results

**Diagnosis**: Check error logs for patterns

**Common Causes**:
- API rate limits exceeded
- Timeout errors
- Invalid prompt format
- API key issues

**Solution**:
- Implement exponential backoff
- Reduce concurrent generations
- Validate prompts before sending
- Rotate API keys if limits hit

## Related Documentation

- [AI Generation Prompts](AI_GENERATION_PROMPTS.md)
- [Admin Auto-Generation Guide](ADMIN_AUTO_GENERATION_GUIDE.md)
- [Country Question Management](COUNTRY_QUESTION_MANAGEMENT.md)
