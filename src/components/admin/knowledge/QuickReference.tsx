import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, User, TrendingUp, Award, Globe } from 'lucide-react';

export default function QuickReference() {
  const references = [
    {
      title: 'Mobile Validation Rules',
      icon: Smartphone,
      items: [
        { label: 'Format', value: 'E.164 (+27823456789)' },
        { label: 'Countries', value: 'ZA, NG, KE, GB, IN' },
        { label: 'Type', value: 'Mobile only (no landlines)' },
        { label: 'Validation', value: 'libphonenumber-js' }
      ],
      badge: 'Core System'
    },
    {
      title: 'Profile Requirements',
      icon: User,
      items: [
        { label: 'Required', value: 'mobile, country, first_name, last_name' },
        { label: 'Optional', value: 'date_of_birth, gender, address' },
        { label: 'Validation', value: 'Real-time with feedback' },
        { label: 'Decay', value: 'Configurable per field' }
      ],
      badge: 'Core System'
    },
    {
      title: 'Reputation System',
      icon: TrendingUp,
      items: [
        { label: 'Daily Check-in', value: '+5 points' },
        { label: 'Survey Complete', value: '+10 points' },
        { label: 'Profile Complete', value: '+20 points' },
        { label: '7-Day Streak', value: 'Badge earned' }
      ],
      badge: 'Core System'
    },
    {
      title: 'User Types',
      icon: Globe,
      items: [
        { label: 'Office User', value: 'B2B partner employees' },
        { label: 'Looplly User', value: 'Direct B2C users' },
        { label: 'Earning Caps', value: 'Different per type' },
        { label: 'KYC Rules', value: 'Type-specific requirements' }
      ],
      badge: 'Admin Guide'
    },
    {
      title: 'Badge System',
      icon: Award,
      items: [
        { label: 'Types', value: 'Achievement, Milestone, Special' },
        { label: 'Earning', value: 'Automated based on rules' },
        { label: 'Display', value: 'User profile showcase' },
        { label: 'Management', value: 'Admin badge generator' }
      ],
      badge: 'Core System'
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Quick Reference</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {references.map((ref) => {
          const Icon = ref.icon;
          return (
            <Card key={ref.title}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">{ref.title}</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {ref.badge}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {ref.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.label}:</span>
                      <span className="font-medium text-right">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
