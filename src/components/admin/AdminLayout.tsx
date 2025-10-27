import { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCog,
  Briefcase,
  Award,
  DollarSign,
  BarChart3,
  Brain,
  Shield,
  CheckCircle2,
  ArrowRightLeft,
  Flame,
  Clock,
  MessageSquare,
  Wrench,
  Plug,
  BookOpen,
  Globe,
  TestTube,
} from 'lucide-react';
import { useRole } from '@/hooks/useRole';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

type UserRole = 'super_admin' | 'admin' | 'tester' | 'user';

const adminNavItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard, exact: true, minRole: 'admin' as UserRole },
  { title: 'Journey Simulator', url: '/admin/simulator', icon: TestTube, minRole: 'tester' as UserRole },
  { title: 'Knowledge Center', url: '/admin/knowledge', icon: BookOpen, minRole: 'tester' as UserRole },
  { title: 'Team', url: '/admin/team', icon: UserCog, minRole: 'admin' as UserRole },
  { title: 'Users', url: '/admin/users', icon: Users, minRole: 'admin' as UserRole },
  { title: 'Content', url: '/admin/content', icon: Briefcase, minRole: 'admin' as UserRole },
  { title: 'Badges', url: '/admin/badges', icon: Award, minRole: 'admin' as UserRole },
  { title: 'Streak Config', url: '/admin/streak-config', icon: Flame, minRole: 'admin' as UserRole },
  { title: 'Profile Questions', url: '/admin/questions', icon: MessageSquare, minRole: 'admin' as UserRole },
  { title: 'Profile Decay', url: '/admin/profile-decay', icon: Clock, minRole: 'admin' as UserRole },
  { title: 'Country Blocklist', url: '/admin/country-blocklist', icon: Globe, minRole: 'admin' as UserRole },
  { title: 'Redemptions', url: '/admin/redemptions', icon: DollarSign, minRole: 'admin' as UserRole },
  { title: 'Analytics', url: '/admin/analytics', icon: BarChart3, minRole: 'admin' as UserRole },
  { title: 'Integrations', url: '/admin/integrations', icon: Plug, minRole: 'admin' as UserRole },
  { title: 'AI Agents', url: '/admin/agents', icon: Brain, minRole: 'admin' as UserRole },
  { title: 'Earning Rules', url: '/admin/earning-rules', icon: CheckCircle2, minRole: 'admin' as UserRole },
  { title: 'Migration', url: '/admin/migration', icon: ArrowRightLeft, minRole: 'admin' as UserRole },
];

function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { hasRole } = useRole();

  const isActive = (url: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === url;
    }
    return location.pathname.startsWith(url);
  };

  const isCollapsed = state === 'collapsed';
  
  // Filter nav items based on user's role
  const visibleNavItems = adminNavItems.filter(item => {
    // Journey Simulator: tester or higher (hierarchical)
    if (item.url === '/admin/simulator') {
      return hasRole('tester');
    }
    
    // All other admin routes: hierarchical (super_admin can access admin features)
    return hasRole(item.minRole);
  });

  return (
    <Sidebar className={isCollapsed ? 'w-14' : 'w-60'} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <Shield className="h-4 w-4 mr-2 inline" />
            {!isCollapsed && 'Admin Panel'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.exact}
                      className={({ isActive: navIsActive }) =>
                        navIsActive || isActive(item.url, item.exact)
                          ? 'bg-muted text-primary font-medium'
                          : 'hover:bg-muted/50'
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function AdminBreadcrumb() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const getBreadcrumbLabel = (segment: string) => {
    const labels: Record<string, string> = {
      admin: 'Admin',
      simulator: 'Journey Simulator',
      knowledge: 'Knowledge Center',
      team: 'Team Management',
      users: 'Users',
      content: 'Content',
      badges: 'Badge Generator',
      'streak-config': 'Streak Configuration',
      questions: 'Question Management',
      'country-blocklist': 'Country Blocklist',
      'profile-decay': 'Profile Decay Configuration',
      'profile-questions': 'Question Management',
      'question-builder': 'Question Management',
      redemptions: 'Redemptions',
      analytics: 'Analytics',
      integrations: 'Integrations',
      agents: 'AI Agents',
      'earning-rules': 'Earning Rules',
      migration: 'Migration Helper',
    };
    return labels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathSegments.map((segment, index) => {
          const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
          const isLast = index === pathSegments.length - 1;

          return (
            <div key={path} className="flex items-center">
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{getBreadcrumbLabel(segment)}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={path}>
                    {getBreadcrumbLabel(segment)}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b flex items-center px-4 gap-4 bg-background sticky top-0 z-10">
            <SidebarTrigger />
            <AdminBreadcrumb />
          </header>
          <main className="flex-1 px-6 py-6 lg:px-12 xl:px-16 bg-muted/30 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
