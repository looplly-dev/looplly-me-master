# Country Code Specification

## Overview

Looplly uses **ISO 3166-1 alpha-2** country codes throughout the platform for consistency, interoperability, and global expansion readiness.

## Standard Format

### ISO 3166-1 Alpha-2

**Format**: Two-letter uppercase code

**Examples**:
- South Africa: `ZA`
- Nigeria: `NG`
- Kenya: `KE`
- United Kingdom: `GB`
- United States: `US`
- India: `IN`

**Why This Standard?**
- ✅ Globally recognized (ISO standard)
- ✅ Compact (2 characters)
- ✅ Supported by all major APIs and services
- ✅ Consistent across databases and APIs

## Database Storage

### Profiles Table

```sql
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY,
  country_code TEXT CHECK (country_code ~ '^[A-Z]{2}$'),
  country_iso TEXT, -- Derived from country_code
  -- ... other fields
);
```

### Validation Trigger

Auto-populate `country_iso` from dial code:

```sql
CREATE FUNCTION sync_country_iso() RETURNS TRIGGER AS $$
BEGIN
  NEW.country_iso := get_country_iso_from_dial_code(NEW.country_code);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_country_iso_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_country_iso();
```

## Dial Code to ISO Mapping

### Supported Mappings

```typescript
const DIAL_CODE_TO_ISO: Record<string, string> = {
  '+1': 'US',    // United States / Canada (ambiguous - needs clarification)
  '+27': 'ZA',   // South Africa
  '+44': 'GB',   // United Kingdom
  '+91': 'IN',   // India
  '+234': 'NG',  // Nigeria
  '+254': 'KE',  // Kenya
  '+233': 'GH',  // Ghana
  '+256': 'UG',  // Uganda
  '+255': 'TZ',  // Tanzania
  '+260': 'ZM',  // Zambia
  '+263': 'ZW',  // Zimbabwe
  '+267': 'BW',  // Botswana
  '+92': 'PK',   // Pakistan
  '+880': 'BD',  // Bangladesh
  '+94': 'LK',   // Sri Lanka
  '+971': 'AE',  // United Arab Emirates
  '+966': 'SA',  // Saudi Arabia
  '+20': 'EG',   // Egypt
  // ... extend as needed
};
```

### Database Function

```sql
CREATE FUNCTION get_country_iso_from_dial_code(p_dial_code TEXT)
RETURNS TEXT
LANGUAGE SQL IMMUTABLE AS $$
  SELECT CASE p_dial_code
    WHEN '+27'  THEN 'ZA'
    WHEN '+234' THEN 'NG'
    WHEN '+254' THEN 'KE'
    WHEN '+44'  THEN 'GB'
    WHEN '+91'  THEN 'IN'
    WHEN '+1'   THEN 'US'
    -- ... add all supported countries
    ELSE NULL
  END;
$$;
```

## Usage in Code

### Frontend

```typescript
import { countries } from '@/data/countries';

// Get country by code
const country = countries.find(c => c.code === 'ZA');
console.log(country.name); // "South Africa"

// Get dial code
console.log(country.dialCode); // "+27"

// Validate country code
function isValidCountryCode(code: string): boolean {
  return /^[A-Z]{2}$/.test(code) && 
         countries.some(c => c.code === code);
}
```

### Backend (Edge Functions)

```typescript
import { supabase } from './supabase-client.ts';

// Query by country
const { data: users } = await supabase
  .from('profiles')
  .select('*')
  .eq('country_code', 'ZA');

// Filter questions by country
const { data: options } = await supabase
  .from('country_question_options')
  .select('*')
  .eq('country_code', 'NG');
```

## Country-Specific Features

### Profile Questions

Country-specific question options:

```sql
CREATE TABLE country_question_options (
  id UUID PRIMARY KEY,
  question_id UUID REFERENCES profile_questions(id),
  country_code TEXT CHECK (country_code ~ '^[A-Z]{2}$'),
  options TEXT[],
  UNIQUE (question_id, country_code)
);
```

### Legal Age Restrictions

```sql
CREATE TABLE country_legal_age (
  country_code TEXT PRIMARY KEY CHECK (country_code ~ '^[A-Z]{2}$'),
  minimum_age INTEGER NOT NULL,
  notes TEXT
);

INSERT INTO country_legal_age VALUES
  ('ZA', 18, 'Legal age of majority'),
  ('NG', 18, 'Legal age of majority'),
  ('KE', 18, 'Legal age of majority'),
  ('US', 18, 'Legal age of majority (some states 19/21)'),
  ('IN', 18, 'Legal age of majority'),
  ('GLOBAL', 18, 'Default fallback');
```

### Currency & Localization

```typescript
interface CountryConfig {
  code: string;
  currency: string;
  locale: string;
  dateFormat: string;
  timeZone: string;
}

const COUNTRY_CONFIGS: Record<string, CountryConfig> = {
  ZA: {
    code: 'ZA',
    currency: 'ZAR',
    locale: 'en-ZA',
    dateFormat: 'DD/MM/YYYY',
    timeZone: 'Africa/Johannesburg'
  },
  NG: {
    code: 'NG',
    currency: 'NGN',
    locale: 'en-NG',
    dateFormat: 'DD/MM/YYYY',
    timeZone: 'Africa/Lagos'
  },
  US: {
    code: 'US',
    currency: 'USD',
    locale: 'en-US',
    dateFormat: 'MM/DD/YYYY',
    timeZone: 'America/New_York'
  }
};
```

## Expanding to New Countries

### Checklist

When adding a new country:

- [ ] Add to `countries.ts` data file
- [ ] Add dial code mapping to `get_country_iso_from_dial_code()`
- [ ] Add minimum age to `country_legal_age` table
- [ ] Add currency/locale config
- [ ] Generate country-specific profile question options
- [ ] Update mobile validation patterns
- [ ] Test registration flow
- [ ] Update documentation

### Example: Adding Pakistan (PK)

```typescript
// 1. Add to countries.ts
{
  code: 'PK',
  name: 'Pakistan',
  dialCode: '+92',
  flag: '🇵🇰'
}

// 2. Update dial code mapping
WHEN '+92' THEN 'PK'

// 3. Add legal age
INSERT INTO country_legal_age VALUES ('PK', 18, 'Legal age');

// 4. Generate question options (via AI tool)
// Admin Portal → Profile Questions → Auto-Generate → Select "PK"

// 5. Test
npm run test:country -- --country=PK
```

## Special Cases

### Ambiguous Dial Codes

Some dial codes map to multiple countries (e.g., `+1` for US/Canada):

**Solution**: Prompt user to select country during registration

```typescript
if (dialCode === '+1') {
  // Show country selector
  const country = await promptCountrySelection([
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' }
  ]);
  return country.code;
}
```

### Country Blocklist

**16 Countries Currently Blocked** for regulatory reasons (data localization requirements):

- Argentina, Brazil, China, India, Indonesia, Iran, Kazakhstan, Pakistan
- Russia, Saudi Arabia, Singapore, South Korea, Thailand, Turkey, UAE, Vietnam

Countries are blocked due to data localization regulations, not technical limitations. The platform supports **193 available countries** for registration (209 total - 16 blocked).

**Management**: Admin Portal → Country Blocklist (`/admin/country-blocklist`)

```sql
CREATE TABLE country_blocklist (
  country_code TEXT PRIMARY KEY,
  reason TEXT NOT NULL,
  blocked_at TIMESTAMP DEFAULT NOW()
);

-- Block registrations
CREATE FUNCTION check_country_allowed() RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM country_blocklist WHERE country_code = NEW.country_code) THEN
    RAISE EXCEPTION 'Registrations from this country are not currently accepted';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Validation & Testing

### Unit Tests

```typescript
describe('Country Code Validation', () => {
  test('validates ISO format', () => {
    expect(isValidCountryCode('ZA')).toBe(true);
    expect(isValidCountryCode('za')).toBe(false); // lowercase
    expect(isValidCountryCode('ZAR')).toBe(false); // 3 letters
    expect(isValidCountryCode('99')).toBe(false); // numbers
  });
  
  test('maps dial code to ISO', () => {
    expect(getCountryFromDialCode('+27')).toBe('ZA');
    expect(getCountryFromDialCode('+234')).toBe('NG');
    expect(getCountryFromDialCode('+999')).toBeNull(); // unknown
  });
});
```

### Integration Tests

```typescript
test('profile creation with country code', async () => {
  const profile = await createProfile({
    email: 'test@example.com',
    country_code: 'ZA',
    mobile: '0712345678',
    country_dial_code: '+27'
  });
  
  expect(profile.country_code).toBe('ZA');
  expect(profile.country_iso).toBe('ZA');
});
```

## Related Documentation

- [Mobile Validation](MOBILE_VALIDATION.md)
- [Data Isolation](DATA_ISOLATION_QUICK_REFERENCE.md)
- [Profile System Architecture](PROFILE_SYSTEM_ARCHITECTURE.md)
