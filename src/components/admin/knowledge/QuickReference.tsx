import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, Users, Sparkles, Award } from 'lucide-react';

export default function QuickReference() {
  const navigate = useNavigate();
  
  const stats = [
    {
      icon: Globe,
      value: '5',
      label: 'Supported Countries',
      sublabel: 'ZA, NG, KE, GB, IN',
      link: 'mobile-validation'
    },
    {
      icon: Users,
      value: '3',
      label: 'User Roles',
      sublabel: 'Admin, Office, Standard',
      link: 'role-architecture'
    },
    {
      icon: Sparkles,
      value: '4',
      label: 'Core Systems',
      sublabel: 'Validation, Profile, Rep, Badges',
      link: 'profile-system-architecture'
    },
    {
      icon: Award,
      value: '20+',
      label: 'Badges',
      sublabel: 'Achievements & milestones',
      link: 'earning-rules'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card 
          key={stat.label} 
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate(`/admin/knowledge/${stat.link}`)}
        >
          <CardContent className="pt-6 text-center space-y-2">
            <stat.icon className="h-8 w-8 mx-auto text-primary" />
            <div className="text-3xl font-bold">{stat.value}</div>
            <div className="font-medium">{stat.label}</div>
            <div className="text-xs text-muted-foreground">{stat.sublabel}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
