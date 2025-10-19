# Global vs Local Brands Strategy

## Problem Statement

Some profile questions (e.g., "Which beverage brands do you consume?", "Which banks do you use?") have **both global and country-specific options**:

- **Global Brands**: Coca-Cola, Pepsi, BMW, Apple (available worldwide)
- **Local Brands**: Bigi Cola (Nigeria), Stoney Tangawizi (Kenya), Thums Up (India), Jollof Rice (West Africa only)

**Challenges**:
1. How to show users only relevant options (global + their country's local brands)?
2. How to safely compare global brand penetration across countries?
3. How to prevent Nigerian users from seeing Kenyan local brands (data isolation)?
4. How to enable admins to add new countries/brands without breaking existing data?

---

## Solution: `is_global` Flag System

### Core Principle:
- **Global brands** have `is_global = true` and are visible to ALL users regardless of country
- **Local brands** have `is_global = false` and are filtered by `country_code`

### Database Schema:

#### `country_question_options` Table (Already Exists):
```sql
CREATE TABLE country_question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES profile_questions(id),
  country_code TEXT NOT NULL, -- 'NG', 'ZA', 'KE', 'IN', or '*' for global
  options JSONB NOT NULL, -- Array of option objects
  is_global BOOLEAN DEFAULT false, -- NEW FIELD
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast filtering
CREATE INDEX idx_country_options_question_country 
ON country_question_options(question_id, country_code);

CREATE INDEX idx_country_options_global 
ON country_question_options(question_id, is_global);
```

#### Option Object Structure (JSONB):
```json
{
  "value": "coca_cola",
  "label": "Coca-Cola",
  "category": "soft_drinks",
  "is_global": true
}
```

---

## Example: Beverage Brands Question

### Nigeria (NG):
**Global brands** (visible to everyone):
- Coca-Cola
- Pepsi
- Sprite
- Fanta

**Local brands** (Nigeria only):
- Bigi Cola
- Chivita
- Ragolis
- Fearless Energy Drink

### Kenya (KE):
**Global brands** (same as above):
- Coca-Cola
- Pepsi
- Sprite
- Fanta

**Local brands** (Kenya only):
- Stoney Tangawizi
- Tusker (beer)
- Krest
- Delmonte Juice

### India (IN):
**Global brands** (same as above):
- Coca-Cola
- Pepsi
- Sprite
- Fanta

**Local brands** (India only):
- Thums Up
- Frooti
- Maaza
- Limca

---

## SQL Patterns

### 1. Get Options for User's Country:
```sql
-- User from Nigeria sees global brands + Nigerian local brands
SELECT 
  cqo.options
FROM country_question_options cqo
JOIN profiles p ON p.country_code = cqo.country_code OR cqo.is_global = true
WHERE cqo.question_id = ? -- 'beverage_brands' question
  AND p.user_id = ?
ORDER BY cqo.is_global DESC; -- Global brands first
```

**Result for Nigerian User**:
```json
[
  {"value": "coca_cola", "label": "Coca-Cola", "is_global": true},
  {"value": "pepsi", "label": "Pepsi", "is_global": true},
  {"value": "sprite", "label": "Sprite", "is_global": true},
  {"value": "fanta", "label": "Fanta", "is_global": true},
  {"value": "bigi_cola", "label": "Bigi Cola", "is_global": false},
  {"value": "chivita", "label": "Chivita", "is_global": false},
  {"value": "ragolis", "label": "Ragolis", "is_global": false}
]
```

### 2. Cross-Country Analysis (Global Brands Only):
```sql
-- Compare Coca-Cola penetration in Nigeria vs South Africa vs Kenya
SELECT 
  p.country_code,
  COUNT(DISTINCT pa.user_id) AS users_drinking_coke
FROM profile_answers pa
JOIN profiles p ON p.user_id = pa.user_id
WHERE pa.question_id = ? -- 'beverage_brands' question
  AND pa.answer_normalized = 'coca_cola' -- Global brand
  AND p.country_code IN ('NG', 'ZA', 'KE')
GROUP BY p.country_code;
```

**Output**:
```
country_code | users_drinking_coke
-------------|--------------------
NG           | 1,234
ZA           | 891
KE           | 567
```

### 3. Local Brand Isolation (Safety Check):
```sql
-- Verify no Nigerian users have Kenyan local brands in their answers
SELECT 
  p.user_id,
  p.country_code,
  pa.answer_normalized AS suspicious_answer
FROM profile_answers pa
JOIN profiles p ON p.user_id = pa.user_id
WHERE pa.question_id = ? -- 'beverage_brands' question
  AND p.country_code = 'NG' -- Nigerian users
  AND pa.answer_normalized IN ('stoney_tangawizi', 'tusker', 'krest') -- Kenyan brands
LIMIT 10;

-- Should return 0 rows (if isolation is working correctly)
```

---

## UI Rendering

### Frontend (React/TypeScript):

#### 1. Fetch Options for User:
```typescript
const fetchBeverageBrands = async (userId: string) => {
  const { data, error } = await supabase
    .from('country_question_options')
    .select('options, is_global')
    .eq('question_id', 'beverage_brands_question_id')
    .or(`country_code.eq.${userCountry},is_global.eq.true`)
    .order('is_global', { ascending: false }); // Global brands first

  if (error) throw error;

  // Flatten options array
  const allOptions = data.flatMap(row => row.options);
  
  // Group by global vs local
  return {
    global: allOptions.filter(opt => opt.is_global),
    local: allOptions.filter(opt => !opt.is_global)
  };
};
```

#### 2. Render with Visual Separation:
```tsx
<Select>
  <SelectGroup label="Global Brands">
    {globalBrands.map(brand => (
      <SelectItem key={brand.value} value={brand.value}>
        🌍 {brand.label}
      </SelectItem>
    ))}
  </SelectGroup>
  
  <SelectSeparator />
  
  <SelectGroup label="Local Brands (Nigeria)">
    {localBrands.map(brand => (
      <SelectItem key={brand.value} value={brand.value}>
        🇳🇬 {brand.label}
      </SelectItem>
    ))}
  </SelectGroup>
</Select>
```

**Visual Output**:
```
┌─────────────────────────────────┐
│ Beverage Brands                 │
├─────────────────────────────────┤
│ Global Brands                   │
│   🌍 Coca-Cola                  │
│   🌍 Pepsi                      │
│   🌍 Sprite                     │
│   🌍 Fanta                      │
├─────────────────────────────────┤
│ Local Brands (Nigeria)          │
│   🇳🇬 Bigi Cola                 │
│   🇳🇬 Chivita                   │
│   🇳🇬 Ragolis                   │
└─────────────────────────────────┘
```

---

## Admin Interface: Adding New Countries

### Workflow (Warren's Perspective):

#### Step 1: Navigate to Admin Panel
- Go to `/admin/profile-questions`
- Select question: "Beverage Brands"
- Click "Add Country" button

#### Step 2: Select Country
- Dropdown shows: [Nigeria ✓] [South Africa ✓] [Kenya ✓] [India (New)]
- Select "India"
- System auto-detects:
  - Currency: INR (₹)
  - Dial code: +91
  - Timezone: Asia/Kolkata

#### Step 3: Add Local Brands
```
Global Brands (Already Configured):
✓ Coca-Cola
✓ Pepsi
✓ Sprite
✓ Fanta

Local Brands (India):
+ Add Brand
  ├─ Value: thums_up
  ├─ Label: Thums Up
  └─ Category: soft_drinks

+ Add Brand
  ├─ Value: frooti
  ├─ Label: Frooti
  └─ Category: juices

+ Add Brand
  ├─ Value: maaza
  ├─ Label: Maaza
  └─ Category: juices

[Save India Brands]
```

#### Step 4: Test with Fake User
- Click "Test with User"
- System creates fake Indian user
- Preview question UI
- Verify Indian user sees:
  - 4 global brands (Coca-Cola, Pepsi, Sprite, Fanta)
  - 3 local brands (Thums Up, Frooti, Maaza)
  - **Does NOT see** Nigerian brands (Bigi Cola) or Kenyan brands (Stoney)

#### Step 5: Launch
- Click "Publish to Production"
- All Indian users now see India-specific options

---

## Migration Example: Adding India

### SQL Migration:
```sql
-- Step 1: Verify global brands are already configured
SELECT * FROM country_question_options
WHERE question_id = (SELECT id FROM profile_questions WHERE question_key = 'beverage_brands')
  AND is_global = true;

-- Expected: 4 rows (Coca-Cola, Pepsi, Sprite, Fanta)

-- Step 2: Add Indian local brands
INSERT INTO country_question_options (question_id, country_code, options, is_global, metadata)
VALUES (
  (SELECT id FROM profile_questions WHERE question_key = 'beverage_brands'),
  'IN', -- India
  '[
    {"value": "thums_up", "label": "Thums Up", "category": "soft_drinks", "is_global": false},
    {"value": "frooti", "label": "Frooti", "category": "juices", "is_global": false},
    {"value": "maaza", "label": "Maaza", "category": "juices", "is_global": false},
    {"value": "limca", "label": "Limca", "category": "soft_drinks", "is_global": false}
  ]'::jsonb,
  false, -- Local brands
  '{"region": "South Asia", "added_by": "admin_warren", "added_date": "2025-10-19"}'::jsonb
);

-- Step 3: Verify isolation (Indian users should NOT see Nigerian brands)
-- This query should return 0 rows
SELECT 
  p.user_id,
  p.country_code,
  pa.answer_normalized
FROM profile_answers pa
JOIN profiles p ON p.user_id = pa.user_id
WHERE pa.question_id = (SELECT id FROM profile_questions WHERE question_key = 'beverage_brands')
  AND p.country_code = 'IN' -- Indian users
  AND pa.answer_normalized IN ('bigi_cola', 'chivita', 'ragolis') -- Nigerian brands
LIMIT 10;

-- Step 4: Test query for Indian user
SELECT 
  cqo.options
FROM country_question_options cqo
WHERE cqo.question_id = (SELECT id FROM profile_questions WHERE question_key = 'beverage_brands')
  AND (cqo.country_code = 'IN' OR cqo.is_global = true)
ORDER BY cqo.is_global DESC;

-- Expected: Global brands + Indian local brands (no NG, ZA, KE brands)
```

---

## Data Quality Checks

### 1. Check for Orphaned Local Brands (User Answers with Deleted Brands):
```sql
-- Find answers that reference brands no longer in country_question_options
SELECT 
  pa.user_id,
  pa.answer_normalized AS orphaned_brand,
  p.country_code
FROM profile_answers pa
JOIN profiles p ON p.user_id = pa.user_id
WHERE pa.question_id = (SELECT id FROM profile_questions WHERE question_key = 'beverage_brands')
  AND NOT EXISTS (
    SELECT 1 FROM country_question_options cqo
    CROSS JOIN jsonb_array_elements(cqo.options) AS opt
    WHERE cqo.question_id = pa.question_id
      AND (cqo.country_code = p.country_code OR cqo.is_global = true)
      AND opt->>'value' = pa.answer_normalized
  );

-- Action: Mark these answers as stale or remove them
```

### 2. Check for Cross-Country Leaks (Critical Bug):
```sql
-- Find users who have local brands from other countries
SELECT 
  p.user_id,
  p.country_code AS user_country,
  pa.answer_normalized AS suspicious_brand,
  cqo.country_code AS brand_country
FROM profile_answers pa
JOIN profiles p ON p.user_id = pa.user_id
JOIN country_question_options cqo ON cqo.question_id = pa.question_id
CROSS JOIN jsonb_array_elements(cqo.options) AS opt
WHERE pa.question_id = (SELECT id FROM profile_questions WHERE question_key = 'beverage_brands')
  AND opt->>'value' = pa.answer_normalized
  AND cqo.is_global = false -- Local brand
  AND cqo.country_code != p.country_code -- Brand country doesn't match user country
LIMIT 10;

-- Should return 0 rows (if isolation is working correctly)
-- If any rows found: CRITICAL BUG - contact dev immediately
```

### 3. Verify Global Brand Consistency:
```sql
-- Ensure global brands are marked as global across all countries
SELECT 
  cqo.country_code,
  opt->>'value' AS brand_value,
  opt->>'label' AS brand_label,
  cqo.is_global
FROM country_question_options cqo
CROSS JOIN jsonb_array_elements(cqo.options) AS opt
WHERE cqo.question_id = (SELECT id FROM profile_questions WHERE question_key = 'beverage_brands')
  AND opt->>'value' IN ('coca_cola', 'pepsi', 'sprite', 'fanta')
ORDER BY brand_value, country_code;

-- Expected: All 4 brands should have is_global = true for all countries
```

---

## Performance Optimization

### 1. Indexes (Already Applied):
```sql
CREATE INDEX idx_country_options_question_country 
ON country_question_options(question_id, country_code);

CREATE INDEX idx_country_options_global 
ON country_question_options(question_id, is_global);
```

### 2. Caching Strategy (Frontend):
```typescript
// Cache options per user's country to avoid repeated DB queries
const cacheKey = `beverage_brands_${userCountry}`;
const cachedOptions = localStorage.getItem(cacheKey);

if (cachedOptions && isCacheFresh(cachedOptions.timestamp)) {
  return JSON.parse(cachedOptions.data);
} else {
  const freshOptions = await fetchBeverageBrands(userId);
  localStorage.setItem(cacheKey, JSON.stringify({
    data: freshOptions,
    timestamp: Date.now()
  }));
  return freshOptions;
}
```

### 3. Materialized View for Cross-Country Analysis:
```sql
-- Create materialized view for fast global brand reporting
CREATE MATERIALIZED VIEW global_brand_penetration AS
SELECT 
  p.country_code,
  pa.answer_normalized AS brand,
  COUNT(DISTINCT pa.user_id) AS user_count,
  ROUND(COUNT(DISTINCT pa.user_id)::NUMERIC / (
    SELECT COUNT(*) FROM profiles WHERE country_code = p.country_code
  ) * 100, 2) AS penetration_pct
FROM profile_answers pa
JOIN profiles p ON p.user_id = pa.user_id
JOIN country_question_options cqo ON cqo.question_id = pa.question_id
CROSS JOIN jsonb_array_elements(cqo.options) AS opt
WHERE pa.question_id = (SELECT id FROM profile_questions WHERE question_key = 'beverage_brands')
  AND opt->>'value' = pa.answer_normalized
  AND opt->>'is_global' = 'true' -- Global brands only
GROUP BY p.country_code, pa.answer_normalized;

-- Refresh daily
CREATE INDEX idx_global_brand_pen_country ON global_brand_penetration(country_code);
REFRESH MATERIALIZED VIEW global_brand_penetration;
```

---

## Other Questions Using Global/Local Strategy

### 1. **Bank Brands**:
- **Global**: Citibank, HSBC, Standard Chartered
- **Nigeria**: GTBank, First Bank, Zenith Bank, Access Bank
- **South Africa**: FNB, Standard Bank, Absa, Capitec
- **Kenya**: Equity Bank, KCB, Co-operative Bank, Barclays
- **India**: HDFC Bank, ICICI Bank, SBI, Axis Bank

### 2. **Automotive Brands**:
- **Global**: Toyota, Honda, BMW, Mercedes-Benz, Ford
- **Nigeria**: Innoson (local manufacturer)
- **India**: Tata Motors, Mahindra, Maruti Suzuki
- **South Africa**: (mostly global brands, no major local OEMs)

### 3. **Telecommunications Providers**:
- **Global**: Vodafone (operates in multiple African countries)
- **Nigeria**: MTN, Glo, Airtel, 9mobile
- **South Africa**: MTN, Vodacom, Cell C, Telkom
- **Kenya**: Safaricom, Airtel, Telkom Kenya
- **India**: Jio, Airtel, Vodafone Idea, BSNL

### 4. **Food Delivery Apps**:
- **Global**: Uber Eats, Deliveroo
- **Nigeria**: Chowdeck, Glovo, Jumia Food
- **South Africa**: Mr D Food, Uber Eats, Bolt Food
- **Kenya**: Glovo, Uber Eats, Jumia Food
- **India**: Swiggy, Zomato, Dunzo

---

## Admin Training (Warren's Guide)

### Quick Checklist for Adding a New Country:

1. ✅ Navigate to `/admin/profile-questions`
2. ✅ Select question (e.g., "Beverage Brands")
3. ✅ Click "Add Country" → Select country from dropdown
4. ✅ Add local brand options (Value, Label, Category)
5. ✅ Verify global brands are already configured (no need to re-add)
6. ✅ Click "Test with User" → Preview as user from that country
7. ✅ Run isolation check: Verify no cross-country brand leaks
8. ✅ Click "Publish to Production"

### Red Flags:
- 🚨 Cross-country leak detected (Nigerian user has Kenyan brands)
- 🚨 Global brand missing from new country (user doesn't see Coca-Cola)
- 🚨 Local brand appears in wrong country (Kenyan user sees Bigi Cola)

### Troubleshooting:
- **Issue**: "New country's users don't see options"
  - **Solution**: Check `country_question_options` table, verify `country_code = 'IN'` (or relevant code)
- **Issue**: "Global brands not showing for new country"
  - **Solution**: Verify `is_global = true` in database, check frontend query includes `OR is_global.eq.true`
- **Issue**: "Users seeing brands from other countries"
  - **Solution**: CRITICAL BUG - Run isolation check query, contact dev immediately

---

## Related Documentation

- `LEVEL_PROFILING_STRATEGY.md`: Overview of 3-level profiling system
- `COUNTRY_QUESTION_MANAGEMENT.md`: Country-specific data handling
- `DATA_ISOLATION_QUICK_REFERENCE.md`: SQL patterns for country filtering
- `WARREN_ADMIN_GUIDE.md`: Step-by-step admin instructions (plain English)
