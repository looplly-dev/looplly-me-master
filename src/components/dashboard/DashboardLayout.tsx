import { ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { useDarkMode } from '@/hooks/useDarkMode';
import { Coins, Wallet, User, Users, Trophy, MessageSquare, LogOut, Settings as SettingsIcon, HelpCircle, Shield, Moon, Sun } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const { authState, logout } = useAuth();
  const { isAdmin } = useRole();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const handleLogout = () => {
    logout();
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: Coins, label: 'Earn' },
    { path: '/wallet', icon: Wallet, label: 'Wallet' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/refer', icon: Users, label: 'Refer' },
    { path: '/community', icon: MessageSquare, label: 'Community' },
    { path: '/rep', icon: Trophy, label: 'Rep' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card/95 backdrop-blur-md border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-md md:max-w-2xl lg:max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary">
              Hello, {authState.user?.firstName || 'User'}!
            </h1>
            <p className="text-sm text-muted-foreground">
              Welcome back to Looplly
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin() && (
              <Link to="/admin">
                <Button variant="ghost" size="icon">
                  <Shield className="h-5 w-5" />
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            <Link to="/settings">
              <Button variant="ghost" size="icon">
                <SettingsIcon className="h-5 w-5" />
              </Button>
            </Link>

            <Link to="/support">
              <Button variant="ghost" size="icon">
                <HelpCircle className="h-5 w-5" />
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md md:max-w-2xl lg:max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        {children}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t z-50">
        <div className="max-w-md md:max-w-2xl lg:max-w-5xl mx-auto px-2 md:px-4">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-primary hover:bg-muted/50'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
