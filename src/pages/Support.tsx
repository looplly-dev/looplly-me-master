import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import SimplifiedSupportTab from '@/components/dashboard/SimplifiedSupportTab';

export default function Support() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card/95 backdrop-blur-md border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-md md:max-w-2xl lg:max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-primary"
          >
            ← Back
          </Button>
          <h1 className="text-xl font-bold text-primary">Support</h1>
          <div className="w-8" />
        </div>
      </div>
      <div className="max-w-md md:max-w-2xl lg:max-w-5xl mx-auto">
        <SimplifiedSupportTab />
      </div>
    </div>
  );
}
