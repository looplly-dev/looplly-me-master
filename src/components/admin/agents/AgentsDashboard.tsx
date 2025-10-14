import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, DollarSign, Clock, AlertCircle, CheckCircle } from 'lucide-react';

export function AgentsDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['agent-dashboard-stats'],
    queryFn: async () => {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Get total agents and active count
      const { data: agents } = await supabase
        .from('ai_agents')
        .select('status');

      // Get 24h executions
      const { data: executions } = await supabase
        .from('agent_executions')
        .select('status, response_time_ms, api_cost_usd')
        .gte('created_at', twentyFourHoursAgo.toISOString());

      const totalAgents = agents?.length || 0;
      const activeAgents = agents?.filter(a => a.status === 'active').length || 0;
      const totalExecutions = executions?.length || 0;
      const successfulExecutions = executions?.filter(e => e.status === 'success').length || 0;
      const failedExecutions = executions?.filter(e => e.status === 'failure').length || 0;
      
      const avgResponseTime = executions?.length 
        ? Math.round(executions.reduce((sum, e) => sum + (e.response_time_ms || 0), 0) / executions.length)
        : 0;
      
      const totalCost = executions?.reduce((sum, e) => sum + (Number(e.api_cost_usd) || 0), 0) || 0;
      const successRate = totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 100;

      return {
        totalAgents,
        activeAgents,
        totalExecutions,
        successfulExecutions,
        failedExecutions,
        avgResponseTime,
        totalCost,
        successRate
      };
    },
    refetchInterval: 30000, // Refresh every 30s
  });

  const metrics = [
    {
      title: 'Active Agents',
      value: `${stats?.activeAgents || 0}/${stats?.totalAgents || 0}`,
      icon: Activity,
      color: 'text-blue-500',
    },
    {
      title: '24h Executions',
      value: stats?.totalExecutions || 0,
      icon: TrendingUp,
      color: 'text-green-500',
    },
    {
      title: 'Success Rate',
      value: `${stats?.successRate || 100}%`,
      icon: stats?.successRate && stats.successRate >= 95 ? CheckCircle : AlertCircle,
      color: stats?.successRate && stats.successRate >= 95 ? 'text-green-500' : 'text-yellow-500',
    },
    {
      title: 'Avg Response',
      value: `${stats?.avgResponseTime || 0}ms`,
      icon: Clock,
      color: 'text-purple-500',
    },
    {
      title: '24h Cost',
      value: `$${stats?.totalCost?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'text-orange-500',
    },
    {
      title: 'Failed',
      value: stats?.failedExecutions || 0,
      icon: AlertCircle,
      color: 'text-red-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-20" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <metric.icon className={`w-4 h-4 ${metric.color}`} />
              {metric.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
