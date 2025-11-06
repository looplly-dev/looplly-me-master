import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, X, Download, RefreshCw } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface AuthLogFiltersProps {
  timeRange: string;
  onTimeRangeChange: (value: string) => void;
  eventType: string;
  onEventTypeChange: (value: string) => void;
  userId: string;
  onUserIdChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  autoRefresh: boolean;
  onAutoRefreshChange: (value: boolean) => void;
  onClear: () => void;
  onExport: () => void;
  onRefresh: () => void;
}

export function AuthLogFilters({
  timeRange,
  onTimeRangeChange,
  eventType,
  onEventTypeChange,
  userId,
  onUserIdChange,
  status,
  onStatusChange,
  searchTerm,
  onSearchChange,
  autoRefresh,
  onAutoRefreshChange,
  onClear,
  onExport,
  onRefresh,
}: AuthLogFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-5">
        <div className="space-y-2">
          <Label>Time Range</Label>
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Event Type</Label>
          <Select value={eventType} onValueChange={onEventTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="logout">Logout</SelectItem>
              <SelectItem value="register">Register</SelectItem>
              <SelectItem value="token">Token</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>User ID / Mobile</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search user..."
              value={userId}
              onChange={(e) => onUserIdChange(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Search Logs</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={onAutoRefreshChange}
            />
            <Label htmlFor="auto-refresh" className="cursor-pointer">
              Auto-Refresh
            </Label>
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Now
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onClear}>
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>
    </div>
  );
}
