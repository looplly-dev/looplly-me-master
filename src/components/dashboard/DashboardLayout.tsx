import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { useUserType } from '@/hooks/useUserType';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useIsMobile } from '@/hooks/use-mobile';
import { Coins, Wallet, User, Users, Trophy, MessageSquare, LogOut, Settings as SettingsIcon, HelpCircle, Shield, Moon, Sun, BookOpen } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { HeaderActionsMenu } from './HeaderActionsMenu';
import { analytics } from '@/utils/analytics';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const { authState, logout } = useAuth();
  const { isAdmin } = useRole();
  const { isOfficeUser } = useUserType();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const isMobile = useIsMobile();

  const handleLogout = () => {
    logout();
  };

  const isActive = (path: string) => location.pathname === path;

  // Build nav items based on user type
  const baseNavItems = [
    { path: '/', icon: Coins, label: 'Earn' },
    { path: '/wallet', icon: Wallet, label: 'Wallet' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/refer', icon: Users, label: 'Refer' },
    { path: '/community', icon: MessageSquare, label: 'Community' },
    { path: '/rep', icon: Trophy, label: 'Rep' },
  ];
  
  const navItems = isOfficeUser() 
    ? [...baseNavItems, { path: '/knowledge', icon: BookOpen, label: 'Knowledge' }]
    : baseNavItems;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card/95 backdrop-blur-md border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-md md:max-w-2xl lg:max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-3 md:py-4 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-primary truncate">
              Hello, {authState.user?.firstName || 'User'}!
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
              Welcome back to Looplly
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {isAdmin() && (
              <Link to="/admin">
                <Button variant="ghost" size="icon" className="h-10 w-10 md:h-9 md:w-9">
                  <Shield className="h-6 w-6 md:h-5 md:w-5" />
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="h-10 w-10 md:h-9 md:w-9"
            >
              {isDarkMode ? (
                <Sun className="h-6 w-6 md:h-5 md:w-5" />
              ) : (
                <Moon className="h-6 w-6 md:h-5 md:w-5" />
              )}
            </Button>

            {isMobile ? (
              <HeaderActionsMenu onLogout={handleLogout} />
            ) : (
              <>
                <Link to="/settings">
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <SettingsIcon className="h-5 w-5" />
                  </Button>
                </Link>

                <Link to="/support">
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <HelpCircle className="h-5 w-5" />
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="h-9 w-9"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md md:max-w-2xl lg:max-w-5xl mx-auto px-4 md:px-6 lg:px-8 pb-6">
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
                onClick={() => {
                  analytics.trackNavigation(location.pathname, item.path, 'bottom_nav');
                }}
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
