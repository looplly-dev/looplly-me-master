# Country Code Specification

## Overview
The system uses a **dual-column approach** for country identification:
- **`country_code`**: Phone dial code (e.g., `+27`) - **Source of Truth**
- **`country_iso`**: ISO 3166-1 alpha-2 code (e.g., `ZA`) - **Auto-Derived**

## Why Both?

### `country_code` (Dial Code) - Primary
- **Purpose**: User identification via mobile number
- **Format**: Dial code with `+` prefix
- **Source**: Selected during registration
- **Immutable**: Never changes after account creation
- **Use Cases**: 
  - Mobile number formatting
  - SMS delivery routing
  - User authentication

### `country_iso` (ISO Code) - Derived
- **Purpose**: Data segmentation, queries, integrations
- **Format**: 2-letter ISO code (e.g., `ZA`, `NG`, `KE`)
- **Source**: Auto-derived from `country_code` via database trigger
- **Immutable**: Changes only if `country_code` changes (rare)
- **Use Cases**:
  - Profile question filtering (`country_codes` array)
  - Analytics and reporting
  - External API integrations (Google Places, payment providers)
  - Data isolation queries

## Data Flow
```
User Registration
      ↓
Selects Country (dial code stored)
      ↓
country_code = '+27'
      ↓
[Database Trigger Fires]
      ↓
country_iso = 'ZA' (auto-derived)
```

## Mapping Table
| Dial Code (`country_code`) | ISO Code (`country_iso`) | Country Name    |
|----------------------------|--------------------------|-----------------|
| `+27`                      | `ZA`                     | South Africa    |
| `+234`                     | `NG`                     | Nigeria         |
| `+254`                     | `KE`                     | Kenya           |
| `+44`                      | `GB`                     | United Kingdom  |
| `+91`                      | `IN`                     | India           |

## Query Patterns

### ✅ Correct Usage

**Profile question filtering** (use ISO):
```sql
SELECT * FROM profile_questions
WHERE applicability = 'global' 
   OR 'ZA' = ANY(country_codes);
```

**User country queries** (use either):
```sql
-- By dial code (source of truth)
SELECT * FROM profiles WHERE country_code = '+27';

-- By ISO code (derived, more readable)
SELECT * FROM profiles WHERE country_iso = 'ZA';
```

**Data isolation** (use ISO):
```sql
SELECT p.*, pa.* 
FROM profiles p
JOIN profile_answers pa ON pa.user_id = p.user_id
WHERE p.country_iso = 'NG';
```

### ❌ Incorrect Usage

```sql
-- DON'T: Mix formats
WHERE country_code = 'ZA'  -- Wrong! Should be '+27'

-- DON'T: Use dial code for array checks
WHERE '+27' = ANY(country_codes)  -- Wrong! Array contains ISO codes
```

## Code References

### Frontend
- **Master list**: `src/data/countries.ts` (defines mapping)
- **Utilities**: `src/utils/countries.ts`
  - `getCountryByDialCode('+27')` → `{ code: 'ZA', ... }`
  - `getCountryByCode('ZA')` → `{ dialCode: '+27', ... }`
  - `getISOFromDialCode('+27')` → `'ZA'`
  - `getDialCodeFromISO('ZA')` → `'+27'`

### Database
- **Mapping function**: `public.get_country_iso_from_dial_code(text)`
- **Sync trigger**: `sync_country_iso_trigger` on `profiles`
- **Indexes**: 
  - `idx_profiles_country_iso`
  - `idx_profiles_country_tenant`

## Adding New Countries

### 1. Update Frontend Code
**File**: `src/data/countries.ts`
```typescript
{ code: 'GH', name: 'Ghana', flag: '🇬🇭', dialCode: '+233' }
```

### 2. Update Database Function
```sql
CREATE OR REPLACE FUNCTION public.get_country_iso_from_dial_code(p_dial_code text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE p_dial_code
    WHEN '+27'  THEN 'ZA'
    WHEN '+234' THEN 'NG'
    WHEN '+254' THEN 'KE'
    WHEN '+44'  THEN 'GB'
    WHEN '+91'  THEN 'IN'
    WHEN '+233' THEN 'GH'  -- New country
    ELSE NULL
  END;
$$;
```

### 3. Update Check Constraint
```sql
ALTER TABLE profiles DROP CONSTRAINT valid_country_iso;
ALTER TABLE profiles ADD CONSTRAINT valid_country_iso 
CHECK (country_iso IN ('ZA', 'NG', 'KE', 'GB', 'IN', 'GH'));
```

### 4. Backfill Existing Users (if needed)
```sql
UPDATE profiles
SET country_iso = public.get_country_iso_from_dial_code(country_code)
WHERE country_code = '+233' AND country_iso IS NULL;
```

## Data Integrity Guarantees

✅ **Automatic Sync**: Trigger ensures `country_iso` always matches `country_code`  
✅ **Immutable**: Both columns set once at registration, rarely change  
✅ **Validated**: Check constraint prevents invalid ISO codes  
✅ **Indexed**: Fast queries on both columns  
✅ **Source of Truth**: `country_code` is always authoritative  
✅ **No Manual Entry**: ISO code is never manually set by code or users

## Verification Queries

### Check data integrity
```sql
SELECT 
  country_code,
  country_iso,
  COUNT(*) as user_count,
  CASE 
    WHEN country_code = '+27' AND country_iso = 'ZA' THEN 'OK'
    WHEN country_code = '+234' AND country_iso = 'NG' THEN 'OK'
    WHEN country_code = '+254' AND country_iso = 'KE' THEN 'OK'
    WHEN country_code = '+44' AND country_iso = 'GB' THEN 'OK'
    WHEN country_code = '+91' AND country_iso = 'IN' THEN 'OK'
    ELSE '⚠️ MISMATCH'
  END as status
FROM profiles
GROUP BY country_code, country_iso
ORDER BY user_count DESC;
```

### Test trigger functionality
```sql
-- Insert test user with dial code
INSERT INTO profiles (user_id, country_code, email)
VALUES (
  gen_random_uuid(),
  '+234',
  'test@example.com'
)
RETURNING user_id, country_code, country_iso;
-- Should return: country_code='+234', country_iso='NG'
```

## Troubleshooting

### Problem: `country_iso` is NULL
**Cause**: Unknown dial code not in mapping function  
**Solution**: Add the new country to `get_country_iso_from_dial_code()`

### Problem: Check constraint violation
**Cause**: ISO code not in allowed list  
**Solution**: Update `valid_country_iso` constraint to include new ISO code

### Problem: Mismatched codes
**Cause**: Manual UPDATE bypassing trigger  
**Solution**: Run backfill query to re-sync:
```sql
UPDATE profiles
SET country_iso = public.get_country_iso_from_dial_code(country_code)
WHERE country_code IS NOT NULL;
```
