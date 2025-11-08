import { env } from '@/config/env';
import mockPlacesData from '@/mock_data/features/google-places.json';
import { supabase } from '@/integrations/supabase/client';

export interface PlaceResult {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

export interface AddressComponents {
  street_number: string;
  route: string;
  sublocality: string;
  locality: string;
  administrative_area_level_1: string;
  administrative_area_level_2: string;
  postal_code: string;
  country: string;
  place_id: string;
  formatted_address: string;
  latitude: number;
  longitude: number;
}

class GooglePlacesService {
  private useMock: boolean;

  constructor() {
    const config = env.get();
    this.useMock = config.VITE_USE_MOCK_PLACES ?? true;
  }

  /**
   * Check if service is using mock data or real API
   */
  public isMockMode(): boolean {
    return this.useMock;
  }

  /**
   * Search for places (autocomplete)
   */
  public async searchPlaces(query: string, countryCode?: string): Promise<any[]> {
    if (this.isMockMode()) {
      return this.mockSearchPlaces(query, countryCode);
    }
    return this.realSearchPlaces(query, countryCode);
  }

  /**
   * Get place details by place_id
   */
  public async getPlaceDetails(placeId: string): Promise<PlaceResult | null> {
    if (this.isMockMode()) {
      return this.mockGetPlaceDetails(placeId);
    }
    return this.realGetPlaceDetails(placeId);
  }

  /**
   * Parse place result into structured address components
   */
  public parseAddressComponents(place: PlaceResult): AddressComponents {
    const components: Partial<AddressComponents> = {
      place_id: place.place_id,
      formatted_address: place.formatted_address,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      street_number: '',
      route: '',
      sublocality: '',
      locality: '',
      administrative_area_level_1: '',
      administrative_area_level_2: '',
      postal_code: '',
      country: '',
    };

    place.address_components.forEach((component) => {
      const types = component.types;
      
      if (types.includes('street_number')) {
        components.street_number = component.long_name;
      }
      if (types.includes('route')) {
        components.route = component.long_name;
      }
      if (types.includes('sublocality') || types.includes('neighborhood')) {
        components.sublocality = component.long_name;
      }
      if (types.includes('locality')) {
        components.locality = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        components.administrative_area_level_1 = component.long_name;
      }
      if (types.includes('administrative_area_level_2')) {
        components.administrative_area_level_2 = component.long_name;
      }
      if (types.includes('postal_code')) {
        components.postal_code = component.long_name;
      }
      if (types.includes('country')) {
        components.country = component.long_name;
      }
    });

    return components as AddressComponents;
  }

  // ============ MOCK IMPLEMENTATIONS ============

  private mockSearchPlaces(query: string, countryCode?: string): Promise<any[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let results = mockPlacesData.mockAutocompleteResults.filter((place) =>
          place.description.toLowerCase().includes(query.toLowerCase())
        );
        
        // Filter by country if specified (for mock data consistency)
        if (countryCode) {
          const countryName = this.getCountryNameFromCode(countryCode);
          results = results.filter(place => 
            place.description.toLowerCase().includes(countryName.toLowerCase())
          );
        }
        
        console.log(`🎭 Using MOCK Google Places Autocomplete (country: ${countryCode || 'all'}):`, results.length, 'results');
        resolve(results);
      }, 300); // Simulate network delay
    });
  }

  private mockGetPlaceDetails(placeId: string): Promise<PlaceResult | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const place = mockPlacesData.mockPlaces.find((p) => p.place_id === placeId);
        console.log('🎭 Using MOCK Google Places Details:', place ? 'found' : 'not found');
        resolve(place || null);
      }, 200);
    });
  }

  // ============ REAL API IMPLEMENTATIONS ============

  private async realSearchPlaces(query: string, countryCode?: string): Promise<any[]> {
    try {
      console.log('[GooglePlaces] Searching with:', { query, countryCode });
      
      const { data, error } = await supabase.functions.invoke('google-places', {
        body: { 
          query,
          countryCode // Pass country restriction
        },
        method: 'POST',
      });

      console.log('[GooglePlaces] API Response:', { data, error });

      if (error) {
        console.error('Google Places Autocomplete error:', error);
        throw error;
      }

      // Check if Google API returned an error status
      if (data.status && data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        const errorMessage = data.error_message || `Google Places API error: ${data.status}`;
        console.error('Google Places API returned error:', { status: data.status, message: errorMessage });
        throw new Error(errorMessage);
      }

      console.log(`🌍 Using REAL Google Places Autocomplete (country: ${countryCode || 'all'}):`, data.predictions?.length || 0, 'results');
      return data.predictions || [];
    } catch (error) {
      console.error('Google Places Autocomplete error:', error);
      throw error;
    }
  }

  private getCountryNameFromCode(code: string): string {
    const countryMap: Record<string, string> = {
      'ZA': 'South Africa',
      'NG': 'Nigeria',
      'US': 'United States',
      'GB': 'United Kingdom',
      'KE': 'Kenya',
      'GH': 'Ghana',
      'UG': 'Uganda',
      'TZ': 'Tanzania',
      'ZW': 'Zimbabwe',
      'BW': 'Botswana',
    };
    return countryMap[code.toUpperCase()] || '';
  }

  private async realGetPlaceDetails(placeId: string): Promise<PlaceResult | null> {
    try {
      const { data, error } = await supabase.functions.invoke('google-places', {
        body: { placeId },
        method: 'POST',
      });

      if (error) {
        console.error('Google Places Details error:', error);
        throw error;
      }

      // Check if Google API returned an error status
      if (data.status && data.status !== 'OK') {
        const errorMessage = data.error_message || `Google Places API error: ${data.status}`;
        console.error('Google Places Details error:', { status: data.status, message: errorMessage });
        throw new Error(errorMessage);
      }

      console.log('🌍 Using REAL Google Places Details');
      return data.result || null;
    } catch (error) {
      console.error('Google Places Details error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const googlePlacesService = new GooglePlacesService();
