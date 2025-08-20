import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    <div className="p-4 pb-20 space-y-4">
      {/* Header with category counts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-500" />
            Ready to Earn
          </h1>
          <Badge className="bg-orange-100 text-orange-600 border-orange-200">
            {availableTasks.length} available
          </Badge>
        </div>
        
        {/* Category tabs */}
        <div className="flex gap-2 mb-4">
          <Badge variant="outline" className="px-3 py-1 bg-white">
            <FileText className="h-3 w-3 mr-1" />
            Surveys <span className="ml-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">{surveyCount}</span>
          </Badge>
          <Badge variant="outline" className="px-3 py-1 bg-white">
            <Play className="h-3 w-3 mr-1" />
            Videos <span className="ml-1 bg-teal-500 text-white text-xs px-1.5 py-0.5 rounded-full">{videoCount}</span>
          </Badge>
          <Badge variant="outline" className="px-3 py-1 bg-white">
            <Zap className="h-3 w-3 mr-1" />
            Tasks <span className="ml-1 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">{taskCount}</span>
          </Badge>
          <Badge variant="outline" className="px-3 py-1 bg-white">
            <Shield className="h-3 w-3 mr-1" />
            Data <span className="ml-1 bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-full">{dataCount}</span>
          </Badge>
        </div>
      </div>

      {/* Available Activities - Clean Card Layout */}
      <div className="space-y-3">
        {availableTasks.slice(0, 6).map((activity) => (
          <Card key={activity.id} className="bg-white border-l-4 border-l-orange-400 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    {activity.activity_type === 'survey' && <FileText className="h-5 w-5 text-gray-600 mt-0.5" />}
                    {activity.activity_type === 'video' && <Play className="h-5 w-5 text-gray-600 mt-0.5" />}
                    {activity.activity_type === 'task' && <Zap className="h-5 w-5 text-gray-600 mt-0.5" />}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{activity.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{activity.time_estimate || 5} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Coins className="h-4 w-4 text-emerald-600" />
                      <span className="font-bold text-emerald-600">${activity.reward_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500 fill-current" />
                      <span className="font-medium">{activity.metadata?.rating || '4.6'}</span>
                      <span className="text-gray-500">({activity.metadata?.reviews || '234'})</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="ml-4 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium"
                  onClick={() => handleStartTask(activity.activity_type, activity.title, activity.reward_amount)}
                >
                  Start
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Progress Indicator */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">Progress to first cashout</p>
              <p className="text-2xl font-bold text-blue-700">${currentProgress.toFixed(2)} / $5.00</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600">{Math.round(progressPercentage)}% complete</p>
              <Progress value={progressPercentage} className="w-20 h-2 mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}