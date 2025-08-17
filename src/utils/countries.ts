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