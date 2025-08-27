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
  Zap,
  Hexagon,
  Diamond,
  Medal,
  Sparkles
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
  Zap,
  Hexagon,
  Diamond,
  Medal,
  Sparkles
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
    shape?: 'circle' | 'hexagon' | 'shield' | 'star' | 'diamond';
    category?: string;
  };
  size?: 'sm' | 'md' | 'lg';
}

export function CollectibleBadge({ badge, size = 'md' }: CollectibleBadgeProps) {
  const IconComponent = iconMap[badge.icon as keyof typeof iconMap] || Shield;
  
  // Consistent sizing for all badges - mobile optimized
  const sizeClasses = {
    sm: 'w-14 h-14', // Smaller, more consistent mobile size
    md: 'w-16 h-16', // Standard size for mobile
    lg: 'w-20 h-20'  // Larger size
  };

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  // Simplified shapes using CSS only - better mobile performance
  const getShapeClasses = (shape: string) => {
    switch (shape) {
      case 'hexagon':
        return 'rounded-xl'; // Simplified to rounded rectangle
      case 'shield':
        return 'rounded-t-full rounded-b-lg'; // CSS-only shield shape
      case 'star':
        return 'rounded-lg rotate-45'; // Simple rotated square
      case 'diamond':
        return 'rounded-lg rotate-45'; // Diamond as rotated square
      default:
        return 'rounded-full'; // Default circle
    }
  };

  // Simplified gradients using design system tokens - better performance
  const getCategoryGradient = (tier: string, rarity: string) => {
    switch (tier) {
      case 'Diamond':
        return 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg';
      case 'Platinum':
        return 'bg-gradient-to-br from-slate-400 to-slate-600 shadow-lg';
      case 'Gold':
        return 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-md';
      case 'Silver':
        return 'bg-gradient-to-br from-slate-300 to-slate-500 shadow-md';
      case 'Bronze':
        return 'bg-gradient-to-br from-orange-400 to-amber-600 shadow-sm';
      default:
        return 'bg-gradient-to-br from-slate-500 to-slate-600 shadow-sm';
    }
  };

  // Simplified rarity effects - mobile optimized
  const getRarityEffects = (rarity: string, earned: boolean) => {
    if (!earned) return '';
    
    switch (rarity) {
      case 'Legendary': 
        return 'ring-2 ring-yellow-400/60 shadow-lg';
      case 'Epic': 
        return 'ring-2 ring-purple-400/50 shadow-md';
      case 'Rare': 
        return 'ring-1 ring-blue-400/40 shadow-md';
      case 'Common':
        return 'ring-1 ring-gray-300/30 shadow-sm';
      default: 
        return '';
    }
  };

  const getLockedState = () => {
    if (badge.earned) return '';
    return 'opacity-50 grayscale hover:opacity-70 transition-opacity duration-200';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative group touch-manipulation"> {/* Better mobile touch */}
            <div
              className={cn(
                'relative cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95', // Simplified mobile-friendly animation
                sizeClasses[size],
                getShapeClasses(badge.shape || 'circle'),
                getCategoryGradient(badge.tier, badge.rarity),
                getRarityEffects(badge.rarity, badge.earned),
                getLockedState()
              )}
            >
              {/* Simplified background overlay */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br from-white/20 to-transparent",
                getShapeClasses(badge.shape || 'circle')
              )} />
              
              {/* Icon container with shape compensation */}
              <div className={cn(
                "absolute inset-0 flex items-center justify-center",
                (badge.shape === 'diamond' || badge.shape === 'star') ? '-rotate-45' : ''
              )}>
                <IconComponent 
                  className={cn(
                    iconSizes[size],
                    'text-white drop-shadow-lg'
                  )} 
                />
              </div>

              {/* Simplified earned indicator */}
              {badge.earned && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-md">
                  <CheckCircle className="h-2.5 w-2.5 text-white" />
                </div>
              )}

              {/* Simplified legendary effect */}
              {badge.rarity === 'Legendary' && badge.earned && (
                <div className="absolute top-1 right-1">
                  <Sparkles className="h-3 w-3 text-yellow-300" />
                </div>
              )}
            </div>
            
            {/* Simplified progress indicator */}
            {!badge.earned && badge.requirement && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                <div className="bg-muted rounded-full px-2 py-0.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    0/{badge.requirement}
                  </span>
                </div>
              </div>
            )}
          </div>
        </TooltipTrigger>
        
        <TooltipContent side="top" className="max-w-xs"> {/* Smaller max-width for mobile */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <p className="font-bold text-sm">{badge.name}</p> {/* Smaller text for mobile */}
              {badge.earned && <CheckCircle className="h-3 w-3 text-green-500" />}
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed">{badge.description}</p>
            
            {/* Simplified mobile-friendly layout */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  {badge.tier}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  {badge.rarity}
                </span>
              </div>
              <div className="text-center">
                <span className={cn(
                  'text-sm font-bold',
                  badge.earned ? 'text-green-600' : 'text-muted-foreground'
                )}>
                  +{badge.repPoints} Rep
                </span>
              </div>
            </div>
            
            {badge.requirement && !badge.earned && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Need {badge.requirement}+ {badge.category?.toLowerCase() || 'actions'}
                </p>
              </div>
            )}

            {badge.earned && (
              <div className="pt-2 border-t">
                <p className="text-xs text-green-600 font-medium">✨ Unlocked!</p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}