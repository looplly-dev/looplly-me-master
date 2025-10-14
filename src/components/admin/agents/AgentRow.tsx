import { useState } from 'react';
import { 
  Brain, Shield, MessageSquare, Gift, Calculator, Users, 
  TrendingUp, UserPlus, Award, FileText, Anchor, Key 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAgentStats } from '@/hooks/useAgentStats';
import { MiniSparkline } from './MiniSparkline';
import { HealthIndicator } from './HealthIndicator';

const iconMap: Record<string, any> = {
  Brain, Shield, MessageSquare, Gift, Calculator, Users,
  TrendingUp, UserPlus, Award, FileText, Anchor, Key
};

const categoryColors: Record<string, string> = {
  Security: 'bg-red-500/10 text-red-500 border-red-500/20',
  Communication: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  Finance: 'bg-green-500/10 text-green-500 border-green-500/20',
  Analytics: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  Revenue: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  Growth: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  Engagement: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  Intelligence: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
};

const statusColors: Record<string, string> = {
  active: 'bg-green-500/10 text-green-500 border-green-500/20',
  inactive: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  testing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
};

interface Agent {
  id: string;
  name: string;
  slug: string;
  purpose: string;
  description: string;
  category: string;
  icon_name: string;
  status: 'active' | 'inactive' | 'testing';
  created_at: string;
  updated_at: string;
}

interface AgentRowProps {
  agent: Agent;
  onViewDetails?: (agent: Agent) => void;
}

export function AgentRow({ agent, onViewDetails }: AgentRowProps) {
  const Icon = iconMap[agent.icon_name] || Brain;
  const { data: stats, isLoading } = useAgentStats(agent.id);

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        {/* Icon & Name Section */}
        <div className="flex items-center gap-3 min-w-[280px]">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm truncate">{agent.name}</h3>
              <HealthIndicator successRate={stats?.successRate || 0} />
            </div>
            <p className="text-xs text-muted-foreground truncate">{agent.purpose}</p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex gap-2 min-w-[200px]">
          <Badge variant="outline" className={categoryColors[agent.category] || ''}>
            {agent.category}
          </Badge>
          <Badge variant="outline" className={statusColors[agent.status]}>
            {agent.status}
          </Badge>
        </div>

        {/* Metrics Grid */}
        <div className="flex-1 grid grid-cols-4 gap-4 min-w-[500px]">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">24h Executions</div>
            <div className="text-sm font-semibold">
              {isLoading ? '...' : stats?.executions24h || 0}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Success Rate</div>
            <div className="text-sm font-semibold">
              {isLoading ? '...' : `${stats?.successRate || 0}%`}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Avg Time</div>
            <div className="text-sm font-semibold">
              {isLoading ? '...' : `${stats?.avgTime || 0}ms`}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Cost 24h</div>
            <div className="text-sm font-semibold">
              {isLoading ? '...' : `$${stats?.cost24h?.toFixed(2) || '0.00'}`}
            </div>
          </div>
        </div>

        {/* Sparkline */}
        <div className="min-w-[100px]">
          <MiniSparkline data={stats?.trend || []} />
        </div>

        {/* Actions */}
        <div className="flex gap-2 min-w-[180px] justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onViewDetails?.(agent)}
          >
            View Details
          </Button>
          <Button variant="outline" size="sm">
            Configure
          </Button>
        </div>
      </div>
    </Card>
  );
}
