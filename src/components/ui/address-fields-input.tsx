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
    sublocality: value?.sublocality || '',
    locality: value?.locality || '',
    administrative_area_level_2: value?.administrative_area_level_2 || '',
    administrative_area_level_1: value?.administrative_area_level_1 || '',
    country: value?.country || '',
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
        sublocality: address.sublocality,
        locality: address.locality,
        administrative_area_level_2: address.administrative_area_level_2,
        administrative_area_level_1: address.administrative_area_level_1,
        country: address.country,
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
        <div className="space-y-6 p-4 bg-muted/30 rounded-lg border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span>Address selected - you can edit fields below</span>
          </div>

          {/* Street Level Group */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Street Level</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="street" className="text-sm">
                Street Address
              </Label>
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-1">
                  <Input
                    id="street_number"
                    value={addressFields.street_number || ''}
                    onChange={(e) => handleFieldChange('street_number', e.target.value)}
                    placeholder="No."
                    disabled={disabled}
                    className="text-sm"
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    id="street"
                    value={addressFields.route || ''}
                    onChange={(e) => handleFieldChange('route', e.target.value)}
                    placeholder="Street Name"
                    disabled={disabled}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Area Level Group */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Area Level</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sublocality" className="text-sm flex items-center gap-2">
                Suburb / Neighborhood
                <Badge variant="outline" className="text-[10px] font-normal">Optional</Badge>
              </Label>
              <Input
                id="sublocality"
                value={addressFields.sublocality || ''}
                onChange={(e) => handleFieldChange('sublocality', e.target.value)}
                placeholder="Enter suburb or neighborhood"
                disabled={disabled}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="locality" className="text-sm flex items-center gap-2">
                City / Town
                <Badge variant="outline" className="text-[10px] font-normal">Optional</Badge>
              </Label>
              <Input
                id="locality"
                value={addressFields.locality || ''}
                onChange={(e) => handleFieldChange('locality', e.target.value)}
                placeholder="Enter city or town"
                disabled={disabled}
                className="text-sm"
              />
            </div>
          </div>

          {/* Administrative Level Group */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Administrative Level</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region" className="text-sm flex items-center gap-2">
                Region / County
                <Badge variant="outline" className="text-[10px] font-normal">Optional</Badge>
              </Label>
              <Input
                id="region"
                value={addressFields.administrative_area_level_2 || ''}
                onChange={(e) => handleFieldChange('administrative_area_level_2', e.target.value)}
                placeholder="Enter region or county"
                disabled={disabled}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="province" className="text-sm flex items-center gap-2">
                Province / State
                <Badge variant="destructive" className="text-[10px] font-normal">Required</Badge>
              </Label>
              <Input
                id="province"
                value={addressFields.administrative_area_level_1 || ''}
                onChange={(e) => handleFieldChange('administrative_area_level_1', e.target.value)}
                placeholder="Enter province or state"
                disabled={disabled}
                required
                className={cn(
                  "text-sm",
                  !addressFields.administrative_area_level_1 && "border-destructive"
                )}
              />
              {!addressFields.administrative_area_level_1 && (
                <p className="text-xs text-destructive">Province/State is required for targeting</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm flex items-center gap-2">
                Country
                <Badge variant="outline" className="text-[10px] font-normal">Optional</Badge>
              </Label>
              <Input
                id="country"
                value={addressFields.country || ''}
                onChange={(e) => handleFieldChange('country', e.target.value)}
                placeholder="Enter country"
                disabled={disabled}
                className="text-sm"
              />
            </div>
          </div>

          {/* Additional Information Group */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Additional</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal_code" className="text-sm flex items-center gap-2">
                Postal Code
                <Badge variant="outline" className="text-[10px] font-normal">Optional</Badge>
              </Label>
              <Input
                id="postal_code"
                value={addressFields.postal_code || ''}
                onChange={(e) => handleFieldChange('postal_code', e.target.value)}
                placeholder="Enter postal code"
                disabled={disabled}
                className="text-sm"
              />
            </div>
          </div>

          {/* Change Address Link */}
          <div className="pt-2 border-t">
            <button
              type="button"
              onClick={() => {
                setAddressFields({
                  street_number: '',
                  route: '',
                  sublocality: '',
                  locality: '',
                  administrative_area_level_2: '',
                  administrative_area_level_1: '',
                  country: '',
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
        </div>
      )}
    </div>
  );
};
