---
id: "ai-provider-flexibility"
title: "AI Provider Flexibility & Multi-Model Architecture"
category: "Profiling System"
description: "Comprehensive guide to hybrid AI architecture, custom provider configuration, and multi-model orchestration for cost optimization"
audience: "admin"
tags: ["ai", "providers", "cost-optimization", "architecture", "automation"]
status: "published"
---

# AI Provider Flexibility & Multi-Model Architecture

## Executive Summary

### Current State: Hybrid AI Architecture
- **Default:** Lovable AI (built-in, no setup required)
- **Optional:** Custom AI providers (OpenAI, Anthropic, Google AI)
- **Advanced (Future):** Multi-model orchestration - use different AI models for different subtasks

### Key Benefits
- ✅ **Zero Setup:** Start immediately with Lovable AI
- ✅ **No Vendor Lock-in:** Switch providers anytime without code changes
- ✅ **Cost Optimization:** Choose models based on volume and requirements
- ✅ **Quality Optimization:** Use the best model for each task
- ✅ **Automatic Fallback:** Resilient to provider failures

---

## 1. Understanding AI Provider Options

### 1.1 Lovable AI (Default - No Setup Required)

**What it is:**
- Built-in AI gateway using `google/gemini-2.5-flash`
- Included in Lovable Cloud usage
- No API keys needed
- Shared rate limits across workspace

**Best for:**
- Getting started immediately
- Prototyping and development
- Low to medium volume (< 1,000 generations/month)
- Teams that don't want to manage API keys

**Cost Structure:**
- Included credits in Lovable Cloud subscription
- Usage-based pricing for overages
- No separate billing with AI providers

**Limitations:**
- Fixed model (cannot switch to other models)
- Shared rate limits (may impact high-volume users)
- Subject to Lovable Cloud fair use policy

---

### 1.2 Custom AI Providers (Optional Upgrade)

**Supported Providers:**
- **OpenAI:** GPT-5, GPT-5-mini, GPT-5-nano, GPT-4.1
- **Anthropic:** Claude Sonnet 4.5, Claude Opus 4.1
- **Google AI:** Gemini 2.5 Pro, Flash, Flash-Lite

**Requirements:**
- API key from the provider
- Active account with the provider
- Payment method on file with provider

**Best for:**
- Production environments
- High volume (> 1,000 generations/month)
- Specific model requirements (e.g., GPT-5, Claude)
- Teams with existing provider relationships
- Need for dedicated rate limits

**Cost Structure:**
- Pay-as-you-go directly to AI provider
- No markup from Lovable
- Volume discounts available from providers

**Advantages:**
- Choose specific models for quality needs
- Dedicated rate limits (not shared)
- Enterprise SLAs available
- Direct relationship with AI provider

---

### 1.3 Hybrid Approach (Recommended)

**Strategy:**
- Start with Lovable AI to launch quickly
- Monitor usage and costs in Admin → Integrations
- Switch to custom provider when volume justifies it
- Mix providers for different features if needed

**Automatic Fallback:**
```
Custom Provider → Fails → Lovable AI → Success
```
Your edge functions automatically fall back to Lovable AI if custom provider fails, ensuring zero downtime.

---

## 2. Where AI is Used in Question Generation

### 2.1 Currently Implemented Features

#### Country-Specific Options Auto-Generation
**Status:** ✅ **Live in Production**

**What it does:**
- Automatically generates localized answer options for select/multi-select questions
- Researches local context (brands, services, products) for each country
- Creates culturally relevant options that make sense to local users

**Example:**
```
Question: "Which banks do you use?"

South Africa:
- Standard Bank
- FNB (First National Bank)
- Capitec Bank
- Nedbank
- ABSA

Nigeria:
- GTBank (Guaranty Trust Bank)
- Zenith Bank
- Access Bank
- First Bank of Nigeria
- UBA (United Bank for Africa)
```

**How to use:**
1. Navigate to Admin → Profile Questions
2. Select a question (or create new one)
3. Scroll to "Country-Specific Options" section
4. Click **"✨ AI Generate Options"** next to a country
5. Review and approve generated options
6. Save

**See:** [Admin Auto-Generation Guide](ADMIN_AUTO_GENERATION_GUIDE.md) for detailed instructions.

---

### 2.2 Coming Soon (Preview Features)

#### Question Text Generation
**Status:** 📋 **Planned Q2 2025**

Generate user-friendly question text from question key.

**Example:**
```
Input: employment_status
Output: "What is your current employment status?"
```

---

#### Global Answer Options
**Status:** 📋 **Planned Q2 2025**

Generate answer options for select/multi-select questions without country context.

**Example:**
```
Question Key: employment_status
Generated Options:
- Full-time employed
- Part-time employed
- Self-employed / Freelance
- Unemployed (seeking work)
- Student
- Retired
- Homemaker
```

---

#### Help Text Suggestions
**Status:** 📋 **Planned Q2 2025**

Generate contextual help text to guide users.

**Example:**
```
Question: "What is your annual household income?"
Generated Help Text: "We use this information to match you with surveys and opportunities relevant to your income bracket. Your data is kept confidential."
```

---

#### Live Preview
**Status:** 📋 **Planned Q1 2025**

See how questions look to users as you build them, with device switching (desktop/mobile/tablet).

---

## 3. Configuration Guide

### 3.1 Using Lovable AI (Default)

**Setup Required:** ✅ **NONE** - Works immediately!

Lovable AI is already configured in all edge functions. No steps needed.

**Monitor Usage:**
1. Navigate to **Admin → Integrations**
2. Find "Lovable AI" section
3. View current usage and included credits

**That's it!** You're ready to use AI features immediately.

---

### 3.2 Switching to Custom AI Provider

**Step-by-Step:**

1. **Obtain API Key from Provider**
   - OpenAI: https://platform.openai.com/api-keys
   - Anthropic: https://console.anthropic.com/settings/keys
   - Google AI: https://aistudio.google.com/apikey

2. **Navigate to Admin Portal**
   - Go to **Admin → Integrations**

3. **Enable Custom Provider**
   - Find "AI Providers" section
   - Toggle **"Use Custom AI Provider"** → ON

4. **Select Provider**
   - Choose from dropdown:
     - OpenAI
     - Anthropic
     - Google AI

5. **Add API Key Securely**
   - Click **"Configure in Backend Settings"** button
   - Opens Backend Settings interface
   - Add secret: `AI_PROVIDER_API_KEY`
   - Paste your API key
   - Save securely

6. **Test Connection**
   - Return to Integrations page
   - Click **"Test Connection"** button
   - Should show: ✅ **Connected Successfully**

7. **Verify in Use**
   - Try generating country options for a question
   - Check edge function logs to confirm custom provider is being used

**Time Required:** ~5 minutes

---

### 3.3 Switching Back to Lovable AI

**If you want to revert to Lovable AI:**

1. Navigate to **Admin → Integrations**
2. Toggle **"Use Custom AI Provider"** → OFF
3. Done!

**Note:** Your API key remains securely stored in case you want to switch back later.

---

## 4. Provider Comparison Matrix

| Feature | Lovable AI | OpenAI | Anthropic | Google AI |
|---------|------------|--------|-----------|-----------|
| **Setup Time** | ✅ 0 minutes (automatic) | ⚙️ 5 minutes | ⚙️ 5 minutes | ⚙️ 5 minutes |
| **API Key Required** | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |
| **Models Available** | Gemini 2.5 Flash (fixed) | GPT-5, GPT-5-mini, GPT-5-nano, GPT-4.1 | Claude Sonnet 4.5, Opus 4.1 | Gemini 2.5 Pro, Flash, Flash-Lite |
| **Cost Model** | Included usage + overages | Per-token pricing | Per-token pricing | Per-token pricing |
| **Rate Limits** | Workspace-shared | Your account limits | Your account limits | Your account limits |
| **Best For** | Quick start, prototyping | Production, flexibility, latest models | Long context (200K), natural wording | Multimodal (image+text), cost-efficient |
| **Fallback Support** | N/A (primary) | ✅ Yes (→ Lovable AI) | ✅ Yes (→ Lovable AI) | ✅ Yes (→ Lovable AI) |
| **Vendor Lock-in** | None | None | None | None |
| **Enterprise SLA** | Lovable Cloud SLA | Available | Available | Available |

---

## 5. Cost Analysis & When to Switch

### 5.1 When to Stay with Lovable AI

✅ **You should keep using Lovable AI if:**
- Just getting started with the platform
- Under 1,000 AI generations per month
- Don't want to manage API keys or provider accounts
- Using default question generation features
- Within included Lovable Cloud usage credits
- Development/staging environment
- Want zero configuration

---

### 5.2 When to Consider Custom Provider

🔄 **Consider switching to custom provider if:**
- Over 1,000 AI generations per month (volume discounts)
- Need specific models (e.g., Claude for better wording, GPT-4 for research)
- Want dedicated rate limits (not shared with workspace)
- Require enterprise SLAs from AI provider
- Already have negotiated pricing with a provider
- Production environment with critical AI dependencies

---

### 5.3 Cost Examples

#### Scenario 1: Low Volume (500 generations/month)
```
Lovable AI:
- Included credits: $10 (covers ~200 generations)
- Overages: 300 × $0.02 = $6
- Total: ~$16/month
✅ Best choice: Stay with Lovable AI

Custom OpenAI GPT-5-mini:
- 500 × $0.015 = $7.50/month
- Plus: API key management overhead
- Total: $7.50/month + time cost
```

---

#### Scenario 2: Medium Volume (1,000 generations/month)
```
Lovable AI:
- Included credits: $10 (covers ~200 generations)
- Overages: 800 × $0.02 = $16
- Total: ~$26/month

Custom OpenAI GPT-5-mini:
- 1,000 × $0.015 = $15/month
- Savings: $11/month (42% cheaper)
✅ Best choice: Switch to custom provider

Custom OpenAI GPT-4:
- 1,000 × $0.10 = $100/month
- Premium: $74/month more (but higher quality)
- Use case: Complex research tasks requiring deep reasoning
```

---

#### Scenario 3: High Volume (10,000 generations/month)
```
Lovable AI:
- 10,000 × $0.02 = $200/month

Custom OpenAI GPT-5-mini:
- 10,000 × $0.015 = $150/month
- Savings: $50/month (25% cheaper)

Custom Google Gemini Flash:
- 10,000 × $0.008 = $80/month
- Savings: $120/month (60% cheaper)
✅ Best choice: Custom Gemini Flash for cost, GPT-5-mini for quality
```

---

## 6. Decision Tree: Choosing Your AI Strategy

```
START: Need AI for question generation
│
├─ Volume < 500 generations/month?
│  └─ YES → ✅ Use Lovable AI (included, simple)
│  └─ NO → Continue...
│
├─ Have preferred AI provider relationship?
│  └─ YES → ✅ Use Custom Provider (cost savings, dedicated limits)
│  └─ NO → Continue...
│
├─ Need specific model capabilities?
│  ├─ Long context (100K+ tokens) → ✅ Custom Anthropic Claude
│  ├─ Latest models (GPT-5) → ✅ Custom OpenAI
│  ├─ Multimodal (images + text) → ✅ Custom Gemini Pro
│  └─ General purpose → ✅ Lovable AI or Custom Gemini Flash
│
├─ Budget very tight?
│  └─ YES → ✅ Lovable AI (included credits) or Custom Gemini Flash (cheapest)
│
└─ Default: Start with Lovable AI, upgrade later when volume grows
```

---

## 7. Advanced: Multi-Model Orchestration (Future Optimization)

### Status: 📋 **Planned Enhancement - Q2 2025** (Not Yet Implemented)

### Concept
Use **different AI models for different subtasks** within a single operation to optimize for both **quality AND cost**.

---

### Why Multi-Model?

**Problem with Single-Model Approach:**
- Expensive models (GPT-4) used even for simple tasks (classification)
- Cheap models (GPT-5-nano) used for complex tasks (research) = poor quality
- One-size-fits-all doesn't optimize for cost or quality

**Solution: Task-Based Routing**
- Use GPT-4 for complex research (where you need it)
- Use Claude for creative wording (where it excels)
- Use Gemini-Lite for simple classification (fast & cheap)
- Use Lovable AI for validation (included credits)

---

### Example Workflow: "Generate Question for Banking Preferences"

#### Traditional Single-Model Approach
```
Use: GPT-4 for everything
Cost: $0.10 per generation
Time: ~5 seconds
Quality: High (but expensive)
```

#### Multi-Model Pipeline Approach
```
Step 1: Research (GPT-4) → $0.03
  Task: "Research banking preferences in South Africa - major players, market share"
  Why GPT-4: Needs deep knowledge, current data, complex reasoning
  
Step 2: Question Wording (Claude Sonnet 4) → $0.02
  Task: "Create user-friendly question text from research"
  Why Claude: Superior natural language flow, human-like phrasing
  
Step 3: Generate Options (Gemini Flash-Lite) → $0.001
  Task: "Extract brand names from research data"
  Why Gemini-Lite: Simple classification task, very fast, very cheap
  
Step 4: Cultural Validation (Lovable AI) → FREE
  Task: "Validate options are appropriate for South African users"
  Why Lovable AI: Quick validation check, included in usage credits

Total Cost: $0.051 (49% savings vs single-model)
Total Time: ~3 seconds (parallel execution)
Quality: Optimized (right tool for each job)
```

---

### Configuration UI (Future)

**Admin → Integrations → AI Strategy → Multi-Model Pipeline**

```
Task Routing Grid:
┌──────────────────┬─────────────────┬──────────────┬──────────┐
│ Task Type        │ Assigned Model  │ Provider     │ Override │
├──────────────────┼─────────────────┼──────────────┼──────────┤
│ Research         │ GPT-4           │ OpenAI       │ ✎ Edit   │
│ Wording          │ Claude Sonnet 4 │ Anthropic    │ ✎ Edit   │
│ Options Extract  │ Gemini Flash    │ Lovable AI   │ ✎ Edit   │
│ Validation       │ Gemini Lite     │ Lovable AI   │ ✎ Edit   │
│ Classification   │ GPT-5-nano      │ OpenAI       │ ✎ Edit   │
└──────────────────┴─────────────────┴──────────────┴──────────┘

Cost Estimate: $0.051 per generation (vs $0.10 single-model)
Estimated Monthly Savings: $49 (based on 1,000 generations)
```

---

### Task Type Recommendations

| Task Type | Best Model | Why | Fallback |
|-----------|------------|-----|----------|
| **Research** | GPT-4, Claude Opus | Deep reasoning, current knowledge, complex analysis | GPT-5-mini |
| **Wording/Creative** | Claude Sonnet 4, GPT-5 | Natural language, human-like, creative | Gemini Flash |
| **Classification** | Gemini Flash-Lite, GPT-5-nano | Fast, cheap, accurate for simple categorization | Lovable AI |
| **Validation** | Gemini Flash, Lovable AI | Quick checks, pattern matching, rule-based | GPT-5-mini |
| **Multimodal** | Gemini Pro, GPT-5 | Image + text understanding, visual analysis | Gemini Flash |
| **Long Context** | Claude Opus, Gemini Pro | Handle 100K+ token inputs, document analysis | GPT-4 |

---

### Benefits of Multi-Model Orchestration

✅ **Cost Optimization:** Use expensive models only where needed (30-50% savings)

✅ **Quality Optimization:** Best tool for each job (right model for right task)

✅ **Speed Optimization:** Parallel execution of independent tasks

✅ **Flexibility:** Mix Lovable AI (free) with custom providers

✅ **Resilience:** Automatic fallback if one model fails

---

### When to Use Multi-Model

**Consider multi-model orchestration if:**
- High volume operations (1,000+ generations/month)
- Complex workflows with distinct subtasks
- Cost-sensitive production environments
- Quality-critical applications requiring specialized models
- Have multiple AI provider accounts

**Stick with single-model if:**
- Low volume (< 1,000 generations/month)
- Simple workflows (one clear task)
- Configuration complexity not worth savings
- Just getting started

---

### Implementation Status

- ⏳ **Planned for Q2 2025**
- Will be optional feature (single-model still available)
- Requires custom AI provider configuration
- UI configuration in Admin → Integrations

**See:** [Future Optimizations Roadmap](../../reference/FUTURE_OPTIMIZATIONS.md) for detailed implementation plan.

---

## 8. Technical Architecture

### 8.1 Edge Function: AI Provider Detection

**Current implementation in edge functions (e.g., `auto-generate-country-options`):**

```typescript
const aiProvider = Deno.env.get('AI_PROVIDER') || 'lovable';
const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
const customApiKey = Deno.env.get('AI_PROVIDER_API_KEY');

// Route to appropriate provider
if (aiProvider === 'lovable') {
  return await callLovableAI(prompt, lovableApiKey);
} else if (aiProvider === 'openai') {
  return await callOpenAI(prompt, customApiKey);
} else if (aiProvider === 'anthropic') {
  return await callAnthropic(prompt, customApiKey);
} else if (aiProvider === 'google') {
  return await callGoogleAI(prompt, customApiKey);
}
```

**How it works:**
1. Edge function checks `AI_PROVIDER` environment variable
2. If custom provider configured → use custom API key
3. Otherwise → default to Lovable AI
4. No code changes needed when switching providers

---

### 8.2 Secret Management

**Lovable AI (Default):**
- Secret: `LOVABLE_API_KEY`
- Auto-provided by platform
- User never sees or manages this
- Included in all Lovable Cloud projects

**Custom Providers:**
- Secret: `AI_PROVIDER_API_KEY`
- User adds via Backend Settings (Admin → Integrations → Configure)
- Encrypted at rest
- Scoped to project environment

**Provider Selection:**
- Environment variable: `AI_PROVIDER`
- Set via Admin UI → Integrations
- Options: `lovable`, `openai`, `anthropic`, `google`

---

### 8.3 Fallback Logic

**Automatic Resilience:**

```typescript
try {
  // Try custom provider first (if configured)
  return await callCustomProvider();
} catch (error) {
  console.warn('Custom provider failed, falling back to Lovable AI');
  
  // Automatic fallback to Lovable AI
  return await callLovableAI();
}
```

**What this means:**
- If your custom provider is down → Lovable AI takes over
- If API key expires → Lovable AI takes over
- If rate limit hit → Lovable AI takes over
- **Zero downtime** for your users

---

### 8.4 Future: Multi-Model Orchestrator Edge Function

**Planned architecture:**

```typescript
// New edge function: ai-orchestrator/index.ts
interface PipelineStep {
  task: 'research' | 'wordsmith' | 'classify' | 'validate';
  input: string;
  model?: string; // Optional override
}

async function orchestrate(pipeline: PipelineStep[]) {
  const results = [];
  
  for (const step of pipeline) {
    // Select optimal model for task
    const model = step.model || selectModelForTask(step.task);
    
    // Call that model
    const result = await callModel(model, step.input);
    
    results.push(result);
  }
  
  return results;
}

function selectModelForTask(task: string) {
  const config = getMultiModelConfig(); // From database
  
  return config.taskRouting[task] || {
    provider: 'lovable',
    model: 'gemini-2.5-flash'
  };
}
```

---

## 9. Monitoring & Usage Tracking

### 9.1 Current Usage Dashboard

**Location:** Admin → Integrations → AI Usage

**Metrics Shown:**
- Total AI generations this month
- Cost breakdown (if custom provider)
- Success rate (% successful generations)
- Average response time
- Fallback frequency (custom → Lovable AI)

---

### 9.2 Future: Enhanced Usage Analytics (Q2 2025)

**Planned metrics:**
- Cost breakdown by task type (when multi-model enabled)
- Cost comparison: Actual vs Single-Model estimate
- Model performance by task type
- Quality scoring (user feedback on generated content)

**Alerts:**
- 🚨 Approaching included usage limit (Lovable AI)
- 🚨 Custom provider API key expiring
- 🚨 High failure rate on custom provider
- 💡 Recommendation: "Switch to multi-model to save $X/month"

---

## 10. Migration Guide

### Scenario 1: Lovable AI → Custom OpenAI

**Current:** Using Lovable AI (gemini-2.5-flash)  
**Want:** Switch to OpenAI GPT-5-mini

**Steps:**
1. Obtain OpenAI API key from https://platform.openai.com/api-keys
2. Navigate to **Admin → Integrations**
3. Toggle **"Use Custom AI Provider"** → ON
4. Select **"OpenAI"** from dropdown
5. Click **"Add API Key"** → Enter key → Save
6. Click **"Test Connection"** → ✅ Success
7. Done - all AI features now use OpenAI

**Code changes required:** ✅ **NONE** (automatic)  
**Downtime:** ✅ **NONE** (seamless switch)  
**Rollback:** Toggle back to Lovable AI anytime

---

### Scenario 2: Custom Provider → Multi-Model (Future - Q2 2025)

**Current:** Using custom Anthropic Claude for everything  
**Want:** Use GPT-4 for research, Claude for wording, Gemini-Lite for classification

**Steps:**
1. Ensure you have API keys for all providers you want to use
2. Navigate to **Admin → Integrations**
3. Toggle **"Multi-Model Pipeline"** → ON
4. Configure task routing grid:
   - Research → GPT-4 (OpenAI)
   - Wording → Claude Sonnet (Anthropic)
   - Classification → Gemini-Lite (Lovable AI)
5. Review cost estimate
6. Save configuration
7. Test with sample question generation
8. Monitor cost savings in usage dashboard

**Code changes required:** ✅ **NONE**  
**Configuration time:** ~5 minutes  
**Expected cost savings:** 30-50%

---

## 11. Troubleshooting

### Issue: "Still using Lovable AI after configuring custom provider"

**Possible causes:**
1. API key not saved in Backend Settings
2. Provider toggle not enabled in Integrations
3. API key expired/invalid
4. Edge function not redeployed (rare)

**Solution:**
1. Go to **Admin → Integrations**
2. Check toggle is **ON** for "Use Custom AI Provider"
3. Click **"Test Connection"** → Should show ✅ Success
4. If test fails:
   - Click "Configure in Backend Settings"
   - Verify `AI_PROVIDER_API_KEY` is present
   - Re-enter API key if needed
5. Try generating country options again
6. Check edge function logs for confirmation

---

### Issue: "Custom provider errors/timeouts"

**Behavior:** Automatically falls back to Lovable AI

**Causes:**
- Provider API downtime
- Rate limit exceeded on provider account
- Invalid/expired API key
- Network issues between edge function and provider

**Solution:**
1. Check provider status page:
   - OpenAI: https://status.openai.com
   - Anthropic: https://status.anthropic.com
   - Google: https://status.cloud.google.com
2. Review provider dashboard for rate limits
3. Verify API key hasn't expired (regenerate if needed)
4. Check edge function logs for detailed error messages
5. **System will auto-fallback to Lovable AI** - no user impact

---

### Issue: "High costs on custom provider"

**Diagnosis:**
1. Go to **Admin → Integrations → Usage Dashboard**
2. Check "Total Generations This Month"
3. Calculate: Generations × Model cost = Monthly spend
4. Compare to Lovable AI cost

**Solutions:**
- **If volume < 1,000:** Switch back to Lovable AI (included credits)
- **If volume > 1,000:** Wait for multi-model orchestration (Q2 2025) for 30-50% savings
- **Use cheaper models:** Switch from GPT-4 → GPT-5-mini or Gemini Flash
- **Set budget alerts:** In provider dashboard (OpenAI/Anthropic/Google)
- **Optimize usage:** Only generate options when needed (don't regenerate frequently)

---

### Issue: "Low quality AI-generated content"

**Possible causes:**
- Using cheapest model (Gemini-Lite, GPT-5-nano) for complex tasks
- Prompts need optimization
- Insufficient context in prompts

**Solutions:**
1. **Switch to higher-quality model:**
   - Research tasks → GPT-4 or Claude Opus
   - Creative wording → Claude Sonnet or GPT-5
   - Simple classification → Gemini Flash (not Lite)

2. **Wait for prompt optimization features (Q3 2025):**
   - Prompt version control
   - A/B testing of prompts
   - Admin UI for prompt editing

3. **Provide more context in admin UI:**
   - Add detailed question descriptions
   - Specify target audience clearly
   - Include examples of desired output

---

## 12. Related Documentation

### Question Generation & AI
- **[AI Generation Prompts](AI_GENERATION_PROMPTS.md)** - Prompt templates and engineering best practices
- **[Admin Auto-Generation Guide](ADMIN_AUTO_GENERATION_GUIDE.md)** - Step-by-step usage instructions
- **[Auto-Scaling System](AUTO_SCALING_SYSTEM.md)** - AI-powered country option generation system

### System Architecture
- **[Profile System Architecture](../../technical/PROFILE_SYSTEM_ARCHITECTURE.md)** - Technical overview
- **[Integrations Setup](../../deployment/INTEGRATIONS_SETUP.md)** - Detailed provider configuration

### Future Enhancements
- **[Future Optimizations Roadmap](../../reference/FUTURE_OPTIMIZATIONS.md)** - Multi-model orchestration and other planned features

---

## 13. Summary: Quick Reference

### ✅ Use Lovable AI (Default) if:
- Just getting started
- Volume < 1,000 generations/month
- Don't want to manage API keys
- Want zero configuration

### 🔄 Use Custom Provider if:
- Volume > 1,000 generations/month
- Need specific models (GPT-5, Claude)
- Want dedicated rate limits
- Have existing provider relationship

### ⏳ Use Multi-Model Orchestration (Coming Q2 2025) if:
- High volume (5,000+ generations/month)
- Complex workflows with distinct subtasks
- Cost optimization is priority
- Quality optimization is priority

### 🎯 Key Takeaways
1. **Start fast:** Lovable AI works immediately, no setup
2. **No lock-in:** Switch providers anytime without code changes
3. **Automatic fallback:** Custom provider fails → Lovable AI takes over
4. **Cost-aware:** Monitor usage, switch providers based on volume
5. **Future-ready:** Multi-model orchestration coming for 30-50% cost savings

---

**Last Updated:** 2025-01-04  
**Version:** 1.0  
**Feedback:** Report issues or suggestions in Admin → Knowledge Centre → Feedback
