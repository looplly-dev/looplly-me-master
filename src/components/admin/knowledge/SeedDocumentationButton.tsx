import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function SeedDocumentationButton() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    stats?: { total: number; success: number; failed: number };
    errors?: string[];
  } | null>(null);

  const handleSeed = async () => {
    setIsSeeding(true);
    setResult(null);

    try {
      // Dynamic discovery: use Vite's import.meta.glob to find all .md files
      const modules = import.meta.glob('/public/docs/**/*.md', { as: 'raw', eager: false });
      const paths = Object.keys(modules);
      
      console.log(`📁 Discovered ${paths.length} documentation files`);

      // Fetch and parse all markdown files in parallel
      const fetched = await Promise.all(
        paths.map(async (path) => {
          try {
            const loadContent = modules[path];
            const content = await loadContent();
            
            // Extract metadata from filename and path
            const filename = path.split('/').pop()?.replace('.md', '') || '';
            const id = filename.toLowerCase().replace(/_/g, '-');
            
            // Parse basic frontmatter if present (simple parser for now)
            const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
            let metadata: any = {};
            
            if (frontmatterMatch) {
              const yamlContent = frontmatterMatch[1];
              const lines = yamlContent.split('\n');
              lines.forEach(line => {
                const match = line.match(/^(\w+):\s*(.+)$/);
                if (match) {
                  const [, key, value] = match;
                  metadata[key] = value.replace(/^["']|["']$/g, '');
                }
              });
            }
            
            // Build document object
            return {
              id: metadata.id || id,
              title: metadata.title || filename.replace(/_/g, ' '),
              content: content,
              category: metadata.category || 'Core Systems',
              tags: metadata.tags ? metadata.tags.split(',').map((t: string) => t.trim()) : [],
              description: metadata.description || '',
              audience: metadata.audience || 'all',
              status: metadata.status || 'published',
              path: path.replace('/public', '')
            };
          } catch (e: any) {
            console.error(`Failed to load ${path}:`, e);
            return { __error: `Failed to load: ${path}` };
          }
        })
      );

      const docs = fetched.filter((d: any) => !d.__error);
      const fileErrors = fetched.filter((d: any) => d.__error).map((d: any) => d.__error as string);

      console.log(`✅ Parsed ${docs.length} documents successfully`);

      // Send to edge function for seeding
      const { data, error } = await supabase.functions.invoke('seed-documentation', {
        body: { docs, action: 'manual-seed' }
      });

      if (error) throw error;

      // Merge errors
      const merged = {
        ...data,
        errors: [...(data?.errors || []), ...fileErrors],
        stats: {
          total: paths.length,
          success: data?.stats?.success || 0,
          failed: (data?.stats?.failed || 0) + fileErrors.length
        }
      };

      setResult(merged);

      if (merged.success && merged.stats.failed === 0) {
        toast.success(`Successfully seeded ${merged.stats.success} documents!`);
      } else if (merged.success) {
        toast.success(`Seeded ${merged.stats.success} docs with ${merged.stats.failed} errors`);
      } else {
        toast.error('Seeding completed with some errors');
      }
    } catch (error: any) {
      console.error('Seeding error:', error);
      toast.error('Failed to seed documentation');
      setResult({
        success: false,
        message: error.message
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
              Automatically discover and seed all documentation files
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
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted">
                  <div className="text-2xl font-bold">{result.stats.total}</div>
                  <div className="text-xs text-muted-foreground">Total Docs</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                  <div className="text-2xl font-bold text-green-600">{result.stats.success}</div>
                  <div className="text-xs text-muted-foreground">Seeded</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
                  <div className="text-2xl font-bold text-red-600">{result.stats.failed}</div>
                  <div className="text-xs text-muted-foreground">Failed</div>
                </div>
              </div>
            )}

            {/* Wave Breakdown */}
            {result.success && (
              <div className="space-y-2">
                <p className="text-sm font-semibold">Documents Seeded:</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    7 Published (Wave 1)
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    ○ 33 Coming Soon (Waves 2 & 3)
                  </Badge>
                </div>
              </div>
            )}

            {/* Errors */}
            {result.errors && result.errors.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-red-600">Errors:</p>
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
