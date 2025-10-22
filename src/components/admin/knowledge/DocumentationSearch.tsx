import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, FileText } from 'lucide-react';
import { documentationIndex, DocumentationItem } from '@/data/documentationIndex';
import Fuse from 'fuse.js';

interface DocumentationSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function DocumentationSearch({ searchQuery, onSearchChange }: DocumentationSearchProps) {
  const [results, setResults] = useState<DocumentationItem[]>([]);

  // Configure Fuse.js for fuzzy search
  const fuse = useMemo(() => new Fuse(documentationIndex, {
    keys: [
      { name: 'title', weight: 2 },
      { name: 'description', weight: 1.5 },
      { name: 'tags', weight: 1 },
      { name: 'category', weight: 0.5 }
    ],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 2,
  }), []);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    const searchResults = fuse.search(searchQuery);
    setResults(searchResults.map(result => result.item));
  }, [searchQuery, fuse]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search documentation... (e.g., 'mobile validation', 'reputation', 'profiling')"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Found {results.length} result{results.length !== 1 ? 's' : ''}
          </p>
          <div className="grid gap-3">
            {results.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        {doc.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {doc.description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {doc.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1">
                    {doc.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {searchQuery.trim().length >= 2 && results.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No documents found matching "{searchQuery}"</p>
            <p className="text-sm mt-1">Try different keywords or browse by category</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
