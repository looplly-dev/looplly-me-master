import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { useDarkMode } from '@/hooks/useDarkMode';
import { Coins, Wallet, User, Trophy, LogOut, Settings, HelpCircle, Moon, Sun, Shield, Users, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getSupabaseClient } from '@/integrations/supabase/activeClient';
import SimplifiedEarnTab from './SimplifiedEarnTab';
import WalletTab from './WalletTab';
import ProfileTab from './ProfileTab';
import SettingsTab from './SettingsTab';
import ReferTab from './ReferTab';
import RepTab from './RepTab';
import CommunityTab from './CommunityTab';
import SimplifiedSupportTab from './SimplifiedSupportTab';
import { OnboardingTour } from '@/components/ui/onboarding-tour';
import { useProfileQuestions } from '@/hooks/useProfileQuestions';
import { useToast } from '@/hooks/use-toast';

interface DashboardProps {
  triggerOnboarding?: boolean;
}

export default function Dashboard({ triggerOnboarding = false }: DashboardProps) {
  const [showOnboardingTour, setShowOnboardingTour] = useState(false);
  const [activeTab, setActiveTab] = useState('earn');
  const [showSettings, setShowSettings] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const { authState, logout } = useAuth();
  const { isAdmin } = useRole();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { level2Complete, level2Categories } = useProfileQuestions();
  const { toast } = useToast();
  const navigate = useNavigate();
  const supabase = getSupabaseClient();

  // Check for onboarding tour flag on mount
  useEffect(() => {
    const shouldShowTour = sessionStorage.getItem('show_onboarding_tour');
    if (shouldShowTour === 'true') {
      setShowOnboardingTour(true);
      sessionStorage.removeItem('show_onboarding_tour');
    }
  }, []);
  
  // Prevent test accounts from accessing dashboard outside simulator
  useEffect(() => {
    const checkTestAccount = async () => {
      if (!authState.user?.id) return;
      
      // Only check if NOT in simulator
      if (window.location.pathname.startsWith('/simulator')) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_test_account')
        .eq('user_id', authState.user.id)
        .maybeSingle();
      
      if (profile?.is_test_account) {
        console.warn('[Dashboard] Test account blocked from production dashboard');
        toast({
          title: 'Access Denied',
          description: 'Test accounts can only be used in the Journey Simulator',
          variant: 'destructive'
        });
        navigate('/');
      }
    };
    
    checkTestAccount();
  }, [authState.user, navigate, supabase, toast]);
  
  const isVerified = authState.user?.profile?.is_verified ?? false;
  
  // Calculate Level 2 percentage
  const level2Questions = level2Categories.flatMap(c => c.questions);
  const level2Required = level2Questions.filter(q => q.is_required);
  const level2Answered = level2Required.filter(q => q.user_answer?.answer_value || q.user_answer?.answer_json);
  const level2Percentage = level2Required.length > 0 
    ? Math.round((level2Answered.length / level2Required.length) * 100)
    : 0;

  const handleLogout = () => {
    logout();
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  const handleSupportClick = () => {
    setShowSupport(true);
  };

  const handleBackFromSettings = () => {
    setShowSettings(false);
  };

  const handleBackFromSupport = () => {
    setShowSupport(false);
  };

  // Show support page
  if (showSupport) {
    return (
      <div className="min-h-screen bg-background">
      <div className="bg-card/95 backdrop-blur-md border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-md md:max-w-2xl lg:max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackFromSupport}
              className="text-muted-foreground hover:text-primary"
            >
              ← Back
            </Button>
            <h1 className="text-xl font-bold text-primary">
              Support
            </h1>
            <div className="w-8" /> {/* Spacer */}
          </div>
        </div>
        <div className="max-w-md md:max-w-2xl lg:max-w-5xl mx-auto">
          <SimplifiedSupportTab />
        </div>
      </div>
    );
  }

  // Show settings page
  if (showSettings) {
    return (
      <div className="min-h-screen bg-background">
      <div className="bg-card/95 backdrop-blur-md border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-md md:max-w-2xl lg:max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackFromSettings}
              className="text-muted-foreground hover:text-primary"
            >
              ← Back
            </Button>
            <h1 className="text-xl font-bold text-primary">
              Settings
            </h1>
            <div className="w-8" /> {/* Spacer */}
          </div>
        </div>
        <div className="max-w-md md:max-w-2xl lg:max-w-5xl mx-auto">
          <SettingsTab />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card/95 backdrop-blur-md border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-md md:max-w-2xl lg:max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-primary">
              Looplly
            </h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {authState.user?.firstName || 'User'}!
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin() && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-muted-foreground hover:text-primary"
              >
                <Link to="/admin">
                  <Shield className="h-4 w-4" />
                </Link>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSupportClick}
              className="text-muted-foreground hover:text-primary"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="text-muted-foreground hover:text-primary transition-all duration-200 active:scale-95"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4 text-amber-500 dark:text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-600" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSettingsClick}
              className="text-muted-foreground hover:text-primary"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md md:max-w-2xl lg:max-w-5xl mx-auto">
        {/* Alerts removed - gates now handled in SimplifiedEarnTab */}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="earn" className="mt-0">
            <SimplifiedEarnTab />
          </TabsContent>
          <TabsContent value="wallet" className="mt-0">
            <WalletTab />
          </TabsContent>
          <TabsContent value="profile" className="mt-0">
            <ProfileTab />
          </TabsContent>
          <TabsContent value="refer" className="mt-0">
            <ReferTab />
          </TabsContent>
          <TabsContent value="community" className="mt-0">
            <CommunityTab />
          </TabsContent>
          <TabsContent value="rep" className="mt-0">
            <RepTab />
          </TabsContent>

          {/* Universal bottom spacer to ensure all tabs can scroll past the fixed nav */}
          <div aria-hidden="true" className="h-24 md:h-20 lg:h-8" />

          {/* Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t shadow-lg pb-[env(safe-area-inset-bottom)]">
            <div className="max-w-md md:max-w-2xl lg:max-w-5xl mx-auto">
              <TabsList className="grid w-full grid-cols-6 h-16 md:h-14 bg-transparent">
                <TabsTrigger 
                  value="earn" 
                  className="flex-col gap-1 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary active:scale-95 transition-transform"
                >
                  <Coins className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-xs md:text-sm">Earn</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="wallet" 
                  className="flex-col gap-1 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary active:scale-95 transition-transform"
                >
                  <Wallet className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-xs md:text-sm">Wallet</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="profile" 
                  className="flex-col gap-1 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary active:scale-95 transition-transform relative"
                >
                  <User className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-xs md:text-sm">Profile</span>
                  {!level2Complete && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-warning rounded-full animate-pulse" />
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="refer" 
                  className="flex-col gap-1 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary active:scale-95 transition-transform"
                >
                  <Users className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-xs md:text-sm">Refer</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="community" 
                  className="flex-col gap-1 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary active:scale-95 transition-transform"
                >
                  <MessageSquare className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-xs md:text-sm">Community</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="rep" 
                  className="flex-col gap-1 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary active:scale-95 transition-transform"
                >
                  <Trophy className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-xs md:text-sm">Rep</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </Tabs>
      </div>

      {/* Onboarding Tour - Shows after registration */}
      {showOnboardingTour && (
        <OnboardingTour 
          isVisible={showOnboardingTour}
          onComplete={() => setShowOnboardingTour(false)}
          onSkip={() => setShowOnboardingTour(false)}
        />
      )}
    </div>
  );
}