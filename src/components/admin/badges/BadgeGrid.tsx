import { Badge } from '@/hooks/useBadgeService';
import { BadgeCard } from './BadgeCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Search } from 'lucide-react';

interface BadgeGridProps {
  badges: Badge[];
  onUpdate: () => void;
  showAll?: boolean;
}

export function BadgeGrid({ badges, onUpdate, showAll = false }: BadgeGridProps) {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const tierOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
  
  const filteredBadges = badges
    .filter(badge => {
      const matchesSearch = badge.name.toLowerCase().includes(search.toLowerCase()) ||
                           badge.description?.toLowerCase().includes(search.toLowerCase());
      const matchesTier = tierFilter === 'all' || badge.tier === tierFilter;
      const matchesCategory = categoryFilter === 'all' || badge.category === categoryFilter;
      
      return matchesSearch && matchesTier && matchesCategory;
    })
    .sort((a, b) => {
      const tierA = tierOrder.indexOf(a.tier || 'bronze');
      const tierB = tierOrder.indexOf(b.tier || 'bronze');
      return tierA - tierB;
    });

  const tierCounts = badges.reduce((acc, badge) => {
    const tier = badge.tier || 'bronze';
    acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (badges.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No badges found. Create your first badge!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search badges..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers ({badges.length})</SelectItem>
            <SelectItem value="bronze">🥉 Bronze ({tierCounts['bronze'] || 0})</SelectItem>
            <SelectItem value="silver">🥈 Silver ({tierCounts['silver'] || 0})</SelectItem>
            <SelectItem value="gold">🥇 Gold ({tierCounts['gold'] || 0})</SelectItem>
            <SelectItem value="platinum">💎 Platinum ({tierCounts['platinum'] || 0})</SelectItem>
            <SelectItem value="diamond">💠 Diamond ({tierCounts['diamond'] || 0})</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="social">👥 Social</SelectItem>
            <SelectItem value="speed">⚡ Speed</SelectItem>
            <SelectItem value="perfection">✨ Perfection</SelectItem>
            <SelectItem value="exploration">🔍 Exploration</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tier Header when filtering */}
      {tierFilter !== 'all' && (
        <div className="bg-muted/50 p-4 rounded-lg border">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-2xl">
              {tierFilter === 'bronze' && '🥉'}
              {tierFilter === 'silver' && '🥈'}
              {tierFilter === 'gold' && '🥇'}
              {tierFilter === 'platinum' && '💎'}
              {tierFilter === 'diamond' && '💠'}
            </span>
            {tierFilter.charAt(0).toUpperCase() + tierFilter.slice(1)} Tier
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Showing {filteredBadges.length} badge{filteredBadges.length !== 1 ? 's' : ''} in this tier
          </p>
        </div>
      )}

      {/* Results count */}
      {tierFilter === 'all' && (
        <p className="text-sm text-muted-foreground">
          Showing {filteredBadges.length} of {badges.length} badges
        </p>
      )}

      {/* Badge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBadges.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} onUpdate={onUpdate} />
        ))}
      </div>
    </div>
  );
}
