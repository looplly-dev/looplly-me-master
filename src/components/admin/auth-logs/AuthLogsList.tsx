import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock, Eye, User } from 'lucide-react';
import type { AuthLogEntry } from '@/hooks/useAuthLogs';
import { format } from 'date-fns';

interface AuthLogsListProps {
  logs: AuthLogEntry[];
  onViewDetails: (log: AuthLogEntry) => void;
  onViewUser?: (userId: string) => void;
}

export function AuthLogsList({ logs, onViewDetails, onViewUser }: AuthLogsListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-amber-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="secondary" className="bg-green-500/20 text-green-700">Success</Badge>;
      case 'failed':
        return <Badge variant="secondary" className="bg-red-500/20 text-red-700">Failed</Badge>;
      default:
        return <Badge variant="secondary" className="bg-amber-500/20 text-amber-700">Pending</Badge>;
    }
  };

  const getEventTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No authentication logs found for the selected filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div
          key={log.id}
          className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="mt-1">
                {getStatusIcon(log.status)}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">
                    {format(log.timestamp, 'HH:mm:ss')}
                  </span>
                  <span className="text-muted-foreground">|</span>
                  <span className="font-semibold">
                    {getEventTypeLabel(log.event_type)}
                  </span>
                  {getStatusBadge(log.status)}
                  <Badge variant="outline" className="text-xs">
                    {log.source}
                  </Badge>
                </div>
                
                {log.user_identifier && (
                  <p className="text-sm text-muted-foreground">
                    User: <span className="font-mono">{log.user_identifier}</span>
                  </p>
                )}
                
                {log.method && (
                  <p className="text-sm text-muted-foreground">
                    Method: {log.method}
                  </p>
                )}
                
                {log.duration_ms && (
                  <p className="text-sm text-muted-foreground">
                    Duration: {log.duration_ms}ms
                  </p>
                )}
                
                {log.error_message && (
                  <p className="text-sm text-red-600 font-mono">
                    Error: {log.error_message}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(log)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Details
              </Button>
              {log.user_identifier && onViewUser && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewUser(log.raw_data?.user_id)}
                >
                  <User className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
