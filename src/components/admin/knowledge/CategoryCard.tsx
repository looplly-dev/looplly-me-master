import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, FileText } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  category: string;
  total: number;
  published: number;
  comingSoon: number;
  icon: LucideIcon;
  topDocs?: Array<{ id: string; title: string }>;
  onClick: () => void;
}

export default function CategoryCard({
  category,
  total,
  published,
  comingSoon,
  icon: IconComponent,
  topDocs = [],
  onClick
}: CategoryCardProps) {
  const hasNewDocs = false; // TODO: Check if docs added in past 7 days

  return (
    <Card 
      className="relative overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      {hasNewDocs && (
        <Badge className="absolute top-2 right-2 animate-pulse">New</Badge>
      )}
      
      <CardContent className="pt-6 text-center space-y-3">
        <IconComponent className="h-12 w-12 mx-auto text-primary group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />
        
        <div>
          <h3 className="font-semibold text-lg">{category}</h3>
          <div className="flex justify-center gap-2 mt-2 text-xs text-muted-foreground">
            {published > 0 && (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                {published}
              </span>
            )}
            {comingSoon > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-yellow-600" />
                {comingSoon}
              </span>
            )}
          </div>
        </div>

        {/* Preview overlay on hover */}
        {topDocs.length > 0 && (
          <div className="absolute inset-0 bg-background/98 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-center">
            <p className="text-sm font-semibold mb-3">Top Documents:</p>
            <ul className="text-xs space-y-2 text-left">
              {topDocs.slice(0, 3).map(doc => (
                <li key={doc.id} className="truncate flex items-start gap-2">
                  <FileText className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                  <span>{doc.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
