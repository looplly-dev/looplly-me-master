import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Clock, RotateCcw, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface VersionHistoryProps {
  docId: string;
  currentVersion: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestore?: () => void;
}

interface HistoryVersion {
  id: string;
  version: number;
  title: string;
  content: string;
  changed_by: string | null;
  change_summary: string | null;
  created_at: string;
}

export default function VersionHistory({ 
  docId, 
  currentVersion, 
  open, 
  onOpenChange,
  onRestore 
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<HistoryVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<HistoryVersion | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    if (open) {
      loadVersionHistory();
    }
  }, [open, docId]);

  const loadVersionHistory = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('documentation_history' as any)
        .select('*')
        .eq('doc_id', docId)
        .order('version', { ascending: false });

      if (error) throw error;
      setVersions((data as any) || []);
    } catch (error) {
      console.error('Error loading version history:', error);
      toast.error('Failed to load version history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (version: HistoryVersion) => {
    if (!confirm(`Restore to version ${version.version}? This will create a new version with this content.`)) {
      return;
    }

    try {
      setIsRestoring(true);
      
      // Update the main documentation table with the old content
      const { error } = await supabase
        .from('documentation')
        .update({
          content: version.content,
          title: version.title,
          changed_by: (await supabase.auth.getUser()).data.user?.id,
          change_summary: `Restored from version ${version.version}`,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', docId);

      if (error) throw error;

      toast.success(`Restored to version ${version.version}`);
      onOpenChange(false);
      if (onRestore) onRestore();
    } catch (error) {
      console.error('Error restoring version:', error);
      toast.error('Failed to restore version');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Version History
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No version history available
            </div>
          ) : (
            <div className="space-y-4">
              {versions.map((version, index) => (
                <div key={version.id} className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={version.version === currentVersion ? 'default' : 'outline'}>
                          v{version.version}
                        </Badge>
                        {version.version === currentVersion && (
                          <Badge variant="secondary">Current</Badge>
                        )}
                      </div>
                      
                      <p className="text-sm font-medium">{version.title}</p>
                      
                      {version.change_summary && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {version.change_summary}
                        </p>
                      )}
                      
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(version.created_at), 'PPp')}
                      </p>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedVersion(
                          selectedVersion?.id === version.id ? null : version
                        )}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {version.version !== currentVersion && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRestore(version)}
                          disabled={isRestoring}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {selectedVersion?.id === version.id && (
                    <div className="bg-muted/50 p-3 rounded-md">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap text-xs">
                          {version.content.substring(0, 500)}
                          {version.content.length > 500 && '...'}
                        </pre>
                      </div>
                    </div>
                  )}

                  {index < versions.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
