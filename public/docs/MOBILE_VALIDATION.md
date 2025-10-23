# Mobile Number Validation System

## Overview
This system provides comprehensive, country-aware mobile number validation using Google's libphonenumber-js library. It ensures all mobile numbers are properly formatted, validated, and stored in a consistent E.164 international format.

## Key Features

✅ **Country-aware validation** - Validates numbers according to country-specific rules  
✅ **Automatic normalization** - Strips leading zeros and formats consistently  
✅ **Real-time feedback** - Shows users exactly what will be saved  
✅ **Mobile-specific** - Rejects landline numbers  
✅ **E.164 storage** - All numbers stored in international format (+27823093959)  
✅ **Flexible display** - Can format for national or international display  

## Input Formats Supported

The system handles all common input variations:

### South Africa (+27)
- Local with leading zero: `0823093959` → `+27823093959` ✓
- Without leading zero: `823093959` → `+27823093959` ✓
- With spaces: `082 309 3959` → `+27823093959` ✓
- With dashes: `082-309-3959` → `+27823093959` ✓
- With parentheses: `(082) 309-3959` → `+27823093959` ✓
- With embedded zero: `+270823093959` → `+27823093959` ✓

### Nigeria (+234)
- Local format: `08012345678` → `+2348012345678` ✓
- Without zero: `8012345678` → `+2348012345678` ✓

### Kenya (+254)
- Local format: `0712345678` → `+254712345678` ✓
- Without zero: `712345678` → `+254712345678` ✓

## Storage Format

All mobile numbers are stored in **E.164 international format**:
- Always starts with `+`
- Followed by country code
- Then the subscriber number (no leading zeros)
- No spaces, dashes, or other formatting

**Examples:**
- South Africa: `+27823093959`
- Nigeria: `+2348012345678`
- Kenya: `+254712345678`

## Display Formats

The system can display numbers in two formats:

### National Format
Shows how locals would write the number:
- South Africa: `082 309 3959`
- Nigeria: `0801 234 5678`
- Kenya: `071 234 5678`

### International Format
Shows the full international number with spacing:
- South Africa: `+27 82 309 3959`
- Nigeria: `+234 801 234 5678`
- Kenya: `+254 71 234 5678`

## Validation Rules

### Mobile Number Requirements

1. **Valid for selected country** - Number must be valid according to country-specific rules
2. **Correct length** - Must match expected length for the country (usually 9-11 digits)
3. **Valid prefix** - Must start with valid mobile prefix (e.g., South Africa: 06x, 07x, 08x)
4. **Mobile type** - Must be a mobile number (landlines are rejected)

### Error Messages

The system provides specific, actionable error messages:

- `"Invalid country code selected"` - The country code is not recognized
- `"Number too short for ZA"` - Number doesn't have enough digits
- `"Number too long for ZA"` - Number has too many digits
- `"Invalid mobile number format for ZA"` - Number format doesn't match country rules
- `"Please enter a mobile number (not a landline)"` - Number is valid but it's a landline

## Implementation

### Core Functions

#### `validateAndNormalizeMobile(mobile, countryDialCode)`

Main validation function that:
- Strips leading zeros
- Removes spaces, dashes, parentheses
- Validates against country rules
- Returns normalized E.164 format and national display format

```typescript
const result = validateAndNormalizeMobile("0823093959", "+27");
// Returns:
// {
//   isValid: true,
//   normalizedNumber: "+27823093959",
//   nationalFormat: "082 309 3959"
// }
```

#### `isValidMobileForCountry(mobile, countryDialCode)`

Quick boolean check for validation:

```typescript
const isValid = isValidMobileForCountry("0823093959", "+27");
// Returns: true
```

#### `formatMobileForDisplay(mobile, countryDialCode, format)`

Format number for display:

```typescript
const formatted = formatMobileForDisplay("+27823093959", "+27", "international");
// Returns: "+27 82 309 3959"

const national = formatMobileForDisplay("+27823093959", "+27", "national");
// Returns: "082 309 3959"
```

### Registration Flow

1. User enters mobile number in any format
2. System validates in real-time as they type
3. Preview shows exactly what will be saved
4. On submission, number is normalized to E.164
5. Normalized number stored in database

### Admin Panel Display

Admin panel displays numbers in international format for clarity:
- `+27 82 309 3959` (not `0823093959`)
- `+234 801 234 5678` (not `08012345678`)

## Testing

### Test Cases for Each Country

**South Africa (+27):**
```typescript
// Valid cases
validateAndNormalizeMobile("0823093959", "+27") // ✓ Valid
validateAndNormalizeMobile("823093959", "+27")  // ✓ Valid
validateAndNormalizeMobile("082 309 3959", "+27") // ✓ Valid

// Invalid cases
validateAndNormalizeMobile("1234567", "+27")    // ✗ Too short
validateAndNormalizeMobile("0123093959", "+27") // ✗ Invalid prefix
validateAndNormalizeMobile("012345678", "+27")  // ✗ Landline
```

**Nigeria (+234):**
```typescript
// Valid cases
validateAndNormalizeMobile("08012345678", "+234") // ✓ Valid
validateAndNormalizeMobile("8012345678", "+234")  // ✓ Valid

// Invalid cases
validateAndNormalizeMobile("0601234567", "+234")  // ✗ Invalid prefix
```

**Kenya (+254):**
```typescript
// Valid cases
validateAndNormalizeMobile("0712345678", "+254") // ✓ Valid
validateAndNormalizeMobile("712345678", "+254")  // ✓ Valid

// Invalid cases
validateAndNormalizeMobile("0201234567", "+254") // ✗ Landline
```

## Database Migration

To fix existing malformed numbers in the database:

```sql
-- Create normalization function
CREATE OR REPLACE FUNCTION normalize_mobile_number(
  mobile_number TEXT, 
  country_dial_code TEXT
)
RETURNS TEXT AS $$
BEGIN
  mobile_number := regexp_replace(mobile_number, '[\s\-\(\)]', '', 'g');
  mobile_number := regexp_replace(mobile_number, '^' || country_dial_code, '');
  mobile_number := regexp_replace(mobile_number, '^\+?' || substring(country_dial_code from 2), '');
  mobile_number := regexp_replace(mobile_number, '^0+', '');
  RETURN country_dial_code || mobile_number;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fix existing numbers
UPDATE profiles
SET mobile = normalize_mobile_number(mobile, country_code)
WHERE mobile IS NOT NULL 
  AND country_code IS NOT NULL
  AND mobile ~ '^\+?\d+0\d+$';
```

## Troubleshooting

### Common Issues

**Issue:** Number marked as invalid even though it looks correct
- **Solution:** Check if the country code is selected correctly. The same number format can be valid in one country but not another.

**Issue:** Leading zeros cause validation errors
- **Solution:** This is expected behavior. Leading zeros are automatically stripped because they're not used in international format.

**Issue:** Landline numbers rejected
- **Solution:** The system only accepts mobile numbers. Landlines can't receive SMS for OTP verification.

### Adding New Countries

To add support for a new country:

1. Add country to `src/data/countries.ts`:
```typescript
{
  code: 'NG',
  name: 'Nigeria',
  dialCode: '+234',
  flag: '🇳🇬'
}
```

2. No changes needed to validation - libphonenumber-js handles all country rules automatically

---

## Global Expansion

For comprehensive guidance on expanding mobile validation to support more countries (from 5 to 230+), see:

📘 **[MOBILE_VALIDATION_GLOBAL_EXPANSION.md](./MOBILE_VALIDATION_GLOBAL_EXPANSION.md)**

This child document covers:
- Three approaches to global expansion (database-driven, full global, hybrid)
- Database schema considerations for dynamic country management
- UX/UI patterns for different country list sizes
- Legal & compliance requirements per region
- Operational considerations (SMS providers, fraud prevention, support)
- Phased rollout strategy with decision matrix
- Analytics and monitoring for data-driven expansion

The validation system is already globally capable through `libphonenumber-js`—expanding is primarily a strategic and UX decision.

---

## Dependencies

- **libphonenumber-js** (v1.11.18+) - Google's phone number validation library
- Lightweight: 140KB minified
- Zero external dependencies
- Full TypeScript support
- Comprehensive country coverage

## Files Modified

- `src/utils/mobileValidation.ts` - Core validation utilities (new)
- `src/utils/auth.ts` - Uses normalization during registration
- `src/components/auth/Register.tsx` - Real-time validation UI
- `src/hooks/useAdminUsers.ts` - Formats display in admin panel

## Best Practices

1. **Always validate before storage** - Never store unvalidated mobile numbers
2. **Store in E.164 format** - Consistent storage format for all numbers
3. **Display in local format** - Show users numbers in familiar format
4. **Provide real-time feedback** - Let users know immediately if input is invalid
5. **Be specific with errors** - Tell users exactly what's wrong and how to fix it

## Future Enhancements

Potential improvements:
- Country-specific placeholder text
- Auto-detect country from IP address
- SMS verification preview
- Bulk mobile number validation for imports
- More granular mobile operator validation
