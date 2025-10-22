import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, BookOpen, Search, FileText, Sparkles } from 'lucide-react';
import DocumentationSearch from './DocumentationSearch';
import QuickReference from './QuickReference';
import { documentationIndex } from '@/data/documentationIndex';

export default function KnowledgeDashboard() {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = Array.from(new Set(documentationIndex.map(doc => doc.category)));
  const categoryCounts = categories.map(cat => ({
    category: cat,
    count: documentationIndex.filter(doc => doc.category === cat).length
  }));

  const categoryIcons: Record<string, any> = {
    'Core Systems': Sparkles,
    'Admin Guides': BookOpen,
    'Strategy': Lightbulb,
    'Technical Reference': FileText
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Knowledge Center</h1>
        <p className="text-muted-foreground text-lg">
          Find answers about how Looplly works
        </p>
        <p className="text-sm text-muted-foreground">
          Search or browse by topic
        </p>
      </div>

      {/* Search Section - Hero */}
      <DocumentationSearch 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Categories Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {categoryCounts.map(({ category, count }) => {
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
                  <p className="text-sm text-muted-foreground">{count} documents</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <QuickReference />

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
