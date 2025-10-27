import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(progress > 0 && progress < 100);
  }, [progress]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-muted">
        <div
          className={cn(
            "h-full bg-primary transition-all duration-300 ease-out",
            progress === 100 && "opacity-0"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
