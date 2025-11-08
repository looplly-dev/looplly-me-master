import { useState, useEffect, useCallback, useRef } from 'react';
import { googlePlacesService, type AddressComponents } from '@/services/googlePlacesService';

export const useAddressAutocomplete = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<AddressComponents | null>(null);
  const [isMockMode, setIsMockMode] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setIsMockMode(googlePlacesService.isMockMode());
  }, []);

  const searchAddress = useCallback(async (query: string, countryCode?: string) => {
    // Cancel any in-flight requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    try {
      const results = await googlePlacesService.searchPlaces(query, countryCode);
      
      // Only update if request wasn't aborted
      if (!abortControllerRef.current.signal.aborted) {
        setSuggestions(results);
      }
    } catch (error) {
      // Ignore abort errors
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error('Address search error:', error);
      setSuggestions([]);
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []); // Empty dependency array - function is stable

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
