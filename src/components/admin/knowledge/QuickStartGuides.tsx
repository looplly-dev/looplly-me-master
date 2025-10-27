import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowRight, UserCircle, Shield, Users, ClipboardList, UserPlus, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { quickStartGuides } from '@/data/quickStartGuides';

const iconMap = {
  UserCircle,
  Shield,
  Users,
  ClipboardList,
  UserPlus,
  Star
};

export default function QuickStartGuides() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Quick Start Guides</h2>
        <p className="text-muted-foreground">
          Get started quickly with these essential guides
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quickStartGuides.map((guide) => {
          const IconComponent = iconMap[guide.icon as keyof typeof iconMap] || ClipboardList;
          
          return (
            <Card 
              key={guide.id}
              className="hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => navigate(`/admin/knowledge/doc/${guide.documentId}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="h-3 w-3" />
                        {guide.estimatedMinutes} min
                      </Badge>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {guide.title}
                    </CardTitle>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{guide.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
