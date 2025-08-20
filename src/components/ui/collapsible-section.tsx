import { useState } from 'react';
import { ChevronDown, ChevronUp, Minimize2, Maximize2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  alwaysShowHeader?: boolean;
  className?: string;
  compactContent?: React.ReactNode;
  priority?: 'high' | 'medium' | 'low';
}

export function CollapsibleSection({ 
  title, 
  icon, 
  children, 
  defaultOpen = true, 
  alwaysShowHeader = false,
  className,
  compactContent,
  priority = 'medium'
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isCompact, setIsCompact] = useState(false);

  const priorityColors = {
    high: 'border-red-200 bg-white shadow-sm',
    medium: 'border-gray-200 bg-white shadow-sm', 
    low: 'border-gray-200 bg-white shadow-sm'
  };

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md',
      priorityColors[priority],
      className
    )}>
      <CardHeader 
        className={cn(
          'cursor-pointer select-none',
          !isOpen && !alwaysShowHeader ? 'pb-2' : ''
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-base md:text-lg">{title}</span>
          </div>
          <div className="flex items-center gap-1">
            {compactContent && isOpen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCompact(!isCompact);
                }}
                className="h-8 w-8 p-0"
              >
                {isCompact ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      {isOpen && (
        <CardContent className="pt-0 animate-fade-in">
          {isCompact && compactContent ? compactContent : children}
        </CardContent>
      )}
    </Card>
  );
}