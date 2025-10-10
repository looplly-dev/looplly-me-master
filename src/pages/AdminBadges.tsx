import { BadgeGenerator } from '@/components/admin/BadgeGenerator';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminBadges() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Badge Generator Admin</h1>
          <p className="text-muted-foreground">
            Generate AI-powered badge images using Gemini. This is a one-time setup to create all badge assets.
          </p>
        </div>

        <BadgeGenerator />

        <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
          <h3 className="font-semibold">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Click "Generate All Badges & Icons" to start the batch generation</li>
            <li>Wait for all images to be generated (this takes a few minutes)</li>
            <li>Click "Download All Images" to save them to your computer</li>
            <li>Manually save badge images to <code className="bg-muted px-1 rounded">/public/badges/</code></li>
            <li>Save tier icons to <code className="bg-muted px-1 rounded">/public/tier-icons/</code></li>
            <li>Update badge data with the new image paths</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
