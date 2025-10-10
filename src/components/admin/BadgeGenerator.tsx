import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Download, Image } from 'lucide-react';
import { generateAllBadges, generateTierIcons, downloadBase64Image } from '@/utils/generateBadges';
import { useToast } from '@/hooks/use-toast';

/**
 * Admin tool for batch-generating AI badges and tier icons
 * Use this once to create all badge images, then save them to /public/badges/
 */
export function BadgeGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentBadge, setCurrentBadge] = useState('');
  const [results, setResults] = useState<Map<string, string>>(new Map());
  const { toast } = useToast();

  const handleGenerateAllBadges = async () => {
    setIsGenerating(true);
    setProgress(0);
    setResults(new Map());

    toast({
      title: "Generating badges...",
      description: "This will take a few minutes. Please don't close this window.",
    });

    const badgeResults = await generateAllBadges((current, total, name) => {
      setProgress((current / total) * 50); // First 50% for badges
      setCurrentBadge(name);
    });

    const tierResults = await generateTierIcons((current, total, name) => {
      setProgress(50 + (current / total) * 50); // Next 50% for tier icons
      setCurrentBadge(name);
    });

    const allResults = new Map([...badgeResults, ...tierResults]);
    setResults(allResults);
    setIsGenerating(false);
    setProgress(100);
    setCurrentBadge('Complete!');

    toast({
      title: "Generation complete!",
      description: `Generated ${allResults.size} images. Click Download All to save them.`,
    });
  };

  const handleDownloadAll = () => {
    results.forEach((imageUrl, id) => {
      const filename = `${id}.png`;
      downloadBase64Image(imageUrl, filename);
    });

    toast({
      title: "Downloaded all images",
      description: "Save them to /public/badges/ and /public/tier-icons/ directories",
    });
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">AI Badge Generator</h2>
            <p className="text-sm text-muted-foreground">
              Generate all badge and tier icon images using Gemini AI
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleGenerateAllBadges}
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            <Image className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate All Badges & Icons'}
          </Button>

          {isGenerating && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">
                {Math.round(progress)}% - {currentBadge}
              </p>
            </div>
          )}

          {results.size > 0 && (
            <div className="space-y-3 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                ✅ Generated {results.size} images successfully!
              </p>
              
              <Button
                onClick={handleDownloadAll}
                variant="outline"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download All Images
              </Button>

              <div className="text-xs text-muted-foreground space-y-1 bg-muted/50 p-3 rounded">
                <p className="font-medium">Next steps:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Save badge images to <code>/public/badges/</code></li>
                  <li>Save tier icons to <code>/public/tier-icons/</code></li>
                  <li>Update badge data with image paths</li>
                  <li>Update RepTab with tier icon paths</li>
                </ol>
              </div>

              {/* Preview grid */}
              <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto p-2 bg-muted/30 rounded">
                {Array.from(results.entries()).map(([id, imageUrl]) => (
                  <div key={id} className="aspect-square relative group">
                    <img 
                      src={imageUrl} 
                      alt={id}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                      <p className="text-xs text-white text-center px-1">{id}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
