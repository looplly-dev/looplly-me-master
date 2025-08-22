import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CollapsibleSection } from '@/components/ui/collapsible-section';
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
  Clock
} from 'lucide-react';
import { useBalance } from '@/hooks/useBalance';
import { useEarningActivities } from '@/hooks/useEarningActivities';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/hooks/useAuth';
import { addMissingDemoActivities } from '@/utils/addMissingDemoActivities';
import { addMockEarningActivities } from '@/utils/mockEarningActivities';
import { userStats } from '@/data/mockData';

export default function SimplifiedEarnTab() {
  const [checkInDone, setCheckInDone] = useState(false);
  const [dataOptIns, setDataOptIns] = useState({
    shopping: false,
    appUsage: false
  });
  const { toast } = useToast();
  const { balance } = useBalance();
  const { activities, addActivity, refetch } = useEarningActivities();
  const { addTransaction } = useTransactions();
  const { authState } = useAuth();

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
    // More celebratory feedback
    toast({
      title: '✨ Task Started!',
      description: `Great choice! Complete "${title}" to earn $${reward.toFixed(2)}`,
    });
  };

  const handleDataToggle = (type: 'shopping' | 'appUsage', checked: boolean) => {
    setDataOptIns(prev => ({ ...prev, [type]: checked }));
    
    const earnings = type === 'shopping' ? 0.10 : 0.08;
    const action = checked ? 'Opted In' : 'Opted Out';
    const description = checked 
      ? `You'll now earn $${earnings.toFixed(2)}/month from ${type === 'shopping' ? 'shopping behavior' : 'app usage'} data sharing.`
      : `You've stopped earning $${earnings.toFixed(2)}/month from ${type === 'shopping' ? 'shopping behavior' : 'app usage'} data sharing.`;
    
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
  const dataCount = (!dataOptIns.shopping || !dataOptIns.appUsage) ? (2 - (dataOptIns.shopping ? 1 : 0) - (dataOptIns.appUsage ? 1 : 0)) : 0;


  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Enhanced Balance Card with Progress */}
      <Card className="bg-card border-0 shadow-lg">
        <CardContent className="p-6">
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
      <Card className="border-primary/20 bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
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
              className={checkInDone ? "" : "bg-primary hover:bg-primary/90"}
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
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-white shadow-sm border">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-primary">{completedTasks.length}</p>
            <p className="text-xs text-muted-foreground">Tasks Done</p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm border">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-warning">{availableTasks.length}</p>
            <p className="text-xs text-muted-foreground">Available</p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm border">
          <CardContent className="p-3 text-center">
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
        <Card className="bg-white shadow-sm border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Ready to Earn
              </span>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {availableTasks.length} available
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="min-h-[500px] max-h-[650px] overflow-visible">
            <Tabs defaultValue="surveys" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="surveys" className="text-xs relative">
                  Surveys
                  {surveyCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-medium z-10">
                      {surveyCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="videos" className="text-xs relative">
                  Videos
                  {videoCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-accent text-white text-xs rounded-full flex items-center justify-center font-medium z-10">
                      {videoCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="tasks" className="text-xs relative">
                  Tasks
                  {taskCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-warning text-white text-xs rounded-full flex items-center justify-center font-medium z-10">
                      {taskCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="data" className="text-xs relative">
                  Data
                  {dataCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-success text-white text-xs rounded-full flex items-center justify-center font-medium z-10">
                      {dataCount}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="surveys" className="space-y-3 mt-4 max-h-[400px] overflow-y-auto scroll-smooth pb-4">
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
                    <div key={activity.id} className="p-4 border rounded-lg bg-white shadow-sm border-l-4 border-l-primary/50 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <div>
                            <h3 className="font-semibold">{activity.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <Button
                            onClick={() => handleStartTask(activity.activity_type, activity.title, activity.reward_amount)}
                          >
                            Start
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {activity.time_estimate || 5} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Coins className="h-4 w-4 text-success" />
                          <span className="font-bold text-success">${activity.reward_amount.toFixed(2)}</span>
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-warning fill-current" />
                          <span className="font-medium">
                            {activity.metadata?.rating || '4.2'}
                          </span>
                          <span className="text-muted-foreground">
                            ({activity.metadata?.reviews || '284'})
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="videos" className="space-y-3 mt-4 max-h-[400px] overflow-y-auto scroll-smooth pb-4">
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
                    <div key={activity.id} className="p-4 border rounded-lg bg-white shadow-sm border-l-4 border-l-accent/50 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Play className="h-5 w-5 text-accent" />
                          <div>
                            <h3 className="font-semibold">{activity.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <Button
                            onClick={() => handleStartTask(activity.activity_type, activity.title, activity.reward_amount)}
                          >
                            Start
                          </Button>
                        </div>
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
                          <Star className="h-4 w-4 text-warning fill-current" />
                          <span className="font-medium">
                            {activity.metadata?.rating || '4.2'}
                          </span>
                          <span className="text-muted-foreground">
                            ({activity.metadata?.reviews || '284'})
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="tasks" className="space-y-3 mt-4 max-h-[400px] overflow-y-auto scroll-smooth pb-4">
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
                    <div key={activity.id} className="p-4 border rounded-lg bg-white shadow-sm border-l-4 border-l-warning/50 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Zap className="h-5 w-5 text-warning" />
                          <div>
                            <h3 className="font-semibold">{activity.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <Button
                            onClick={() => handleStartTask(activity.activity_type, activity.title, activity.reward_amount)}
                          >
                            Start
                          </Button>
                        </div>
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
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-warning fill-current" />
                          <span className="font-medium">
                            {activity.metadata?.rating || '4.5'}
                          </span>
                          <span className="text-muted-foreground">
                            ({activity.metadata?.reviews || '92'})
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="data" className="space-y-3 mt-4 max-h-[500px] overflow-y-auto scroll-smooth">
                <div className="p-4 border rounded-lg bg-white shadow-sm">
                  <div className="flex gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <div className="text-lg">🔄</div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-1">Data Revenue Sharing</h3>
                      <p className="text-xs text-muted-foreground">
                        Earn when Looplly generates revenue from your opted-in data
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Location Data</p>
                        <p className="text-xs text-muted-foreground">Anonymous location insights</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-success">$0.05/month</p>
                        <Badge variant="outline" className="text-success border-success text-xs">
                          Active
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Shopping Behavior</p>
                        <p className="text-xs text-muted-foreground">Purchase pattern analysis</p>
                      </div>
                       <div className="flex flex-col items-end gap-1">
                         <p className="text-sm font-semibold text-success">$0.10/month</p>
                         <Switch
                           checked={dataOptIns.shopping}
                           onCheckedChange={(checked) => handleDataToggle('shopping', checked)}
                         />
                       </div>
                     </div>
                     
                     <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                       <div>
                         <p className="font-medium text-sm">App Usage Patterns</p>
                         <p className="text-xs text-muted-foreground">Digital behavior insights</p>
                       </div>
                       <div className="flex flex-col items-end gap-1">
                         <p className="text-sm font-semibold text-success">$0.08/month</p>
                         <Switch
                           checked={dataOptIns.appUsage}
                           onCheckedChange={(checked) => handleDataToggle('appUsage', checked)}
                         />
                       </div>
                     </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-xs text-muted-foreground">
                      💡 <strong>Transparent Earnings:</strong> You earn a share of revenue each time your data contributes to insights sold to research partners. All data is anonymized and aggregated.
                    </p>
                  </div>
                </div>
              </TabsContent>

            </Tabs>
          </CardContent>
        </Card>

        {/* Completed Tasks (if any) */}
        {completedTasks.length > 0 && (
          <Card className="bg-white shadow-sm border border-success/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-success">
                <CheckCircle className="h-5 w-5" />
                Recently Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                 {completedTasks.slice(0, 2).map((activity) => (
                   <div key={activity.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
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
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
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
            
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
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
            
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
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
          
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs text-info font-medium">
              💡 <strong>Pro Tip:</strong> Check in daily and complete quality tasks to build Rep fast. Higher Rep = Higher earnings!
            </p>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}