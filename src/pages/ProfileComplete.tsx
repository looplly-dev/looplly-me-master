import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const { level2Categories, refetch, isLoading } = useProfileQuestions();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Flatten all Level 2 questions
  const allQuestions = level2Categories.flatMap(cat => cat.questions);
  const requiredQuestions = allQuestions.filter(q => q.is_required);
  
  // Filter to only show unanswered questions
  const unansweredQuestions = requiredQuestions.filter(q => 
    !q.user_answer?.answer_value && !q.user_answer?.answer_json
  );
  
  const currentQuestion = unansweredQuestions[currentQuestionIndex];
  
  // On mount, check if a specific question ID is in the URL and navigate to it
  useEffect(() => {
    const questionId = searchParams.get('question');
    if (questionId && requiredQuestions.length > 0) {
      // Find the question in the unanswered list
      const unanswered = requiredQuestions.filter(q => 
        !q.user_answer?.answer_value && !q.user_answer?.answer_json
      );
      const questionIndex = unanswered.findIndex(q => q.id === questionId);
      if (questionIndex !== -1) {
        setCurrentQuestionIndex(questionIndex);
      } else {
        // Question not found in unanswered list, start at first unanswered
        setCurrentQuestionIndex(0);
      }
    }
    // Only run on mount when searchParams or requiredQuestions first become available
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('question'), requiredQuestions.length > 0 ? 'ready' : 'loading']);
  
  const progress = unansweredQuestions.length > 0 
    ? ((currentQuestionIndex + 1) / unansweredQuestions.length) * 100 
    : 100;

  const handleAnswerSubmit = async (questionId: string, answer: any) => {
    setIsSubmitting(true);
    
    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('Not authenticated');

      // Debug: Check session state
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('[ProfileComplete] Auth debug:', {
        userId,
        sessionUserId: session?.user?.id,
        hasSession: !!session,
        sessionError,
        pathname: window.location.pathname
      });

      if (!session) {
        throw new Error('No active session. Please log in again.');
      }

      // Save answer
      const authUserId = session.user.id;
      const normalizedValue = typeof answer === 'string' 
        ? answer 
        : (answer?.value || answer?.formatted_address || JSON.stringify(answer));

      const { error } = await supabase
        .from('profile_answers')
        .upsert({
          user_id: authUserId,
          question_id: questionId,
          answer_value: typeof answer === 'string' ? answer : null,
          answer_json: typeof answer === 'object' ? answer : null,
          answer_normalized: normalizedValue,
          last_updated: new Date().toISOString(),
          is_stale: false
        }, { onConflict: 'user_id,question_id' });

      if (error) throw error;

      // Refetch to update the questions list
      const { data } = await refetch();
      
      // Check if there are more unanswered questions after refetch
      const allQuestionsAfterRefetch = data?.level2Categories?.flatMap(cat => cat.questions) || [];
      const requiredAfterRefetch = allQuestionsAfterRefetch.filter(q => q.is_required);
      const unansweredAfterRefetch = requiredAfterRefetch.filter(q => 
        !q.user_answer?.answer_value && !q.user_answer?.answer_json
      );

      if (unansweredAfterRefetch.length > 0) {
        // More questions to answer - stay at index 0 to show next question
        setCurrentQuestionIndex(0);
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
          .eq('user_id', authUserId);

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
      navigate('/earn');
    }
  };

  // Show loading state while fetching
  if (isLoading) {
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

  // No questions available - navigate to earn page
  if (!currentQuestion || unansweredQuestions.length === 0) {
    navigate('/earn');
    return null;
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
              Question {currentQuestionIndex + 1} of {unansweredQuestions.length}
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
            {unansweredQuestions.map((_, idx) => (
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
