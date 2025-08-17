import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { Coins, Wallet, User, Users, Trophy, LogOut, Settings } from 'lucide-react';
import EarnTab from './EarnTab';
import WalletTab from './WalletTab';
import ProfileTab from './ProfileTab';
import SettingsTab from './SettingsTab';
import ReferTab from './ReferTab';
import RepTab from './RepTab';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('earn');
  const { authState, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <div className="bg-card/95 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Looplly
            </h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {authState.user?.firstName || 'User'}!
            </p>
          </div>
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

      {/* Main Content */}
      <div className="max-w-md mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="earn" className="mt-0">
            <EarnTab />
          </TabsContent>
          <TabsContent value="wallet" className="mt-0">
            <WalletTab />
          </TabsContent>
          <TabsContent value="profile" className="mt-0">
            <ProfileTab />
          </TabsContent>
          <TabsContent value="settings" className="mt-0">
            <SettingsTab />
          </TabsContent>
          <TabsContent value="refer" className="mt-0">
            <ReferTab />
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
                  value="settings" 
                  className="flex-col gap-1 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <Settings className="h-4 w-4" />
                  <span className="text-xs">Settings</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="refer" 
                  className="flex-col gap-1 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <Users className="h-4 w-4" />
                  <span className="text-xs">Refer</span>
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
    </div>
  );
}