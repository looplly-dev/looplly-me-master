import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { useDarkMode } from '@/hooks/useDarkMode';
import { Coins, Wallet, User, Users, Trophy, MessageSquare, LogOut, Settings, HelpCircle, Shield, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import SimplifiedEarnTab from './SimplifiedEarnTab';
import WalletTab from './WalletTab';
import ProfileTab from './ProfileTab';
import SettingsTab from './SettingsTab';
import ReferTab from './ReferTab';
import RepTab from './RepTab';
import CommunityTab from './CommunityTab';
import SimplifiedSupportTab from './SimplifiedSupportTab';
import { OnboardingTour } from '@/components/ui/onboarding-tour';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useProfileQuestions } from '@/hooks/useProfileQuestions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface DashboardProps {
  triggerOnboarding?: boolean;
}

export default function Dashboard({ triggerOnboarding = false }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('earn');
  const [showSettings, setShowSettings] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const { authState, logout } = useAuth();
  const { isAdmin } = useRole();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { showOnboarding, completeOnboarding, skipOnboarding } = useOnboarding(triggerOnboarding);
  const { level2Complete, level2Categories } = useProfileQuestions();
  
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
        {/* Level 2 Incomplete Alert */}
        {!level2Complete && (
          <Alert className="mx-4 mt-4 border-warning bg-warning/10">
            <AlertCircle className="h-5 w-5 text-warning" />
            <AlertTitle className="text-warning font-bold">Complete Your Profile to Start Earning</AlertTitle>
            <AlertDescription className="text-sm text-muted-foreground">
              You're {Math.round(level2Percentage)}% done! Finish your basic info to unlock surveys and earning opportunities.
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 border-warning text-warning hover:bg-warning hover:text-warning-foreground"
                onClick={() => setActiveTab('profile')}
              >
                Complete Now →
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
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

      {/* Onboarding Tour */}
      <OnboardingTour
        isVisible={showOnboarding}
        onComplete={completeOnboarding}
        onSkip={skipOnboarding}
      />
    </div>
  );
}