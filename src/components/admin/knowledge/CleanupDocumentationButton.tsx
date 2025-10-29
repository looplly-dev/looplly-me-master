import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function CleanupDocumentationButton() {
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    deletedCount?: number;
    verification?: {
      comingSoonRemaining: number;
      uncategorizedRemaining: number;
    };
    error?: string;
  } | null>(null);
  const queryClient = useQueryClient();

  const handleCleanup = async () => {
    setIsCleaningUp(true);
    setResult(null);

    try {
      console.log('🗑️ Starting documentation cleanup...');
      
      const { data, error } = await supabase.functions.invoke('cleanup-documentation');

      if (error) {
        console.error('❌ Cleanup failed:', error);
        toast.error('Cleanup failed', {
          description: error.message
        });
        setResult({
          success: false,
          error: error.message
        });
        return;
      }

      console.log('✅ Cleanup complete:', data);
      
      setResult(data);
      
      // Invalidate documentation stats query to refresh counters
      queryClient.invalidateQueries({ queryKey: ['documentation-stats'] });
      
      if (data.success) {
        toast.success('Legacy documents cleaned up!', {
          description: `${data.deletedCount} legacy documents removed. Now re-seed to complete the process.`
        });
      } else {
        toast.error('Cleanup failed', {
          description: data.error || 'Unknown error occurred'
        });
      }
    } catch (err) {
      console.error('💥 Fatal error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast.error('Fatal error during cleanup', {
        description: errorMessage
      });
      setResult({
        success: false,
        error: errorMessage
      });
    } finally {
      setIsCleaningUp(false);
    }
  };

  return (
    <Card className="border-dashed border-destructive/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Clean Up Legacy Documents
            </CardTitle>
            <CardDescription className="mt-1">
              Removes 20 legacy/duplicate documents (17 "Coming Soon" + 3 "Uncategorized")
            </CardDescription>
          </div>
          <Button 
            onClick={handleCleanup} 
            disabled={isCleaningUp}
            variant="destructive"
            size="lg"
          >
            {isCleaningUp ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Cleaning...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Clean Up
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
                    {result.success ? 'Cleanup Successful' : 'Cleanup Failed'}
                  </p>
                  <p className="text-sm mt-1">{result.message || result.error}</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            {result.success && result.deletedCount !== undefined && (
              <div className="space-y-4">
                <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                  <div className="text-3xl font-bold text-green-600">{result.deletedCount}</div>
                  <div className="text-sm text-muted-foreground">Legacy Documents Deleted</div>
                </div>

                {result.verification && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <div className="text-xl font-bold">{result.verification.comingSoonRemaining}</div>
                      <div className="text-xs text-muted-foreground">Coming Soon Remaining</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <div className="text-xl font-bold">{result.verification.uncategorizedRemaining}</div>
                      <div className="text-xs text-muted-foreground">Uncategorized Remaining</div>
                    </div>
                  </div>
                )}

                <div className="text-sm text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
                  <p className="font-semibold text-blue-700 dark:text-blue-300">Next Step:</p>
                  <p className="text-muted-foreground">Click "Seed Database" above to re-import all updated documents</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
