import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuthStatsCards } from './AuthStatsCards';
import { AuthLogFilters } from './AuthLogFilters';
import { AuthLogsList } from './AuthLogsList';
import { AuthLogDetailModal } from './AuthLogDetailModal';
import { useAuthLogs, type AuthLogEntry, type TimeRange } from '@/hooks/useAuthLogs';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export function AuthLogsDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [eventType, setEventType] = useState('all');
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuthLogEntry | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [portalFilter, setPortalFilter] = useState<'all' | 'user' | 'admin'>('all');
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: logs = [], isLoading, refetch } = useAuthLogs({
    timeRange,
    eventType: eventType === 'all' ? undefined : eventType,
    userId: userId || undefined,
    status: status === 'all' ? undefined : status,
    portal: portalFilter,
    autoRefresh,
  });

  // Filter logs by search term
  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      log.user_identifier?.toLowerCase().includes(search) ||
      log.mobile?.includes(search) ||
      log.method?.toLowerCase().includes(search) ||
      log.error_message?.toLowerCase().includes(search) ||
      JSON.stringify(log.metadata).toLowerCase().includes(search)
    );
  });

  // Calculate counts for tabs
  const allCount = filteredLogs.length;
  const userPortalCount = filteredLogs.filter(l => l.portal === 'user').length;
  const adminPortalCount = filteredLogs.filter(l => l.portal === 'admin').length;

  const handleClearFilters = () => {
    setEventType('all');
    setUserId('');
    setStatus('all');
    setSearchTerm('');
  };

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'Event Type', 'Status', 'User', 'Method', 'Duration', 'Error'].join(','),
      ...filteredLogs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.event_type,
        log.status,
        log.user_identifier || '',
        log.method || '',
        log.duration_ms || '',
        log.error_message || '',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auth-logs-${Date.now()}.csv`;
    a.click();
    
    toast({
      title: 'Export Complete',
      description: `Exported ${filteredLogs.length} log entries`,
    });
  };

  const handleViewDetails = (log: AuthLogEntry) => {
    setSelectedLog(log);
    setDetailModalOpen(true);
  };

  const handleViewUser = (userId: string) => {
    if (userId) {
      navigate(`/admin/users?search=${userId}`);
    }
  };

  return (
    <div className="space-y-6">
      <AuthStatsCards 
        timeRange={timeRange === 'custom' ? '24h' : timeRange} 
        portal={portalFilter}
      />

      <AuthLogFilters
        timeRange={timeRange}
        onTimeRangeChange={(value) => setTimeRange(value as TimeRange)}
        eventType={eventType}
        onEventTypeChange={setEventType}
        userId={userId}
        onUserIdChange={setUserId}
        status={status}
        onStatusChange={setStatus}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        autoRefresh={autoRefresh}
        onAutoRefreshChange={setAutoRefresh}
        onClear={handleClearFilters}
        onExport={handleExport}
        onRefresh={() => refetch()}
      />

      <Tabs value={portalFilter} onValueChange={(value) => setPortalFilter(value as 'all' | 'user' | 'admin')}>
        <TabsList>
          <TabsTrigger value="all">
            All Portals ({allCount})
          </TabsTrigger>
          <TabsTrigger value="user">
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            User Portal ({userPortalCount})
          </TabsTrigger>
          <TabsTrigger value="admin">
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Admin Portal ({adminPortalCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={portalFilter} className="mt-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading auth logs...</p>
            </div>
          ) : (
            <AuthLogsList
              logs={filteredLogs}
              onViewDetails={handleViewDetails}
              onViewUser={handleViewUser}
            />
          )}
        </TabsContent>
      </Tabs>

      <AuthLogDetailModal
        log={selectedLog}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />
    </div>
  );
}
