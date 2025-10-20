import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, RotateCcw, ExternalLink } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { JourneyPreviewProvider, journeySteps, useJourneyPreview } from '@/contexts/JourneyPreviewContext';
import { JourneyStepSidebar } from '@/components/admin/journey/JourneyStepSidebar';
import { JourneyPreviewFrame } from '@/components/admin/journey/JourneyPreviewFrame';
import { UserStatePanel } from '@/components/admin/journey/UserStatePanel';
import { CountrySelector } from '@/components/admin/journey/CountrySelector';
import { Link } from 'react-router-dom';

function JourneyPreviewContent() {
  const { currentStepId, setCurrentStepId, resetMockUserState } = useJourneyPreview();
  
  const currentIndex = journeySteps.findIndex(s => s.id === currentStepId);
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < journeySteps.length - 1;

  const handlePrevious = () => {
    if (canGoPrevious) {
      setCurrentStepId(journeySteps[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setCurrentStepId(journeySteps[currentIndex + 1].id);
    }
  };

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
        {/* Header Controls */}
        <div className="flex items-center justify-between gap-4 bg-background p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Visual Journey Preview</h1>
            <Button 
              size="sm" 
              variant="outline"
              onClick={resetMockUserState}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Journey
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <CountrySelector />
            
            <div className="flex items-center gap-2 border-l pl-3">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePrevious}
                disabled={!canGoPrevious}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {currentIndex + 1} / {journeySteps.length}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleNext}
                disabled={!canGoNext}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            <Button
              size="sm"
              variant="ghost"
              asChild
            >
              <Link to="/admin/question-builder">
                <ExternalLink className="h-4 w-4 mr-2" />
                Question Builder
              </Link>
            </Button>
          </div>
        </div>

        {/* Main Preview Layout */}
        <div className="flex-1 flex border rounded-lg overflow-hidden bg-background">
          <JourneyStepSidebar />
          <JourneyPreviewFrame />
          <UserStatePanel />
        </div>
      </div>
    </AdminLayout>
  );
}

export default function AdminJourneyPreview() {
  return (
    <ProtectedRoute requiredRole="admin">
      <JourneyPreviewProvider>
        <JourneyPreviewContent />
      </JourneyPreviewProvider>
    </ProtectedRoute>
  );
}
