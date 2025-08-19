import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { Coins, Wallet, User, Users, Trophy, MessageSquare, LogOut, Settings, HelpCircle } from 'lucide-react';
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

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('earn');
  const [showSettings, setShowSettings] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const { authState, logout } = useAuth();
  const { showOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();

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
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="bg-card/95 backdrop-blur-sm border-b sticky top-0 z-40">
          <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
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
        <div className="max-w-md mx-auto">
          <SimplifiedSupportTab />
        </div>
      </div>
    );
  }

  // Show settings page
  if (showSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="bg-card/95 backdrop-blur-sm border-b sticky top-0 z-40">
          <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
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
        <div className="max-w-md mx-auto">
          <SettingsTab />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <div className="bg-card/95 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary">
              Looplly
            </h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {authState.user?.firstName || 'User'}!
            </p>
          </div>
          <div className="flex items-center gap-2">
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
      <div className="max-w-md mx-auto">
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

          {/* Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t">
            <div className="max-w-md mx-auto">
              <TabsList className="grid w-full grid-cols-6 h-16 bg-transparent">
                <TabsTrigger 
                  value="earn" 
                  className="flex-col gap-1 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <Coins className="h-4 w-4" />
                  <span className="text-xs">Earn</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="wallet" 
                  className="flex-col gap-1 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <Wallet className="h-4 w-4" />
                  <span className="text-xs">Wallet</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="profile" 
                  className="flex-col gap-1 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <User className="h-4 w-4" />
                  <span className="text-xs">Profile</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="refer" 
                  className="flex-col gap-1 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <Users className="h-4 w-4" />
                  <span className="text-xs">Refer</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="community" 
                  className="flex-col gap-1 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-xs">Community</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="rep" 
                  className="flex-col gap-1 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <Trophy className="h-4 w-4" />
                  <span className="text-xs">Rep</span>
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