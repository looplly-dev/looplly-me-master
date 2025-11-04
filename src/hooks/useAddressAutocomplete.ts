import { useState, useEffect } from 'react';
import { googlePlacesService, type AddressComponents } from '@/services/googlePlacesService';

export const useAddressAutocomplete = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<AddressComponents | null>(null);
  const [isMockMode, setIsMockMode] = useState(true);

  useEffect(() => {
    setIsMockMode(googlePlacesService.isMockMode());
  }, []);

  const searchAddress = async (query: string, countryCode?: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await googlePlacesService.searchPlaces(query, countryCode);
      setSuggestions(results);
    } catch (error) {
      console.error('Address search error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectPlace = async (placeId: string, expectedCountryName?: string) => {
    setIsLoading(true);
    try {
      const placeDetails = await googlePlacesService.getPlaceDetails(placeId);
      if (placeDetails) {
        const parsedAddress = googlePlacesService.parseAddressComponents(placeDetails);
        
        // Validate country matches expected country
        if (expectedCountryName && parsedAddress.country !== expectedCountryName) {
          throw new Error(`Address must be in ${expectedCountryName}. Selected address is in ${parsedAddress.country}.`);
        }
        
        setSelectedAddress(parsedAddress);
        return parsedAddress;
      }
    } catch (error) {
      console.error('Place selection error:', error);
      throw error; // Re-throw to be handled by caller
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    suggestions,
    selectedAddress,
    searchAddress,
    selectPlace,
    isMockMode,
  };
};
