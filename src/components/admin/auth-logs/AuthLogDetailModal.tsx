import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { AuthLogEntry } from '@/hooks/useAuthLogs';
import { format } from 'date-fns';

interface AuthLogDetailModalProps {
  log: AuthLogEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthLogDetailModal({ log, open, onOpenChange }: AuthLogDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  if (!log) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(log.raw_data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Copied to clipboard',
      description: 'Log data copied as JSON',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Auth Log Details</span>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy JSON
                </>
              )}
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
              <p className="text-sm font-mono">
                {format(log.timestamp, 'yyyy-MM-dd HH:mm:ss.SSS')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Event Type</p>
              <Badge>{log.event_type}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                {log.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Source</p>
              <Badge variant="outline">{log.source}</Badge>
            </div>
          </div>

          {log.user_identifier && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">User Identifier</p>
              <p className="text-sm font-mono">{log.user_identifier}</p>
            </div>
          )}

          {log.method && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Method</p>
              <p className="text-sm">{log.method}</p>
            </div>
          )}

          {log.duration_ms && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Duration</p>
              <p className="text-sm">{log.duration_ms}ms</p>
            </div>
          )}

          {log.error_message && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Error Message</p>
              <p className="text-sm text-red-600 font-mono">{log.error_message}</p>
            </div>
          )}

          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Metadata</p>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Raw Data</p>
            <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
              {JSON.stringify(log.raw_data, null, 2)}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
