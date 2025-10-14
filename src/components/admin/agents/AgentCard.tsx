import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, TrendingUp, Activity } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface AgentCardProps {
  agent: Agent;
}

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
  active: 'bg-green-500/10 text-green-600 border-green-500/20',
  inactive: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  testing: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
};

export function AgentCard({ agent }: AgentCardProps) {
  const IconComponent = (LucideIcons as any)[agent.icon_name] || LucideIcons.Bot;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <IconComponent className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{agent.name}</CardTitle>
              <CardDescription className="text-xs">{agent.purpose}</CardDescription>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 mt-3">
          <Badge variant="outline" className={cn('text-xs', categoryColors[agent.category])}>
            {agent.category}
          </Badge>
          <Badge variant="outline" className={cn('text-xs', statusColors[agent.status])}>
            {agent.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {agent.description}
        </p>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-bold">0</div>
            <div className="text-xs text-muted-foreground">Executions</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">-</div>
            <div className="text-xs text-muted-foreground">Success</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">-</div>
            <div className="text-xs text-muted-foreground">Avg Time</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Activity className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Settings className="h-3 w-3 mr-1" />
            Configure
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
