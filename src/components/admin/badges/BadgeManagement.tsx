import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BadgeGrid } from './BadgeGrid';
import { BadgeForm } from './BadgeForm';
import { useBadgeService, Badge } from '@/hooks/useBadgeService';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

export function BadgeManagement() {
  const { listBadges } = useBadgeService();
  const [activeTab, setActiveTab] = useState('all');
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);

  const { data: badges, isLoading, refetch } = useQuery({
    queryKey: ['badges', 'all'],
    queryFn: () => listBadges(false), // Get all badges including inactive
  });

  const activeBadges = badges?.filter(b => b.is_active) || [];
  const inactiveBadges = badges?.filter(b => !b.is_active) || [];

  // Listen for edit badge events
  useEffect(() => {
    const handleEdit = (e: CustomEvent) => {
      setEditingBadge(e.detail);
      setActiveTab('create');
    };
    window.addEventListener('edit-badge' as any, handleEdit);
    return () => window.removeEventListener('edit-badge' as any, handleEdit);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Badge Management</h1>
        <p className="text-muted-foreground">
          Manage badge catalog, create new badges, and control visibility
        </p>
        <div className="flex gap-4 text-sm">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            {activeBadges.length} Active (visible to users)
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            {inactiveBadges.length} Inactive (hidden)
          </span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            All Badges ({badges?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({activeBadges.length})
          </TabsTrigger>
          <TabsTrigger value="inactive">
            Inactive ({inactiveBadges.length})
          </TabsTrigger>
          <TabsTrigger value="create" onClick={() => setEditingBadge(null)}>
            + Create New
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <BadgeGrid badges={badges || []} onUpdate={refetch} showAll />
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✓ These badges are <strong>LIVE</strong> and visible to users on their dashboards
            </p>
          </div>
          <BadgeGrid badges={activeBadges} onUpdate={refetch} />
        </TabsContent>

        <TabsContent value="inactive" className="mt-6">
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
            <p className="text-sm text-muted-foreground">
              These badges are <strong>NOT visible</strong> to users (drafts or deactivated)
            </p>
          </div>
          <BadgeGrid badges={inactiveBadges} onUpdate={refetch} />
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <BadgeForm 
            badge={editingBadge || undefined}
            onSuccess={() => {
              refetch();
              setEditingBadge(null);
              setActiveTab('all');
            }} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
