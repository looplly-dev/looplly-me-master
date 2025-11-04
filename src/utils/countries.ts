// Country utilities
import { countries } from '@/data/countries';
import { Country } from '@/types/auth';

export const getCountryByDialCode = (dialCode: string): Country | undefined => {
  return countries.find(country => country.dialCode === dialCode);
};

export const getCountryByCode = (code: string): Country | undefined => {
  return countries.find(country => country.code === code);
};

export const getDefaultCountry = (): Country => {
  // Default to South Africa
  return countries.find(country => country.code === 'ZA') || countries[0];
};

export const formatCountryDisplay = (country: Country): string => {
  return `${country.flag} ${country.dialCode}`;
};

export const formatCountryOption = (country: Country): string => {
  return `${country.flag} ${country.dialCode} ${country.name}`;
};

export const validateCountryCode = (dialCode: string): boolean => {
  return countries.some(country => country.dialCode === dialCode);
};

export const getAllCountries = (): Country[] => {
  return [...countries];
};

/**
 * Get ISO code from dial code
 * Mirrors the database function get_country_iso_from_dial_code()
 * 
 * @param dialCode - Phone dial code with + prefix (e.g., '+27')
 * @returns ISO 3166-1 alpha-2 code (e.g., 'ZA') or undefined
 */
export const getISOFromDialCode = (dialCode: string): string | undefined => {
  const country = getCountryByDialCode(dialCode);
  return country?.code;
};

/**
 * Get dial code from ISO code
 * 
 * @param isoCode - ISO 3166-1 alpha-2 code (e.g., 'ZA')
 * @returns Phone dial code with + prefix (e.g., '+27') or undefined
 */
export const getDialCodeFromISO = (isoCode: string): string | undefined => {
  const country = getCountryByCode(isoCode);
  return country?.dialCode;
};

/**
 * Get country name from dial code
 * @param dialCode - e.g., "+27", "+234", "+44"
 * @returns Country name - e.g., "South Africa"
 */
export const getCountryNameFromDialCode = (dialCode: string): string => {
  const country = countries.find(c => c.dialCode === dialCode);
  return country?.name || '';
};

/**
 * Get country flag emoji from dial code
 * @param dialCode - e.g., "+27"
 * @returns Flag emoji - e.g., "🇿🇦"
 */
export const getCountryFlagFromDialCode = (dialCode: string): string => {
  const country = countries.find(c => c.dialCode === dialCode);
  return country?.flag || '🌍';
};