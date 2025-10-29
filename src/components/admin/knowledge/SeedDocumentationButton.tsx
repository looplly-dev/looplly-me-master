import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import matter from 'gray-matter';
import { useQueryClient } from '@tanstack/react-query';

export default function SeedDocumentationButton() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    stats?: { 
      total: number; 
      received_count?: number;
      fetched_count?: number;
      success: number; 
      failed: number;
    };
    errors?: string[];
  } | null>(null);
  const queryClient = useQueryClient();

  const handleSeed = async () => {
    setIsSeeding(true);
    setResult(null);

    try {
      // Step 1: Discover markdown files from BOTH /public/docs and /docs
      console.log('🔍 Discovering documentation files...');
      
      const publicDocsModules = import.meta.glob('/public/docs/**/*.md', { 
        as: 'raw',
        eager: true 
      });
      
      const projectDocsModules = import.meta.glob('/docs/**/*.md', { 
        as: 'raw',
        eager: true 
      });

      const publicCount = Object.keys(publicDocsModules).length;
      const projectCount = Object.keys(projectDocsModules).length;
      console.log(`✅ Found ${publicCount} files in /public/docs, ${projectCount} files in /docs`);

      const totalFiles = publicCount + projectCount;
      if (totalFiles === 0) {
        toast.error('No documentation files found');
        setIsSeeding(false);
        return;
      }

      // Step 2: Parse frontmatter and content using gray-matter
      console.log('📖 Parsing frontmatter and content...');
      
      const parseDoc = (path: string, content: string, source: 'public' | 'docs') => {
        try {
          const { data: frontmatter, content: body } = matter(content);
          
          // Generate ID from filename if not in frontmatter
          const filename = path.split('/').pop()?.replace('.md', '') || 'unknown';
          const id = frontmatter.id || filename.toLowerCase().replace(/_/g, '-');
          
          return {
            id,
            title: frontmatter.title || filename.replace(/_/g, ' '),
            content: body.trim(),
            category: frontmatter.category || 'Uncategorized',
            tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
            description: frontmatter.description || '',
            audience: frontmatter.audience || 'all',
            status: frontmatter.status || 'published',
            path: source === 'public' ? path.split('public')[1] || path : path,
            source
          };
        } catch (err) {
          console.error(`Failed to parse ${path}:`, err);
          return null;
        }
      };

      const publicDocs = Object.entries(publicDocsModules)
        .map(([path, content]) => parseDoc(path, content, 'public'))
        .filter(Boolean);
      
      const projectDocs = Object.entries(projectDocsModules)
        .map(([path, content]) => parseDoc(path, content, 'docs'))
        .filter(Boolean);

      // Step 3: Deduplicate by ID (prefer /docs over /public/docs)
      const docMap = new Map();
      
      // Add public docs first
      publicDocs.forEach(doc => {
        if (doc) docMap.set(doc.id, doc);
      });
      
      // Override with project docs (preferred source)
      projectDocs.forEach(doc => {
        if (doc) docMap.set(doc.id, doc);
      });

      const uniqueDocs = Array.from(docMap.values());
      console.log(`✅ Parsed ${uniqueDocs.length} unique documents (${publicDocs.length} from public, ${projectDocs.length} from docs, deduped)`);

      // Step 4: Send to edge function with action to fetch public docs via HTTP
      console.log('🚀 Seeding database...');
      const { data, error } = await supabase.functions.invoke('seed-documentation', {
        body: { 
          docs: uniqueDocs,
          action: 'http-fetch-index',
          baseUrl: window.location.origin
        }
      });

      if (error) {
        console.error('❌ Seeding failed:', error);
        toast.error('Seeding failed', {
          description: error.message
        });
        setResult({
          success: false,
          stats: { total: 0, success: 0, failed: 0 },
          errors: [error.message]
        });
        return;
      }

      console.log('✅ Seeding complete:', data);
      
      setResult(data);
      
      // Invalidate documentation stats query to refresh counters
      queryClient.invalidateQueries({ queryKey: ['documentation-stats'] });
      
      if (data.success && data.stats.failed === 0) {
        toast.success('Documentation seeded successfully!', {
          description: `${data.stats.success} documents added (${data.stats.received_count || 0} from project, ${data.stats.fetched_count || 0} fetched via HTTP)`
        });
      } else if (data.stats.success > 0) {
        toast.warning('Seeding completed with some errors', {
          description: `${data.stats.success} succeeded, ${data.stats.failed} failed`
        });
      } else {
        toast.error('Seeding failed', {
          description: `All ${data.stats.failed} documents failed to seed`
        });
      }
    } catch (err) {
      console.error('💥 Fatal error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast.error('Fatal error during seeding', {
        description: errorMessage
      });
      setResult({
        success: false,
        stats: { total: 0, success: 0, failed: 0 },
        errors: [errorMessage]
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Card className="border-dashed">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Seed Documentation Database
            </CardTitle>
            <CardDescription className="mt-1">
              Automatically discover project docs from /docs and fetch public docs via HTTP
            </CardDescription>
          </div>
          <Button 
            onClick={handleSeed} 
            disabled={isSeeding}
            size="lg"
          >
            {isSeeding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Seeding...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Seed Database
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {result && (
        <CardContent>
          <div className="space-y-4">
            {/* Status Banner */}
            <div className={`p-4 rounded-lg border ${
              result.success 
                ? 'bg-green-50 border-green-200 dark:bg-green-950/20' 
                : 'bg-red-50 border-red-200 dark:bg-red-950/20'
            }`}>
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-semibold">
                    {result.success ? 'Seeding Successful' : 'Seeding Failed'}
                  </p>
                  <p className="text-sm mt-1">{result.message}</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            {result.stats && (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <div className="text-2xl font-bold">{result.stats.total}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <div className="text-2xl font-bold text-blue-600">{result.stats.received_count || 0}</div>
                    <div className="text-xs text-muted-foreground">Received</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                    <div className="text-2xl font-bold text-purple-600">{result.stats.fetched_count || 0}</div>
                    <div className="text-xs text-muted-foreground">Fetched</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <div className="text-2xl font-bold text-green-600">{result.stats.success}</div>
                    <div className="text-xs text-muted-foreground">Seeded</div>
                  </div>
                </div>
                {result.stats.failed > 0 && (
                  <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
                    <div className="text-2xl font-bold text-red-600">{result.stats.failed}</div>
                    <div className="text-xs text-muted-foreground">Failed</div>
                  </div>
                )}
              </div>
            )}

            {/* Errors */}
            {result.errors && result.errors.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-red-600">Errors ({result.errors.length}):</p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {result.errors.map((error, idx) => (
                    <div key={idx} className="text-xs p-2 bg-red-50 dark:bg-red-950/20 rounded border border-red-200">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
