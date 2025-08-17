import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle, X } from 'lucide-react';

interface ContextualHelpProps {
  content: string;
  trigger?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function ContextualHelp({ 
  content, 
  trigger, 
  position = 'top',
  className = "" 
}: ContextualHelpProps) {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2'
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger || (
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-primary">
            <HelpCircle className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Help Card */}
          <Card className={`absolute z-50 w-64 shadow-lg border-primary/20 ${positionClasses[position]}`}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {content}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}