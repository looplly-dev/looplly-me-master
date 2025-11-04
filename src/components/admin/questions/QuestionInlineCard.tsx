import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Settings, Globe, MapPin, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useRole } from '@/hooks/useRole';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QuestionInlineCardProps {
  question: any;
  decayLabel: string;
  onManageCountries: () => void;
  onSettings?: () => void;
  onEdit?: () => void;
  onPreview?: () => void;
  isEditable?: boolean;
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
  onManageCountries,
  onSettings,
  onEdit,
  onPreview,
  isEditable = true
}: QuestionInlineCardProps) {
  const { isSuperAdmin } = useRole();
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const queryClient = useQueryClient();

  const toggleDraftMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('profile_questions')
        .update({ is_draft: !question.is_draft })
        .eq('id', question.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(question.is_draft ? 'Question published successfully' : 'Question unpublished');
      queryClient.invalidateQueries({ queryKey: ['admin-questions-unified'] });
      setShowPublishDialog(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to update question: ${error.message}`);
    },
  });

  const handlePublishClick = () => {
    if (question.is_draft) {
      setShowPublishDialog(true);
    } else {
      toggleDraftMutation.mutate();
    }
  };
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

          <Badge variant={question.is_draft ? "secondary" : "default"}>
            {question.is_draft ? (
              <><EyeOff className="mr-1 h-3 w-3" />Draft</>
            ) : (
              <><Eye className="mr-1 h-3 w-3" />Published</>
            )}
          </Badge>
          
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
        
        {question.level === 2 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handlePublishClick}
            disabled={toggleDraftMutation.isPending}
          >
            {toggleDraftMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {question.is_draft ? "Publishing..." : "Unpublishing..."}
              </>
            ) : question.is_draft ? (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Publish
              </>
            ) : (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Unpublish
              </>
            )}
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          title="Preview Question"
          onClick={onPreview}
        >
          <Eye className="h-4 w-4" />
        </Button>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                title="Quick Settings"
                disabled={!isEditable}
                onClick={onSettings}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            {!isEditable && (
              <TooltipContent>
                <p className="text-sm">Level 1 questions are locked (Super Admin only)</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                title="Edit Question"
                disabled={!isEditable}
                onClick={onEdit}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            {!isEditable && (
              <TooltipContent>
                <p className="text-sm">Level 1 questions are locked (Super Admin only)</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Level 2 Question?</AlertDialogTitle>
            <AlertDialogDescription>
              This will make the question visible to all users. 
              Users will be prompted to answer it before accessing surveys.
              <br /><br />
              <strong>Question:</strong> "{question.question_text}"
              <br />
              <strong>Level:</strong> 2 (Pre-Earning Requirement)
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => toggleDraftMutation.mutate()}>
              Publish Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
