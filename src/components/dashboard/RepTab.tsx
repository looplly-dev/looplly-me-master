// RESTORE POINT: Before implementing oversized icon theme throughout RepTab
// RESTORE POINT: Before implementing oversized icon theme throughout RepTab
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Trophy, 
  Shield, 
  MapPin, 
  Flame, 
  Users, 
  Star,
  Target,
  TrendingUp,
  Award,
  Plus,
  Minus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
  Maximize2,
  Minimize2,
  Zap,
  History,
  BookOpen,
  ChevronDown,
  FileCheck,
  TrendingDown,
  Wallet,
  MessageCircle
} from 'lucide-react';
import { userStats } from '@/mock_data';
import { useAuth } from '@/hooks/useAuth';
import { CollectibleBadge } from '@/components/ui/collectible-badge';
import { BadgeDetailModal } from '@/components/ui/badge-detail-modal';
import { StreakProgress } from '@/components/ui/streak-progress';
import { CollapsibleSection } from '@/components/ui/collapsible-section';
import { Stage2CapAlert } from '@/components/ui/stage-2-cap-alert';
import { useUserStreaks } from '@/hooks/useUserStreaks';
import { useStageUnlockLogic } from '@/hooks/useStageUnlockLogic';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useBadgeService } from '@/hooks/useBadgeService';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { RepOnboardingTour } from '@/components/ui/rep-onboarding-tour';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useUserReputation } from '@/hooks/useUserReputation';
import { ContextualRepTour } from '@/components/ui/contextual-rep-tour';

export default function RepTab() {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('rep_onboarding_completed');
  });
  const [showContextualTour, setShowContextualTour] = useState(false);
  const { listBadges, getUserBadges } = useBadgeService();
  const { streak } = useUserStreaks();
  const { checkStage2Unlock } = useStageUnlockLogic();
  const { reputation, isLoading: reputationLoading } = useUserReputation();

  const handleCloseOnboarding = () => {
    localStorage.setItem('rep_onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  useEffect(() => {
    if (selectedBadge) {
      console.info('Modal will render badge', { id: selectedBadge.id, name: selectedBadge.name });
    }
  }, [selectedBadge]);

  // Fetch admin's badge preview setting
  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['user-profile', authState.user?.id],
    queryFn: async () => {
      if (!authState.user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('badge_preview_mode')
        .eq('user_id', authState.user.id)
        .single();
      if (error) {
        console.error('Profile query error:', error);
        return null; // Return null on error instead of throwing
      }
      return data;
    },
    enabled: !!authState.user?.id,
  });

  // Fetch all badges from database
  const { data: allBadges = [], isLoading: badgesLoading, error: badgesError } = useQuery({
    queryKey: ['badges'],
    queryFn: () => listBadges(true),
  });

  // Fetch user's earned badges
  const { data: userBadges = [], isLoading: userBadgesLoading, error: userBadgesError } = useQuery({
    queryKey: ['user-badges'],
    queryFn: () => getUserBadges(),
  });
  // Endless reputation system with tiers and prestige
  const getLevel = (score: number) => {
    if (score >= 2000) return { name: 'Elite', tier: 'Elite', color: 'text-gradient', icon: '👑', min: 2000, max: Infinity };
    if (score >= 1000) return { name: 'Diamond', tier: 'Diamond', color: 'text-cyan-600', icon: '💎', min: 1000, max: 1999 };
    if (score >= 500) return { name: 'Platinum', tier: 'Platinum', color: 'text-purple-600', icon: '⭐', min: 500, max: 999 };
    if (score >= 250) return { name: 'Gold', tier: 'Gold', color: 'text-yellow-600', icon: '🥇', min: 250, max: 499 };
    if (score >= 100) return { name: 'Silver', tier: 'Silver', color: 'text-gray-500', icon: '🥈', min: 100, max: 249 };
    return { name: 'Bronze', tier: 'Bronze', color: 'text-amber-600', icon: '🥉', min: 0, max: 99 };
  };

  const level = getLevel(userStats.reputation.score);
  
  // Calculate prestige level within tier
  const prestigeLevel = Math.floor((userStats.reputation.score - level.min) / Math.max(1, Math.floor((level.max - level.min + 1) / 3))) + 1;
  const prestigeName = prestigeLevel > 3 ? 'III' : prestigeLevel === 3 ? 'III' : prestigeLevel === 2 ? 'II' : 'I';
  
  const nextLevelThreshold = level.max === Infinity ? userStats.reputation.score + 1000 : level.max + 1;
  const progressToNext = level.max === Infinity 
    ? 100 
    : ((userStats.reputation.score - level.min) / (level.max - level.min + 1)) * 100;

  // Map database badges to categories with earned status
  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));
  
  const categoryMap: Record<string, { name: string; icon: any; dbKey: string }> = {
    identity_security: { name: 'Identity & Security', icon: Shield, dbKey: 'identity_security' },
    consistency: { name: 'Consistency Mastery', icon: Flame, dbKey: 'consistency' },
    excellence: { name: 'Excellence & Impact', icon: Award, dbKey: 'excellence' },
    social: { name: 'Social Network', icon: Users, dbKey: 'social' },
    speed: { name: 'Speed Masters', icon: Zap, dbKey: 'speed' },
    perfection: { name: 'Perfection Elite', icon: Target, dbKey: 'perfection' },
    exploration: { name: 'Exploration Heroes', icon: MapPin, dbKey: 'exploration' },
  };

  const badgeCategories = Object.entries(categoryMap).map(([key, value]) => ({
    name: value.name,
    icon: value.icon,
    badges: allBadges
      .filter(badge => badge.category === key)
      .map(badge => {
        const userBadge = userBadges.find(ub => ub.badge_id === badge.id);
        const isEarned = earnedBadgeIds.has(badge.id);
        // Apply badge preview mode: if enabled, show all badges as earned
        const displayAsEarned = profile?.badge_preview_mode || isEarned;
        
        return {
          id: badge.id,
          name: badge.name,
          description: badge.description || '',
          tier: badge.tier ? badge.tier.charAt(0).toUpperCase() + badge.tier.slice(1) : 'Bronze',
          repPoints: badge.rep_points || 0,
          points: badge.rep_points || 0,
          earned: displayAsEarned,
          rarity: badge.rarity || 'Common',
          icon: badge.icon_name || 'Star',
          shape: (badge.shape as 'circle' | 'hexagon' | 'shield' | 'star' | 'diamond') || 'circle',
          category: badge.category || '',
          categoryLabel: categoryMap[badge.category as keyof typeof categoryMap]?.name || badge.category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Other',
          requirements: badge.requirement ? [badge.requirement] : undefined,
          earnedAt: userBadge?.awarded_at,
          imageUrl: badge.icon_url || undefined,
        };
      }),
  })).filter(cat => cat.badges.length > 0);

  const handleBadgeClick = (badge: any) => {
    console.info('Badge clicked', { 
      id: badge?.id, 
      earned: !!badge?.earned, 
      preview: !!profile?.badge_preview_mode, 
      categoryKey: badge?.category,
      categoryLabel: badge?.categoryLabel 
    });
    setSelectedBadge({ 
      ...badge, 
      earned: (!!profile?.badge_preview_mode) || !!badge.earned 
    });
    setIsModalOpen(true);
  };

  // Handle action routing
  const handleActionRoute = (routeTo: string) => {
    switch (routeTo) {
      case 'kyc':
        navigate('/settings'); // Navigate to settings where KYC is located
        break;
      case 'surveys':
        navigate('/earn'); // Navigate to earn tab for survey tips
        break;
      case 'token':
        navigate('/wallet'); // Navigate to wallet for token connection
        break;
      case 'profile':
        navigate('/profile'); // Navigate to profile completion
        break;
      case 'notifications':
        navigate('/settings'); // Navigate to settings for notification preferences
        break;
      default:
        console.log('No route defined for:', routeTo);
    }
  };

  const tips = [
    { 
      title: 'Complete KYC Verification', 
      subtitle: 'Verify identity with Soulbase',
      icon: <Shield className="h-5 w-5 text-red-500" />,
      points: '+30', 
      description: 'Identity verification unlocks withdrawals and premium earning opportunities. Complete KYC to access higher-paying surveys and faster payment processing.',
      priority: 'high',
      actionLabel: 'Start KYC Verification',
      routeTo: 'kyc',
      completed: false
    },
    { 
      title: 'Improve Survey Quality', 
      subtitle: 'Boost consistency & accuracy',
      icon: <FileCheck className="h-5 w-5 text-red-500" />,
      points: '+20', 
      description: 'Read questions carefully and provide consistent, thoughtful responses. Quality answers increase your reputation and reduce rejection rates.',
      priority: 'high',
      actionLabel: 'View Quality Guide',
      routeTo: 'surveys',
      completed: false
    },
    { 
      title: 'Connect Soulbase Crypto Token', 
      subtitle: 'Premium verification method',
      icon: <Wallet className="h-5 w-5 text-amber-500" />,
      points: '+50', 
      description: 'Link your Soulbase crypto token for advanced verification. Gain access to exclusive high-value opportunities and premium features.',
      priority: 'medium',
      actionLabel: 'Connect Token',
      routeTo: 'token',
      completed: false
    },
    { 
      title: 'Slow Down Survey Completion', 
      subtitle: 'Avoid speeding penalties',
      icon: <TrendingDown className="h-5 w-5 text-amber-500" />,
      points: '+15', 
      description: 'Take time to read each question carefully. Rushing through surveys can trigger quality flags and lower your reputation score.',
      priority: 'medium',
      actionLabel: 'Learn Best Practices',
      routeTo: 'surveys',
      completed: false
    },
    { 
      title: 'Enable WhatsApp Notifications', 
      subtitle: 'Get instant survey alerts',
      icon: <MessageCircle className="h-5 w-5 text-blue-500" />,
      points: '+5', 
      description: 'Receive quick survey notifications via WhatsApp. Respond faster to time-sensitive opportunities and maximize your earnings.',
      priority: 'low',
      actionLabel: 'Enable Notifications',
      routeTo: 'notifications',
      completed: false
    }
  ];

  // Show loading state - include ALL loading states
  if (badgesLoading || userBadgesLoading || profileLoading || reputationLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-20 lg:pb-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your reputation data...</p>
        </div>
      </div>
    );
  }

  // Show error state if queries failed
  if (badgesError || userBadgesError) {
    return (
      <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-20 lg:pb-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-8 w-8 mx-auto text-destructive" />
          <p className="text-muted-foreground">Unable to load badge data. Please try refreshing.</p>
        </div>
      </div>
    );
  }

  return (
    <div data-tour-step="page" className="pt-2 px-0 md:px-6 lg:px-8 pb-24 md:pb-20 lg:pb-8 space-y-4 md:space-y-6">
      {/* Header with Icon-Only Tour Buttons */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Reputation</h1>
        <div className="flex gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowOnboarding(true)}
                  className="h-8 w-8"
                >
                  <BookOpen className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Welcome Guide</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowContextualTour(true)}
                  className="h-8 w-8"
                >
                  <MapPin className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Feature Tour</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Tier Progression */}
      <CollapsibleSection
        data-tour-step="tier-progression"
        title="Tier Progression" 
        icon={<TrendingUp className="h-5 w-5" />}
        defaultOpen={true}
        compactContent={
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Current:</span>
            <Badge variant="default" className="text-sm">{level.name} {prestigeName}</Badge>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm">{Math.round(progressToNext)}% to next</span>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center justify-items-center">
            <div className={`p-4 rounded-2xl transition-all duration-200 ${
              userStats.reputation.score >= 0 && userStats.reputation.score < 100
                ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 shadow-lg border-2 border-amber-300 dark:border-amber-700 scale-105 ring-2 ring-primary ring-offset-2 dark:ring-offset-background' 
                : userStats.reputation.score >= 0
                ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 shadow-md border border-amber-300 dark:border-amber-700 hover:scale-105 opacity-60'
                : 'bg-gray-50/50 dark:bg-gray-800/30 text-muted-foreground border border-gray-200 dark:border-gray-700 hover:scale-105 opacity-60'
            }`}>
              <div className="text-5xl mb-2">🥉</div>
              <div className="text-sm font-semibold">Bronze</div>
              <div className="text-xs opacity-75">0-99</div>
            </div>
            <div className={`p-4 rounded-2xl transition-all duration-200 ${
              userStats.reputation.score >= 100 && userStats.reputation.score < 250
                ? 'bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-200 shadow-lg border-2 border-gray-300 dark:border-gray-600 scale-105 ring-2 ring-primary ring-offset-2 dark:ring-offset-background' 
                : userStats.reputation.score >= 100
                ? 'bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-200 shadow-md border border-gray-300 dark:border-gray-600 hover:scale-105 opacity-60'
                : 'bg-gray-50/50 dark:bg-gray-800/30 text-muted-foreground border border-gray-200 dark:border-gray-700 hover:scale-105 opacity-60'
            }`}>
              <div className="text-5xl mb-2">🥈</div>
              <div className="text-sm font-semibold">Silver</div>
              <div className="text-xs opacity-75">100-249</div>
            </div>
            <div className={`p-4 rounded-2xl transition-all duration-200 ${
              userStats.reputation.score >= 250 && userStats.reputation.score < 500
                ? 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-200 shadow-lg border-2 border-yellow-300 dark:border-yellow-700 scale-105 ring-2 ring-primary ring-offset-2 dark:ring-offset-background' 
                : userStats.reputation.score >= 250
                ? 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-200 shadow-md border border-yellow-300 dark:border-yellow-700 hover:scale-105 opacity-60'
                : 'bg-gray-50/50 dark:bg-gray-800/30 text-muted-foreground border border-gray-200 dark:border-gray-700 hover:scale-105 opacity-60'
            }`}>
              <div className="text-5xl mb-2">🥇</div>
              <div className="text-sm font-semibold">Gold</div>
              <div className="text-xs opacity-75">250-499</div>
            </div>
            <div className={`p-4 rounded-2xl transition-all duration-200 ${
              userStats.reputation.score >= 500 && userStats.reputation.score < 1000
                ? 'bg-purple-50 dark:bg-purple-950/30 text-purple-800 dark:text-purple-200 shadow-lg border-2 border-purple-300 dark:border-purple-700 scale-105 ring-2 ring-primary ring-offset-2 dark:ring-offset-background' 
                : userStats.reputation.score >= 500
                ? 'bg-purple-50 dark:bg-purple-950/30 text-purple-800 dark:text-purple-200 shadow-md border border-purple-300 dark:border-purple-700 hover:scale-105 opacity-60'
                : 'bg-gray-50/50 dark:bg-gray-800/30 text-muted-foreground border border-gray-200 dark:border-gray-700 hover:scale-105 opacity-60'
            }`}>
              <div className="text-5xl mb-2">⭐</div>
              <div className="text-sm font-semibold">Platinum</div>
              <div className="text-xs opacity-75">500-999</div>
            </div>
            <div className={`relative p-4 rounded-2xl transition-all duration-200 ${
              userStats.reputation.score >= 1000 && userStats.reputation.score < 2000
                ? 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-800 dark:text-cyan-200 shadow-2xl shadow-cyan-500/50 border-4 border-cyan-400 dark:border-cyan-600 scale-110 ring-2 ring-primary ring-offset-2 dark:ring-offset-background' 
                : userStats.reputation.score >= 1000
                ? 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-800 dark:text-cyan-200 shadow-md border border-cyan-300 dark:border-cyan-700 hover:scale-105 opacity-60'
                : 'bg-gray-50/50 dark:bg-gray-800/30 text-muted-foreground border border-gray-200 dark:border-gray-700 hover:scale-105 opacity-60'
            }`}>
              {userStats.reputation.score >= 1000 && userStats.reputation.score < 2000 && (
                <div className="absolute -top-2 -right-2 bg-cyan-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg z-10">
                  ✓
                </div>
              )}
              <div className="text-5xl mb-2">💎</div>
              <div className="text-sm font-semibold">Diamond</div>
              <div className="text-xs opacity-75">1000-1999</div>
            </div>
            <div className={`p-4 rounded-2xl transition-all duration-200 ${
              userStats.reputation.score >= 2000
                ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-800 dark:text-orange-200 shadow-lg border-2 border-orange-300 dark:border-orange-700 scale-105 ring-2 ring-primary ring-offset-2 dark:ring-offset-background' 
                : 'bg-gray-50/50 dark:bg-gray-800/30 text-muted-foreground border border-gray-200 dark:border-gray-700 hover:scale-105 opacity-60'
            }`}>
              <div className="text-5xl mb-2">👑</div>
              <div className="text-sm font-semibold">Elite</div>
              <div className="text-xs opacity-75">2000+</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <div className="flex justify-center items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{userStats.reputation.score}</p>
                <p className="text-xs text-muted-foreground">Current</p>
              </div>
              <Progress value={progressToNext} className="w-32 h-2" />
              <div className="text-center">
                <p className="text-lg font-semibold">{level.max === Infinity ? '∞' : nextLevelThreshold}</p>
                <p className="text-xs text-muted-foreground">Next</p>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Stage 2 Cap Alert */}
      {streak && !streak.unlocked_stages?.stage2 && streak.current_streak >= 29 && (
        <Stage2CapAlert
          earnedBadgesCount={checkStage2Unlock.data?.progress || 0}
          requiredBadgesCount={checkStage2Unlock.data?.required || 4}
          missingBadgeNames={
            allBadges
              .filter(badge => 
                badge.category === 'identity_security' && 
                badge.name !== 'Crypto Token Verification' &&
                !earnedBadgeIds.has(badge.id)
              )
              .map(badge => badge.name)
          }
        />
      )}

      {/* Beta Cohort Progress Bar */}
      {reputation?.beta_cohort && reputation.score > 500 && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary">Beta Soft Cap Active</Badge>
            <span className="text-sm text-muted-foreground">
              {reputation.score} / {reputation.beta_rep_cap} Rep
            </span>
          </div>
          <Progress 
            value={(reputation.score / reputation.beta_rep_cap) * 100} 
            className="h-2"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Gains are reduced by {Math.round((1 - Math.min(reputation.score / reputation.beta_rep_cap, 1)) * 100)}% 
            due to Beta soft cap
          </p>
        </Card>
      )}

      {/* Quality Metrics Card */}
      {reputation?.quality_metrics && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Quality Metrics
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Surveys Completed</span>
              <p className="font-semibold">{reputation.quality_metrics.surveysCompleted}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Surveys Rejected</span>
              <p className="font-semibold text-red-600 dark:text-red-400">{reputation.quality_metrics.surveysRejected}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Consistency Score</span>
              <p className="font-semibold">{reputation.quality_metrics.consistencyScore}%</p>
            </div>
            <div>
              <span className="text-muted-foreground">Average Time</span>
              <p className="font-semibold">{reputation.quality_metrics.averageTime}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Daily Streak Progress */}
      <CollapsibleSection
        data-tour-step="streak-progress"
        title="Daily Streak Progress"
        icon={<Flame className="h-5 w-5" />}
        defaultOpen={true}
        compactContent={
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-3xl mb-1">🔥</div>
              <p className="text-lg font-bold text-primary">{userStats.streaks.currentStreak}</p>
              <p className="text-xs text-muted-foreground">Current</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">🏅</div>
              <p className="text-lg font-bold text-accent">{userStats.streaks.longestStreak}</p>
              <p className="text-xs text-muted-foreground">Best</p>
            </div>
          </div>
        }
      >
        <StreakProgress 
          currentStreak={userStats.streaks.currentStreak}
          longestStreak={userStats.streaks.longestStreak}
          daysUntilMonthlyMilestone={userStats.streaks.daysUntilMonthlyMilestone}
          monthsUntilYearly={userStats.streaks.monthsUntilYearly}
          milestones={userStats.streaks.milestones}
        />
      </CollapsibleSection>

      {/* Collectible Badges & Achievements */}
      <CollapsibleSection
        data-tour-step="badges"
        title="Badge Collection"
        icon={<Star className="h-5 w-5" />}
        defaultOpen={true}
        priority="high"
        compactContent={
          <div className="flex justify-center gap-2 overflow-x-auto pb-2">
            {badgeCategories.slice(0, 2).map((category) => 
              category.badges.filter(b => b.earned).slice(0, 3).map((badge) => (
                <div key={badge.id} className="flex-shrink-0">
                  <CollectibleBadge 
                    badge={badge} 
                    size="sm"
                    onClick={() => handleBadgeClick(badge)}
                  />
                </div>
              ))
            ).flat()}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted border flex items-center justify-center">
              <span className="text-xs font-bold text-muted-foreground">
                +{badgeCategories.reduce((total, cat) => total + cat.badges.filter(b => b.earned).length, 0) - 6}
              </span>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {badgeCategories.map((category) => (
            <div key={category.name}>
              {/* Category Header with Progress */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/50">
                <h3 className="text-base font-bold text-foreground flex items-center gap-3">
                  <div className="text-3xl">
                    {category.name === 'Identity & Security' && '🛡️'}
                    {category.name === 'Consistency Mastery' && '🔥'}
                    {category.name === 'Excellence & Impact' && '🏆'}
                    {category.name === 'Social Network' && '👥'}
                    {category.name === 'Speed Masters' && '⚡'}
                    {category.name === 'Perfection Elite' && '🎯'}
                    {category.name === 'Exploration Heroes' && '🗺️'}
                  </div>
                  {category.name}
                </h3>
                <Badge variant="secondary" className="text-xs font-semibold px-3 py-1">
                  {Math.round((category.badges.filter(b => b.earned).length / category.badges.length) * 100)}%
                </Badge>
              </div>

              {/* Badge Carousel */}
              <Carousel
                opts={{
                  align: "center",
                  loop: true,
                  dragFree: false,
                  containScroll: "trimSnaps",
                  skipSnaps: false,
                  duration: 25,
                }}
                className="w-full"
              >
                <CarouselContent className="ml-0 gap-8 py-4">
                  {category.badges.map((badge, index) => (
                    <CarouselItem key={badge.id} index={index} className="basis-auto pl-0">
                      <CollectibleBadge 
                        badge={badge} 
                        size="md"
                        onClick={() => handleBadgeClick(badge)}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          ))}

        </div>
      </CollapsibleSection>

      {/* Survey Quality Metrics */}
      <CollapsibleSection
        data-tour-step="performance"
        title="📊 Your Performance"
        icon={<CheckCircle className="h-5 w-5" />}
        defaultOpen={true}
        priority="medium"
        compactContent={
          <div className="flex justify-center gap-6">
            <div className="text-center">
              <p className="text-lg font-bold text-success">{userStats.reputation.qualityMetrics.consistencyScore}%</p>
              <p className="text-xs text-muted-foreground">Consistency</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-primary">
                {Math.round((userStats.reputation.qualityMetrics.surveysCompleted / (userStats.reputation.qualityMetrics.surveysCompleted + userStats.reputation.qualityMetrics.surveysRejected)) * 100)}%
              </p>
              <p className="text-xs text-muted-foreground">Success</p>
            </div>
          </div>
        }
      >
        <div className="space-y-3">
          {/* Two-Column Dense Layout */}
          <div className="grid grid-cols-2 gap-3">
            {/* Surveys Done */}
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800 shadow-sm hover:scale-[1.02] transition-transform">
              <div className="text-3xl">✓</div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Done</p>
                <p className="text-xl font-bold text-green-700 dark:text-green-400">{userStats.reputation.qualityMetrics.surveysCompleted}</p>
              </div>
            </div>

            {/* Consistency */}
            <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800 shadow-sm hover:scale-[1.02] transition-transform">
              <div className="text-3xl">⚡</div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Consistency</p>
                <p className="text-xl font-bold text-purple-700 dark:text-purple-400">{userStats.reputation.qualityMetrics.consistencyScore}%</p>
              </div>
            </div>

            {/* Success Rate */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm hover:scale-[1.02] transition-transform">
              <div className="text-3xl">
                {(() => {
                  const rate = Math.round((userStats.reputation.qualityMetrics.surveysCompleted / (userStats.reputation.qualityMetrics.surveysCompleted + userStats.reputation.qualityMetrics.surveysRejected)) * 100);
                  if (rate >= 95) return '🏆';
                  if (rate >= 85) return '🌟';
                  if (rate >= 75) return '⭐';
                  return '📊';
                })()}
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Success</p>
                <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
                  {Math.round((userStats.reputation.qualityMetrics.surveysCompleted / (userStats.reputation.qualityMetrics.surveysCompleted + userStats.reputation.qualityMetrics.surveysRejected)) * 100)}%
                </p>
              </div>
            </div>

            {/* Rejected */}
            <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800 shadow-sm hover:scale-[1.02] transition-transform">
              <div className="text-3xl">✗</div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Rejected</p>
                <p className="text-xl font-bold text-red-700 dark:text-red-400">{userStats.reputation.qualityMetrics.surveysRejected}</p>
              </div>
            </div>
          </div>

          {/* Average Time - Centered */}
          <div className="flex items-center justify-center gap-3 p-3 bg-slate-50 dark:bg-slate-950/30 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm hover:scale-[1.02] transition-transform">
            <div className="text-3xl">⏱️</div>
            <div>
              <p className="text-xs text-muted-foreground">Avg. Time</p>
              <p className="text-xl font-bold text-slate-700 dark:text-slate-400">{userStats.reputation.qualityMetrics.averageTime}</p>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Reputation History - Enhanced with Database Data */}
      {reputation?.history && reputation.history.length > 0 && (
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-2 w-full p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
            <History className="h-4 w-4" />
            <span className="font-semibold">Reputation History</span>
            <span className="text-sm text-muted-foreground ml-auto">
              {reputation.history.length} transactions
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-2">
            {reputation.history.slice().reverse().slice(0, 20).map((entry) => (
              <Card key={entry.transaction_id} className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={entry.type === 'gain' ? 'default' : entry.type === 'loss' ? 'destructive' : 'secondary'}>
                        {entry.category}
                      </Badge>
                      <span className="text-sm font-medium">{entry.action}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {entry.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(entry.date).toLocaleDateString()} - ID: {entry.transaction_id.slice(0, 8)}
                    </p>
                  </div>
                  <span className={`font-bold text-lg ml-4 ${entry.points >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {entry.points >= 0 ? '+' : ''}{entry.points}
                  </span>
                </div>
              </Card>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Reputation Benefits */}
      <CollapsibleSection
        data-tour-step="benefits"
        title="Reputation Benefits"
        icon={<Trophy className="h-5 w-5" />}
        defaultOpen={false}
        compactContent={
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              5 exclusive benefits unlocked
            </p>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800 shadow-sm hover:scale-105 transition-transform">
            <div className="text-3xl">💰</div>
            <span className="text-sm font-medium flex-1">Higher-paying survey opportunities</span>
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm hover:scale-105 transition-transform">
            <div className="text-3xl">🚀</div>
            <span className="text-sm font-medium flex-1">Priority access to new features</span>
            <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800 shadow-sm hover:scale-105 transition-transform">
            <div className="text-3xl">👑</div>
            <span className="text-sm font-medium flex-1">Exclusive Gold+ member surveys</span>
            <CheckCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800 shadow-sm hover:scale-105 transition-transform">
            <div className="text-3xl">⚡</div>
            <span className="text-sm font-medium flex-1">Faster payment processing</span>
            <CheckCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800 shadow-sm hover:scale-105 transition-transform">
            <div className="text-3xl">💎</div>
            <span className="text-sm font-medium flex-1">Premium crypto verification access</span>
            <CheckCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </CollapsibleSection>

      {/* Improvement Action Plan - FAQ Style */}
      <CollapsibleSection
        data-tour-step="action-plan"
        title="Action Plan to Improve"
        icon={<Target className="h-5 w-5" />}
        defaultOpen={true}
        priority="high"
        compactContent={
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {tips.filter(t => !t.completed).length} pending actions • {tips.reduce((sum, t) => sum + parseInt(t.points), 0)} rep available
            </p>
          </div>
        }
      >
        <div className="space-y-2">
          {tips.map((tip, index) => (
            <Card key={index} className={`overflow-hidden transition-all hover:shadow-md ${
              tip.priority === 'high' ? 'border-destructive/20' :
              tip.priority === 'medium' ? 'border-amber-500/20' :
              'border-blue-500/20'
            }`}>
              <Collapsible>
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="hover:bg-muted/50 transition-colors cursor-pointer p-4">
                    <div className="flex items-center justify-between gap-4">
                      {/* Left: Icon + Title */}
                      <div className="flex items-center gap-3 flex-1 text-left">
                        <div className="shrink-0">
                          {tip.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm mb-0.5">{tip.title}</h4>
                          <p className="text-xs text-muted-foreground truncate">{tip.subtitle}</p>
                        </div>
                      </div>
                      
                      {/* Right: Points + Priority Badge + Expand Icon */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Points circle */}
                        <div className="w-10 h-10 rounded-full border-2 border-primary/20 bg-primary/5 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">{tip.points}</span>
                        </div>
                        
                        {/* Priority badge */}
                        <Badge 
                          variant="outline" 
                          className={`text-xs hidden sm:flex ${
                            tip.priority === 'high' ? 'border-destructive/30 text-destructive' :
                            tip.priority === 'medium' ? 'border-amber-500/30 text-amber-600' :
                            'border-blue-500/30 text-blue-600'
                          }`}
                        >
                          {tip.priority}
                        </Badge>
                        
                        {/* Expand icon */}
                        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0 pb-4 px-4 border-t">
                    <div className="space-y-3 pt-3">
                      {/* Description */}
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {tip.description}
                      </p>
                      
                      {/* Action button */}
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActionRoute(tip.routeTo);
                        }}
                        className="w-full"
                        size="sm"
                      >
                        {tip.actionLabel}
                      </Button>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-muted/50 border rounded-lg">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Tip:</strong> Higher reputation unlocks better opportunities, faster payments, and premium features. Complete actions above to boost your score efficiently.
          </p>
        </div>
      </CollapsibleSection>

      {/* Badge Detail Modal */}
      <BadgeDetailModal
        key={selectedBadge?.id || 'no-badge'}
        badge={selectedBadge}
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setSelectedBadge(null);
        }}
        previewEarned={!!profile?.badge_preview_mode}
      />

      {/* Reputation Onboarding Tour */}
      <RepOnboardingTour
        isVisible={showOnboarding}
        onComplete={handleCloseOnboarding}
        onSkip={handleCloseOnboarding}
        isBetaCohort={reputation?.beta_cohort ?? false}
      />

      {/* Contextual Rep Tour */}
      <ContextualRepTour
        isActive={showContextualTour}
        onStart={() => setShowContextualTour(true)}
        onComplete={() => setShowContextualTour(false)}
      />
    </div>
  );
}