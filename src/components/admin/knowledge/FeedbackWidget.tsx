import { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface FeedbackWidgetProps {
  documentId: string;
}

export default function FeedbackWidget({ documentId }: FeedbackWidgetProps) {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [comment, setComment] = useState('');
  const [showComment, setShowComment] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { authState } = useAuth();

  const handleFeedback = async (rating: 'positive' | 'negative') => {
    if (!authState.user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to provide feedback',
        variant: 'destructive'
      });
      return;
    }

    setFeedback(rating);

    if (rating === 'negative') {
      setShowComment(true);
      return;
    }

    await submitFeedback(rating);
  };

  const submitFeedback = async (rating: 'positive' | 'negative') => {
    if (!authState.user) return;

    const { error } = await supabase
      .from('documentation_feedback')
      .insert({
        document_id: documentId,
        user_id: authState.user.id,
        rating: rating === 'positive' ? 1 : -1,
        comment: comment || null
      });

    if (error) {
      toast({
        title: 'Failed to submit feedback',
        description: error.message,
        variant: 'destructive'
      });
      return;
    }

    setSubmitted(true);
    toast({
      title: 'Thank you!',
      description: 'Your feedback helps us improve our documentation'
    });
  };

  if (submitted) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            ✓ Thank you for your feedback!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="text-center">
          <h3 className="font-semibold mb-2">Was this helpful?</h3>
          <div className="flex gap-2 justify-center">
            <Button
              variant={feedback === 'positive' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFeedback('positive')}
              disabled={feedback !== null}
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              Yes
            </Button>
            <Button
              variant={feedback === 'negative' ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => handleFeedback('negative')}
              disabled={feedback !== null}
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              No
            </Button>
          </div>
        </div>

        {showComment && (
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Help us improve (optional):
            </label>
            <Textarea
              placeholder="What could be better?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
            <Button
              size="sm"
              onClick={() => submitFeedback('negative')}
              className="w-full"
            >
              Submit Feedback
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
