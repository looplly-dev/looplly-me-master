import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AgentRow } from './AgentRow';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface AgentGridProps {
  searchQuery: string;
  categoryFilter: string;
  statusFilter: string;
  sortBy: string;
}

export function AgentGrid({ searchQuery, categoryFilter, statusFilter, sortBy }: AgentGridProps) {
  const { data: agents, isLoading } = useQuery({
    queryKey: ['ai-agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_agents')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const filteredAndSortedAgents = useMemo(() => {
    if (!agents) return [];

    let filtered = agents;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (agent) =>
          agent.name.toLowerCase().includes(query) ||
          agent.purpose.toLowerCase().includes(query) ||
          agent.description.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (categoryFilter && categoryFilter !== 'All Categories') {
      filtered = filtered.filter((agent) => agent.category === categoryFilter);
    }

    // Apply status filter
    if (statusFilter && statusFilter !== 'All Statuses') {
      filtered = filtered.filter((agent) => agent.status === statusFilter);
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [agents, searchQuery, categoryFilter, statusFilter, sortBy]);

  // Group agents by category
  const agentsByCategory = useMemo(() => {
    const grouped: Record<string, typeof filteredAndSortedAgents> = {};
    filteredAndSortedAgents.forEach((agent) => {
      if (!grouped[agent.category]) {
        grouped[agent.category] = [];
      }
      grouped[agent.category].push(agent);
    });
    return grouped;
  }, [filteredAndSortedAgents]);

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    Object.keys(agentsByCategory).reduce((acc, cat) => ({ ...acc, [cat]: true }), {})
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!agents || agents.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No AI agents configured yet.
      </div>
    );
  }

  if (filteredAndSortedAgents.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No agents match your filters.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(agentsByCategory).map(([category, categoryAgents]) => (
        <Collapsible
          key={category}
          open={openCategories[category]}
          onOpenChange={(open) =>
            setOpenCategories((prev) => ({ ...prev, [category]: open }))
          }
        >
          <CollapsibleTrigger className="flex items-center gap-2 mb-3 hover:text-primary transition-colors">
            {openCategories[category] ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
            <h2 className="text-lg font-semibold">
              {category} <span className="text-muted-foreground">({categoryAgents.length})</span>
            </h2>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3">
            {categoryAgents.map((agent) => (
              <AgentRow key={agent.id} agent={agent} />
            ))}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}
