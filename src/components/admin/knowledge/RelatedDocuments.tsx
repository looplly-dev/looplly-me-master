import { FileText, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { findRelatedDocuments } from '@/utils/documentSimilarity';
import { calculateReadTime } from '@/utils/readTime';

interface RelatedDocumentsProps {
  documentId: string;
}

export default function RelatedDocuments({ documentId }: RelatedDocumentsProps) {
  const navigate = useNavigate();
  const relatedDocs = findRelatedDocuments(documentId, 4);

  if (relatedDocs.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Related Documentation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {relatedDocs.map((doc) => (
          <div
            key={doc.id}
            className="p-3 rounded-lg border hover:border-primary cursor-pointer transition-all group"
            onClick={() => navigate(`/admin/knowledge/doc/${doc.id}`)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-primary" />
                  <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                    {doc.title}
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {doc.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {doc.category}
                  </Badge>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
