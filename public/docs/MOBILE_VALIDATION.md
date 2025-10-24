# Mobile Number Validation

## Overview

Looplly implements country-aware mobile number validation to ensure accurate phone verification across global markets. This document explains the validation system, supported formats, and implementation details.

## Core Principles

### 1. Country-Specific Validation

Mobile number formats vary by country. Validation rules adapt based on user's country code.

### 2. Normalization

All mobile numbers are stored in a normalized format:
- Full international format: `+27712345678`
- No spaces, dashes, or parentheses
- Country dial code + local number (without leading 0)

### 3. Multiple Input Formats Supported

Users can enter numbers in various formats:
- International: `+27 71 234 5678`
- National: `071 234 5678`
- Compact: `0712345678`

All are normalized to: `+27712345678`

## Supported Countries

### South Africa (ZA)

**Dial Code**: `+27`

**Format**: 9 digits (after removing leading 0)

**Pattern**: `0XX XXX XXXX`

**Valid Ranges**:
- Mobile: `06X`, `07X`, `08X`
- Landline: `01X`, `02X`, `03X`, `04X`, `05X`

**Examples**:
```
Input:          Normalized:
071 234 5678 → +27712345678
(071) 234-5678 → +27712345678
+27 71 234 5678 → +27712345678
```

**Validation**:
```typescript
const ZA_MOBILE_REGEX = /^0[6-8]\d{8}$/;
const ZA_MOBILE_INTL_REGEX = /^\+27[6-8]\d{8}$/;
```

### Nigeria (NG)

**Dial Code**: `+234`

**Format**: 10 digits (after removing leading 0)

**Pattern**: `0XXX XXX XXXX`

**Valid Ranges**:
- Mobile: `070X`, `080X`, `081X`, `090X`, `091X`

**Examples**:
```
Input:            Normalized:
0803 456 7890 → +2348034567890
+234 803 456 7890 → +2348034567890
```

**Validation**:
```typescript
const NG_MOBILE_REGEX = /^0[789][01]\d{8}$/;
const NG_MOBILE_INTL_REGEX = /^\+234[789][01]\d{8}$/;
```

### Kenya (KE)

**Dial Code**: `+254`

**Format**: 9 digits (after removing leading 0)

**Pattern**: `0XXX XXX XXX`

**Valid Ranges**:
- Mobile: `07XX`, `01XX` (Safaricom, Airtel, Telkom)

**Examples**:
```
Input:           Normalized:
0712 345 678 → +254712345678
+254 712 345 678 → +254712345678
```

**Validation**:
```typescript
const KE_MOBILE_REGEX = /^0[71]\d{8}$/;
const KE_MOBILE_INTL_REGEX = /^\+254[71]\d{8}$/;
```

### United Kingdom (GB)

**Dial Code**: `+44`

**Format**: 10 digits (after removing leading 0)

**Pattern**: `0XXXX XXXXXX` or `07XXX XXXXXX`

**Valid Ranges**:
- Mobile: `07XXX XXXXXX`

**Examples**:
```
Input:            Normalized:
07700 900123 → +447700900123
+44 7700 900123 → +447700900123
```

**Validation**:
```typescript
const GB_MOBILE_REGEX = /^07\d{9}$/;
const GB_MOBILE_INTL_REGEX = /^\+447\d{9}$/;
```

### India (IN)

**Dial Code**: `+91`

**Format**: 10 digits

**Pattern**: `XXXXX XXXXX`

**Valid Ranges**:
- Mobile: `6XXXX XXXXX`, `7XXXX XXXXX`, `8XXXX XXXXX`, `9XXXX XXXXX`

**Examples**:
```
Input:             Normalized:
9876543210 → +919876543210
+91 98765 43210 → +919876543210
```

**Validation**:
```typescript
const IN_MOBILE_REGEX = /^[6-9]\d{9}$/;
const IN_MOBILE_INTL_REGEX = /^\+91[6-9]\d{9}$/;
```

## Implementation

### Frontend Validation

```typescript
import { parsePhoneNumberFromString } from 'libphonenumber-js';

function validateMobileNumber(
  mobile: string,
  countryCode: string
): { valid: boolean; normalized?: string; error?: string } {
  try {
    const phoneNumber = parsePhoneNumberFromString(mobile, countryCode);
    
    if (!phoneNumber) {
      return {
        valid: false,
        error: 'Invalid phone number format'
      };
    }
    
    if (!phoneNumber.isValid()) {
      return {
        valid: false,
        error: 'Invalid phone number for this country'
      };
    }
    
    if (phoneNumber.getType() !== 'MOBILE') {
      return {
        valid: false,
        error: 'Please enter a mobile number, not a landline'
      };
    }
    
    return {
      valid: true,
      normalized: phoneNumber.format('E.164') // e.g., +27712345678
    };
  } catch (error) {
    return {
      valid: false,
      error: 'Unable to validate phone number'
    };
  }
}

// Usage
const result = validateMobileNumber('071 234 5678', 'ZA');
if (result.valid) {
  console.log('Normalized:', result.normalized); // +27712345678
}
```

### Backend Normalization

```sql
-- Database function to normalize mobile numbers
CREATE FUNCTION normalize_mobile_number(
  mobile_number TEXT,
  country_dial_code TEXT
) RETURNS TEXT
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  dial_code_escaped TEXT;
  dial_code_no_plus TEXT;
BEGIN
  IF mobile_number IS NULL OR country_dial_code IS NULL THEN
    RETURN mobile_number;
  END IF;

  -- Remove spaces, dashes, parentheses
  mobile_number := regexp_replace(mobile_number, '[\s\-\(\)]', '', 'g');
  
  -- Escape dial code for regex
  dial_code_escaped := replace(country_dial_code, '+', '\+');
  dial_code_no_plus := substring(country_dial_code from 2);
  
  -- Strip country code if included
  mobile_number := regexp_replace(mobile_number, '^' || dial_code_escaped, '');
  mobile_number := regexp_replace(mobile_number, '^\+?' || dial_code_no_plus, '');
  
  -- Remove leading zeros
  mobile_number := regexp_replace(mobile_number, '^0+', '');
  
  -- Reconstruct with country code
  RETURN country_dial_code || mobile_number;
END;
$$;
```

### Validation Trigger

```sql
-- Auto-normalize mobile numbers on insert/update
CREATE FUNCTION normalize_profile_mobile()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.mobile IS NOT NULL AND NEW.country_code IS NOT NULL THEN
    NEW.mobile := normalize_mobile_number(NEW.mobile, NEW.country_code);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER normalize_mobile_on_save
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION normalize_profile_mobile();
```

## OTP Verification

### SMS Provider Integration

```typescript
import { supabase } from '@/integrations/supabase/client';

async function sendOTP(mobile: string, countryCode: string) {
  // Validate and normalize
  const validation = validateMobileNumber(mobile, countryCode);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  // Send OTP via Supabase Auth
  const { data, error } = await supabase.auth.signInWithOtp({
    phone: validation.normalized // +27712345678
  });
  
  if (error) throw error;
  
  return data;
}

async function verifyOTP(mobile: string, otp: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone: mobile,
    token: otp,
    type: 'sms'
  });
  
  if (error) throw error;
  
  return data;
}
```

## Error Messages

### User-Friendly Validation Errors

```typescript
function getValidationErrorMessage(
  countryCode: string,
  errorType: string
): string {
  const messages = {
    ZA: {
      invalid_format: 'Please enter a valid South African mobile number (e.g., 071 234 5678)',
      not_mobile: 'Please enter a mobile number, not a landline',
      too_short: 'Mobile number is too short (should be 10 digits)',
      too_long: 'Mobile number is too long (should be 10 digits)'
    },
    NG: {
      invalid_format: 'Please enter a valid Nigerian mobile number (e.g., 0803 456 7890)',
      not_mobile: 'Please enter a mobile number, not a landline',
      too_short: 'Mobile number is too short (should be 11 digits)',
      too_long: 'Mobile number is too long (should be 11 digits)'
    },
    // ... other countries
  };
  
  return messages[countryCode]?.[errorType] || 'Invalid mobile number';
}
```

## Testing

### Unit Tests

```typescript
describe('Mobile Validation', () => {
  test('validates South African numbers', () => {
    expect(validateMobileNumber('071 234 5678', 'ZA').valid).toBe(true);
    expect(validateMobileNumber('0712345678', 'ZA').valid).toBe(true);
    expect(validateMobileNumber('+27712345678', 'ZA').valid).toBe(true);
    
    // Invalid
    expect(validateMobileNumber('012 345 6789', 'ZA').valid).toBe(false); // Landline
    expect(validateMobileNumber('071 234 567', 'ZA').valid).toBe(false); // Too short
  });
  
  test('normalizes to E.164 format', () => {
    const result = validateMobileNumber('071 234 5678', 'ZA');
    expect(result.normalized).toBe('+27712345678');
  });
  
  test('rejects landline numbers', () => {
    const result = validateMobileNumber('021 123 4567', 'ZA');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('mobile');
  });
});
```

### Integration Tests

```typescript
test('user registration with mobile verification', async () => {
  // Register with mobile
  const mobile = '071 234 5678';
  const countryCode = 'ZA';
  
  await register({
    email: 'test@example.com',
    mobile,
    countryCode
  });
  
  // Verify mobile stored correctly
  const profile = await getProfile(userId);
  expect(profile.mobile).toBe('+27712345678'); // Normalized
  expect(profile.country_code).toBe('+27');
  expect(profile.country_iso).toBe('ZA');
});
```

## Troubleshooting

### Common Issues

**Issue**: OTP not received

**Causes**:
- Invalid mobile number format
- Number not normalized correctly
- SMS provider blocking country
- User's carrier blocking shortcodes

**Solutions**:
1. Verify number format with validation function
2. Check SMS provider logs
3. Test with different carrier
4. Use alternative verification (email)

**Issue**: Duplicate mobile numbers

**Causes**:
- Different formats stored (with/without +)
- Leading zeros not stripped
- Spaces/formatting characters stored

**Solutions**:
1. Enable normalization trigger
2. Run migration to normalize existing data:
```sql
UPDATE profiles
SET mobile = normalize_mobile_number(mobile, country_code)
WHERE mobile IS NOT NULL;
```

## Global Expansion

### Adding New Countries

See [Mobile Validation Global Expansion](MOBILE_VALIDATION_GLOBAL_EXPANSION.md) for detailed guide on adding validation for new countries.

## Related Documentation

- [Country Code Specification](COUNTRY_CODE_SPECIFICATION.md)
- [Mobile Validation Global Expansion](MOBILE_VALIDATION_GLOBAL_EXPANSION.md)
- [Profile System Architecture](PROFILE_SYSTEM_ARCHITECTURE.md)
