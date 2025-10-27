import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lightbulb, BookOpen, FileText, Sparkles, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import DocumentationSearch from './DocumentationSearch';
import QuickReference from './QuickReference';
import SeedDocumentationButton from './SeedDocumentationButton';
import QuickStartGuides from './QuickStartGuides';
import RecommendationsPanel from './RecommendationsPanel';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';
import CategoryCard from './CategoryCard';
import { useRole } from '@/hooks/useRole';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { useDocumentationStats } from '@/hooks/useDocumentationStats';
import { supabase } from '@/integrations/supabase/client';

export default function KnowledgeDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'coming_soon'>('all');
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const { isAdmin } = useRole();
  const { addSearch } = useSearchHistory();
  const { data: stats, isLoading } = useDocumentationStats();

  useKeyboardShortcuts([
    { key: '?', callback: () => setShowShortcutsHelp(true) },
    { key: '/', callback: () => document.querySelector<HTMLInputElement>('input[type="text"]')?.focus() }
  ]);

  const totalPublished = stats?.published || 0;
  const totalComingSoon = stats?.comingSoon || 0;
  const categoryCounts = stats?.categoryStats || [];

  const categoryIcons: Record<string, any> = {
    'Core Systems': Sparkles,
    'Admin Guides': BookOpen,
    'Strategy': Lightbulb,
    'Technical Reference': FileText,
    'Profiling': BookOpen
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
            All ({stats?.total || 0})
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

          {/* Quick Start Guides */}
          {!searchQuery && <QuickStartGuides />}

          {/* Recommendations */}
          {!searchQuery && <RecommendationsPanel />}

          {/* Categories Grid */}
          {!searchQuery && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {categoryCounts.map(({ category, total, published, comingSoon }) => {
                const IconComponent = categoryIcons[category] || FileText;
                return (
                  <CategoryCard
                    key={category}
                    category={category}
                    total={total}
                    published={published}
                    comingSoon={comingSoon}
                    icon={IconComponent}
                    topDocs={[]}
                    onClick={() => {
                      setSearchQuery(category);
                      addSearch(category);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
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

      {/* Admin Seeding Tool */}
      {isAdmin && !searchQuery && (
        <SeedDocumentationButton />
      )}

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

      <KeyboardShortcutsHelp open={showShortcutsHelp} onClose={() => setShowShortcutsHelp(false)} />
    </div>
  );
}
