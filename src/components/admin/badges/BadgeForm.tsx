import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useBadgeService } from '@/hooks/useBadgeService';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';
import { BadgePreview } from './BadgePreview';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(200),
  category: z.string().min(1, 'Category is required'),
  tier: z.enum(['bronze', 'silver', 'gold', 'platinum', 'diamond', 'elite']),
  rarity: z.enum(['Common', 'Rare', 'Epic', 'Legendary']),
  rep_points: z.coerce.number().min(0, 'REP points must be positive'),
  requirement: z.string().min(5, 'Requirement description is required'),
  icon_theme: z.string().min(10, 'Icon theme description is required'),
  shape: z.enum(['circle', 'hexagon', 'star', 'diamond']).optional(),
  is_active: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface BadgeFormProps {
  badge?: BadgeType;
  onSuccess: () => void;
}

type BadgeType = z.infer<typeof formSchema> & { id?: string; tenant_id?: string; icon_url?: string; created_at?: string; updated_at?: string; metadata?: any };

export function BadgeForm({ badge, onSuccess }: BadgeFormProps) {
  const { generateBadge, updateBadge } = useBadgeService();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(badge?.icon_url || null);
  const [showPreview, setShowPreview] = useState(false);

  // Update preview when badge prop changes
  useEffect(() => {
    setPreviewImage(badge?.icon_url || null);
  }, [badge?.id]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: badge ? {
      name: badge.name || '',
      description: badge.description || '',
      category: badge.category || '',
      tier: badge.tier || 'bronze',
      rarity: badge.rarity || 'Common',
      rep_points: badge.rep_points || 10,
      requirement: badge.requirement || '',
      icon_theme: (badge.metadata as any)?.icon_theme || '',
      shape: badge.shape || 'circle',
      is_active: badge.is_active ?? false,
    } : {
      name: '',
      description: '',
      category: '',
      tier: 'bronze',
      rarity: 'Common',
      rep_points: 10,
      requirement: '',
      icon_theme: '',
      shape: 'circle',
      is_active: false,
    },
  });

  const handleGeneratePreview = async () => {
    const values = form.getValues();
    
    if (!values.name || !values.tier || !values.category || !values.icon_theme) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in name, tier, category, and icon theme',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateBadge({
        badgeName: values.name,
        tier: values.tier,
        category: values.category,
        iconTheme: values.icon_theme,
        type: 'badge',
      });

      if (result?.imageUrl) {
        setPreviewImage(result.imageUrl);
        setShowPreview(true);
      }
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate badge image',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = async () => {
    if (!previewImage) return;

    setIsSaving(true);
    try {
      const values = form.getValues();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get tenant_id from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.tenant_id) throw new Error('No tenant found');

      // Convert base64 to blob
      const base64Response = await fetch(previewImage);
      const blob = await base64Response.blob();
      
      // Upload to storage
      const filename = `${values.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('badges')
        .upload(filename, blob, {
          contentType: 'image/png',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('badges')
        .getPublicUrl(filename);

      if (badge?.id) {
        // Update existing badge
        await updateBadge(badge.id, {
          name: values.name,
          description: values.description,
          tier: values.tier,
          category: values.category,
          rarity: values.rarity,
          rep_points: values.rep_points,
          requirement: values.requirement,
          shape: values.shape || 'circle',
          icon_url: publicUrl,
          is_active: values.is_active,
          metadata: { icon_theme: values.icon_theme },
        });

        toast({
          title: 'Badge Updated',
          description: `${values.name} has been updated successfully`,
        });
      } else {
        // Insert new badge
        const { error: insertError } = await supabase
          .from('badge_catalog')
          .insert({
            tenant_id: profile.tenant_id,
            name: values.name,
            description: values.description,
            tier: values.tier,
            category: values.category,
            rarity: values.rarity,
            rep_points: values.rep_points,
            requirement: values.requirement,
            shape: values.shape || 'circle',
            icon_url: publicUrl,
            is_active: values.is_active,
            metadata: { icon_theme: values.icon_theme },
          });

        if (insertError) throw insertError;

        toast({
          title: 'Badge Created',
          description: `${values.name} has been added to the catalog`,
        });
      }

      form.reset();
      setPreviewImage(null);
      setShowPreview(false);
      onSuccess();
    } catch (error) {
      console.error('Error saving badge:', error);
      toast({
        title: 'Error',
        description: 'Failed to save badge',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{badge ? 'Edit Badge' : 'Create New Badge'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Badge Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Network Pioneer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe what this badge represents..."
                          maxLength={200}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value.length}/200 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="identity_security">🛡️ Identity & Security</SelectItem>
                          <SelectItem value="consistency">🔥 Consistency Mastery</SelectItem>
                          <SelectItem value="excellence">🏆 Excellence & Impact</SelectItem>
                          <SelectItem value="social">👥 Social Network</SelectItem>
                          <SelectItem value="speed">⚡ Speed Masters</SelectItem>
                          <SelectItem value="perfection">✨ Perfection Elite</SelectItem>
                          <SelectItem value="exploration">🔍 Exploration Heroes</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Badge Properties */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Badge Properties</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tier *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bronze">🥉 Bronze</SelectItem>
                            <SelectItem value="silver">🥈 Silver</SelectItem>
                            <SelectItem value="gold">🥇 Gold</SelectItem>
                            <SelectItem value="platinum">💎 Platinum</SelectItem>
                            <SelectItem value="diamond">💠 Diamond</SelectItem>
                            <SelectItem value="elite">👑 Elite</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rarity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rarity *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Common">Common</SelectItem>
                            <SelectItem value="Rare">Rare</SelectItem>
                            <SelectItem value="Epic">Epic</SelectItem>
                            <SelectItem value="Legendary">Legendary</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="rep_points"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>REP Points *</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} placeholder="e.g., 15" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requirement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requirement *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Complete 5 surveys" {...field} />
                      </FormControl>
                      <FormDescription>
                        What users need to do to earn this badge
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Visual Design */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Visual Design</h3>
                
                <FormField
                  control={form.control}
                  name="icon_theme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon Theme *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., connected people and network nodes with bronze accents"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Describe the visual style for AI image generation
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shape"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shape</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="circle">Circle</SelectItem>
                          <SelectItem value="hexagon">Hexagon</SelectItem>
                          <SelectItem value="star">Star</SelectItem>
                          <SelectItem value="diamond">Diamond</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Badge Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Badge Status</h3>
                
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Set as Active</FormLabel>
                        <FormDescription>
                          Make this badge visible to users immediately after creation
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="button"
                onClick={handleGeneratePreview}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {badge ? 'Regenerating...' : 'Generating...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {badge ? 'Regenerate Preview' : 'Generate Preview'}
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {previewImage && (
        <BadgePreview
          badge={{
            id: 'preview',
            name: form.getValues('name'),
            description: form.getValues('description'),
            tier: form.getValues('tier'),
            category: form.getValues('category'),
            rarity: form.getValues('rarity'),
            rep_points: form.getValues('rep_points'),
            requirement: form.getValues('requirement'),
            icon_url: previewImage,
            is_active: form.getValues('is_active'),
            tenant_id: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            metadata: {},
          }}
          open={showPreview}
          onOpenChange={setShowPreview}
          isPreview
          onApprove={handleApprove}
          onRegenerate={handleGeneratePreview}
          isApproving={isSaving}
          isRegenerating={isGenerating}
        />
      )}
    </div>
  );
}
