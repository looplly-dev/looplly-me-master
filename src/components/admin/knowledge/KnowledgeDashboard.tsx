import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lightbulb, BookOpen, FileText, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import DocumentationSearch from './DocumentationSearch';
import QuickReference from './QuickReference';
import { documentationIndex } from '@/data/documentationIndex';

export default function KnowledgeDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'coming_soon'>('all');

  const categories = Array.from(new Set(documentationIndex.map(doc => doc.category)));
  const categoryCounts = categories.map(cat => {
    const categoryDocs = documentationIndex.filter(doc => doc.category === cat);
    return {
      category: cat,
      total: categoryDocs.length,
      published: categoryDocs.filter(doc => doc.status === 'published').length,
      comingSoon: categoryDocs.filter(doc => doc.status === 'coming_soon').length
    };
  });

  const totalPublished = documentationIndex.filter(doc => doc.status === 'published').length;
  const totalComingSoon = documentationIndex.filter(doc => doc.status === 'coming_soon').length;

  const categoryIcons: Record<string, any> = {
    'Core Systems': Sparkles,
    'Admin Guides': BookOpen,
    'Strategy': Lightbulb,
    'Technical Reference': FileText,
    'Profiling': BookOpen
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Knowledge Center</h1>
        <p className="text-muted-foreground text-lg">
          Find answers about how Looplly works
        </p>
        <div className="flex justify-center gap-2 text-sm text-muted-foreground">
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {totalPublished} Live
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            {totalComingSoon} Coming Soon
          </Badge>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <Tabs defaultValue="all" onValueChange={(value) => setStatusFilter(value as any)}>
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
          <TabsTrigger value="all">
            All ({documentationIndex.length})
          </TabsTrigger>
          <TabsTrigger value="published">
            Live ({totalPublished})
          </TabsTrigger>
          <TabsTrigger value="coming_soon">
            Coming Soon ({totalComingSoon})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Search Section */}
          <DocumentationSearch 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter="all"
          />

          {/* Categories Grid */}
          {!searchQuery && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {categoryCounts.map(({ category, total, published, comingSoon }) => {
                const IconComponent = categoryIcons[category] || FileText;
                return (
                  <Card 
                    key={category} 
                    className="hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => {
                      setSearchQuery(category);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <CardContent className="pt-6 text-center space-y-3">
                      <IconComponent className="h-12 w-12 mx-auto text-primary group-hover:scale-110 transition-transform" />
                      <div>
                        <h3 className="font-semibold text-lg">{category}</h3>
                        <div className="flex justify-center gap-2 mt-2 text-xs text-muted-foreground">
                          {published > 0 && (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                              {published}
                            </span>
                          )}
                          {comingSoon > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-yellow-600" />
                              {comingSoon}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="published" className="space-y-6">
          <DocumentationSearch 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter="published"
          />
        </TabsContent>

        <TabsContent value="coming_soon" className="space-y-6">
          <DocumentationSearch 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter="coming_soon"
          />
          
          {!searchQuery && (
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Coming Soon Documents</h3>
                    <p className="text-sm text-muted-foreground">
                      These documents are being prepared and will be available soon. 
                      They're organized and ready, just awaiting final review and publishing.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      {!searchQuery && <QuickReference />}

      {/* Help Footer */}
      <Card className="bg-muted/50 border-dashed">
        <CardContent className="pt-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Can't find what you're looking for?
          </p>
          <Button variant="outline" disabled>
            Report an Issue <span className="ml-2 text-xs">(coming soon)</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
