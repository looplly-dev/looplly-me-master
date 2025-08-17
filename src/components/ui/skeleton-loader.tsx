import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonLoaderProps {
  variant?: 'card' | 'list' | 'balance' | 'transaction';
  count?: number;
}

export function SkeletonLoader({ variant = 'card', count = 1 }: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'balance':
        return (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center space-y-2">
                <Skeleton className="h-6 w-8 mx-auto" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </div>
              <div className="text-center space-y-2">
                <Skeleton className="h-6 w-8 mx-auto" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </div>
              <div className="text-center space-y-2">
                <Skeleton className="h-6 w-8 mx-auto" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </div>
            </div>
          </div>
        );
      
      case 'transaction':
        return (
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="text-right space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        );
      
      case 'list':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-60" />
                  <div className="flex gap-4">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </div>
        );
      
      default: // card
        return (
          <div className="p-4 space-y-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
}