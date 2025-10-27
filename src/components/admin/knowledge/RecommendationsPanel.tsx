import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Sparkles, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRecommendations } from '@/hooks/useRecommendations';
import { calculateReadTime } from '@/utils/readTime';

export default function RecommendationsPanel() {
  const navigate = useNavigate();
  const recommendations = useRecommendations(4);

  if (recommendations.length === 0) return null;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Recommended for You
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          {recommendations.map((doc) => (
            <div
              key={doc.id}
              className="p-3 rounded-lg bg-background border hover:border-primary cursor-pointer transition-all group"
              onClick={() => navigate(`/admin/knowledge/doc/${doc.id}`)}
            >
              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 text-primary mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                    {doc.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {doc.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {doc.category}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
