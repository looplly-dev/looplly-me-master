import { env } from '@/config/env';
import mockPlacesData from '@/mock_data/features/google-places.json';

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
  private apiKey: string | undefined;

  constructor() {
    const config = env.get();
    this.useMock = config.VITE_USE_MOCK_PLACES ?? true;
    this.apiKey = config.VITE_GOOGLE_PLACES_API_KEY;
  }

  /**
   * Check if service is using mock data or real API
   */
  public isMockMode(): boolean {
    return this.useMock || !this.apiKey;
  }

  /**
   * Search for places (autocomplete)
   */
  public async searchPlaces(query: string): Promise<any[]> {
    if (this.isMockMode()) {
      return this.mockSearchPlaces(query);
    }
    return this.realSearchPlaces(query);
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

  private mockSearchPlaces(query: string): Promise<any[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = mockPlacesData.mockAutocompleteResults.filter((place) =>
          place.description.toLowerCase().includes(query.toLowerCase())
        );
        console.log('🎭 Using MOCK Google Places Autocomplete:', results.length, 'results');
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

  private async realSearchPlaces(query: string): Promise<any[]> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${this.apiKey}`
      );
      const data = await response.json();
      console.log('🌍 Using REAL Google Places Autocomplete:', data.predictions?.length || 0, 'results');
      return data.predictions || [];
    } catch (error) {
      console.error('Google Places Autocomplete error:', error);
      throw error;
    }
  }

  private async realGetPlaceDetails(placeId: string): Promise<PlaceResult | null> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${this.apiKey}`
      );
      const data = await response.json();
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
