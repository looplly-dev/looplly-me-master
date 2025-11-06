import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AuthLogEntry {
  id: string;
  timestamp: number;
  event_type: 'login' | 'logout' | 'register' | 'token' | 'error';
  status: 'success' | 'failed' | 'pending';
  user_identifier?: string;
  mobile?: string;
  portal?: 'user' | 'admin';
  method?: string;
  duration_ms?: number;
  error_message?: string;
  metadata?: Record<string, any>;
  source: 'supabase' | 'edge_function' | 'audit' | 'database';
  raw_data?: any;
}

export type TimeRange = '1h' | '24h' | '7d' | 'custom';

interface UseAuthLogsOptions {
  timeRange?: TimeRange;
  eventType?: string;
  userId?: string;
  status?: string;
  portal?: 'user' | 'admin' | 'all';
  autoRefresh?: boolean;
  refreshInterval?: number;
}

// Helper function to detect portal from username
function detectPortal(username?: string, method?: string): 'user' | 'admin' {
  if (username?.includes('@looplly.mobile') || method?.includes('mock-looplly-login')) {
    return 'user';
  }
  return 'admin';
}

// Helper function to extract mobile from username or edge logs
function extractMobile(username?: string, rawData?: any): string | undefined {
  // From edge function log: "[MOCK LOGIN] Login successful for: +27828543494"
  if (rawData && typeof rawData === 'string') {
    const match = rawData.match(/for: (\+\d+)/);
    if (match) return match[1];
  }
  // Mobile number might be in username format
  if (username?.includes('@looplly.mobile')) {
    // Username format is UUID@looplly.mobile, we need to get mobile from profiles
    return undefined;
  }
  return username?.startsWith('+') ? username : undefined;
}

export function useAuthLogs(options: UseAuthLogsOptions = {}) {
  const {
    timeRange = '24h',
    eventType,
    userId,
    status,
    portal = 'all',
    autoRefresh = true,
    refreshInterval = 10000,
  } = options;

  return useQuery({
    queryKey: ['auth-logs', timeRange, eventType, userId, status, portal],
    queryFn: async () => {
      const logs: AuthLogEntry[] = [];

      // Calculate time threshold
      const hours = timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 24;
      const threshold = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

      // 1. Fetch Supabase Auth Logs from provided context
      try {
        const authLogsData = (window as any).__AUTH_LOGS__;
        if (authLogsData && Array.isArray(authLogsData)) {
          authLogsData.forEach((logEntry: any) => {
            try {
              const eventData = typeof logEntry.event_message === 'string' 
                ? JSON.parse(logEntry.event_message) 
                : logEntry.event_message;

              if (eventData.auth_event) {
                const { action, actor_username, actor_id } = eventData.auth_event;
                const logStatus = eventData.status || logEntry.status;
                
                logs.push({
                  id: logEntry.id,
                  timestamp: logEntry.timestamp / 1000,
                  event_type: action === 'login' ? 'login' : action === 'logout' ? 'logout' : 'token',
                  status: (logStatus === 200 || logStatus === 204 || logStatus === '200' || logStatus === '204') ? 'success' : 'failed',
                  user_identifier: actor_username,
                  portal: detectPortal(actor_username),
                  mobile: extractMobile(actor_username),
                  duration_ms: eventData.duration ? Math.round(eventData.duration / 1000) : undefined,
                  method: eventData.grant_type || 'password',
                  source: 'supabase',
                  raw_data: eventData,
                });
              } else if (eventData.action === 'login' || eventData.action === 'Login') {
                logs.push({
                  id: logEntry.id,
                  timestamp: logEntry.timestamp / 1000,
                  event_type: 'login',
                  status: 'success',
                  user_identifier: eventData.user_id,
                  portal: detectPortal(eventData.provider),
                  method: eventData.login_method || eventData.provider,
                  source: 'supabase',
                  raw_data: eventData,
                });
              }
            } catch (parseError) {
              console.error('Error parsing auth log:', parseError);
            }
          });
        }
      } catch (error) {
        console.error('Error fetching supabase auth logs:', error);
      }

      // 2. Fetch Edge Function Logs for mock-looplly-login
      try {
        const edgeFunctionLogsData = (window as any).__EDGE_FUNCTION_LOGS__;
        if (edgeFunctionLogsData && Array.isArray(edgeFunctionLogsData)) {
          edgeFunctionLogsData.forEach((logEntry: any) => {
            if (logEntry.event_message && typeof logEntry.event_message === 'string') {
              // Match: "[MOCK LOGIN] Login successful for: +27828543494"
              const loginMatch = logEntry.event_message.match(/Login (successful|failed) for: (\+\d+)/);
              
              if (loginMatch) {
                const mobile = loginMatch[2];
                logs.push({
                  id: `edge-${logEntry.timestamp}`,
                  timestamp: logEntry.timestamp / 1000,
                  event_type: 'login',
                  status: loginMatch[1] === 'successful' ? 'success' : 'failed',
                  user_identifier: mobile,
                  mobile: mobile,
                  portal: 'user',
                  method: 'mock-looplly-login',
                  source: 'edge_function',
                  raw_data: logEntry.event_message,
                });
              }
            }
          });
        }
      } catch (error) {
        console.error('Error fetching edge function logs:', error);
      }

      // 3. Fetch audit logs
      try {
        const { data: auditLogs, error } = await supabase
          .from('audit_logs')
          .select('*')
          .or('action.ilike.%auth%,action.ilike.%login%,action.ilike.%logout%')
          .gte('created_at', threshold)
          .order('created_at', { ascending: false })
          .limit(100);

        if (auditLogs && !error) {
          auditLogs.forEach((log) => {
            const action = log.action?.toLowerCase() || '';
            const metadata = log.metadata as Record<string, any> | null;
            const identifier = (metadata?.mobile as string) || (metadata?.email as string);
            
            logs.push({
              id: `audit-${log.id}`,
              timestamp: new Date(log.created_at).getTime(),
              event_type: action.includes('login') ? 'login' : action.includes('logout') ? 'logout' : 'token',
              status: 'success',
              user_identifier: identifier,
              mobile: extractMobile(identifier),
              portal: detectPortal(identifier, metadata?.method as string),
              method: (metadata?.method as string) || 'unknown',
              metadata: metadata || undefined,
              source: 'audit',
              raw_data: log,
            });
          });
        }
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      }

      // Sort by timestamp descending and deduplicate
      logs.sort((a, b) => b.timestamp - a.timestamp);

      // Deduplicate by timestamp + user (keep most detailed entry)
      const uniqueLogs = logs.reduce((acc, log) => {
        const key = `${Math.floor(log.timestamp / 1000)}-${log.user_identifier}`;
        if (!acc.has(key) || (log.source === 'edge_function' && acc.get(key)?.source !== 'edge_function')) {
          acc.set(key, log);
        }
        return acc;
      }, new Map<string, AuthLogEntry>());

      let filtered = Array.from(uniqueLogs.values());

      // Apply filters
      if (portal !== 'all') {
        filtered = filtered.filter(log => log.portal === portal);
      }
      if (eventType) {
        filtered = filtered.filter(log => log.event_type === eventType);
      }
      if (userId) {
        filtered = filtered.filter(log => 
          log.user_identifier?.includes(userId) || 
          log.mobile?.includes(userId) ||
          log.raw_data?.user_id === userId
        );
      }
      if (status) {
        filtered = filtered.filter(log => log.status === status);
      }

      return filtered.sort((a, b) => b.timestamp - a.timestamp);
    },
    refetchInterval: autoRefresh ? refreshInterval : false,
  });
}
