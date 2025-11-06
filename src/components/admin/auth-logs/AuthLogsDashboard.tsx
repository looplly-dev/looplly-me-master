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
  const [activeTab, setActiveTab] = useState('all');
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: logs = [], isLoading, refetch } = useAuthLogs({
    timeRange,
    eventType: eventType === 'all' ? undefined : eventType,
    userId: userId || undefined,
    status: status === 'all' ? undefined : status,
    autoRefresh,
  });

  // Filter logs by search term
  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      log.user_identifier?.toLowerCase().includes(search) ||
      log.method?.toLowerCase().includes(search) ||
      log.error_message?.toLowerCase().includes(search) ||
      JSON.stringify(log.metadata).toLowerCase().includes(search)
    );
  });

  // Filter logs by active tab
  const tabFilteredLogs = filteredLogs.filter(log => {
    if (activeTab === 'all') return true;
    return log.event_type === activeTab;
  });

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
      <AuthStatsCards timeRange={timeRange === 'custom' ? '24h' : timeRange} />

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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Events ({filteredLogs.length})</TabsTrigger>
          <TabsTrigger value="login">
            Logins ({filteredLogs.filter(l => l.event_type === 'login').length})
          </TabsTrigger>
          <TabsTrigger value="logout">
            Logouts ({filteredLogs.filter(l => l.event_type === 'logout').length})
          </TabsTrigger>
          <TabsTrigger value="error">
            Errors ({filteredLogs.filter(l => l.status === 'failed').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading auth logs...</p>
            </div>
          ) : (
            <AuthLogsList
              logs={tabFilteredLogs}
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
