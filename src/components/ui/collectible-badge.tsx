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
    sm: 'p-2 min-h-[80px]',
    md: 'p-3 min-h-[100px]',
    lg: 'p-4 min-h-[120px]'
  };

  const rarityColors = {
    Common: 'border-muted bg-gradient-to-br from-muted/30 to-muted/50 shadow-sm',
    Rare: 'border-primary/40 bg-gradient-to-br from-primary/10 to-primary/20 shadow-md shadow-primary/20',
    Epic: 'border-accent/50 bg-gradient-to-br from-accent/15 to-accent/30 shadow-lg shadow-accent/30',
    Legendary: 'border-warning/60 bg-gradient-to-br from-warning/20 to-warning/40 shadow-xl shadow-warning/40 animate-pulse'
  };

  const tierColors = {
    Bronze: 'text-amber-600 drop-shadow-sm',
    Silver: 'text-gray-600 drop-shadow-sm',
    Gold: 'text-yellow-600 drop-shadow-sm',
    Platinum: 'text-purple-600 drop-shadow-sm',
    Diamond: 'text-cyan-600 drop-shadow-sm'
  };

  return (
    <div
      className={cn(
        'rounded-xl border transition-all duration-300 hover:scale-105 cursor-pointer relative overflow-hidden group',
        containerClasses[size],
        badge.earned 
          ? cn(
              'border-2 hover:shadow-lg',
              rarityColors[badge.rarity as keyof typeof rarityColors]
            )
          : 'bg-muted/50 border-muted opacity-70 hover:opacity-85'
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
        
        <div className="flex gap-1 justify-center mt-2">
          <Badge 
            variant={badge.earned ? "default" : "secondary"} 
            className={cn(
              'text-xs px-2 py-0.5',
              badge.earned ? 'bg-success/20 text-success border-success/50' : 'bg-muted text-muted-foreground'
            )}
          >
            {badge.earned ? 'Earned' : 'Locked'}
          </Badge>
          
          <Badge 
            variant="outline" 
            className={cn(
              'text-xs px-2 py-0.5 font-medium',
              badge.rarity === 'Legendary' ? 'border-warning/60 text-warning bg-warning/10' :
              badge.rarity === 'Epic' ? 'border-accent/60 text-accent bg-accent/10' :
              badge.rarity === 'Rare' ? 'border-primary/60 text-primary bg-primary/10' :
              'border-muted-foreground/40 text-muted-foreground bg-muted/30'
            )}
          >
            {badge.rarity}
          </Badge>
        </div>
        
        {/* Hover tooltip overlay */}
        {!showDetails && (
          <div className="absolute inset-0 bg-background/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl p-2 flex flex-col justify-center">
            <p className="text-xs text-muted-foreground text-center leading-tight">
              {badge.description}
            </p>
            {badge.requirement && (
              <p className="text-xs text-accent text-center mt-1 font-medium">
                Requires: {badge.requirement}+
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}