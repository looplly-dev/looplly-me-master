import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { documentationIndex } from '@/data/documentationIndex';

interface SearchFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
}

export interface FilterState {
  categories: string[];
  tags: string[];
  status: string[];
}

export default function SearchFilters({ onFiltersChange }: SearchFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    tags: [],
    status: []
  });

  const categories = Array.from(new Set(documentationIndex.map(doc => doc.category)));
  const allTags = Array.from(new Set(documentationIndex.flatMap(doc => doc.tags)));
  const popularTags = allTags.slice(0, 10); // Top 10 tags

  const updateFilters = (type: keyof FilterState, value: string, checked: boolean) => {
    const newFilters = { ...filters };
    if (checked) {
      newFilters[type] = [...newFilters[type], value];
    } else {
      newFilters[type] = newFilters[type].filter(v => v !== value);
    }
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAll = () => {
    const emptyFilters = { categories: [], tags: [], status: [] };
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const totalFilters = filters.categories.length + filters.tags.length + filters.status.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Filters</CardTitle>
          {totalFilters > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Categories */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Category</h4>
          {categories.map(category => (
            <div key={category} className="flex items-center gap-2">
              <Checkbox
                id={`cat-${category}`}
                checked={filters.categories.includes(category)}
                onCheckedChange={(checked) => 
                  updateFilters('categories', category, checked as boolean)
                }
              />
              <Label 
                htmlFor={`cat-${category}`}
                className="text-sm cursor-pointer"
              >
                {category}
              </Label>
            </div>
          ))}
        </div>

        {/* Status */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Status</h4>
          <div className="flex items-center gap-2">
            <Checkbox
              id="status-published"
              checked={filters.status.includes('published')}
              onCheckedChange={(checked) => 
                updateFilters('status', 'published', checked as boolean)
              }
            />
            <Label htmlFor="status-published" className="text-sm cursor-pointer">
              Published
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="status-coming-soon"
              checked={filters.status.includes('coming_soon')}
              onCheckedChange={(checked) => 
                updateFilters('status', 'coming_soon', checked as boolean)
              }
            />
            <Label htmlFor="status-coming-soon" className="text-sm cursor-pointer">
              Coming Soon
            </Label>
          </div>
        </div>

        {/* Popular Tags */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Popular Tags</h4>
          <div className="flex flex-wrap gap-2">
            {popularTags.map(tag => (
              <Badge
                key={tag}
                variant={filters.tags.includes(tag) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => updateFilters('tags', tag, !filters.tags.includes(tag))}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
