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
import { useToast } from '@/hooks/use-toast';

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
                    <Label>Options JSON</Label>
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
    </Dialog>
  );
}
