import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AuthStats {
  successCount: number;
  failedCount: number;
  activeSessionsCount: number;
  errorCount: number;
  successRate: number;
}

export function useAuthStats(timeRange: '1h' | '24h' | '7d' = '24h') {
  return useQuery({
    queryKey: ['auth-stats', timeRange],
    queryFn: async (): Promise<AuthStats> => {
      const hours = timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : 168;
      const threshold = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

      let successCount = 0;
      let failedCount = 0;
      let errorCount = 0;

      // Fetch auth-related audit logs for stats
      try {
        const { data: auditLogs, error } = await supabase
          .from('audit_logs')
          .select('action, metadata')
          .or('action.ilike.%auth%,action.ilike.%login%,action.ilike.%logout%')
          .gte('created_at', threshold);

        if (auditLogs && !error) {
          auditLogs.forEach((log) => {
            const action = log.action?.toLowerCase() || '';
            if (action.includes('login') || action.includes('success')) {
              successCount++;
            } else if (action.includes('error') || action.includes('failed')) {
              failedCount++;
              errorCount++;
            }
          });
        }
      } catch (error) {
        console.error('Error fetching auth stats:', error);
      }

      // Fetch active sessions count (simplified)
      const { count: activeSessionsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_verified', true);

      const total = successCount + failedCount;
      const successRate = total > 0 ? (successCount / total) * 100 : 0;

      return {
        successCount,
        failedCount,
        activeSessionsCount: activeSessionsCount || 0,
        errorCount,
        successRate: Math.round(successRate),
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
