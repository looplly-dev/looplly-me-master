import { Country } from '@/types/auth';

/**
 * Master country mapping for Looplly
 * 
 * This defines the relationship between:
 * - dialCode: Stored in profiles.country_code (source of truth)
 * - code: Auto-populated in profiles.country_iso (derived via DB trigger)
 * 
 * IMPORTANT: When adding countries, also update:
 * 1. Database function: get_country_iso_from_dial_code()
 * 2. Check constraint: valid_country_iso on profiles table
 * 
 * See docs/COUNTRY_CODE_SPECIFICATION.md for full details.
 */
export const countries: Country[] = [
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', dialCode: '+27' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', dialCode: '+234' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', dialCode: '+254' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44' },
  { code: 'IN', name: 'India', flag: '🇮🇳', dialCode: '+91' },
];