import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Settings, Globe, MapPin } from 'lucide-react';

interface QuestionInlineCardProps {
  question: any;
  decayLabel: string;
  onManageCountries: () => void;
}

const getQuestionTypeIcon = (type: string) => {
  switch (type) {
    case 'text':
      return '📝';
    case 'number':
      return '🔢';
    case 'select':
    case 'select_single':
      return '📋';
    case 'select_multiple':
      return '☑️';
    case 'date':
      return '📅';
    case 'email':
      return '📧';
    case 'phone':
      return '📱';
    case 'address':
      return '📍';
    case 'boolean':
      return '✓';
    default:
      return '❓';
  }
};

export function QuestionInlineCard({ 
  question, 
  decayLabel,
  onManageCountries 
}: QuestionInlineCardProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xl">{getQuestionTypeIcon(question.question_type)}</span>
          <h3 className="font-medium">{question.question_text}</h3>
          
          <Badge variant={question.applicability === 'global' ? 'default' : 'secondary'}>
            {question.applicability === 'global' ? (
              <><Globe className="mr-1 h-3 w-3" />Global</>
            ) : (
              <><MapPin className="mr-1 h-3 w-3" />Country-Specific</>
            )}
          </Badge>
          
          {question.is_required && (
            <Badge variant="destructive">Required</Badge>
          )}
          
          <Badge variant="outline">{decayLabel}</Badge>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Key: <code className="text-xs bg-muted px-1 py-0.5 rounded">{question.question_key}</code></span>
          <span>Type: {question.question_type}</span>
          {question.country_codes && question.country_codes.length > 0 && (
            <span>Countries: {question.country_codes.join(', ')}</span>
          )}
        </div>
      </div>
      
      <div className="flex gap-2 ml-4">
        {question.applicability === 'country_specific' && (
          <Button
            variant="outline"
            size="sm"
            onClick={onManageCountries}
          >
            Manage Countries
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          title="Quick Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          title="Edit Question"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
