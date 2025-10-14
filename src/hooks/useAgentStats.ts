import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAgentStats(agentId: string) {
  return useQuery({
    queryKey: ['agent-stats', agentId],
    queryFn: async () => {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Get 24h executions
      const { data: executions24h } = await supabase
        .from('agent_executions')
        .select('status, response_time_ms, api_cost_usd, created_at')
        .eq('agent_id', agentId)
        .gte('created_at', twentyFourHoursAgo.toISOString());

      // Get 7-day trend data
      const { data: executions7d } = await supabase
        .from('agent_executions')
        .select('created_at, status')
        .eq('agent_id', agentId)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      const total24h = executions24h?.length || 0;
      const successful24h = executions24h?.filter(e => e.status === 'success').length || 0;
      const successRate = total24h > 0 ? Math.round((successful24h / total24h) * 100) : 100;
      
      const avgTime = executions24h?.length 
        ? Math.round(executions24h.reduce((sum, e) => sum + (e.response_time_ms || 0), 0) / executions24h.length)
        : 0;
      
      const cost24h = executions24h?.reduce((sum, e) => sum + (Number(e.api_cost_usd) || 0), 0) || 0;

      // Generate 7-day trend (daily execution counts)
      const trend: number[] = [];
      for (let i = 6; i >= 0; i--) {
        const dayStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
        const count = executions7d?.filter(e => {
          const execDate = new Date(e.created_at);
          return execDate >= dayStart && execDate < dayEnd;
        }).length || 0;
        trend.push(count);
      }

      return {
        executions24h: total24h,
        successRate,
        avgTime,
        cost24h,
        trend,
      };
    },
    refetchInterval: 60000, // Refresh every minute
  });
}
