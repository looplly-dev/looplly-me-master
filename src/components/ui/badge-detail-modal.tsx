import React from "react"
import { X, Calendar, Trophy, Target, Clock, Shield, Flame, Users, Star, MapPin, Award, Zap, Gift, Crown, Gem, Globe, MessageSquare, Heart, Coffee, Book, Code, Music, Gamepad2, Camera, Palette, Rocket, Key, Lock, Settings, Bell, Mail, Phone, Home, User, CheckCircle, XCircle, AlertCircle, Info, Plus, Minus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

// Icon mapping system (matching CollectibleBadge)
const iconMap = {
  shield: Shield,
  flame: Flame,
  users: Users,
  star: Star,
  trophy: Trophy,
  target: Target,
  crown: Crown,
  gem: Gem,
  award: Award,
  zap: Zap,
  gift: Gift,
  globe: Globe,
  message: MessageSquare,
  heart: Heart,
  coffee: Coffee,
  book: Book,
  code: Code,
  music: Music,
  gamepad: Gamepad2,
  camera: Camera,
  palette: Palette,
  rocket: Rocket,
  key: Key,
  lock: Lock,
  settings: Settings,
  bell: Bell,
  mail: Mail,
  phone: Phone,
  home: Home,
  user: User,
  check: CheckCircle,
  x: XCircle,
  alert: AlertCircle,
  info: Info,
  mapPin: MapPin
}

interface BadgeDetailModalProps {
  badge: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BadgeDetailModal({ badge, open, onOpenChange }: BadgeDetailModalProps) {
  if (!badge) return null

  const getShapeClasses = (shape: string) => {
    switch (shape) {
      case 'hexagon':
        return 'rounded-3xl'
      case 'shield':
        return 'rounded-t-3xl rounded-b-sm'
      case 'star':
        return 'rounded-2xl rotate-12'
      case 'diamond':
        return 'rounded-2xl rotate-45'
      default:
        return 'rounded-full'
    }
  }

  const getCategoryGradient = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'legendary':
        return 'from-gradient-legendary-start to-gradient-legendary-end'
      case 'epic':
        return 'from-gradient-epic-start to-gradient-epic-end'
      case 'rare':
        return 'from-gradient-rare-start to-gradient-rare-end'
      case 'common':
        return 'from-gradient-common-start to-gradient-common-end'
      default:
        return 'from-muted to-muted-foreground/20'
    }
  }

  const getRarityRing = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary':
        return 'ring-4 ring-gradient-legendary-start/50'
      case 'epic':
        return 'ring-4 ring-gradient-epic-start/50'
      case 'rare':
        return 'ring-2 ring-gradient-rare-start/50'
      default:
        return ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto bg-background/95 backdrop-blur-sm border-2 p-0 overflow-hidden">
        {/* Header with close button */}
        <div className="relative p-6 pb-4">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-full p-2 bg-background/80 hover:bg-background transition-colors z-10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Large Badge Display */}
        <div className="px-6 pb-6">
          <div className="flex flex-col items-center space-y-6">
            {/* Large Badge */}
            <div className="relative">
              <div
                className={cn(
                  "w-32 h-32 flex items-center justify-center bg-gradient-to-br shadow-lg transition-all duration-300",
                  getCategoryGradient(badge.tier),
                  getShapeClasses(badge.shape),
                  getRarityRing(badge.rarity),
                  badge.earned ? "opacity-100" : "opacity-40 grayscale"
                )}
              >
                <div className="text-white text-4xl">
                  {(() => {
                    const IconComponent = iconMap[badge.icon as keyof typeof iconMap];
                    return IconComponent ? <IconComponent className="h-12 w-12" /> : (badge.icon || '🏆');
                  })()}
                </div>
                
                {/* Earned indicator */}
                {badge.earned && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Badge Info */}
            <div className="text-center space-y-3">
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-bold">{badge.name}</DialogTitle>
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {badge.tier}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {badge.category}
                  </Badge>
                </div>
              </div>
              
              <p className="text-muted-foreground text-sm leading-relaxed">
                {badge.description}
              </p>
            </div>

            {/* Progress Section */}
            {badge.progress !== undefined && (
              <div className="w-full space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    Progress
                  </span>
                  <span className="font-medium">
                    {badge.progress}/{badge.target || 100}
                  </span>
                </div>
                <Progress value={(badge.progress / (badge.target || 100)) * 100} className="h-2" />
              </div>
            )}

            {/* Achievement Details */}
            <div className="w-full space-y-3 border-t pt-4">
              {badge.earned && badge.earnedAt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Earned on {new Date(badge.earnedAt).toLocaleDateString()}</span>
                </div>
              )}
              
              {badge.requirements && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Target className="h-3 w-3" />
                    Requirements
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-5">
                    {badge.requirements.map((req: string, idx: number) => (
                      <li key={idx} className="list-disc">{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {badge.points && (
                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="h-3 w-3 text-yellow-500" />
                  <span className="font-medium">{badge.points} Reputation Points</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}