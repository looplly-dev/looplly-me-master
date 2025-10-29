import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import Fuse from 'fuse.js';

interface DocumentationItem {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  status?: string;
  audience?: string;
}

interface DocumentationSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter?: 'all' | 'published' | 'coming_soon';
}

export default function DocumentationSearch({ searchQuery, onSearchChange, statusFilter = 'all' }: DocumentationSearchProps) {
  const navigate = useNavigate();
  const [results, setResults] = useState<DocumentationItem[]>([]);
  const [allDocs, setAllDocs] = useState<DocumentationItem[]>([]);
  const { authState } = useAuth();
  const { isAdmin } = useRole();

  // Fetch documentation from Supabase with audience filtering
  useEffect(() => {
    const fetchDocs = async () => {
      let query = supabase
        .from('documentation')
        .select('id, title, description, category, tags, status, audience');

      // Apply audience filter based on user role
      if (isAdmin) {
        // Admins see both 'all' and 'admin' docs
        query = query.in('audience', ['all', 'admin']);
      } else {
        // Non-admins only see 'all' docs
        query = query.eq('audience', 'all');
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Failed to fetch documentation:', error);
        return;
      }

      const docs = (data || []).map(doc => ({
        id: doc.id,
        title: doc.title || '',
        description: doc.description || '',
        category: doc.category || 'Uncategorized',
        tags: doc.tags || [],
        status: doc.status || 'published',
        audience: doc.audience || 'all'
      }));

      setAllDocs(docs);
    };

    fetchDocs();
  }, [isAdmin, statusFilter]);

  // SECURITY: Audit log search queries
  useEffect(() => {
    if (searchQuery.trim().length >= 2 && authState.user) {
      supabase
        .from('documentation_access_log')
        .insert({
          user_id: authState.user.id,
          action: 'search',
          search_query: searchQuery
        })
        .then(({ error }) => {
          if (error) console.error('Failed to log search query:', error);
        });
    }
  }, [searchQuery, authState.user]);

  // Configure Fuse.js for fuzzy search
  const fuse = useMemo(() => new Fuse(allDocs, {
    keys: [
      { name: 'title', weight: 2 },
      { name: 'description', weight: 1.5 },
      { name: 'tags', weight: 1 },
      { name: 'category', weight: 0.5 }
    ],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 2,
  }), [allDocs]);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    const searchResults = fuse.search(searchQuery);
    setResults(searchResults.map(result => result.item));
  }, [searchQuery, fuse]);

  const popularSearches = ['Mobile validation', 'Reputation system', 'User types', 'Profile questions'];

  const getStatusBadge = (status?: string) => {
    if (status === 'published') {
      return (
        <Badge variant="default" className="gap-1 ml-2">
          <span className="text-xs">●</span> Live
        </Badge>
      );
    }
    if (status === 'coming_soon') {
      return (
        <Badge variant="secondary" className="gap-1 ml-2">
          <span className="text-xs">○</span> Coming Soon
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <Card className="border-2 shadow-lg">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="What do you need help with?"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 h-14 text-lg"
            />
          </div>
        </CardContent>
      </Card>

      {!searchQuery && (
        <div className="flex flex-wrap gap-2 justify-center">
          <span className="text-sm text-muted-foreground">Popular:</span>
          {popularSearches.map((term) => (
            <Badge
              key={term}
              variant="secondary"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => onSearchChange(term)}
            >
              {term}
            </Badge>
          ))}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Found {results.length} result{results.length !== 1 ? 's' : ''}
          </p>
          <div className="grid gap-3">
            {results.map((doc) => (
              <Card 
                key={doc.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  if (doc.status === 'published') {
                    navigate(`/admin/knowledge/doc/${doc.id}`);
                  }
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        {doc.title}
                        {doc.audience === 'admin' && (
                          <Badge variant="outline" className="gap-1 ml-2 text-xs">
                            <Shield className="h-3 w-3" />
                            Admin Only
                          </Badge>
                        )}
                        {getStatusBadge(doc.status)}
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
                  {doc.status === 'coming_soon' && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      Documentation available soon
                    </p>
                  )}
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
