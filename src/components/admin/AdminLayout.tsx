import { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Award,
  DollarSign,
  BarChart3,
  Brain,
  Shield,
  Home,
  ArrowRightLeft,
  Flame,
  Clock,
  MessageSquare,
  Wrench,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const adminNavItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard, exact: true },
  { title: 'Users', url: '/admin/users', icon: Users },
  { title: 'Content', url: '/admin/content', icon: Briefcase },
  { title: 'Badges', url: '/admin/badges', icon: Award },
  { title: 'Streak Config', url: '/admin/streak-config', icon: Flame },
  { title: 'Questions', url: '/admin/questions', icon: MessageSquare },
  { title: 'Redemptions', url: '/admin/redemptions', icon: DollarSign },
  { title: 'Analytics', url: '/admin/analytics', icon: BarChart3 },
  { title: 'AI Agents', url: '/admin/agents', icon: Brain },
  { title: 'Migration', url: '/admin/migration', icon: ArrowRightLeft },
];

function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();

  const isActive = (url: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === url;
    }
    return location.pathname.startsWith(url);
  };

  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar className={isCollapsed ? 'w-14' : 'w-60'} collapsible="icon">
      <SidebarHeader className="p-2">
        <NavLink to="/" className="block">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 border-primary/50 hover:bg-primary/10"
          >
            <Home className="h-4 w-4" />
            {!isCollapsed && <span>Back to Dashboard</span>}
          </Button>
        </NavLink>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <Shield className="h-4 w-4 mr-2 inline" />
            {!isCollapsed && 'Admin Panel'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
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
      users: 'Users',
      content: 'Content',
      badges: 'Badge Generator',
      'streak-config': 'Streak Configuration',
      questions: 'Question Management',
      'profile-decay': 'Question Management',
      'profile-questions': 'Question Management',
      'question-builder': 'Question Management',
      redemptions: 'Redemptions',
      analytics: 'Analytics',
      agents: 'AI Agents',
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
