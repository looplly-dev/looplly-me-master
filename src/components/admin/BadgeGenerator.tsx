import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Check, RefreshCw, X } from 'lucide-react';
import { generateBadgeImage } from '@/utils/generateBadges';
import { uploadBadgeToStorage, listSavedBadges, getBadgePublicUrl, type SavedBadge } from '@/utils/badgeStorage';
import { useToast } from '@/hooks/use-toast';

/**
 * Single badge generator with preview and approval workflow
 * Generate badges one at a time, preview them, and save to Supabase Storage
 */
export function BadgeGenerator() {
  const [formData, setFormData] = useState({
    badgeName: '',
    tier: 'Bronze',
    category: 'Social',
    iconTheme: ''
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedBadges, setSavedBadges] = useState<SavedBadge[]>([]);
  const { toast } = useToast();

  // Load saved badges on mount
  useEffect(() => {
    loadSavedBadges();
  }, []);

  const loadSavedBadges = async () => {
    const badges = await listSavedBadges();
    setSavedBadges(badges);
  };

  const handleGeneratePreview = async () => {
    if (!formData.badgeName.trim()) {
      toast({
        title: "Badge name required",
        description: "Please enter a badge name",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setPreviewImage(null);

    toast({
      title: "Generating badge...",
      description: "Please wait while we create your badge preview"
    });

    const imageUrl = await generateBadgeImage({
      badgeId: formData.badgeName.toLowerCase().replace(/\s+/g, '-'),
      tier: formData.tier,
      category: formData.category,
      iconTheme: formData.iconTheme || `${formData.category.toLowerCase()} themed badge with ${formData.tier.toLowerCase()} tier styling`
    });

    if (imageUrl) {
      setPreviewImage(imageUrl);
      toast({
        title: "Preview ready!",
        description: "Review your badge and approve to save or regenerate"
      });
    } else {
      toast({
        title: "Generation failed",
        description: "Failed to generate badge. Please try again.",
        variant: "destructive"
      });
    }

    setIsGenerating(false);
  };

  const handleApprove = async () => {
    if (!previewImage) return;

    setIsSaving(true);

    toast({
      title: "Saving badge...",
      description: "Uploading to storage"
    });

    const publicUrl = await uploadBadgeToStorage(
      previewImage,
      formData.badgeName,
      formData.tier,
      formData.category
    );

    if (publicUrl) {
      toast({
        title: "Badge saved!",
        description: "Badge uploaded successfully to storage"
      });

      // Reload saved badges list
      await loadSavedBadges();

      // Reset form
      setFormData({
        badgeName: '',
        tier: 'Bronze',
        category: 'Social',
        iconTheme: ''
      });
      setPreviewImage(null);
    } else {
      toast({
        title: "Save failed",
        description: "Failed to upload badge. Please try again.",
        variant: "destructive"
      });
    }

    setIsSaving(false);
  };

  const handleRegenerate = () => {
    handleGeneratePreview();
  };

  const handleReject = () => {
    setPreviewImage(null);
    toast({
      title: "Badge rejected",
      description: "Preview cleared"
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Form Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary" />
            <CardTitle>Generate New Badge</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="badgeName">Badge Name</Label>
            <Input
              id="badgeName"
              placeholder="e.g., Network Pioneer"
              value={formData.badgeName}
              onChange={(e) => setFormData({ ...formData, badgeName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tier">Tier</Label>
              <Select value={formData.tier} onValueChange={(tier) => setFormData({ ...formData, tier })}>
                <SelectTrigger id="tier">
                  <SelectValue placeholder="Select Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bronze">🥉 Bronze</SelectItem>
                  <SelectItem value="Silver">🥈 Silver</SelectItem>
                  <SelectItem value="Gold">🥇 Gold</SelectItem>
                  <SelectItem value="Platinum">💎 Platinum</SelectItem>
                  <SelectItem value="Diamond">💠 Diamond</SelectItem>
                  <SelectItem value="Elite">👑 Elite</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(category) => setFormData({ ...formData, category })}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Social">👥 Social</SelectItem>
                  <SelectItem value="Speed">⚡ Speed</SelectItem>
                  <SelectItem value="Perfection">✨ Perfection</SelectItem>
                  <SelectItem value="Exploration">🔍 Exploration</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="iconTheme">Icon Theme (Optional)</Label>
            <Textarea
              id="iconTheme"
              placeholder="e.g., 'connected people and network nodes' or leave empty for automatic theme"
              value={formData.iconTheme}
              onChange={(e) => setFormData({ ...formData, iconTheme: e.target.value })}
              rows={3}
            />
          </div>

          <Button
            onClick={handleGeneratePreview}
            disabled={isGenerating || !formData.badgeName.trim()}
            className="w-full"
            size="lg"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating Preview...' : 'Generate Badge Preview'}
          </Button>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {previewImage && (
        <Card>
          <CardHeader>
            <CardTitle>Badge Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <img
                src={previewImage}
                alt="Badge Preview"
                className="w-64 h-64 rounded-lg shadow-lg"
              />
              <div className="text-center space-y-1">
                <p className="font-semibold text-lg">{formData.badgeName}</p>
                <p className="text-sm text-muted-foreground">
                  {formData.tier} • {formData.category}
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-center">
              <Button
                onClick={handleApprove}
                disabled={isSaving}
                className="flex-1 max-w-xs"
                variant="default"
              >
                <Check className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Approve & Save'}
              </Button>
              <Button
                onClick={handleRegenerate}
                disabled={isGenerating || isSaving}
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
              <Button
                onClick={handleReject}
                disabled={isSaving}
                variant="ghost"
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Badges List */}
      {savedBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Badges ({savedBadges.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {savedBadges.map((badge) => (
                <div key={badge.id} className="space-y-2">
                  <div className="aspect-square relative group overflow-hidden rounded-lg border bg-muted">
                    <img
                      src={getBadgePublicUrl(badge.name)}
                      alt={badge.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-xs text-center space-y-0.5">
                    <p className="font-medium truncate">{badge.name}</p>
                    <p className="text-muted-foreground">
                      {new Date(badge.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
