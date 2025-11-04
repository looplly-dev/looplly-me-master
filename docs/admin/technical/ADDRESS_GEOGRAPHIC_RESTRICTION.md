---
id: "address-geographic-restriction"
title: "Address Geographic Restriction System"
category: "Technical"
description: "Technical specification for country-based address restriction in profile questions"
audience: "admin"
tags: ["address", "geocoding", "validation", "security"]
status: "published"
---

# Address Geographic Restriction System

## Overview

The address question type implements geographic restrictions to ensure data integrity and security by limiting address inputs to the user's registered country (verified via mobile number).

## Business Rules

### Core Requirement
**Address country MUST always match the user's mobile verification country**

### Enforcement Points
1. **API Level** - Google Places autocomplete filtered by country
2. **Client Validation** - Selected address validated against expected country
3. **Data Storage** - Country field forced to profile country on save
4. **UI Display** - Country shown as read-only badge

## Technical Implementation

### Database Schema

**Relevant Tables:**
```sql
-- User's verified country from mobile registration
profiles
  - country_code TEXT (e.g., "+27")
  - country_iso TEXT (e.g., "ZA")

-- Stored address data
profile_answers
  - answer_json JSONB {
      "country": "South Africa",  -- Must match profile
      "locality": "Cape Town",
      "route": "Long Street",
      ...
    }
```

### API Integration

**Edge Function:** `supabase/functions/google-places/index.ts`

**Request Schema:**
```typescript
interface AutocompleteRequest {
  query: string;
  countryCode?: string; // ISO 2-letter code (e.g., "ZA")
}
```

**API Call Construction:**
```typescript
let apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json`;
apiUrl += `?input=${encodeURIComponent(query)}`;
apiUrl += `&key=${apiKey}`;

// Geographic restriction
if (countryCode) {
  apiUrl += `&components=country:${countryCode.toLowerCase()}`;
}
```

**Google Places API Response:**
- Only returns addresses matching the `components` filter
- If no `countryCode` provided, returns global results (not used in address questions)

### Frontend Services

**File:** `src/services/googlePlacesService.ts`

**Method Updates:**
```typescript
class GooglePlacesService {
  // Pass country filter to API
  async searchPlaces(query: string, countryCode?: string): Promise<any[]> {
    const { data } = await supabase.functions.invoke('google-places', {
      body: { query, countryCode }
    });
    return data.predictions || [];
  }
  
  // Parse and return address components
  parseAddressComponents(place: any): AddressComponents {
    // Extracts: street_number, route, locality, country, etc.
  }
}
```

### Validation Hook

**File:** `src/hooks/useAddressAutocomplete.ts`

**Country Validation:**
```typescript
const selectPlace = async (placeId: string, expectedCountryName?: string) => {
  const placeDetails = await googlePlacesService.getPlaceDetails(placeId);
  const parsedAddress = googlePlacesService.parseAddressComponents(placeDetails);
  
  // Validate country matches
  if (expectedCountryName && parsedAddress.country !== expectedCountryName) {
    throw new Error(
      `Address must be in ${expectedCountryName}. ` +
      `Selected address is in ${parsedAddress.country}.`
    );
  }
  
  return parsedAddress;
};
```

### UI Component

**File:** `src/components/ui/address-fields-input.tsx`

**Key Features:**
1. Receives `userCountryCode` prop (e.g., "+27")
2. Derives metadata: name, ISO code, flag emoji
3. Passes ISO code to search for API filtering
4. Passes country name to selectPlace for validation
5. Forces country field to profile country
6. Displays read-only country badge

**Country Badge Display:**
```tsx
<div className="bg-blue-50 border-blue-200">
  <span className="text-3xl">🇿🇦</span>
  <div>
    <p className="font-semibold">South Africa</p>
    <p className="text-xs">
      Based on your mobile number - Address must be in this country
    </p>
  </div>
</div>
```

### Utility Functions

**File:** `src/utils/countries.ts`

```typescript
// Map dial code to country name
export const getCountryNameFromDialCode = (dialCode: string): string => {
  const country = countries.find(c => c.dialCode === dialCode);
  return country?.name || '';
};

// Map dial code to ISO code
export const getISOFromDialCode = (dialCode: string): string => {
  const country = countries.find(c => c.dialCode === dialCode);
  return country?.isoCode || '';
};

// Map dial code to flag emoji
export const getCountryFlagFromDialCode = (dialCode: string): string => {
  const country = countries.find(c => c.dialCode === dialCode);
  return country?.flag || '🌍';
};
```

## Security Considerations

### Threat Model

**Risk:** User attempts to input address from different country
**Mitigation:** Multi-layer validation (API, client, storage)

**Risk:** Google Places API returns wrong country
**Mitigation:** Client-side validation rejects mismatched addresses

**Risk:** Direct API manipulation bypassing UI
**Mitigation:** Future database trigger validation

### Validation Layers

**Layer 1: API Filtering**
- Google Places autocomplete restricted via `components` parameter
- Users never see addresses from other countries

**Layer 2: Client Validation**
- Selected address validated before storing
- Error toast shown if validation fails

**Layer 3: Data Enforcement**
- Country field forced to profile country in all code paths
- Immutable in UI (read-only badge)

**Layer 4: Database (Future)**
- Trigger validation to reject mismatched countries
- RLS policies to enforce country matching

### Future Enhancements

**Database Trigger Validation:**
```sql
CREATE OR REPLACE FUNCTION validate_address_country()
RETURNS TRIGGER AS $$
DECLARE
  user_country_name TEXT;
BEGIN
  -- Get user's country from profile
  SELECT get_country_name_from_dial_code(country_code)
  INTO user_country_name
  FROM profiles
  WHERE user_id = NEW.user_id;
  
  -- Validate address country
  IF (NEW.answer_json->>'country') != user_country_name THEN
    RAISE EXCEPTION 'Address country (%) must match profile country (%)', 
      NEW.answer_json->>'country', user_country_name;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_address_country_trigger
  BEFORE INSERT OR UPDATE ON profile_answers
  FOR EACH ROW
  WHEN (NEW.answer_json->>'country' IS NOT NULL)
  EXECUTE FUNCTION validate_address_country();
```

## Testing Guide

### Manual Testing

**Test Case 1: Address Autocomplete Filtering**
1. Register with mobile +27 123 456 789
2. Navigate to address question
3. Type "123 main street"
4. Expected: Only South African addresses shown

**Test Case 2: Country Badge Display**
1. View address question
2. Expected: Badge shows "🇿🇦 South Africa"
3. Expected: Message "Based on your mobile number - Address must be in this country"

**Test Case 3: Validation Error**
1. (Hypothetically) Select US address while registered in ZA
2. Expected: Error toast "Address must be in South Africa. Selected address is in United States."
3. Expected: Form not populated

**Test Case 4: Missing Country Code**
1. User with no `country_code` in profile
2. Expected: Error badge "Country not detected. Please contact support."

### Automated Testing

```typescript
describe('AddressFieldsInput Geographic Restriction', () => {
  it('should filter autocomplete by country', async () => {
    render(<AddressFieldsInput userCountryCode="+27" />);
    // Assert API called with countryCode="ZA"
  });
  
  it('should display country badge', () => {
    render(<AddressFieldsInput userCountryCode="+27" />);
    expect(screen.getByText('South Africa')).toBeInTheDocument();
    expect(screen.getByText('🇿🇦')).toBeInTheDocument();
  });
  
  it('should reject mismatched country', async () => {
    // Mock API returning US address
    // Assert validation error thrown
  });
});
```

## Monitoring & Logging

### Key Metrics
- Address question completion rate by country
- Validation error rate
- API filter effectiveness

### Log Points
```typescript
// Edge function
console.log(`[GOOGLE-PLACES] Restricting autocomplete to country: ${countryCode}`);

// Client validation
console.warn('Country field is immutable');

// Error handling
console.error('Address selection error:', error);
```

## Troubleshooting

**Issue:** Autocomplete shows no results
- Verify user has valid `country_code` in profile
- Check Google Places API key is configured
- Verify API is not rate limited

**Issue:** Wrong country displayed in badge
- Check `profiles.country_code` value
- Verify `getCountryNameFromDialCode` utility function
- Ensure `countries.ts` data is up to date

**Issue:** Validation error on every selection
- Check `expectedCountryName` matches Google Places API country format
- Verify address parsing extracts country correctly
- Check for typos in country name comparison

## Data Flow Diagram

```
1. User registers with "+27" (South Africa)
   → profiles.country_code = "+27"
   → profiles.country_iso = "ZA" (auto-generated by trigger)

2. User reaches address question
   → QuestionRenderer fetches country_code = "+27"
   → Derives: name="South Africa", ISO="ZA", flag="🇿🇦"

3. User types "123 main st"
   → searchAddress("123 main st", "ZA") called
   → Edge function adds &components=country:za to API
   → Google Places returns ONLY South African addresses

4. User selects address from dropdown
   → selectPlace validates country matches "South Africa"
   → If mismatch: throws error, shows toast
   → If match: populates form with country forced to "South Africa"

5. Form displays
   → Read-only badge: "🇿🇦 South Africa"
   → Message: "Based on your mobile number - Address must be in this country"
   → All other fields editable

6. Form submits
   → address.country = "South Africa" (guaranteed)
   → Matches profile.country_code = "+27"
```

## Related Documentation

- [Question Builder Guide](../features/profiling/QUESTION_BUILDER_GUIDE.md)
- [Profiling Architecture](../features/profiling/ARCHITECTURE.md)
- [Mobile Verification System](../authentication/MOBILE_VERIFICATION_SYSTEM.md)
- [Google Places Integration](../deployment/INTEGRATIONS_SETUP.md)
- [Country Question Management](../features/profiling/COUNTRY_QUESTION_MANAGEMENT.md)
