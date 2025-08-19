import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Shield, 
  MapPin, 
  CheckCircle, 
  Star, 
  Users, 
  Flame, 
  Trophy, 
  Award, 
  Crown, 
  Target, 
  Zap 
} from 'lucide-react';

const iconMap = {
  Shield,
  MapPin,
  CheckCircle,
  Star,
  Users,
  Flame,
  Trophy,
  Award,
  Crown,
  Target,
  Zap
};

interface CollectibleBadgeProps {
  badge: {
    id: string;
    name: string;
    description: string;
    tier: string;
    repPoints: number;
    earned: boolean;
    rarity: string;
    icon: string;
    requirement?: number;
  };
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export function CollectibleBadge({ badge, size = 'md', showDetails = false }: CollectibleBadgeProps) {
  const IconComponent = iconMap[badge.icon as keyof typeof iconMap] || Shield;
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const containerClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4'
  };

  const rarityColors = {
    Common: 'border-gray-300 bg-gray-50',
    Rare: 'border-blue-300 bg-blue-50',
    Epic: 'border-purple-300 bg-purple-50',
    Legendary: 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50'
  };

  const tierColors = {
    Bronze: 'text-amber-600',
    Silver: 'text-gray-600',
    Gold: 'text-yellow-600',
    Platinum: 'text-purple-600',
    Diamond: 'text-cyan-600'
  };

  return (
    <div
      className={cn(
        'rounded-lg border-2 transition-all',
        containerClasses[size],
        badge.earned 
          ? cn(
              'border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5',
              rarityColors[badge.rarity as keyof typeof rarityColors]
            )
          : 'bg-gray-50 border-gray-200 opacity-60'
      )}
    >
      <div className="text-center">
        <IconComponent 
          className={cn(
            'mx-auto mb-2',
            sizeClasses[size],
            badge.earned 
              ? tierColors[badge.tier as keyof typeof tierColors]
              : 'text-gray-400'
          )} 
        />
        <p className={cn(
          'font-medium',
          size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base',
          badge.earned ? 'text-foreground' : 'text-gray-500'
        )}>
          {badge.name}
        </p>
        
        {showDetails && (
          <p className={cn(
            'text-xs text-muted-foreground mt-1',
            size === 'sm' ? 'hidden' : ''
          )}>
            {badge.description}
          </p>
        )}
        
        <p className={cn(
          'text-xs mt-1',
          badge.earned ? 'text-success' : 'text-gray-400'
        )}>
          +{badge.repPoints} Rep
        </p>
        
        <div className="flex gap-1 justify-center mt-1">
          <Badge 
            variant={badge.earned ? "default" : "secondary"} 
            className={cn(
              'text-xs',
              badge.earned ? 'bg-success/10 text-success border-success' : ''
            )}
          >
            {badge.earned ? 'Earned' : 'Locked'}
          </Badge>
          
          <Badge 
            variant="outline" 
            className={cn(
              'text-xs',
              badge.rarity === 'Legendary' ? 'border-yellow-300 text-yellow-700' :
              badge.rarity === 'Epic' ? 'border-purple-300 text-purple-700' :
              badge.rarity === 'Rare' ? 'border-blue-300 text-blue-700' :
              'border-gray-300 text-gray-700'
            )}
          >
            {badge.rarity}
          </Badge>
        </div>
      </div>
    </div>
  );
}