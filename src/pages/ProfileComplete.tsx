import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useProfileQuestions } from '@/hooks/useProfileQuestions';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { QuestionRenderer } from '@/components/dashboard/profile/QuestionRenderer';
import { getCurrentUserId } from '@/utils/authHelper';

export default function ProfileComplete() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { level2Categories, refetch } = useProfileQuestions();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Flatten all Level 2 questions
  const allQuestions = level2Categories.flatMap(cat => cat.questions);
  const requiredQuestions = allQuestions.filter(q => q.is_required);
  const currentQuestion = requiredQuestions[currentQuestionIndex];
  
  const progress = ((currentQuestionIndex + 1) / requiredQuestions.length) * 100;

  const handleAnswerSubmit = async (questionId: string, answer: any) => {
    setIsSubmitting(true);
    
    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('Not authenticated');

      // Save answer
      const { error } = await supabase
        .from('profile_answers')
        .upsert({
          user_id: userId,
          question_id: questionId,
          answer_value: typeof answer === 'string' ? answer : null,
          answer_json: typeof answer === 'object' ? answer : null,
          last_updated: new Date().toISOString(),
          is_stale: false
        });

      if (error) throw error;

      // Move to next question or complete
      if (currentQuestionIndex < requiredQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // All questions answered - mark Level 2 complete
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            level_2_complete: true,
            profile_level: 2,
            profile_completeness_score: 100,
            last_profile_update: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (profileError) throw profileError;

        await refetch();
        
        toast({
          title: '✅ Profile Complete!',
          description: 'Great! Now let\'s verify your mobile number.',
        });

        // Navigate to OTP verification
        navigate('/verify-mobile');
      }
    } catch (error) {
      console.error('Error saving answer:', error);
      toast({
        title: 'Error',
        description: 'Failed to save answer. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      navigate('/');
    }
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Loading questions...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <span className="text-sm font-medium text-muted-foreground">
              Question {currentQuestionIndex + 1} of {requiredQuestions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="max-w-2xl w-full">
          <CardContent className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">
                {currentQuestion.question_text}
              </h2>
            </div>

            <QuestionRenderer
              question={currentQuestion}
              onAnswerChange={(answer) => handleAnswerSubmit(currentQuestion.id, answer)}
              disabled={isSubmitting}
            />
          </CardContent>
        </Card>
      </div>

      {/* Footer with progress indicator */}
      <div className="bg-card border-t py-4">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-center gap-2">
            {requiredQuestions.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 w-2 rounded-full transition-colors ${
                  idx < currentQuestionIndex
                    ? 'bg-success'
                    : idx === currentQuestionIndex
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
