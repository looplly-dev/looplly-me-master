import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, FileCode } from 'lucide-react';
import { journeySteps, useJourneyPreview } from '@/contexts/JourneyPreviewContext';

export function JourneyPreviewFrame() {
  const { currentStepId, mockUserState } = useJourneyPreview();
  
  const currentStep = journeySteps.find(s => s.id === currentStepId);

  if (!currentStep) return null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Preview Header */}
      <div className="border-b bg-background px-6 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-500/20">
              <Eye className="h-3 w-3 mr-1" />
              Preview Mode
            </Badge>
            <h2 className="text-xl font-semibold">{currentStep.title}</h2>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            <FileCode className="h-3 w-3 mr-1" />
            {currentStep.component}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground">{currentStep.description}</p>
        
        <Alert className="bg-yellow-500/10 border-yellow-500/50">
          <AlertDescription className="text-xs">
            This is a visual preview. All data shown is mock data and no real database operations will occur.
            Current country: <strong>{mockUserState.countryCode}</strong>
          </AlertDescription>
        </Alert>
      </div>

      {/* Preview Content Area */}
      <div className="flex-1 overflow-auto bg-muted/30 p-6">
        <Card className="max-w-4xl mx-auto border-2 border-dashed border-primary/50">
          <div className="aspect-[16/10] flex items-center justify-center bg-background">
            <div className="text-center space-y-4 p-8">
              <div className="text-6xl opacity-20">🎭</div>
              <h3 className="text-xl font-semibold">Component Preview</h3>
              <p className="text-muted-foreground max-w-md">
                Visual rendering of <strong>{currentStep.component}</strong> would appear here.
                This preview frame will display the actual component in the next phase.
              </p>
              <div className="pt-4 space-y-2 text-sm text-muted-foreground">
                <p>📍 Step Category: <Badge variant="outline">{currentStep.category}</Badge></p>
                <p>👤 Preview User: {mockUserState.firstName} {mockUserState.lastName}</p>
                <p>🌍 Country Context: {mockUserState.countryCode}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
