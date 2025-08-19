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

  const getTierGradient = (tier: string, rarity: string) => {
    // Tier-based gradients for modern star styling
    if (tier.toLowerCase().includes('bronze') || rarity === 'Common') {
      return 'bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600';
    }
    if (tier.toLowerCase().includes('silver') || rarity === 'Rare') {
      return 'bg-gradient-to-br from-slate-300 via-gray-400 to-slate-500';
    }
    if (tier.toLowerCase().includes('gold') || rarity === 'Epic') {
      return 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500';
    }
    if (tier.toLowerCase().includes('platinum') || tier.toLowerCase().includes('diamond') || rarity === 'Legendary') {
      return 'bg-gradient-to-br from-purple-400 via-pink-400 to-purple-600';
    }
    
    // Category-based fallbacks with star theme
    if (['Shield', 'CheckCircle', 'MapPin'].includes(badge.icon)) {
      return 'bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600';
    }
    if (['Flame', 'Target'].includes(badge.icon)) {
      return 'bg-gradient-to-br from-red-400 via-orange-500 to-red-600';
    }
    if (['Trophy', 'Award', 'Crown'].includes(badge.icon)) {
      return 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500';
    }
    if (['Users'].includes(badge.icon)) {
      return 'bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600';
    }
    
    // Default bronze tier
    return 'bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600';
  };

  const getTierGlow = (rarity: string, tier: string, earned: boolean) => {
    if (!earned) return 'shadow-sm';
    
    switch (rarity) {
      case 'Legendary': 
        return 'shadow-xl shadow-purple-500/50 ring-2 ring-purple-400/40 animate-pulse';
      case 'Epic': 
        return 'shadow-lg shadow-yellow-500/40 ring-2 ring-yellow-400/30';
      case 'Rare': 
        return 'shadow-lg shadow-slate-400/30 ring-1 ring-slate-300/20';
      default: 
        return 'shadow-md shadow-orange-400/25';
    }
  };

  const getLockedState = () => {
    if (badge.earned) return '';
    return 'opacity-60 saturate-50 hover:opacity-80 hover:saturate-75';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'relative rounded-full cursor-pointer transition-all duration-300 hover:scale-110 group border',
              sizeClasses[size],
              getTierGradient(badge.tier, badge.rarity),
              getTierGlow(badge.rarity, badge.tier, badge.earned),
              getLockedState(),
              badge.earned ? 'border-white/20' : 'border-white/10'
            )}
          >
            {/* Background pattern overlay */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/15 to-transparent" />
            
            {/* 3D depth effect */}
            <div className="absolute inset-1 rounded-full bg-gradient-to-t from-black/10 to-transparent" />
            
            {/* Icon container */}
            <div className="absolute inset-0 flex items-center justify-center">
              <IconComponent 
                className={cn(
                  iconSizes[size],
                  'text-white drop-shadow-lg transition-all duration-300'
                )} 
              />
            </div>

            {/* Earned indicator */}
            {badge.earned && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <CheckCircle className="h-3 w-3 text-white" />
              </div>
            )}

            {/* Tier name overlay */}
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
              <div className="px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded-full">
                <span className="text-xs font-medium text-white capitalize">
                  {badge.tier || badge.rarity}
                </span>
              </div>
            </div>

            {/* Enhanced sparkle effect for legendary */}
            {badge.rarity === 'Legendary' && badge.earned && (
              <div className="absolute inset-0 rounded-full">
                <div className="absolute top-2 right-2 w-1 h-1 bg-purple-300 rounded-full animate-ping" />
                <div className="absolute bottom-3 left-2 w-1 h-1 bg-pink-300 rounded-full animate-ping delay-75" />
                <div className="absolute top-3 left-3 w-1 h-1 bg-purple-300 rounded-full animate-ping delay-150" />
                <div className="absolute bottom-2 right-3 w-1 h-1 bg-pink-300 rounded-full animate-ping delay-300" />
              </div>
            )}
          </div>
        </TooltipTrigger>
        
        <TooltipContent side="top" className="max-w-xs">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <IconComponent className="h-4 w-4 text-primary" />
              <p className="font-semibold text-sm">{badge.name}</p>
            </div>
            
            <p className="text-xs text-muted-foreground mb-3">{badge.description}</p>
            
            <div className="flex items-center justify-between text-xs mb-2">
              <span className={badge.earned ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                +{badge.repPoints} Rep Points
              </span>
            </div>

            <div className="flex items-center justify-center gap-2 mb-2">
              <span className={cn(
                'px-3 py-1 rounded-full text-xs font-medium',
                badge.rarity === 'Legendary' ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800' :
                badge.rarity === 'Epic' ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800' :
                badge.rarity === 'Rare' ? 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-800' :
                'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800'
              )}>
                {badge.tier || `${badge.rarity} Tier`}
              </span>
            </div>
            
            {badge.requirement && !badge.earned && (
              <p className="text-xs text-muted-foreground mt-2 px-2 py-1 bg-muted/50 rounded">
                Unlock requirement: {badge.requirement}+
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}