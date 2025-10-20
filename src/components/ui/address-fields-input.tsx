import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import { useAddressAutocomplete } from '@/hooks/useAddressAutocomplete';
import { cn } from '@/lib/utils';
import type { AddressComponents } from '@/services/googlePlacesService';

interface AddressFieldsInputProps {
  value?: Partial<AddressComponents>;
  onChange?: (address: AddressComponents) => void;
  disabled?: boolean;
  className?: string;
}

export const AddressFieldsInput = ({
  value,
  onChange,
  disabled,
  className,
}: AddressFieldsInputProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addressFields, setAddressFields] = useState<Partial<AddressComponents>>({
    street_number: value?.street_number || '',
    route: value?.route || '',
    locality: value?.locality || '',
    administrative_area_level_1: value?.administrative_area_level_1 || '',
    postal_code: value?.postal_code || '',
  });
  
  const {
    isLoading,
    suggestions,
    searchAddress,
    selectPlace,
    isMockMode,
  } = useAddressAutocomplete();

  const hasSelectedAddress = !!(addressFields.route || addressFields.locality);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery && searchQuery.length >= 3) {
        searchAddress(searchQuery);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSelectSuggestion = async (suggestion: any) => {
    const address = await selectPlace(suggestion.place_id);
    if (address) {
      setAddressFields({
        street_number: address.street_number,
        route: address.route,
        locality: address.locality,
        administrative_area_level_1: address.administrative_area_level_1,
        postal_code: address.postal_code,
      });
      setSearchQuery('');
      setShowSuggestions(false);
      onChange?.(address);
    }
  };

  const handleFieldChange = (field: keyof AddressComponents, fieldValue: string) => {
    const updated = { ...addressFields, [field]: fieldValue };
    setAddressFields(updated);
    
    // Notify parent with updated address components
    if (onChange && value) {
      onChange({ ...value, ...updated } as AddressComponents);
    }
  };

  const getStreetAddress = () => {
    const parts = [addressFields.street_number, addressFields.route].filter(Boolean);
    return parts.join(' ');
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Google Places Autocomplete Search */}
      {!hasSelectedAddress && (
        <div className="relative">
          <Label className="mb-2 block">Search Address</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Start typing your address..."
              className="pl-10"
              disabled={disabled}
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Mock Mode Indicator */}
          {isMockMode && (
            <Badge variant="outline" className="mt-2 text-xs">
              🎭 Mock Mode - Using Demo Data
            </Badge>
          )}

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.place_id || index}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="px-4 py-3 hover:bg-muted cursor-pointer border-b last:border-b-0 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {suggestion.structured_formatting?.main_text || suggestion.description}
                      </p>
                      {suggestion.structured_formatting?.secondary_text && (
                        <p className="text-xs text-muted-foreground">
                          {suggestion.structured_formatting.secondary_text}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Address Component Fields */}
      {hasSelectedAddress && (
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span>Address selected - you can edit fields below</span>
          </div>

          {/* Street Address */}
          <div className="space-y-2">
            <Label htmlFor="street">Street Address</Label>
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-1">
                <Input
                  id="street_number"
                  value={addressFields.street_number || ''}
                  onChange={(e) => handleFieldChange('street_number', e.target.value)}
                  placeholder="No."
                  disabled={disabled}
                />
              </div>
              <div className="col-span-3">
                <Input
                  id="street"
                  value={addressFields.route || ''}
                  onChange={(e) => handleFieldChange('route', e.target.value)}
                  placeholder="Street Name"
                  disabled={disabled}
                />
              </div>
            </div>
          </div>

          {/* Suburb/Locality */}
          <div className="space-y-2">
            <Label htmlFor="suburb">Suburb / City</Label>
            <Input
              id="suburb"
              value={addressFields.locality || ''}
              onChange={(e) => handleFieldChange('locality', e.target.value)}
              placeholder="Enter suburb or city"
              disabled={disabled}
            />
          </div>

          {/* Province/State */}
          <div className="space-y-2">
            <Label htmlFor="province">Province / State</Label>
            <Input
              id="province"
              value={addressFields.administrative_area_level_1 || ''}
              onChange={(e) => handleFieldChange('administrative_area_level_1', e.target.value)}
              placeholder="Enter province or state"
              disabled={disabled}
            />
          </div>

          {/* Postal Code */}
          <div className="space-y-2">
            <Label htmlFor="postal_code">Postal Code</Label>
            <Input
              id="postal_code"
              value={addressFields.postal_code || ''}
              onChange={(e) => handleFieldChange('postal_code', e.target.value)}
              placeholder="Enter postal code"
              disabled={disabled}
            />
          </div>

          {/* Change Address Link */}
          <button
            type="button"
            onClick={() => {
              setAddressFields({
                street_number: '',
                route: '',
                locality: '',
                administrative_area_level_1: '',
                postal_code: '',
              });
              setSearchQuery('');
            }}
            className="text-sm text-primary hover:underline"
            disabled={disabled}
          >
            Search for a different address
          </button>
        </div>
      )}
    </div>
  );
};
