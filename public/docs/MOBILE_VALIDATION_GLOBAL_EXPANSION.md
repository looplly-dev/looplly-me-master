# Mobile Validation Documentation Guide

## Overview

This guide explains how to **document validation patterns** for specific countries. Mobile validation already works globally for all non-blocked countries—this guide is about adding detailed documentation and examples, not enabling support.

**Important**: The platform validates mobile numbers for **193 available countries** (209 total - 16 blocked) automatically using `libphonenumber-js`. You don't need to add code to support new countries; they already work. This guide is for documenting country-specific validation patterns.

## Current Implementation

The platform uses `libphonenumber-js` for comprehensive mobile validation across **all 193 available countries** (209 total - 16 blocked).

### Global Coverage

**193 Countries Available**:
- All countries listed in `src/data/countries.ts` except those on the blocklist
- Validation happens automatically—no code changes needed
- Countries are blocked for data localization regulations, not technical limitations

**16 Countries Blocked**:
- Argentina, Brazil, China, India, Indonesia, Iran, Kazakhstan, Pakistan, Russia, Saudi Arabia, Singapore, South Korea, Thailand, Turkey, UAE, Vietnam
- Managed via Admin Portal → Country Blocklist (`/admin/country-blocklist`)

### Documented Example Countries

The following countries have detailed validation patterns documented (examples only, not limitations):
- South Africa (+27)
- Nigeria (+234)
- Kenya (+254)
- United Kingdom (+44)
- United States (+1)

## Adding a New Country

### Step 1: Add Country Data

Edit `src/data/countries.ts`:

```typescript
export const countries = [
  // ... existing countries
  {
    code: 'PK',
    name: 'Pakistan',
    dialCode: '+92',
    flag: '🇵🇰'
  }
];
```

### Step 2: Update Validation Logic

The validation is handled automatically by `libphonenumber-js`. No code changes needed if the country is supported by the library.

Verify validation works:

```typescript
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';

const testNumber = '+923001234567'; // Pakistan mobile
console.log(isValidPhoneNumber(testNumber, 'PK')); // Should return true

const parsed = parsePhoneNumber(testNumber);
console.log(parsed.country); // 'PK'
console.log(parsed.nationalNumber); // '3001234567'
```

### Step 3: Update Registration Flow

The registration form in `src/components/auth/Register.tsx` automatically supports new countries once added to `countries.ts`.

Verify these components pick up the new country:
1. Country selector dropdown
2. Dial code prefix
3. Mobile input validation
4. OTP delivery

### Step 4: Database Configuration

Update country-specific configuration:

```sql
-- Add legal age requirement
INSERT INTO country_legal_age (country_code, minimum_age, notes)
VALUES ('PK', 18, 'Legal age of majority');

-- Add to country dial code mapping (if needed)
-- Update get_country_iso_from_dial_code() function
ALTER FUNCTION get_country_iso_from_dial_code(p_dial_code TEXT)
...
WHEN '+92' THEN 'PK'
...
```

### Step 5: Test Mobile Validation

Test the following scenarios:

**Valid Numbers:**
```typescript
// Pakistan valid formats
'+923001234567'  // Mobile with +92
'03001234567'    // National format
'3001234567'     // Without leading 0
```

**Invalid Numbers:**
```typescript
'+92123456'      // Too short
'+923009999999999' // Too long
'+9230012345678'   // Invalid prefix
```

### Step 6: Update OTP Delivery

Ensure SMS/OTP delivery is configured for the new country.

Check with your SMS provider:
- Supported country codes
- Delivery rates
- Cost per SMS
- Regulatory requirements

### Step 7: Profile Questions

Generate country-specific profile question options:

1. Navigate to Admin Portal → Profile Questions
2. For brand/provider questions (banks, mobile networks, retailers)
3. Click \"Auto-Generate Options\"
4. Select the new country (e.g., 'PK')
5. Review and approve AI-generated options

See [Country Question Management](PROFILING/COUNTRY_QUESTION_MANAGEMENT.md).

## Country-Specific Considerations

### Number Format Variations

Some countries have complex numbering schemes:

**Example: India (+91)**
- Mobile: 10 digits starting with 6-9
- Landline: 2-4 digit area code + 6-8 digit number

**Example: United States (+1)**
- All numbers: 10 digits (3-digit area code + 7 digits)
- Same format for mobile and landline

### Regulatory Requirements

Check compliance requirements for each country:

**GDPR (EU Countries)**
- Data protection regulations
- User consent requirements
- Right to be forgotten

**POPI Act (South Africa)**
- Purpose specification
- Data minimization
- Security safeguards

**NDPR (Nigeria)**
- Data protection compliance
- Local data storage (may be required)

### SMS Gateway Configuration

Different countries may require different SMS gateways or configurations.

Common providers:
- **Twilio**: Global coverage, good reliability
- **Africa's Talking**: Strong in African markets
- **MSG91**: Good for India/Asia
- **Amazon SNS**: Global, integrated with AWS

## Testing Checklist

Before launching in a new country:

- [ ] Country appears in registration dropdown
- [ ] Dial code auto-populates correctly
- [ ] Valid mobile numbers pass validation
- [ ] Invalid numbers are rejected with clear messages
- [ ] OTP SMS delivers successfully
- [ ] OTP verification works
- [ ] Profile is created with correct country_code
- [ ] Country-specific profile questions appear
- [ ] Legal age verification works
- [ ] Currency displays correctly (if applicable)

## Common Issues

### Numbers Not Validating

**Problem**: Valid numbers being rejected

**Solutions**:
1. Check `libphonenumber-js` supports the country
2. Verify dial code mapping is correct
3. Test with multiple number formats
4. Check for special prefixes (e.g., mobile vs landline)

### OTP Not Delivering

**Problem**: SMS not reaching users

**Solutions**:
1. Verify SMS gateway supports the country
2. Check for country-specific regulations
3. Test with different mobile networks
4. Verify number format is correct
5. Check gateway logs for errors

### Wrong Country Detection

**Problem**: Dial code maps to wrong country

**Solutions**:
1. Check for ambiguous dial codes (e.g., +1 for US/Canada)
2. Update `get_country_iso_from_dial_code()` function
3. Add country selection prompt for ambiguous codes

## Gradual Rollout Strategy

### Phase 1: Soft Launch
- Enable for internal testing
- Test with small group of beta users
- Monitor validation and delivery rates

### Phase 2: Limited Launch
- Enable for 10% of traffic
- Monitor error rates and user feedback
- Adjust validation rules if needed

### Phase 3: Full Launch
- Enable for all users
- Monitor for 1-2 weeks
- Document any issues and resolutions

## Monitoring & Analytics

Track these metrics per country:

```sql
-- Registration success rate
SELECT 
  country_code,
  COUNT(*) as registrations,
  COUNT(CASE WHEN otp_verified = true THEN 1 END) as verified,
  ROUND(100.0 * COUNT(CASE WHEN otp_verified = true THEN 1 END) / COUNT(*), 2) as success_rate
FROM profiles
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY country_code
ORDER BY registrations DESC;

-- Mobile validation errors
SELECT 
  country_code,
  error_type,
  COUNT(*) as error_count
FROM validation_errors
WHERE error_source = 'mobile_validation'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY country_code, error_type;
```

## Documentation Updates

When adding a new country, update:

1. **Country Code Specification** - Add to supported countries list
2. **Mobile Validation** - Add country-specific validation notes
3. **Profile Questions** - Generate country-specific options
4. **User Guide** - Update supported countries section
5. **Admin Guide** - Add country to management instructions

## Resources

- [libphonenumber-js Documentation](https://gitlab.com/catamphetamine/libphonenumber-js)
- [Country Codes (ISO 3166-1)](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)
- [International Dial Codes](https://countrycode.org/)
- [Mobile Validation Guide](MOBILE_VALIDATION.md)
- [Country Code Specification](COUNTRY_CODE_SPECIFICATION.md)
