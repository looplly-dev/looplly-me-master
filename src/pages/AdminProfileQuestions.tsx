import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Globe, MapPin } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function AdminProfileQuestionsContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [countryOptionsQuestion, setCountryOptionsQuestion] = useState<any>(null);

  // Fetch questions
  const { data: questions, isLoading } = useQuery({
    queryKey: ['admin-profile-questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile_questions')
        .select('*, profile_categories(name, display_name)')
        .order('display_order');
      
      if (error) throw error;
      return data;
    }
  });

  const filteredQuestions = questions?.filter(q => {
    const matchesSearch = q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          q.question_key.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || q.level === parseInt(filterLevel);
    return matchesSearch && matchesLevel;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Profile Questions Management</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Question
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Search</Label>
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Label>Filter by Level</Label>
                <Select value={filterLevel} onValueChange={setFilterLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="1">Level 1 (Registration)</SelectItem>
                    <SelectItem value="2">Level 2 (Required)</SelectItem>
                    <SelectItem value="3">Level 3 (Progressive)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Questions ({filteredQuestions?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading questions...</p>
            ) : (
              <div className="space-y-2">
                {filteredQuestions?.map((question) => (
                  <div
                    key={question.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{question.question_text}</h3>
                        <Badge variant="outline">Level {question.level}</Badge>
                        <Badge variant={question.applicability === 'global' ? 'default' : 'secondary'}>
                          {question.applicability === 'global' ? (
                            <><Globe className="mr-1 h-3 w-3" />Global</>
                          ) : (
                            <><MapPin className="mr-1 h-3 w-3" />Country-Specific</>
                          )}
                        </Badge>
                        {question.is_required && <Badge>Required</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Key: {question.question_key} • Type: {question.question_type}
                        {question.country_codes && ` • Countries: ${question.country_codes.join(', ')}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {question.applicability === 'country_specific' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCountryOptionsQuestion(question)}
                        >
                          Manage Countries
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingQuestion(question)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Country Options Dialog */}
        {countryOptionsQuestion && (
          <CountryOptionsDialog
            question={countryOptionsQuestion}
            onClose={() => setCountryOptionsQuestion(null)}
          />
        )}
      </div>
    </AdminLayout>
  );
}

function CountryOptionsDialog({ question, onClose }: { question: any; onClose: () => void }) {
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
      queryClient.invalidateQueries({ queryKey: ['profile-questions'] });
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

export default function AdminProfileQuestions() {
  // Redirect to unified questions page
  window.location.href = '/admin/questions';
  return null;
}
