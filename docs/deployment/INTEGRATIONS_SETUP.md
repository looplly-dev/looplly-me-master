---
id: "deployment-integrations"
title: "Third-Party Integrations Setup"
category: "Deployment & Infrastructure"
description: "Google Places API, AI providers, and external service integration configuration"
audience: "all"
tags: ["deployment", "integrations", "api", "security"]
status: "published"
version: "1.0"
created_at: "2024-01-15"
updated_at: "2024-01-15"
---

# Integrations Setup

Setting up Google Places API and AI Provider integrations with secure secret storage.

## Overview

Looplly integrates with external services to provide enhanced functionality. All API keys and secrets are securely stored in the Backend settings, never in code or frontend environment variables.

## Architecture

### Secure Secret Storage
- **Location:** Backend settings (accessible via Lovable Cloud)
- **Encryption:** All secrets encrypted at rest
- **Access:** Only backend functions can access secrets
- **Isolation:** Secrets never exposed to frontend code

### Integration Flow
```
Frontend → Edge Function → Secret from Backend → External API → Response
```

## Google Places API

### Overview
Provides address autocomplete and location services for user profiles.

### Use Cases
- Address input with autocomplete
- Location validation
- Geographic targeting
- Map display (future)

### Setup Instructions

#### Step 1: Get API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable **Places API** and **Geocoding API**
4. Navigate to **Credentials**
5. Click "Create Credentials" → "API Key"
6. Copy the API key
7. **Important:** Restrict the key:
   - API restrictions: Only allow Places API and Geocoding API
   - Application restrictions: Set HTTP referrer to your domain

#### Step 2: Add Secret to Backend

1. In Looplly Admin Portal, navigate to **Admin → Integrations**
2. Find "Google Places API" section
3. Click "Configure"
4. Follow the link to **Backend Settings**
5. Click "Add New Secret"
6. Enter:
   - **Name:** `VITE_GOOGLE_PLACES_API_KEY`
   - **Value:** Your Google Places API key
7. Click "Save"

#### Step 3: Verify Integration

1. Return to **Admin → Integrations**
2. Google Places API status should show:
   - 🟢 **Connected** if secret is set correctly
   - 🔴 **Not Configured** if secret is missing
   - 🟡 **Mock Mode** if using test data

#### Step 4: Test Functionality

1. Navigate to **Admin → Profile Questions**
2. Find or create an "Address" type question
3. Open the question form
4. Start typing an address
5. Verify autocomplete suggestions appear

### Troubleshooting

**No autocomplete suggestions:**
- Check Backend settings for `VITE_GOOGLE_PLACES_API_KEY`
- Verify API key is valid in Google Cloud Console
- Check edge function logs for errors
- Confirm Places API is enabled in Google Cloud

**"API key not valid" error:**
- Verify API key copied correctly (no spaces)
- Check API restrictions in Google Cloud Console
- Ensure billing is enabled on Google Cloud project

## AI Providers

### Overview
AI providers power intelligent features like content moderation, question generation, and user matching.

### Supported Providers

| Provider | Models | Use Cases |
|----------|--------|-----------|
| **OpenAI** | GPT-4, GPT-3.5 | Content generation, moderation |
| **Anthropic** | Claude 3 | Complex reasoning, long context |
| **Google AI** | Gemini Pro | Multimodal, fast inference |

### Setup Instructions

#### OpenAI

**Step 1: Get API Key**
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create account or sign in
3. Navigate to **API Keys**
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)
6. **Important:** Save it immediately, you can't view it again

**Step 2: Add to Backend**
1. **Admin → Integrations**
2. Find "OpenAI" section
3. Click "Configure"
4. Follow link to **Backend Settings**
5. Add secret:
   - **Name:** `OPENAI_API_KEY`
   - **Value:** Your OpenAI key
6. Save

**Step 3: Configure Models**
1. Set default model (e.g., `gpt-4`)
2. Set fallback model (e.g., `gpt-3.5-turbo`)
3. Configure rate limits
4. Set token budgets

**Step 4: Test**
1. **Admin → Integrations**
2. OpenAI status should show **Connected**
3. Click "Test" to verify API calls work

#### Anthropic (Claude)

**Step 1: Get API Key**
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create account or sign in
3. Navigate to **API Keys**
4. Generate new key
5. Copy the key

**Step 2: Add to Backend**
1. **Admin → Integrations**
2. Find "Anthropic" section
3. Click "Configure"
4. Follow link to **Backend Settings**
5. Add secret:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** Your Anthropic key
6. Save

**Step 3: Configure**
1. Select Claude model (e.g., `claude-3-opus-20240229`)
2. Set max tokens
3. Configure temperature and top_p

**Step 4: Test**
1. Return to **Admin → Integrations**
2. Verify **Connected** status
3. Run test API call

#### Google AI (Gemini)

**Step 1: Get API Key**
1. Visit [Google AI Studio](https://makersuite.google.com/)
2. Sign in with Google account
3. Click "Get API Key"
4. Create new key or use existing
5. Copy the key

**Step 2: Add to Backend**
1. **Admin → Integrations**
2. Find "Google AI" section
3. Click "Configure"
4. Follow link to **Backend Settings**
5. Add secret:
   - **Name:** `GOOGLE_AI_API_KEY`
   - **Value:** Your Google AI key
6. Save

**Step 3: Configure**
1. Select model (e.g., `gemini-pro`)
2. Configure safety settings
3. Set generation parameters

**Step 4: Test**
1. Check integration status
2. Verify connection
3. Run test generation

## Integration Status Monitoring

### Status Page
**Location:** `/admin/integrations`

**Features:**
- Real-time status for all integrations
- Color-coded indicators:
  - 🟢 **Connected**: Working correctly
  - 🟡 **Mock Mode**: Using test data
  - 🔴 **Not Configured**: Needs setup
  - ⚪ **Disabled**: Intentionally off

### Testing Integrations

**Test Actions:**
1. Click "Test" button next to integration
2. System makes real API call
3. Results displayed:
   - ✅ Success: Shows sample response
   - ❌ Error: Shows error message and troubleshooting steps

### Monitoring API Usage

**Metrics Tracked:**
- Total API calls (last 24h, 7d, 30d)
- Average response time
- Error rate
- Cost estimation (if available)

**Alerts:**
- Rate limit approaching (80%)
- Elevated error rate (>5%)
- Slow response times (>2s)
- Quota exhaustion

## Mock Mode

### Purpose
Test integration features without making real API calls during development.

### Configuration

**Enable Mock Mode:**
1. **Admin → Integrations**
2. Click integration name
3. Toggle "Mock Mode" switch
4. Save changes

**Mock Data:**
- Predefined responses for common requests
- Simulates API latency
- Returns realistic test data
- No API costs incurred

**When to Use:**
- Development and staging environments
- Testing error handling
- Demonstrating features to stakeholders
- Avoiding API costs during QA

## Security Best Practices

### API Key Management
- ✅ Store in Backend settings only
- ✅ Never commit to version control
- ✅ Rotate keys regularly (every 90 days)
- ✅ Use separate keys for dev/staging/production
- ❌ Never hardcode in frontend
- ❌ Don't share keys via email/chat
- ❌ Never log keys in error messages

### Access Control
- Only admins can view integrations page
- Only super admins can modify secrets
- Audit logs track all configuration changes
- Edge functions validate permissions before API calls

### Rate Limiting
- Configure reasonable limits for each provider
- Implement exponential backoff for retries
- Monitor usage to avoid quota exhaustion
- Set alerts for approaching limits

### Error Handling
- Log errors securely (no key exposure)
- Provide clear error messages to users
- Fall back to mock mode on repeated failures
- Alert admins to persistent issues

## Troubleshooting

### Integration Shows "Not Configured"

**Cause:** Secret not found in Backend settings

**Fix:**
1. Navigate to Backend settings
2. Verify secret name matches exactly (case-sensitive)
3. Add secret if missing
4. Refresh integration status page

### API Calls Failing

**Check:**
1. API key is valid and not expired
2. Billing is enabled on provider account
3. Rate limits not exceeded
4. Network connectivity from edge functions
5. Provider service status (check their status page)

### Slow Response Times

**Investigate:**
1. Provider latency (check their status)
2. Edge function cold starts
3. Network issues
4. Model selection (larger models = slower)
5. Request complexity

**Optimize:**
- Use faster models for simple tasks
- Cache responses when appropriate
- Implement request batching
- Set aggressive timeouts

### Cost Overruns

**Prevention:**
- Set monthly budget alerts
- Monitor usage daily
- Use cheaper models where possible
- Implement caching aggressively
- Consider rate limiting users

**Response:**
- Pause integration if budget exceeded
- Review usage patterns for abuse
- Optimize prompts to reduce tokens
- Upgrade to volume pricing tiers

## Edge Function Reference

### Google Places

**Function:** `address-autocomplete`
**Method:** POST
**Body:** `{ input: string, country: string }`
**Returns:** `{ predictions: PlacePrediction[] }`

### AI Provider

**Function:** `ai-generate`
**Method:** POST
**Body:** `{ provider: string, model: string, prompt: string }`
**Returns:** `{ response: string, usage: TokenUsage }`

## Related Documentation

- [Admin Portal Guide](./ADMIN_PORTAL_GUIDE.md) - Portal navigation
- [Table Architecture](./TABLE_ARCHITECTURE.md) - Database schema
- [Recent Changes](./RECENT_CHANGES.md) - Latest updates
- [Profile Questions](./ADMIN_PORTAL_GUIDE.md#profile-questions) - Question configuration
