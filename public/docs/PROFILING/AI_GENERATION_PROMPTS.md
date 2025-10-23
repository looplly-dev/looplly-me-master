# AI Prompt Engineering Library

## 🎯 Purpose

This document contains **tested, production-ready prompts** for generating country-specific profile question options using Lovable AI (`google/gemini-2.5-pro`).

**Use Cases**:
- Admins manually triggering generation for new countries
- Developers refining prompts based on approval feedback
- Quality assurance testing AI outputs
- Training new team members on prompt engineering

---

## 🤖 AI Model Selection

### Primary Model: `google/gemini-2.5-pro`

**Why This Model**:
- **Best at Research**: Understands complex research tasks, accesses broad knowledge base
- **Structured Outputs**: Reliably generates valid JSON
- **International Data**: Strong on non-US markets, local currencies, regional brands
- **Context Understanding**: Grasps nuanced differences between similar countries

**Configuration**:
```typescript
{
  model: 'google/gemini-2.5-pro',
  temperature: 0.3, // Lower temperature for factual accuracy
  max_tokens: 2000
}
```

**Why Low Temperature (0.3)**:
- Reduces hallucination
- More consistent outputs
- Favors factual data over creative guesses
- Better for structured data generation

### Fallback Model: `google/gemini-2.5-flash`

**When to Use**:
- Primary model rate-limited
- Lower confidence acceptable (60-70%)
- Drafts only (always require manual review)

---

## 📋 Prompt Templates

### 1. Household Income Ranges

#### Template

```typescript
const SYSTEM_PROMPT = `You are a market research expert specializing in international household income data. Your task is to generate accurate, localized income ranges for countries based on official economic data.

Guidelines:
1. Always use the country's local currency
2. Research current GDP per capita and median household income
3. Create 6-8 income bands covering low, middle, and high earners
4. Format consistently: "Under [amount]", "[range1] - [range2]", "Over [amount]"
5. Cite your data sources (World Bank, national statistics offices, IMF, OECD)
6. Self-assess confidence based on source quality

Confidence Scoring:
- 90-100: Official government or World Bank data from 2023-2024
- 80-89: Reputable international sources (IMF, OECD) from 2022-2024
- 70-79: Industry reports or academic sources from 2021-2024
- 60-69: Regional estimates based on comparable countries
- <60: Insufficient data, return error

Output Format:
Return ONLY valid JSON in this exact structure (no markdown, no extra text):
{
  "options": [
    {"value": "under-50k", "label": "Under 50,000 Br"},
    {"value": "50k-100k", "label": "50,000 - 100,000 Br"}
  ],
  "metadata": {
    "currency": "ETB",
    "currency_symbol": "Br",
    "currency_name": "Ethiopian Birr",
    "format": "thousands",
    "source": "World Bank 2024",
    "research_notes": "Median household income approximately 150,000 Br/year"
  },
  "confidence": 85
}`;

const USER_PROMPT = (countryData) => `
Generate household income ranges for ${countryData.name}.

Country Details:
- Name: ${countryData.name}
- ISO Code: ${countryData.iso}
- Dial Code: ${countryData.code}
- Currency: ${countryData.currency.name} (${countryData.currency.symbol})
- Region: ${countryData.region}

Requirements:
1. Research ${countryData.name}'s current median household income
2. Use ${countryData.currency.name} (${countryData.currency.symbol}) for all ranges
3. Create 6-8 income bands appropriate for ${countryData.name}'s economy
4. Ensure ranges cover the full spectrum (low, middle, high income)
5. Format labels clearly: "Under X ${countryData.currency.symbol}", "X - Y ${countryData.currency.symbol}"

Generate the income ranges now as valid JSON only.
`;
```

#### Example Output (Ethiopia)

```json
{
  "options": [
    {"value": "under-50k", "label": "Under 50,000 Br"},
    {"value": "50k-100k", "label": "50,000 - 100,000 Br"},
    {"value": "100k-200k", "label": "100,000 - 200,000 Br"},
    {"value": "200k-500k", "label": "200,000 - 500,000 Br"},
    {"value": "500k-1m", "label": "500,000 - 1,000,000 Br"},
    {"value": "1m-plus", "label": "Over 1,000,000 Br"}
  ],
  "metadata": {
    "currency": "ETB",
    "currency_symbol": "Br",
    "currency_name": "Ethiopian Birr",
    "format": "thousands",
    "source": "World Bank 2024, Ethiopia Central Statistical Agency",
    "research_notes": "Median household income approximately 145,000 Br/year. GDP per capita: 28,000 Br (2023). Distribution skewed toward lower income bands."
  },
  "confidence": 87
}
```

#### Validation Rules

```typescript
function validateIncomeRanges(output) {
  // 1. Structure validation
  if (!output.options || !Array.isArray(output.options)) {
    throw new Error('Missing or invalid options array');
  }
  
  // 2. Minimum options count
  if (output.options.length < 5) {
    throw new Error('Too few income ranges (minimum 5 required)');
  }
  
  // 3. Each option must have value and label
  for (const option of output.options) {
    if (!option.value || !option.label) {
      throw new Error('Option missing value or label');
    }
  }
  
  // 4. Metadata validation
  if (!output.metadata?.currency || !output.metadata?.currency_symbol) {
    throw new Error('Missing currency metadata');
  }
  
  // 5. Confidence score validation
  if (typeof output.confidence !== 'number' || output.confidence < 0 || output.confidence > 100) {
    throw new Error('Invalid confidence score');
  }
  
  // 6. Currency symbol consistency
  const currencyInLabels = output.options.every(opt => 
    opt.label.includes(output.metadata.currency_symbol)
  );
  if (!currencyInLabels) {
    throw new Error('Currency symbol not consistently used in labels');
  }
  
  return true;
}
```

---

### 2. Local Beverage Brands

#### Template

```typescript
const SYSTEM_PROMPT = `You are a consumer goods analyst specializing in beverage markets across different countries. Your task is to generate accurate lists of beverage brands actually sold in specific countries.

Guidelines:
1. Include ONLY brands actually sold in the target country
2. Mix of local and international brands
3. Cover categories: Soft drinks, Juices, Water, Energy drinks
4. List 10-15 top brands by market share
5. Do NOT include brands from neighboring countries unless also sold in target country
6. Prioritize brands with >3% market share
7. Verify spelling of brand names

Confidence Scoring:
- 90-100: Nielsen, Euromonitor, or official company reports (2023-2024)
- 80-89: Industry publications, market research firms (2022-2024)
- 70-79: Regional reports, trade publications (2021-2024)
- 60-69: Mixed sources, some estimation
- <60: Insufficient data, return error

Output Format:
Return ONLY valid JSON:
{
  "options": [
    {"value": "coca-cola", "label": "Coca-Cola"},
    {"value": "local-brand", "label": "Local Brand Name"}
  ],
  "metadata": {
    "categories": ["soft_drinks", "juices", "water", "energy_drinks"],
    "source": "Nielsen Market Research 2024",
    "coverage": "Top 15 by volume",
    "local_brands_count": 5,
    "international_brands_count": 10
  },
  "confidence": 82
}`;

const USER_PROMPT = (countryData) => `
Generate a list of popular beverage brands sold in ${countryData.name}.

Country Details:
- Name: ${countryData.name}
- ISO Code: ${countryData.iso}
- Region: ${countryData.region}

Requirements:
1. Research brands ACTUALLY SOLD in ${countryData.name} (not neighboring countries)
2. Include both local ${countryData.name} brands and international brands
3. List 12-15 brands across categories: soft drinks, juices, water, energy drinks
4. Prioritize brands with significant market share (>3%)
5. Verify brand names are spelled correctly

Generate the brand list now as valid JSON only.
`;
```

#### Example Output (Nigeria)

```json
{
  "options": [
    {"value": "coca-cola", "label": "Coca-Cola"},
    {"value": "pepsi", "label": "Pepsi"},
    {"value": "bigi", "label": "Bigi Cola"},
    {"value": "lacasera", "label": "La Casera"},
    {"value": "fearless", "label": "Fearless Energy Drink"},
    {"value": "chivita", "label": "Chivita"},
    {"value": "chi", "label": "Chi Limited"},
    {"value": "ribena", "label": "Ribena"},
    {"value": "hollandia", "label": "Hollandia Yoghurt"},
    {"value": "eva-water", "label": "EVA Water"},
    {"value": "nestle-water", "label": "Nestlé Pure Life"},
    {"value": "5-alive", "label": "5 Alive"},
    {"value": "fanta", "label": "Fanta"},
    {"value": "sprite", "label": "Sprite"},
    {"value": "lucozade", "label": "Lucozade"}
  ],
  "metadata": {
    "categories": ["soft_drinks", "juices", "water", "energy_drinks"],
    "source": "Nielsen Nigeria 2024, Euromonitor International",
    "coverage": "Top 15 by market volume",
    "local_brands_count": 6,
    "international_brands_count": 9,
    "research_notes": "Nigerian beverage market is mix of strong local brands (Bigi, La Casera, Chi) and international players. Soft drinks dominate market share."
  },
  "confidence": 88
}
```

---

### 3. Automotive Preferences

#### Template

```typescript
const SYSTEM_PROMPT = `You are an automotive industry analyst. Your task is to generate relevant vehicle ownership questions for specific countries, accounting for local market characteristics.

Guidelines:
1. List popular vehicle types (sedans, SUVs, trucks, motorcycles, rickshaws, etc.)
2. Include top 10-15 vehicle makes/brands sold in that country
3. Adapt to local market (e.g., more motorcycles in India, trucks in USA, bakkies in South Africa)
4. Consider used vs. new car preferences
5. Include local vehicle types if relevant (tuk-tuks, keke, jeepneys)

Confidence Scoring:
- 90-100: Official vehicle registration data, automotive industry reports (2023-2024)
- 80-89: Market research firms, trade publications (2022-2024)
- 70-79: Regional estimates, dealer reports (2021-2024)
- 60-69: Mixed sources, comparative analysis
- <60: Insufficient data, return error

Output Format:
Return ONLY valid JSON:
{
  "options": [
    {"value": "toyota", "label": "Toyota"},
    {"value": "bajaj", "label": "Bajaj (Motorcycles)"}
  ],
  "metadata": {
    "market_type": "motorcycle_dominant",
    "popular_categories": ["motorcycles", "sedans", "suvs"],
    "source": "AutoTrader 2024",
    "notes": "Motorcycle ownership very high due to traffic and affordability"
  },
  "confidence": 79
}`;

const USER_PROMPT = (countryData) => `
Generate vehicle ownership preferences for ${countryData.name}.

Country Details:
- Name: ${countryData.name}
- ISO Code: ${countryData.iso}
- Region: ${countryData.region}

Requirements:
1. Research popular vehicle types in ${countryData.name}
2. List top 10-15 vehicle makes/brands sold locally
3. Consider local vehicle types (rickshaws, tuk-tuks, bakkies, etc.)
4. Account for economic factors (used vs. new cars, affordability)
5. Reflect actual market share

Generate the automotive preferences now as valid JSON only.
`;
```

#### Example Output (India)

```json
{
  "options": [
    {"value": "maruti-suzuki", "label": "Maruti Suzuki"},
    {"value": "hyundai", "label": "Hyundai"},
    {"value": "tata", "label": "Tata Motors"},
    {"value": "mahindra", "label": "Mahindra"},
    {"value": "kia", "label": "Kia"},
    {"value": "honda", "label": "Honda"},
    {"value": "toyota", "label": "Toyota"},
    {"value": "hero-motocorp", "label": "Hero MotoCorp (Motorcycles)"},
    {"value": "bajaj", "label": "Bajaj (Motorcycles)"},
    {"value": "tvs", "label": "TVS (Motorcycles)"},
    {"value": "royal-enfield", "label": "Royal Enfield (Motorcycles)"},
    {"value": "auto-rickshaw", "label": "Auto-Rickshaw (Three-wheeler)"}
  ],
  "metadata": {
    "market_type": "mixed_two_four_wheelers",
    "popular_categories": ["motorcycles", "compact_cars", "suvs", "three_wheelers"],
    "source": "Society of Indian Automobile Manufacturers (SIAM) 2024",
    "notes": "Two-wheeler market dominates (80% of vehicle sales). Maruti Suzuki leads four-wheeler segment. Auto-rickshaws widely used for transportation.",
    "motorcycle_brands_count": 4,
    "car_brands_count": 7,
    "other_vehicles_count": 1
  },
  "confidence": 91
}
```

---

## 🧠 Prompt Anatomy

Every effective prompt has these components:

### 1. Role Assignment
```
"You are a [expert type] specializing in [domain]."
```
**Purpose**: Primes AI to adopt specific knowledge and perspective.

### 2. Task Definition
```
"Your task is to generate [specific output] based on [criteria]."
```
**Purpose**: Clarifies exactly what AI should produce.

### 3. Guidelines
```
1. Specific rule 1
2. Specific rule 2
3. Edge case handling
```
**Purpose**: Constraints prevent hallucination and ensure consistency.

### 4. Output Format
```
Return ONLY valid JSON in this exact structure: {...}
```
**Purpose**: Ensures parsable, structured outputs.

### 5. Confidence Scoring Rubric
```
- 90-100: [criteria]
- 80-89: [criteria]
```
**Purpose**: AI self-assesses quality, enables auto-approval thresholds.

### 6. User Context
```
Country: ${countryData.name}
Currency: ${countryData.currency.name}
```
**Purpose**: Provides specific details for AI to research.

---

## 📊 Confidence Scoring Deep Dive

### How AI Determines Confidence

```typescript
// AI's internal decision process (conceptual):

if (dataSource === 'World Bank' && dataYear >= 2023) {
  confidence = 95;
} else if (dataSource === 'IMF' && dataYear >= 2022) {
  confidence = 85;
} else if (dataSource === 'Industry Report' && dataYear >= 2021) {
  confidence = 75;
} else if (dataSource === 'Regional Estimate') {
  confidence = 65;
} else {
  confidence = 50; // Insufficient data
}

// Adjust for data completeness
if (missingFields > 0) confidence -= 10;
if (estimatedValues > 2) confidence -= 15;
```

### Confidence Distribution (Target)

| Range | % of Generations | Action |
|-------|------------------|--------|
| 90-100 | 30% | Auto-approve (if enabled) |
| 80-89 | 40% | Manual review recommended |
| 70-79 | 20% | Require manual approval |
| 60-69 | 8% | Require manual approval + research |
| <60 | 2% | Auto-reject |

### Example Breakdown

**Ethiopia Income Ranges - Confidence: 87%**

**Data Sources Found by AI**:
- ✅ World Bank GDP per capita (2024): +40 points
- ✅ Ethiopia Central Statistical Agency (2023): +35 points
- ⚠️ Median income estimated from regional data: -5 points
- ✅ All required fields populated: +15 points
- ⚠️ Currency conversion used (USD → Birr): -3 points

**Total**: 87% confidence

**Interpretation**: High-quality data from official sources, minor estimation required. **Recommend manual review but likely approve**.

---

## 🔄 Iteration Guidelines

### When to Regenerate

Regenerate if:
- ✅ Confidence < 75%
- ✅ Admin rejects with specific feedback
- ✅ Output fails JSON validation
- ✅ Brands/options clearly incorrect
- ✅ Currency wrong despite correct input

### How to Refine Prompts

#### Problem: AI Uses Wrong Currency

**Original Prompt**:
```
Generate income ranges for Ethiopia.
```

**Refined Prompt**:
```
Generate income ranges for Ethiopia.

CRITICAL: Use Ethiopian Birr (Br) for all amounts.
Do NOT use USD ($), EUR (€), or any other currency.

Examples of correct format:
✓ "Under 50,000 Br"
✓ "50,000 - 100,000 Br"
✗ "Under $50,000" (WRONG)
```

**Why It Works**: Explicit examples + negative examples prevent confusion.

---

#### Problem: AI Generates Too Many Options

**Original Prompt**:
```
List beverage brands sold in Nigeria.
```

**Refined Prompt**:
```
List the top 12-15 beverage brands sold in Nigeria.

Requirements:
- Limit to 12-15 brands maximum
- Prioritize brands with >3% market share
- Include mix of local (6-8) and international (6-7) brands
```

**Why It Works**: Specific constraints (number, market share) focus AI.

---

#### Problem: AI Confuses Countries

**Original Prompt**:
```
Generate income ranges for Kenya.
```

**Refined Prompt**:
```
Generate income ranges for Kenya (East Africa).

IMPORTANT: Research Kenya-specific data. Do NOT use:
- South African data (different economy)
- Nigerian data (different region)
- Ethiopian data (neighboring but different GDP)

Required sources: Kenya National Bureau of Statistics, World Bank Kenya data.
```

**Why It Works**: Explicitly excludes common confusion points.

---

## 🧪 Testing Prompts

### Stage 1: Known Country Validation

Test prompts against countries we already have manual data for:

```typescript
async function testPromptAccuracy() {
  const knownCountries = [
    { code: '+27', iso: 'ZA', name: 'South Africa' },
    { code: '+254', iso: 'KE', name: 'Kenya' },
    { code: '+234', iso: 'NG', name: 'Nigeria' }
  ];
  
  for (const country of knownCountries) {
    // Generate with AI
    const aiResult = await generateCountryOptions({
      country_code: country.code,
      question_keys: ['household_income']
    });
    
    // Fetch manual data
    const manualData = await supabase
      .from('country_question_options')
      .select('options')
      .eq('country_code', country.code)
      .single();
    
    // Calculate alignment
    const alignment = compareOptions(
      aiResult.draft_options,
      manualData.options
    );
    
    console.log(`${country.name}: ${alignment}% alignment`);
    
    // Target: >75% alignment
    expect(alignment).toBeGreaterThan(75);
  }
}

function compareOptions(aiOptions, manualOptions) {
  // Compare option counts
  const countDiff = Math.abs(aiOptions.length - manualOptions.length);
  let score = 100 - (countDiff * 5);
  
  // Compare labels (fuzzy match)
  const manualLabels = manualOptions.map(o => o.label.toLowerCase());
  const aiLabels = aiOptions.map(o => o.label.toLowerCase());
  
  const matches = aiLabels.filter(label => 
    manualLabels.some(manual => 
      manual.includes(label) || label.includes(manual)
    )
  ).length;
  
  const labelScore = (matches / manualOptions.length) * 100;
  
  return (score + labelScore) / 2;
}
```

**Target Results**:
- South Africa: >85% alignment
- Kenya: >80% alignment
- Nigeria: >75% alignment

---

### Stage 2: A/B Testing

Compare AI-generated vs. manually created options with real users:

```typescript
// Split test: 50% see AI-generated, 50% see manual
async function abTestOptions(country_code) {
  const users = await getUsersFromCountry(country_code);
  
  // Split into groups
  const groupA = users.slice(0, users.length / 2); // AI-generated
  const groupB = users.slice(users.length / 2);    // Manual
  
  // Track metrics
  const metrics = {
    groupA: { completionRate: 0, avgTime: 0, skipRate: 0 },
    groupB: { completionRate: 0, avgTime: 0, skipRate: 0 }
  };
  
  // Analyze after 1 week
  // If groupA.completionRate >= groupB.completionRate * 0.95:
  //   AI options are acceptable
}
```

**Success Criteria**:
- Completion rate within 5% of manual options
- Skip rate < 10% higher than manual
- Average time to answer within 15% of manual

---

## 📈 Prompt Performance Metrics

Track these metrics in `/admin/analytics`:

### 1. Average Confidence Score
**Target**: >80%

```sql
SELECT AVG(confidence_score) as avg_confidence
FROM country_profiling_gaps
WHERE generated_at >= NOW() - INTERVAL '30 days';
```

**Actions**:
- <70%: Investigate prompt quality, refine guidelines
- 70-80%: Review recent low-confidence generations for patterns
- >80%: Maintain current prompts

---

### 2. Approval Rate
**Target**: >70% approved without edits

```sql
SELECT 
  COUNT(CASE WHEN status = 'approved' THEN 1 END) * 100.0 / COUNT(*) as approval_rate,
  COUNT(CASE WHEN admin_feedback IS NULL AND status = 'approved' THEN 1 END) * 100.0 / COUNT(*) as no_edit_rate
FROM country_profiling_gaps
WHERE reviewed_at >= NOW() - INTERVAL '30 days';
```

**Actions**:
- <50%: Major prompt refinement needed
- 50-70%: Review rejection reasons, iterate prompts
- >70%: Prompts working well

---

### 3. Regeneration Rate
**Target**: <20%

```sql
SELECT COUNT(*) * 100.0 / (SELECT COUNT(*) FROM country_profiling_gaps WHERE generated_at >= NOW() - INTERVAL '30 days') as regen_rate
FROM country_profiling_gaps
WHERE status = 'rejected' AND generated_at >= NOW() - INTERVAL '30 days';
```

**Actions**:
- >30%: Prompts need significant improvement
- 20-30%: Analyze rejection feedback, refine
- <20%: Acceptable range

---

### 4. Common Rejection Reasons

```sql
SELECT admin_feedback, COUNT(*) as count
FROM country_profiling_gaps
WHERE status = 'rejected' AND reviewed_at >= NOW() - INTERVAL '30 days'
GROUP BY admin_feedback
ORDER BY count DESC
LIMIT 10;
```

**Example Results**:
```
"Wrong currency used" → 12 occurrences → Refine currency prompt
"Brands not sold in country" → 8 occurrences → Add negative examples
"Income ranges too high" → 5 occurrences → Add GDP per capita constraint
```

---

## 🔗 Related Documentation

- [Auto-Scaling System Architecture](./AUTO_SCALING_SYSTEM.md)
- [Admin Auto-Generation Guide](./ADMIN_AUTO_GENERATION_GUIDE.md)
- [Country Question Management](./COUNTRY_QUESTION_MANAGEMENT.md)

---

## 📞 Contributing Prompt Improvements

### Process

1. **Identify Issue**: Track rejection reasons or low confidence scores
2. **Propose Refinement**: Document changes to prompt template
3. **Test in Staging**: Validate with 3-5 countries
4. **Measure Impact**: Compare before/after approval rates
5. **Update Documentation**: Merge changes into this file

### Example Contribution

**Issue**: AI generates income ranges in wrong increments (e.g., 51,234 - 98,765 instead of 50,000 - 100,000)

**Proposed Fix**:
```diff
+ 4. Use round numbers for income ranges:
+    ✓ Correct: "50,000 - 100,000"
+    ✗ Wrong: "51,234 - 98,765"
```

**Test Results**:
- Before: 65% approval rate
- After: 82% approval rate (+17%)

**Merged**: 2024-10-20

---

**Questions?** Contact dev team or check [AUTO_SCALING_SYSTEM.md](./AUTO_SCALING_SYSTEM.md) for technical architecture details.
