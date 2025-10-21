import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, RefreshCw, Check } from 'lucide-react';

interface CountryOptionsDialogProps {
  question: any;
  onClose: () => void;
}

export function CountryOptionsDialog({ question, onClose }: CountryOptionsDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCountry, setSelectedCountry] = useState(question.country_codes?.[0] || 'ZA');
  const [countryOptions, setCountryOptions] = useState<Record<string, any>>({});
  const [countryMetadata, setCountryMetadata] = useState<Record<string, any>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState<any>(null);

  // Fetch existing country options
  const { data: existingOptions } = useQuery({
    queryKey: ['country-options', question.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('country_question_options')
        .select('*')
        .eq('question_id', question.id);
      
      if (error) throw error;
      
      const optionsMap: Record<string, any> = {};
      const metadataMap: Record<string, any> = {};
      data?.forEach(opt => {
        optionsMap[opt.country_code] = opt.options;
        metadataMap[opt.country_code] = opt.metadata;
      });
      
      setCountryOptions(optionsMap);
      setCountryMetadata(metadataMap);
      return data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const promises = question.country_codes.map((countryCode: string) => {
        return supabase
          .from('country_question_options')
          .upsert({
            question_id: question.id,
            country_code: countryCode,
            options: countryOptions[countryCode] || [],
            metadata: countryMetadata[countryCode] || {}
          }, {
            onConflict: 'question_id,country_code'
          });
      });

      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error);
      if (errors.length > 0) throw errors[0].error;
    },
    onSuccess: () => {
      toast({ title: 'Country options saved successfully' });
      queryClient.invalidateQueries({ queryKey: ['country-options'] });
      queryClient.invalidateQueries({ queryKey: ['admin-questions-unified'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error saving country options',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const updateOptions = (countryCode: string, value: string) => {
    try {
      const parsed = JSON.parse(value);
      setCountryOptions(prev => ({ ...prev, [countryCode]: parsed }));
    } catch (e) {
      // Invalid JSON, don't update
    }
  };

  const updateMetadata = (countryCode: string, key: string, value: string) => {
    setCountryMetadata(prev => ({
      ...prev,
      [countryCode]: { ...prev[countryCode], [key]: value }
    }));
  };

  const handleAutoGenerate = async (countryCode: string) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('auto-generate-country-options', {
        body: {
          gapId: `manual-${Date.now()}`,
          countryCode,
          questionId: question.id,
          questionKey: question.question_key
        }
      });
      
      if (error) throw error;
      
      // Fetch the generated options from database
      const { data: gapData } = await supabase
        .from('country_profiling_gaps')
        .select('draft_options, confidence_score')
        .eq('question_id', question.id)
        .eq('country_code', countryCode)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (gapData?.draft_options) {
        const draftOptions = gapData.draft_options as any;
        setGeneratedPreview({
          countryCode,
          options: draftOptions.options || [],
          confidence: gapData.confidence_score,
          sources: draftOptions.sources || [],
          notes: draftOptions.notes
        });
        setShowPreviewModal(true);
        toast({ title: `Generated ${draftOptions.options?.length || 0} options` });
      } else {
        toast({ title: 'Generation completed but no data found', variant: 'destructive' });
      }
    } catch (error: any) {
      toast({
        title: 'Generation failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApproveGenerated = () => {
    if (!generatedPreview) return;
    
    setCountryOptions(prev => ({
      ...prev,
      [generatedPreview.countryCode]: generatedPreview.options
    }));
    
    setShowPreviewModal(false);
    toast({ title: 'Options applied! Review and save when ready.' });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Country Options: {question.question_text}</DialogTitle>
        </DialogHeader>

        <Tabs value={selectedCountry} onValueChange={setSelectedCountry}>
          <TabsList>
            {question.country_codes?.map((cc: string) => (
              <TabsTrigger key={cc} value={cc}>{cc}</TabsTrigger>
            ))}
          </TabsList>

          {question.country_codes?.map((cc: string) => (
            <TabsContent key={cc} value={cc}>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Options JSON</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAutoGenerate(cc)}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-3 w-3" />
                            Auto-Generate
                          </>
                        )}
                      </Button>
                    </div>
                    <Textarea
                      value={JSON.stringify(countryOptions[cc] || [], null, 2)}
                      onChange={(e) => updateOptions(cc, e.target.value)}
                      rows={15}
                      className="font-mono text-sm"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Currency Symbol</Label>
                      <Input
                        value={countryMetadata[cc]?.symbol || ''}
                        onChange={(e) => updateMetadata(cc, 'symbol', e.target.value)}
                        placeholder="e.g., R, ₦, £"
                      />
                    </div>
                    <div>
                      <Label>Format</Label>
                      <Select
                        value={countryMetadata[cc]?.format || 'thousands'}
                        onValueChange={(v) => updateMetadata(cc, 'format', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="thousands">Thousands</SelectItem>
                          <SelectItem value="millions">Millions</SelectItem>
                          <SelectItem value="lakhs">Lakhs (Indian)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Preview</Label>
                  <Card className="p-4 mt-2">
                    <Label>{question.question_text}</Label>
                    <Select>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        {(countryOptions[cc] || []).map((opt: any, idx: number) => (
                          <SelectItem key={idx} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Card>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving...' : 'Save All Countries'}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* AI Generation Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>AI-Generated Options Preview</DialogTitle>
          </DialogHeader>
          
          {generatedPreview && (
            <div className="space-y-4">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Label>Confidence Score</Label>
                  <Badge variant={generatedPreview.confidence >= 80 ? 'default' : 'secondary'}>
                    {generatedPreview.confidence}%
                  </Badge>
                </div>
                <Progress value={generatedPreview.confidence} className="h-2" />
              </Card>
              
              <Card className="p-4">
                <Label className="mb-2 block">
                  Generated Options ({generatedPreview.options.length})
                </Label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {generatedPreview.options.map((opt: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 p-2 border rounded text-sm">
                      <div className="flex-1">
                        <div className="font-medium">{opt.label}</div>
                        <div className="text-xs text-muted-foreground">
                          Value: {opt.value}
                          {opt.local_context && ` • ${opt.local_context}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              
              <Card className="p-4">
                <Label className="mb-2 block">Sources & Notes</Label>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div><strong>Sources:</strong> {generatedPreview.sources.join(', ')}</div>
                  {generatedPreview.notes && (
                    <div><strong>Notes:</strong> {generatedPreview.notes}</div>
                  )}
                </div>
              </Card>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setShowPreviewModal(false);
                if (generatedPreview) {
                  handleAutoGenerate(generatedPreview.countryCode);
                }
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate
            </Button>
            <Button onClick={handleApproveGenerated}>
              <Check className="mr-2 h-4 w-4" />
              Approve & Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
