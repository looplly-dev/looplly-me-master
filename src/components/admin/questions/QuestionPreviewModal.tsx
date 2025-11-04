import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import { QuestionRenderer } from '@/components/dashboard/profile/QuestionRenderer';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface QuestionPreviewModalProps {
  question: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type DeviceType = 'mobile' | 'tablet' | 'desktop';

export function QuestionPreviewModal({ question, open, onOpenChange }: QuestionPreviewModalProps) {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [previewValue, setPreviewValue] = useState<any>(null);

  if (!question) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Question Preview</DialogTitle>
            <Badge variant="outline">{question.question_type}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Device selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Preview Device:</span>
            <div className="flex gap-1">
              <Button
                variant={device === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDevice('mobile')}
              >
                <Smartphone className="h-4 w-4 mr-1" />
                Mobile
              </Button>
              <Button
                variant={device === 'tablet' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDevice('tablet')}
              >
                <Tablet className="h-4 w-4 mr-1" />
                Tablet
              </Button>
              <Button
                variant={device === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDevice('desktop')}
              >
                <Monitor className="h-4 w-4 mr-1" />
                Desktop
              </Button>
            </div>
          </div>

          {/* Preview container */}
          <div className="border rounded-lg p-6 bg-muted/30">
            <div
              className={cn(
                "mx-auto transition-all",
                device === 'mobile' && "max-w-[375px]",
                device === 'tablet' && "max-w-[768px]",
                device === 'desktop' && "max-w-full"
              )}
            >
              <QuestionRenderer
                question={{
                  id: question.id,
                  question_key: question.question_key,
                  question_text: question.question_text,
                  question_type: question.question_type,
                  is_required: question.is_required,
                  help_text: question.help_text,
                  options: question.options || [],
                  validation_rules: question.validation_rules || {},
                  is_immutable: question.is_immutable || false
                } as any}
                onAnswerChange={(key, value) => setPreviewValue(value)}
                disabled={false}
              />
              
              {previewValue && (
                <div className="mt-4 p-3 bg-background border rounded text-sm">
                  <p className="font-medium mb-1">Preview Value:</p>
                  <code className="text-xs">{JSON.stringify(previewValue, null, 2)}</code>
                </div>
              )}
            </div>
          </div>

          {/* Info alert */}
          <Alert>
            <AlertDescription>
              This is a preview only. Interactions and changes won't be saved.
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
}
