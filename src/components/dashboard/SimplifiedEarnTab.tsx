import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CollapsibleSection } from '@/components/ui/collapsible-section';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Coins, 
  CheckCircle, 
  Star,
  TrendingUp,
  Target,
  Trophy,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Shield,
  Zap,
  Award,
  FileText,
  Play,
  Clock,
  Cookie,
  Eye,
  Search,
  Globe,
  MapPin,
  ShoppingBag,
  Smartphone,
  CreditCard,
  Share2,
  Info,
  Copy,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBalance } from '@/hooks/useBalance';
import { useEarningActivities } from '@/hooks/useEarningActivities';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/hooks/useAuth';
import { useCintSurveys } from '@/hooks/useCintSurveys';
import { useIsMobile } from '@/hooks/use-mobile';
import { addMissingDemoActivities } from '@/utils/addMissingDemoActivities';
import { addMockEarningActivities } from '@/utils/mockEarningActivities';
import { userStats } from '@/mock_data';
import { useProfileQuestions } from '@/hooks/useProfileQuestions';
import { useStaleProfileCheck } from '@/hooks/useStaleProfileCheck';
import { ProfileUpdateModal } from '@/components/dashboard/ProfileUpdateModal';
import { useNavigate } from 'react-router-dom';
import { analytics } from '@/utils/analytics';


export default function SimplifiedEarnTab() {
  const navigate = useNavigate();
  const { level2Complete, level2Categories } = useProfileQuestions();
  
  // Calculate Level 2 percentage
  const level2Questions = level2Categories.flatMap(c => c.questions);
  const level2Required = level2Questions.filter(q => q.is_required);
  const level2Answered = level2Required.filter(q => q.user_answer?.answer_value || q.user_answer?.answer_json);
  const level2Percentage = level2Required.length > 0 
    ? Math.round((level2Answered.length / level2Required.length) * 100)
    : 0;
    
  const { hasStaleData, staleQuestions, staleCount } = useStaleProfileCheck();
  const [checkInDone, setCheckInDone] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(true);
  
  const [dataOptIns, setDataOptIns] = useState({
    shopping: false,
    appUsage: false,
    cookieTracking: false,
    browsingBehavior: false,
    searchHistory: false,
    crossSiteTracking: false,
    adPreferences: false,
    socialMedia: false,
    ecommerce: false,
    financial: false,
    browserHistory: false
  });
  const { toast } = useToast();
  const { balance } = useBalance();
  const { activities, addActivity, refetch } = useEarningActivities();
  const { addTransaction } = useTransactions();
  const { authState } = useAuth();
  const { surveys: cintSurveys, isLoading: cintLoading, startSurvey } = useCintSurveys();
  const isMobile = useIsMobile();
  
  const isVerified = authState.user?.profile?.is_verified ?? false;

  // Skip tracking for stale profile updates
  const SKIP_TIMESTAMP_KEY = 'profile_update_skip_timestamp';
  const SKIP_DURATION_HOURS = 24;

  const hasSkippedUpdate = () => {
    const skipTimestamp = localStorage.getItem(SKIP_TIMESTAMP_KEY);
    if (!skipTimestamp) return false;
    const hoursSinceSkip = (Date.now() - parseInt(skipTimestamp)) / (1000 * 60 * 60);
    return hoursSinceSkip < SKIP_DURATION_HOURS;
  };

  const recordSkip = () => {
    localStorage.setItem(SKIP_TIMESTAMP_KEY, Date.now().toString());
  };

  // Using static mock data - no database calls needed

  // Progress to next goal (simplified for basic users)
  const nextGoal = 5.00; // First withdrawal goal
  const currentProgress = balance?.available_balance || 0;
  const progressPercentage = Math.min((currentProgress / nextGoal) * 100, 100);

  const handleCheckIn = () => {
    if (checkInDone) return;
    
    setCheckInDone(true);
    
    // Calculate progressive Rep reward based on streak from userStats
    const { userStats } = require('@/data/mockData');
    const currentStreak = userStats.streaks.currentStreak + 1;
    const repReward = currentStreak >= 30 ? 25 : currentStreak >= 14 ? 15 : currentStreak >= 7 ? 10 : 5;
    
    // Track daily check-in
    analytics.trackDailyCheckin(currentStreak, repReward);
    
    // Add Rep increase with progressive rewards
    addTransaction({
      type: 'bonus',
      amount: 0, // No money reward
      currency: 'REP',
      description: `Daily streak Rep boost (Day ${currentStreak})`,
      source: 'daily_checkin',
      status: 'completed',
      metadata: { rep_gained: repReward, streak: currentStreak }
    });

    // Enhanced success feedback with milestone info
    const milestoneMessage = currentStreak === 7 ? ' Week Warrior badge unlocked!' :
                           currentStreak === 30 ? ' Month Master badge unlocked!' :
                           currentStreak === 90 ? ' Quarter Champion badge unlocked!' :
                           currentStreak >= 30 ? ` ${currentStreak - 30} days until next milestone!` : '';
    
    toast({
      title: '🔥 Streak Extended!',
      description: `+${repReward} Rep earned! Day ${currentStreak} streak.${milestoneMessage}`,
    });
  };

  const handleStartTask = (type: string, title: string, reward: number) => {
    // Check if content is locked
    if (isContentLocked) {
      toast({
        title: 'Complete Your Profile',
        description: 'Finish answering profile questions to unlock earning opportunities',
        action: (
          <Button size="sm" onClick={() => navigate('/profile/complete')}>
            Complete Profile
          </Button>
        ),
      });
      return;
    }
    
    // Check verification status first
    if (!isVerified) {
      toast({
        title: 'Verification Required',
        description: 'Please verify your mobile number to start earning',
        variant: 'default'
      });
      return;
    }
    
    // Track task click
    analytics.trackEarningActivity(
      type as 'survey' | 'video' | 'task', 
      'click', 
      title, 
      reward
    );
    
    // More celebratory feedback
    toast({
      title: '✨ Task Started!',
      description: `Great choice! Complete "${title}" to earn $${reward.toFixed(2)}`,
    });
  };

  const handleDataToggle = (type: keyof typeof dataOptIns, checked: boolean) => {
    // Check if content is locked
    if (isContentLocked) {
      toast({
        title: 'Complete Your Profile',
        description: 'Finish answering profile questions to unlock data sharing',
        action: (
          <Button size="sm" onClick={() => navigate('/profile/complete')}>
            Complete Profile
          </Button>
        ),
      });
      return;
    }
    
    setDataOptIns(prev => ({ ...prev, [type]: checked }));
    
    const earningsMap = {
      shopping: 0.10,
      appUsage: 0.08,
      cookieTracking: 0.05,
      browsingBehavior: 0.12,
      searchHistory: 0.08,
      crossSiteTracking: 0.15,
      adPreferences: 0.06,
      socialMedia: 0.18,
      ecommerce: 0.22,
      financial: 0.25,
      browserHistory: 0.05
    };
    
    const nameMap = {
      shopping: 'shopping behavior',
      appUsage: 'app usage',
      cookieTracking: 'cookie tracking',
      browsingBehavior: 'browsing behavior',
      searchHistory: 'search history',
      crossSiteTracking: 'cross-site tracking',
      adPreferences: 'advertising preferences',
      socialMedia: 'social media activity',
      ecommerce: 'e-commerce behavior',
      financial: 'financial behavior',
      browserHistory: 'browser history'
    };
    
    const earnings = earningsMap[type];
    
    // Track data sharing toggle
    analytics.trackDataSharing(nameMap[type], checked, earnings);
    
    const action = checked ? 'Opted In' : 'Opted Out';
    const description = checked 
      ? `You'll now earn $${earnings.toFixed(2)}/month from ${nameMap[type]} data sharing.`
      : `You've stopped earning $${earnings.toFixed(2)}/month from ${nameMap[type]} data sharing.`;
    
    toast({
      title: checked ? '🎉 Successfully Opted In!' : 'Opted Out',
      description,
    });
  };

  // Get available tasks (simplified view) - add static mock data for display
  const mockActivities = [
    {
      id: 'mock-survey-1',
      activity_type: 'survey' as const,
      title: 'Shopping Preferences Survey',
      description: 'Share your online shopping habits and preferences',
      reward_amount: 2.50,
      time_estimate: 8,
      status: 'available' as const,
      provider: 'Research Co.',
      metadata: { platform: 'web', rating: '4.6', reviews: '234' }
    },
    {
      id: 'mock-survey-2',
      activity_type: 'survey' as const,
      title: 'Food & Dining Survey',
      description: 'Tell us about your dining preferences and habits',
      reward_amount: 1.75,
      time_estimate: 5,
      status: 'available' as const,
      provider: 'Market Insights',
      metadata: { platform: 'mobile', rating: '4.4', reviews: '89' }
    },
    {
      id: 'mock-video-1',
      activity_type: 'video' as const,
      title: 'Product Demo: Smart Home',
      description: 'Watch a 3-minute demo of the latest smart home technology',
      reward_amount: 0.85,
      time_estimate: 3,
      status: 'available' as const,
      provider: 'AdNetwork Pro',
      metadata: { platform: 'mobile', rating: '4.2', reviews: '67' }
    },
    {
      id: 'mock-video-2',
      activity_type: 'video' as const,
      title: 'New Car Features Video',
      description: 'Learn about innovative features in electric vehicles',
      reward_amount: 1.20,
      time_estimate: 4,
      status: 'available' as const,
      provider: 'Auto Marketing',
      metadata: { platform: 'web', rating: '4.5', reviews: '93' }
    },
    {
      id: 'mock-task-1',
      activity_type: 'task' as const,
      title: 'App Store Review',
      description: 'Download and write a review for a mobile app',
      reward_amount: 1.25,
      time_estimate: 5,
      status: 'available' as const,
      provider: 'AppLovin',
      metadata: { platform: 'mobile', rating: '4.2', reviews: '89' }
    },
    {
      id: 'mock-task-2',
      activity_type: 'task' as const,
      title: 'Website Testing',
      description: 'Test a new e-commerce website and provide feedback',
      reward_amount: 4.50,
      time_estimate: 15,
      status: 'available' as const,
      provider: 'UX Testing Co.',
      metadata: { platform: 'web', rating: '4.7', reviews: '145' }
    },
    {
      id: 'mock-task-3',
      activity_type: 'task' as const,
      title: 'Social Media Engagement',
      description: 'Follow and engage with brand social media accounts',
      reward_amount: 0.75,
      time_estimate: 3,
      status: 'available' as const,
      provider: 'Social Boost',
      metadata: { platform: 'mobile', rating: '4.1', reviews: '56' }
    }
  ];

  const allActivities = [...activities, ...mockActivities];
  const availableTasks = allActivities.filter(a => a.status === 'available');
  const completedTasks = allActivities.filter(a => a.status === 'completed');

  // Count available items per category for notification dots
  const surveyCount = availableTasks.filter(a => a.activity_type === 'survey').length;
  const videoCount = availableTasks.filter(a => a.activity_type === 'video').length;
  const taskCount = availableTasks.filter(a => a.activity_type === 'task').length;
  // Only show data dot if there are items to opt into
  const dataCount = Object.values(dataOptIns).filter(opt => !opt).length;
  // Total available tasks across all categories
  const totalAvailable = surveyCount + videoCount + taskCount + dataCount;


  // Lock state for grayed-out content
  const isContentLocked = !level2Complete;
  const lockStyles = isContentLocked ? "opacity-50 grayscale pointer-events-none" : "";

  // Gate 2: Check if mobile is verified
  if (!isVerified) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-8 space-y-6 bg-gradient-to-b from-amber-500/5 to-transparent">
        <div className="relative">
          <Shield className="h-20 w-20 text-amber-600 mx-auto animate-pulse" />
          <div className="absolute inset-0 h-20 w-20 mx-auto rounded-full bg-amber-500/20 animate-ping" />
        </div>
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold text-foreground">Verify Your Mobile to Start Earning</h2>
          <p className="text-lg text-muted-foreground max-w-md">
            We need to verify your mobile number before you can access surveys
          </p>
        </div>
        <Card className="max-w-md border-amber-500/30 bg-card">
          <CardContent className="p-6 space-y-4">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <span>Quick 5-digit code verification</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <span>Protects your account and earnings</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <span>Required for payment processing</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        <Button onClick={() => navigate('/verify-mobile')} size="lg" className="text-lg px-8 py-6">
          <Shield className="h-5 w-5 mr-2" />
          Verify Mobile Now
        </Button>
      </div>
    );
  }

  // Direct pop-up if stale data exists (no prompt screen)
  const showUpdateModal = hasStaleData && !hasSkippedUpdate() && showProfileModal;

  return (
    <TooltipProvider>
      {/* Profile Update Modal - Shows directly as popup */}
      {showUpdateModal && (
        <ProfileUpdateModal
          staleQuestions={staleQuestions}
          onComplete={() => {
            localStorage.removeItem(SKIP_TIMESTAMP_KEY);
            setShowProfileModal(false);
          }}
          onSkip={() => {
            recordSkip();
            setShowProfileModal(false);
          }}
        />
      )}
      
      {/* Normal Earn content renders underneath */}
      <div className="pt-0 pb-24 md:pb-20 lg:pb-8 px-0 md:px-6 lg:px-8 space-y-3">
        
        {/* Subtle Level 2 Completion Banner */}
        {!level2Complete && (
          <Alert className="sticky top-0 z-10 border-amber-500/30 bg-amber-500/10">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-900 dark:text-amber-100">Complete Your Profile</AlertTitle>
            <AlertDescription className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex-1 space-y-1">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Answer {level2Required.length - level2Answered.length} quick questions to unlock all earning opportunities.
                </p>
                <div className="flex items-center gap-2">
                  <Progress value={level2Percentage} className="h-2 w-32" />
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-300">{level2Percentage}%</span>
                </div>
              </div>
              <Button 
                onClick={() => {
                  analytics.trackProfileComplete();
                  navigate('/profile/complete');
                }}
                size="sm"
                variant="default"
              >
                Complete Now
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Verification banner removed - now handled by gate above */}
        
        {/* Enhanced Balance Card with Progress */}
        <Card className={cn("bg-card border-0 shadow-lg relative", lockStyles)}>
          {isContentLocked && (
            <div className="absolute top-2 right-2 z-10">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Complete profile to unlock</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-primary text-sm font-medium">AI Secured</span>
                </div>
                <div className="mb-1">
                  <p className="text-muted-foreground text-sm">Your Balance</p>
                  {balance?.pending_balance && balance.pending_balance > 0 && (
                    <p className="text-xs text-muted-foreground italic">
                      (${balance.pending_balance.toFixed(2)} Under Review)
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-foreground">
                  ${currentProgress.toFixed(2)}
                </p>
                <p className="text-muted-foreground text-xs">USD</p>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Daily Check-in - More Prominent */}
      <Card className="border-primary/20 bg-card shadow-sm">
        <CardContent className="p-4 md:p-5 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-3 bg-primary/20 rounded-xl">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Daily Streak Boost</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Star className="h-3 w-3 text-warning" />
                  Day {userStats.streaks.currentStreak} • +{userStats.streaks.currentStreak >= 30 ? 25 : userStats.streaks.currentStreak >= 14 ? 15 : userStats.streaks.currentStreak >= 7 ? 10 : 5} Rep daily
                </p>
              </div>
            </div>
            <Button
              variant={checkInDone ? "secondary" : "default"}
              size="lg"
              onClick={handleCheckIn}
              disabled={checkInDone}
              className={cn(
                "w-full sm:w-auto",
                checkInDone ? "" : "bg-primary hover:bg-primary/90"
              )}
            >
              {checkInDone ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Boosted Today!
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  +25 Rep
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-4">
        <Card className="bg-card shadow-sm border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{completedTasks.length}</p>
            <p className="text-xs text-muted-foreground">Tasks Done</p>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-sm border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-warning">{totalAvailable}</p>
            <p className="text-xs text-muted-foreground">Available</p>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-sm border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-success">
              ${(balance?.total_earned || 0).toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground">Total Earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Simplified Task Sections */}
      <div className="space-y-4">
        {/* Ready to Earn with Tabs */}
        <Card className={cn("bg-card shadow-sm border relative", lockStyles)}>
          {isContentLocked && (
            <div className="absolute top-3 right-3 z-10">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Complete profile to unlock</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          <CardHeader className="pb-3 px-4 pt-2">
            <CardTitle className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 md:gap-2 text-lg md:text-[26px]">
                <Target className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                <span className="leading-tight">Ready to Earn</span>
              </span>
              <Badge 
                variant="secondary" 
                className="bg-primary/20 text-foreground border border-primary/30 px-2 py-0.5 md:px-3 md:py-1 font-semibold text-xs md:text-sm whitespace-nowrap flex-shrink-0"
              >
                {totalAvailable} available
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="earn-card-content">
            <Tabs defaultValue="surveys" className="w-full">
              <TabsList className="earn-tabs-list grid w-full grid-cols-4">
                <TabsTrigger value="surveys" className="text-xs relative">
                  Surveys
                  {surveyCount > 0 && (
                    <span className={`absolute ${isMobile ? '-top-1.5 -right-1.5 h-6 w-6 text-xs' : '-top-2 -right-2 h-7 w-7 text-sm'} bg-primary text-white rounded-full flex items-center justify-center font-medium z-10`}>
                      {surveyCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="videos" className="text-xs relative">
                  Videos
                  {videoCount > 0 && (
                    <span className={`absolute ${isMobile ? '-top-1.5 -right-1.5 h-6 w-6 text-xs' : '-top-2 -right-2 h-7 w-7 text-sm'} bg-accent text-white rounded-full border border-foreground/20 flex items-center justify-center font-medium z-10`}>
                      {videoCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="tasks" className="text-xs relative">
                  Tasks
                  {taskCount > 0 && (
                    <span className={`absolute ${isMobile ? '-top-1.5 -right-1.5 h-6 w-6 text-xs' : '-top-2 -right-2 h-7 w-7 text-sm'} bg-warning text-white rounded-full flex items-center justify-center font-medium z-10`}>
                      {taskCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="data" className="text-xs relative">
                  Data
                  {dataCount > 0 && (
                    <span className={`absolute ${isMobile ? '-top-1.5 -right-1.5 h-6 w-6 text-xs' : '-top-2 -right-2 h-7 w-7 text-sm'} bg-success text-success-foreground rounded-full flex items-center justify-center font-medium z-10`}>
                      {dataCount}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="surveys" className="earn-tab-content">
                {/* Cint Premium Surveys */}
                {cintLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="p-4 border rounded-lg animate-pulse">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : cintSurveys.length > 0 ? (
                  cintSurveys.map((survey) => (
                    <div key={survey.id} className="earn-card border rounded-lg shadow-sm border-l-4 border-l-primary/50 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <Search className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">Survey #{survey.id.toString().slice(0, 8)}</h3>
                </div>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => startSurvey(survey)}
                          className="w-16"
                        >
                          Start
                        </Button>
                      </div>
                      <div className="flex items-center gap-3 md:gap-4 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {survey.time_estimate} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Coins className="h-4 w-4 text-success" />
                          <span className="font-bold text-success">${survey.reward_amount.toFixed(2)}</span>
                        </span>
                        <span className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 text-warning fill-warning" />
                          <span className="font-medium text-foreground">{(survey.qualification_score / 20).toFixed(1)}</span>
                          <span className="text-muted-foreground hidden md:inline">({survey.completion_rate})</span>
                        </span>
                        <span className="hidden md:flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          {survey.qualification_score}% match
                        </span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                          <span className="font-mono truncate">ID: {survey.id.toString().slice(0, 12)}...</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(survey.id.toString());
                              toast({ title: "Task ID copied!" });
                            }}
                            className="hover:text-primary transition-colors"
                            title="Copy full ID"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <h3 className="font-semibold mb-2">No Premium Surveys Available</h3>
                    <p className="text-sm text-muted-foreground">
                      Check back later for high-paying Cint surveys
                    </p>
                  </div>
                )}

                {availableTasks.filter(a => a.activity_type === 'survey').length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <h3 className="font-semibold mb-2">No surveys available</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Check back later for new survey opportunities!
                    </p>
                  </div>
                ) : (
                  availableTasks.filter(a => a.activity_type === 'survey').map((activity) => (
                    <div key={activity.id} className="earn-card border rounded-lg shadow-sm border-l-4 border-l-primary/50 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">Survey #{activity.id.slice(0, 8)}</h3>
                </div>
                        </div>
                        <Button
                          size="sm"
                          className="w-16"
                          onClick={() => handleStartTask(activity.activity_type, activity.title, activity.reward_amount)}
                        >
                          Start
                        </Button>
                      </div>
                      <div className="flex items-center gap-3 md:gap-4 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {activity.time_estimate || 5} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Coins className="h-4 w-4 text-success" />
                          <span className="font-bold text-success">${activity.reward_amount.toFixed(2)}</span>
                        </span>
                        <span className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 text-warning fill-warning" />
                          <span className="font-medium text-foreground">{((activity.metadata?.qualification_score || 90) / 20).toFixed(1)}</span>
                          <span className="text-muted-foreground hidden md:inline">(94 reviews)</span>
                        </span>
                        <div className="hidden md:flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          {activity.metadata?.qualification_score || 90}% match
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                          <span className="font-mono truncate">ID: {activity.id.slice(0, 12)}...</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(activity.id);
                              toast({ title: "Task ID copied!" });
                            }}
                            className="hover:text-primary transition-colors"
                            title="Copy full ID"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="videos" className="earn-tab-content">
                {availableTasks.filter(a => a.activity_type === 'video').length === 0 ? (
                  <div className="text-center py-8">
                    <Play className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <h3 className="font-semibold mb-2">No videos available</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Video opportunities will appear here when available!
                    </p>
                  </div>
                ) : (
                  availableTasks.filter(a => a.activity_type === 'video').map((activity) => (
                    <div key={activity.id} className="earn-card border rounded-lg shadow-sm border-l-4 border-l-warning/50 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <Play className="h-5 w-5 text-warning flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold">{activity.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {activity.description}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="w-16"
                          onClick={() => handleStartTask(activity.activity_type, activity.title, activity.reward_amount)}
                        >
                          Start
                        </Button>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {activity.time_estimate || 3} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Coins className="h-4 w-4 text-success" />
                          <span className="font-bold text-success">${activity.reward_amount.toFixed(2)}</span>
                        </span>
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {activity.metadata?.qualification_score || 85}% match
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                          <span className="font-mono truncate">ID: {activity.id.slice(0, 12)}...</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(activity.id);
                              toast({ title: "Task ID copied!" });
                            }}
                            className="hover:text-primary transition-colors"
                            title="Copy full ID"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="tasks" className="earn-tab-content">
                {availableTasks.filter(a => a.activity_type === 'task').length === 0 ? (
                  <div className="text-center py-8">
                    <Zap className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <h3 className="font-semibold mb-2">No tasks available</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Micro-tasks will be posted here when available!
                    </p>
                  </div>
                ) : (
                  availableTasks.filter(a => a.activity_type === 'task').map((activity) => (
                    <div key={activity.id} className="earn-card border rounded-lg shadow-sm border-l-4 border-l-warning/50 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <Zap className="h-5 w-5 text-warning flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold">{activity.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {activity.description}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="w-16"
                          onClick={() => handleStartTask(activity.activity_type, activity.title, activity.reward_amount)}
                        >
                          Start
                        </Button>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {activity.time_estimate || 2} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Coins className="h-4 w-4 text-success" />
                          <span className="font-bold text-success">${activity.reward_amount.toFixed(2)}</span>
                        </span>
                        <span className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 text-warning fill-warning" />
                          <span className="font-medium text-foreground">{activity.metadata?.rating || '4.5'}</span>
                          <span className="text-muted-foreground hidden md:inline">({activity.metadata?.reviews || '92'})</span>
                        </span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                          <span className="font-mono truncate">ID: {activity.id.slice(0, 12)}...</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(activity.id);
                              toast({ title: "Task ID copied!" });
                            }}
                            className="hover:text-primary transition-colors"
                            title="Copy full ID"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="data" className="earn-tab-content">
                <div className="p-4 border rounded-lg bg-card shadow-sm">
                  <div className="flex gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Share2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-1">Cookie Tracking & Data Revenue Sharing</h3>
                      <p className="text-xs text-muted-foreground">
                        Earn when Looplly generates revenue from your opted-in data. All data is anonymized.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Location Data - Already Active */}
                    <div className="p-4 bg-success/10 rounded-lg border border-success/20 relative">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-sm">Location Data</p>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="inline-block cursor-help">
                                  <Badge variant="outline" className="text-green-600 border-green-600 text-xs mt-1">
                                    Anonymous
                                  </Badge>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Data is completely anonymous with no personal identifiers</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-semibold text-success">$0.05/month</p>
                          <Badge variant="outline" className="text-success border-success text-xs mt-1">
                            Active
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground pl-7">Anonymous location insights for market research</p>
                      
                      {/* Info Icon */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="absolute bottom-2 right-2 cursor-help">
                            <Info className="h-3 w-3 text-muted-foreground hover:text-foreground transition-colors" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Your location data is anonymized and used for market research, helping businesses understand regional trends without tracking individuals.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Cookie Tracking */}
                    <div className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors relative">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Cookie className="h-4 w-4 text-orange-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-sm">Cookie Tracking</p>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="inline-block cursor-help">
                                  <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs mt-1">
                                    Pseudonymous
                                  </Badge>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Data uses pseudonyms instead of real identities for privacy</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <p className="text-sm font-semibold text-success">$0.05/month</p>
                          <Switch
                            checked={dataOptIns.cookieTracking}
                            onCheckedChange={(checked) => handleDataToggle('cookieTracking', checked)}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground pl-7">Website cookies for advertising optimization</p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="absolute bottom-2 right-2 text-muted-foreground hover:text-foreground transition-colors">
                            <Info className="h-3 w-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">Tracks website cookies to help advertisers optimize their campaigns. Your identity is protected through pseudonymization.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Browser History */}
                    <div className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors relative">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Globe className="h-4 w-4 text-purple-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-sm">Browser History</p>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="inline-block cursor-help">
                                  <Badge variant="outline" className="text-purple-600 border-purple-600 text-xs mt-1">
                                    Aggregated
                                  </Badge>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Data is combined with others and cannot be traced back to you</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <p className="text-sm font-semibold text-success">$0.05/month</p>
                          <Switch
                            checked={dataOptIns.browserHistory}
                            onCheckedChange={(checked) => handleDataToggle('browserHistory', checked)}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground pl-7">Websites visited and browsing patterns</p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="absolute bottom-2 right-2 text-muted-foreground hover:text-foreground transition-colors">
                            <Info className="h-3 w-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">Aggregates browsing history data to identify trends. Your data is combined with thousands of others for complete anonymity.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Search History */}
                    <div className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors relative">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Search className="h-4 w-4 text-orange-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-sm">Search History</p>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="inline-block cursor-help">
                                  <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs mt-1">
                                    Aggregated
                                  </Badge>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Data is combined with others and cannot be traced back to you</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <p className="text-sm font-semibold text-success">$0.08/month</p>
                          <Switch
                            checked={dataOptIns.searchHistory}
                            onCheckedChange={(checked) => handleDataToggle('searchHistory', checked)}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground pl-7">Search queries and interests</p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="absolute bottom-2 right-2 text-muted-foreground hover:text-foreground transition-colors">
                            <Info className="h-3 w-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">Helps understand search trends and user interests. Data is aggregated across many users to maintain privacy.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Cross-Site Tracking */}
                    <div className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors relative">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Eye className="h-4 w-4 text-red-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-sm">Cross-Site Tracking</p>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="inline-block cursor-help">
                                  <Badge variant="outline" className="text-red-600 border-red-600 text-xs mt-1">
                                    Premium
                                  </Badge>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Higher value data with premium privacy protections</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <p className="text-sm font-semibold text-success">$0.15/month</p>
                          <Switch
                            checked={dataOptIns.crossSiteTracking}
                            onCheckedChange={(checked) => handleDataToggle('crossSiteTracking', checked)}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground pl-7">Website activity across multiple domains</p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="absolute bottom-2 right-2 text-muted-foreground hover:text-foreground transition-colors">
                            <Info className="h-3 w-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">Premium data tracking your activity across websites. Enhanced privacy protections and encryption ensure your data security.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Ad Preferences */}
                    <div className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors relative">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Eye className="h-4 w-4 text-pink-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-sm">Advertising Preferences</p>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="inline-block cursor-help">
                                  <Badge variant="outline" className="text-pink-600 border-pink-600 text-xs mt-1">
                                    Aggregated
                                  </Badge>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Data is combined with others and cannot be traced back to you</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <p className="text-sm font-semibold text-success">$0.06/month</p>
                          <Switch
                            checked={dataOptIns.adPreferences}
                            onCheckedChange={(checked) => handleDataToggle('adPreferences', checked)}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground pl-7">Ad clicks, views, and interaction patterns</p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="absolute bottom-2 right-2 text-muted-foreground hover:text-foreground transition-colors">
                            <Info className="h-3 w-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">Tracks your ad interactions to improve targeting. Data is aggregated to protect your identity.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Shopping Behavior */}
                    <div className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors relative">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <ShoppingBag className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-sm">Shopping Behavior</p>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="inline-block cursor-help">
                                  <Badge variant="outline" className="text-green-600 border-green-600 text-xs mt-1">
                                    Aggregated
                                  </Badge>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Data is combined with others and cannot be traced back to you</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <p className="text-sm font-semibold text-success">$0.10/month</p>
                          <Switch
                            checked={dataOptIns.shopping}
                            onCheckedChange={(checked) => handleDataToggle('shopping', checked)}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground pl-7">Purchase patterns and product preferences</p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="absolute bottom-2 right-2 text-muted-foreground hover:text-foreground transition-colors">
                            <Info className="h-3 w-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">Analyzes your shopping patterns and preferences to help retailers. Your personal information stays private.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Social Media Activity */}
                    <div className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors relative">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Share2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-sm">Social Media Activity</p>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="inline-block cursor-help">
                                  <Badge variant="outline" className="text-blue-500 border-blue-500 text-xs mt-1">
                                    Premium
                                  </Badge>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Higher value data with premium privacy protections</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <p className="text-sm font-semibold text-success">$0.18/month</p>
                          <Switch
                            checked={dataOptIns.socialMedia}
                            onCheckedChange={(checked) => handleDataToggle('socialMedia', checked)}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground pl-7">Social engagement and sharing patterns</p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="absolute bottom-2 right-2 text-muted-foreground hover:text-foreground transition-colors">
                            <Info className="h-3 w-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">Premium insights into social media engagement. Includes enhanced security and data encryption for your protection.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {/* E-commerce Behavior */}
                    <div className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors relative">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Globe className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-sm">E-commerce Behavior</p>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="inline-block cursor-help">
                                  <Badge variant="outline" className="text-indigo-600 border-indigo-600 text-xs mt-1">
                                    Premium
                                  </Badge>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Higher value data with premium privacy protections</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <p className="text-sm font-semibold text-success">$0.22/month</p>
                          <Switch
                            checked={dataOptIns.ecommerce}
                            onCheckedChange={(checked) => handleDataToggle('ecommerce', checked)}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground pl-7">Online shopping journey and cart behavior</p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="absolute bottom-2 right-2 text-muted-foreground hover:text-foreground transition-colors">
                            <Info className="h-3 w-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">Premium e-commerce data including shopping cart and checkout behavior. Enhanced encryption protects your transaction details.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {/* App Usage Patterns */}
                    <div className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors relative">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Smartphone className="h-4 w-4 text-gray-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-sm">App Usage Patterns</p>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="inline-block cursor-help">
                                  <Badge variant="outline" className="text-gray-600 border-gray-600 text-xs mt-1">
                                    Aggregated
                                  </Badge>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Data is combined with others and cannot be traced back to you</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <p className="text-sm font-semibold text-success">$0.08/month</p>
                          <Switch
                            checked={dataOptIns.appUsage}
                            onCheckedChange={(checked) => handleDataToggle('appUsage', checked)}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground pl-7">Mobile app engagement and usage insights</p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="absolute bottom-2 right-2 text-muted-foreground hover:text-foreground transition-colors">
                            <Info className="h-3 w-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">Tracks how you use mobile apps to improve user experiences. Data is aggregated across many users.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Financial Behavior */}
                    <div className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors relative">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-sm">Financial Behavior Patterns</p>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="inline-block cursor-help">
                                  <Badge variant="outline" className="text-yellow-600 border-yellow-600 text-xs mt-1">
                                    Premium
                                  </Badge>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Higher value data with premium privacy protections</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <p className="text-sm font-semibold text-success">$0.25/month</p>
                          <Switch
                            checked={dataOptIns.financial}
                            onCheckedChange={(checked) => handleDataToggle('financial', checked)}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground pl-7">Spending patterns and financial preferences</p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="absolute bottom-2 right-2 text-muted-foreground hover:text-foreground transition-colors">
                            <Info className="h-3 w-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">High-value financial behavior insights with maximum security. Bank-level encryption and strict privacy controls protect your data.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-info/10 rounded-lg border border-info/20">
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-info mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-info-foreground mb-1">Privacy & Transparency</p>
                        <p className="text-xs text-info">
                          All data is anonymized, aggregated, and never sold with personal identifiers. You earn a share of revenue each time your data contributes to research insights sold to partners.
                        </p>
                        <button className="text-xs text-info underline mt-1 hover:text-info-foreground">
                          Learn more about our data practices →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

            </Tabs>
          </CardContent>
        </Card>

        {/* Completed Tasks (if any) */}
        {completedTasks.length > 0 && (
          <Card className="shadow-sm border border-success/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-success">
                <CheckCircle className="h-5 w-5" />
                Recently Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                 {completedTasks.slice(0, 2).map((activity) => (
                   <div key={activity.id} className="flex items-center justify-between p-2 bg-success/10 rounded">
                    <span className="text-sm font-medium">{activity.title}</span>
                    <span className="text-sm font-bold text-success">
                      +${activity.reward_amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Rep Importance Section - Now Collapsible */}
      <CollapsibleSection
        title="Why Rep Matters"
        icon={<Shield className="h-5 w-5" />}
        defaultOpen={false}
        className="border-accent/20"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Higher Paying Tasks</h4>
                <p className="text-xs text-muted-foreground">
                  Higher Rep unlocks premium surveys and tasks worth $2-$10 each
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-success/10 rounded-lg">
                <Trophy className="h-4 w-4 text-success" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Priority Access</h4>
                <p className="text-xs text-muted-foreground">
                  Get first access to new earning opportunities before others
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Award className="h-4 w-4 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Trust & Credibility</h4>
                <p className="text-xs text-muted-foreground">
                  Brands prefer working with high-Rep users for market research
                </p>
              </div>
            </div>
          </div>
          
           <div className="p-3 bg-info/10 rounded-lg border border-info/20">
             <p className="text-xs text-info font-medium">
               💡 <strong>Pro Tip:</strong> Check in daily and complete quality tasks to build Rep fast. Higher Rep = Higher earnings!
             </p>
           </div>
         </div>
       </CollapsibleSection>
     </div>
     </TooltipProvider>
  );
}