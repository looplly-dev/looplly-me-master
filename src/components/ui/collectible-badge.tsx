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

  const getShapeClasses = (shape: string) => {
    switch (shape) {
      case 'hexagon':
        return 'clip-path-hexagon';
      case 'shield':
        return 'clip-path-shield rounded-none';
      case 'star':
        return 'clip-path-star rounded-none';
      case 'diamond':
        return 'rotate-45 rounded-lg';
      default:
        return 'rounded-full';
    }
  };

  const getCategoryGradient = (tier: string, rarity: string) => {
    // Enhanced gradients based on tier and rarity
    switch (tier) {
      case 'Diamond':
        return 'bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 shadow-xl shadow-blue-500/30';
      case 'Platinum':
        return 'bg-gradient-to-br from-slate-300 via-slate-400 to-slate-600 shadow-lg shadow-slate-400/30';
      case 'Gold':
        return 'bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 shadow-lg shadow-amber-400/30';
      case 'Silver':
        return 'bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 shadow-md shadow-slate-300/30';
      case 'Bronze':
        return 'bg-gradient-to-br from-orange-300 via-amber-600 to-yellow-700 shadow-md shadow-amber-500/20';
      default:
        return 'bg-gradient-to-br from-slate-400 via-slate-500 to-slate-600';
    }
  };

  const getRarityEffects = (rarity: string, earned: boolean) => {
    if (!earned) return '';
    
    switch (rarity) {
      case 'Legendary': 
        return 'ring-4 ring-yellow-400/50 shadow-2xl shadow-yellow-500/50 animate-pulse';
      case 'Epic': 
        return 'ring-3 ring-purple-400/40 shadow-xl shadow-purple-500/40';
      case 'Rare': 
        return 'ring-2 ring-blue-400/30 shadow-lg shadow-blue-500/30';
      case 'Common':
        return 'ring-1 ring-gray-300/20 shadow-md';
      default: 
        return 'shadow-sm';
    }
  };

  const getLockedState = () => {
    if (badge.earned) return '';
    return 'opacity-60 grayscale hover:opacity-80 hover:grayscale-0 hover:scale-105';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative group">
            <div
              className={cn(
                'relative cursor-pointer transition-all duration-500 hover:scale-110 group-hover:rotate-2',
                sizeClasses[size],
                getShapeClasses(badge.shape || 'circle'),
                getCategoryGradient(badge.tier, badge.rarity),
                getRarityEffects(badge.rarity, badge.earned),
                getLockedState()
              )}
            >
              {/* Enhanced background patterns */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent",
                getShapeClasses(badge.shape || 'circle')
              )} />
              
              {/* Diamond inner icon adjustment */}
              <div className={cn(
                "absolute inset-0 flex items-center justify-center",
                badge.shape === 'diamond' ? '-rotate-45' : ''
              )}>
                <IconComponent 
                  className={cn(
                    iconSizes[size],
                    'text-white drop-shadow-xl filter brightness-110'
                  )} 
                />
              </div>

              {/* Enhanced earned indicator */}
              {badge.earned && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full border-2 border-white flex items-center justify-center shadow-lg animate-bounce">
                  <CheckCircle className="h-3 w-3 text-white" />
                </div>
              )}

              {/* Enhanced rarity effects */}
              {badge.rarity === 'Legendary' && badge.earned && (
                <>
                  <div className={cn(
                    "absolute inset-0 animate-pulse",
                    getShapeClasses(badge.shape || 'circle')
                  )}>
                    <Sparkles className="absolute top-1 right-1 h-3 w-3 text-yellow-300 animate-ping" />
                    <Sparkles className="absolute bottom-2 left-1 h-2 w-2 text-yellow-200 animate-ping delay-75" />
                    <Sparkles className="absolute top-2 left-2 h-2 w-2 text-yellow-400 animate-ping delay-150" />
                  </div>
                  {/* Legendary glow animation */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 animate-pulse",
                    getShapeClasses(badge.shape || 'circle')
                  )} />
                </>
              )}

              {/* Epic rarity effects */}
              {badge.rarity === 'Epic' && badge.earned && (
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br from-purple-400/10 to-indigo-500/10",
                  getShapeClasses(badge.shape || 'circle')
                )} />
              )}
            </div>
            
            {/* Progress indicator for unearned badges with requirements */}
            {!badge.earned && badge.requirement && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="bg-muted/90 backdrop-blur-sm rounded-full px-2 py-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    0/{badge.requirement}
                  </span>
                </div>
              </div>
            )}
          </div>
        </TooltipTrigger>
        
        <TooltipContent side="top" className="max-w-sm">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <p className="font-bold text-base">{badge.name}</p>
              {badge.earned && <CheckCircle className="h-4 w-4 text-green-500" />}
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">{badge.description}</p>
            
            <div className="flex items-center justify-between text-sm pt-2 border-t">
              <div className="flex items-center gap-2">
                <span className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  badge.tier === 'Diamond' ? 'bg-cyan-100 text-cyan-800 border border-cyan-200' :
                  badge.tier === 'Platinum' ? 'bg-slate-100 text-slate-800 border border-slate-200' :
                  badge.tier === 'Gold' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                  badge.tier === 'Silver' ? 'bg-gray-100 text-gray-800 border border-gray-200' :
                  badge.tier === 'Bronze' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                  'bg-gray-100 text-gray-600'
                )}>
                  {badge.tier}
                </span>
                <span className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  badge.rarity === 'Legendary' ? 'bg-gradient-to-r from-yellow-200 to-orange-200 text-yellow-900 border border-yellow-300' :
                  badge.rarity === 'Epic' ? 'bg-gradient-to-r from-purple-200 to-indigo-200 text-purple-900 border border-purple-300' :
                  badge.rarity === 'Rare' ? 'bg-gradient-to-r from-blue-200 to-cyan-200 text-blue-900 border border-blue-300' :
                  'bg-gray-100 text-gray-700 border border-gray-200'
                )}>
                  {badge.rarity}
                </span>
              </div>
              <span className={cn(
                'font-bold text-sm',
                badge.earned ? 'text-green-600' : 'text-muted-foreground'
              )}>
                +{badge.repPoints} Rep
              </span>
            </div>
            
            {badge.requirement && !badge.earned && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  <strong>Requirement:</strong> {badge.requirement}+ {badge.category?.toLowerCase() || 'actions'}
                </p>
              </div>
            )}

            {badge.earned && (
              <div className="pt-2 border-t">
                <p className="text-xs text-green-600 font-medium">✨ Achievement Unlocked!</p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}