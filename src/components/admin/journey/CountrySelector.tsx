import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { useJourneyPreview } from '@/contexts/JourneyPreviewContext';

const countries = [
  { code: 'ZA', name: 'South Africa' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'KE', name: 'Kenya' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'IN', name: 'India' },
  { code: 'AU', name: 'Australia' },
];

export function CountrySelector() {
  const { mockUserState, updateMockUserState } = useJourneyPreview();

  return (
    <div className="flex items-center gap-3">
      <Label className="flex items-center gap-2 text-sm whitespace-nowrap">
        <Globe className="h-4 w-4" />
        Preview Country
      </Label>
      <Select 
        value={mockUserState.countryCode} 
        onValueChange={(value) => updateMockUserState({ countryCode: value })}
      >
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {countries.map(country => (
            <SelectItem key={country.code} value={country.code}>
              {country.code} - {country.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
