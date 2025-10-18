import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useProfileAnswers } from '@/hooks/useProfileAnswers';
import { QuestionRenderer } from './profile/QuestionRenderer';
import { CheckCircle } from 'lucide-react';
import type { ProfileQuestion } from '@/hooks/useProfileQuestions';
import type { AddressComponents } from '@/services/googlePlacesService';

interface ProfileUpdateModalProps {
  staleQuestions: ProfileQuestion[];
  onComplete: () => void;
  onSkip: () => void;
}

export const ProfileUpdateModal = ({
  staleQuestions,
  onComplete,
  onSkip
}: ProfileUpdateModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const { saveAnswer, saveAddress, isSaving } = useProfileAnswers();
  
  const currentQuestion = staleQuestions[currentIndex];
  const progress = ((currentIndex + 1) / staleQuestions.length) * 100;
  
  const handleAnswer = async (questionId: string, value: any) => {
    await saveAnswer(questionId, value);
    
    // Auto-advance to next question or complete
    if (currentIndex < staleQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleting(true);
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  };
  
  const handleAddressChange = async (address: AddressComponents) => {
    await saveAddress(address);
    
    if (currentIndex < staleQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleting(true);
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  };
  
  if (isCompleting) {
    return (
      <Dialog open={true}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle className="h-16 w-16 text-success animate-bounce" />
            <h3 className="text-2xl font-bold">All Set!</h3>
            <p className="text-muted-foreground text-center">
              Your profile is up to date. Let's start earning!
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={true}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-lg">Quick Question</span>
            <span className="text-sm font-normal text-muted-foreground">
              {currentIndex + 1} of {staleQuestions.length}
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {staleQuestions.length - currentIndex - 1} more to go
            </p>
          </div>
          
          {/* Current Question */}
          <QuestionRenderer
            question={currentQuestion}
            onAnswerChange={handleAnswer}
            onAddressChange={handleAddressChange}
            disabled={isSaving}
          />
          
          {/* Skip Button */}
          <div className="flex justify-center pt-2">
            <Button 
              variant="ghost" 
              onClick={onSkip} 
              size="sm" 
              className="text-xs text-muted-foreground"
            >
              Skip for now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
