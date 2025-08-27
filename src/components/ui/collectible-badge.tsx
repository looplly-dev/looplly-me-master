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
    requirements?: string[];
    points?: number;
    progress?: number;
    target?: number;
    earnedAt?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function CollectibleBadge({ badge, size = 'md', onClick }: CollectibleBadgeProps) {
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
    <div 
      className="relative group touch-manipulation cursor-pointer"
      onClick={onClick}
    >
      <div
        className={cn(
          'relative transition-transform duration-200 hover:scale-105 active:scale-95',
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
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-md">
            <CheckCircle className="h-2 w-2 text-white" />
          </div>
        )}

        {/* Progress indicator for unearned badges */}
        {!badge.earned && badge.progress !== undefined && badge.target && (
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-black/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white/60 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((badge.progress / badge.target) * 100, 100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}