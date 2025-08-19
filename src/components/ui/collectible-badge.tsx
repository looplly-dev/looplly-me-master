import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
}

export function CollectibleBadge({ badge, size = 'md' }: CollectibleBadgeProps) {
  const IconComponent = iconMap[badge.icon as keyof typeof iconMap] || Shield;
  
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20', 
    lg: 'w-24 h-24'
  };

  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  const getCategoryGradient = (icon: string) => {
    if (['Shield', 'CheckCircle', 'MapPin'].includes(icon)) {
      return 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700';
    }
    if (['Flame', 'Target'].includes(icon)) {
      return 'bg-gradient-to-br from-orange-500 via-red-500 to-red-600';
    }
    if (['Trophy', 'Award', 'Crown'].includes(icon)) {
      return 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500';
    }
    if (['Star', 'Zap'].includes(icon)) {
      return 'bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600';
    }
    if (['Users'].includes(icon)) {
      return 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600';
    }
    return 'bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700';
  };

  const getRarityGlow = (rarity: string, earned: boolean) => {
    if (!earned) return '';
    
    switch (rarity) {
      case 'Legendary': 
        return 'shadow-lg shadow-yellow-500/40 ring-2 ring-yellow-400/30';
      case 'Epic': 
        return 'shadow-lg shadow-purple-500/40 ring-2 ring-purple-400/30';
      case 'Rare': 
        return 'shadow-md shadow-blue-500/30 ring-1 ring-blue-400/20';
      default: 
        return 'shadow-sm';
    }
  };

  const getLockedState = () => {
    if (badge.earned) return '';
    return 'opacity-50 grayscale hover:opacity-70 hover:grayscale-0';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'relative rounded-full cursor-pointer transition-all duration-300 hover:scale-110 group',
              sizeClasses[size],
              getCategoryGradient(badge.icon),
              getRarityGlow(badge.rarity, badge.earned),
              getLockedState()
            )}
          >
            {/* Background pattern overlay */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
            
            {/* Icon container */}
            <div className="absolute inset-0 flex items-center justify-center">
              <IconComponent 
                className={cn(
                  iconSizes[size],
                  'text-white drop-shadow-lg'
                )} 
              />
            </div>

            {/* Earned indicator */}
            {badge.earned && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <CheckCircle className="h-3 w-3 text-white" />
              </div>
            )}

            {/* Rarity sparkle effect for legendary */}
            {badge.rarity === 'Legendary' && badge.earned && (
              <div className="absolute inset-0 rounded-full animate-pulse">
                <div className="absolute top-2 right-2 w-1 h-1 bg-yellow-300 rounded-full animate-ping" />
                <div className="absolute bottom-3 left-2 w-1 h-1 bg-yellow-300 rounded-full animate-ping delay-75" />
                <div className="absolute top-3 left-3 w-1 h-1 bg-yellow-300 rounded-full animate-ping delay-150" />
              </div>
            )}
          </div>
        </TooltipTrigger>
        
        <TooltipContent side="top" className="max-w-xs">
          <div className="text-center">
            <p className="font-semibold text-sm mb-1">{badge.name}</p>
            <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
            
            <div className="flex items-center justify-between text-xs">
              <span className={badge.earned ? 'text-green-600' : 'text-muted-foreground'}>
                +{badge.repPoints} Rep
              </span>
              <span className={cn(
                'px-2 py-0.5 rounded text-xs',
                badge.rarity === 'Legendary' ? 'bg-yellow-100 text-yellow-800' :
                badge.rarity === 'Epic' ? 'bg-purple-100 text-purple-800' :
                badge.rarity === 'Rare' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              )}>
                {badge.rarity}
              </span>
            </div>
            
            {badge.requirement && !badge.earned && (
              <p className="text-xs text-muted-foreground mt-2">
                Requires: {badge.requirement}+
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}