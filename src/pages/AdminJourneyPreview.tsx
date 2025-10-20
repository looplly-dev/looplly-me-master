import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, RotateCcw, ExternalLink, Home } from 'lucide-react';
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
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  
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
      <div className="h-[calc(100vh-8rem)] flex flex-col space-y-3">
        {/* Back to Dashboard Button */}
        <Button
          variant="outline"
          size="sm"
          asChild
          className="w-fit border-orange-500 text-orange-500 hover:bg-orange-50"
        >
          <Link to="/admin">
            <Home className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Compact Header Controls */}
        <div className="flex items-center justify-between gap-3 bg-background px-3 py-2 rounded-lg border">
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="ghost"
              onClick={resetMockUserState}
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Reset
            </Button>
            
            <div className="h-4 w-px bg-border" />
            
            <Button
              size="sm"
              variant="ghost"
              onClick={handlePrevious}
              disabled={!canGoPrevious}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground px-1 min-w-[3rem] text-center">
              {currentIndex + 1} / {journeySteps.length}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleNext}
              disabled={!canGoNext}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <CountrySelector />
            
            <div className="h-4 w-px bg-border" />
            
            <Button
              size="sm"
              variant="ghost"
              asChild
            >
              <Link to="/admin/question-builder">
                <ExternalLink className="h-4 w-4 mr-1.5" />
                Builder
              </Link>
            </Button>
          </div>
        </div>

        {/* Main Preview Layout */}
        <div className="flex-1 flex border rounded-lg overflow-hidden bg-background">
          <JourneyStepSidebar 
            collapsed={leftSidebarCollapsed}
            onToggleCollapse={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
          />
          <JourneyPreviewFrame />
          <UserStatePanel 
            collapsed={rightSidebarCollapsed}
            onToggleCollapse={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
          />
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
