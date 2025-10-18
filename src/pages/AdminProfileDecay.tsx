import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, AlertCircle, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AdminProfileDecay() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch decay configs
  const { data: configs, isLoading: configsLoading } = useQuery({
    queryKey: ['decay-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile_decay_config')
        .select('*')
        .order('interval_days', { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data;
    }
  });

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['profile-categories-decay'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile_categories')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data;
    }
  });

  // Fetch questions
  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ['profile-questions-decay'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile_questions')
        .select('*, profile_categories(name)')
        .order('display_order');
      if (error) throw error;
      return data;
    }
  });

  // Update global interval mutation
  const updateIntervalMutation = useMutation({
    mutationFn: async ({ configKey, days }: { configKey: string; days: number }) => {
      const { error } = await supabase
        .from('profile_decay_config')
        .update({ interval_days: days })
        .eq('config_key', configKey);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decay-configs'] });
      toast({ title: 'Interval updated successfully' });
    }
  });

  // Update category default mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ categoryId, configKey }: { categoryId: string; configKey: string }) => {
      const { error } = await supabase
        .from('profile_categories')
        .update({ default_decay_config_key: configKey })
        .eq('id', categoryId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-categories-decay'] });
      toast({ title: 'Category default updated' });
    }
  });

  // Update question override mutation
  const updateQuestionMutation = useMutation({
    mutationFn: async ({ questionId, configKey }: { questionId: string; configKey: string | null }) => {
      const { error } = await supabase
        .from('profile_questions')
        .update({ decay_config_key: configKey })
        .eq('id', questionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-questions-decay'] });
      toast({ title: 'Question override updated' });
    }
  });

  // Platform health metrics
  const { data: staleStats } = useQuery({
    queryKey: ['stale-profile-stats'],
    queryFn: async () => {
      const { data: answers } = await supabase
        .from('profile_answers')
        .select(`
          question_id, 
          last_updated,
          profile_questions!inner(decay_interval_days, is_immutable)
        `)
        .not('profile_questions.decay_interval_days', 'is', null)
        .eq('profile_questions.is_immutable', false);
      
      if (!answers) return { totalAnswers: 0, staleAnswers: 0, stalenessRate: 0 };
      
      const staleCount = answers.filter(a => {
        const daysSinceUpdate = (Date.now() - new Date(a.last_updated).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceUpdate > (a.profile_questions as any).decay_interval_days;
      }).length;
      
      return {
        totalAnswers: answers.length,
        staleAnswers: staleCount,
        stalenessRate: answers.length > 0 ? (staleCount / answers.length) * 100 : 0
      };
    }
  });

  const [searchTerm, setSearchTerm] = useState('');

  const filteredQuestions = questions?.filter(q => 
    q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.question_key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (configsLoading || categoriesLoading || questionsLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile Decay Configuration</h1>
        <p className="text-muted-foreground">Manage how often profile questions expire and need re-confirmation</p>
      </div>

      {/* Platform Health Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Health Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Data Points</p>
              <p className="text-4xl font-bold">{staleStats?.totalAnswers || 0}</p>
              <p className="text-xs text-muted-foreground">Answered profile questions</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Stale Data Points</p>
              <p className="text-4xl font-bold text-warning">{staleStats?.staleAnswers || 0}</p>
              <p className="text-xs text-muted-foreground">Need re-collection</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Staleness Rate</p>
              <p className="text-4xl font-bold text-warning">
                {staleStats?.stalenessRate?.toFixed(1) || 0}%
              </p>
              <p className="text-xs text-muted-foreground">Of answered questions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 1: Global Intervals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Global Decay Intervals
          </CardTitle>
          <CardDescription>
            Set the number of days for each decay interval type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {configs?.filter(c => c.config_key !== 'decay_never').map(config => (
              <div key={config.id} className="space-y-2">
                <Label>{config.interval_type}</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    defaultValue={config.interval_days || 0}
                    onBlur={(e) => {
                      const newValue = parseInt(e.target.value);
                      if (newValue !== config.interval_days) {
                        updateIntervalMutation.mutate({ 
                          configKey: config.config_key, 
                          days: newValue 
                        });
                      }
                    }}
                    className="w-24"
                  />
                  <span className="flex items-center text-sm text-muted-foreground">days</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Category Defaults */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Category Default Decay
          </CardTitle>
          <CardDescription>
            Set the default decay interval for each category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories?.map(category => (
              <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{category.display_name}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
                <Select
                  value={category.default_decay_config_key || ''}
                  onValueChange={(value) => {
                    updateCategoryMutation.mutate({ 
                      categoryId: category.id, 
                      configKey: value 
                    });
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {configs?.map(config => (
                      <SelectItem key={config.config_key} value={config.config_key}>
                        {config.interval_type} {config.interval_days ? `(${config.interval_days}d)` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Question Overrides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Question-Level Overrides
          </CardTitle>
          <CardDescription>
            Override decay intervals for specific questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredQuestions?.map(question => (
                <div key={question.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{question.question_text}</p>
                      {question.is_immutable && (
                        <Badge variant="secondary" className="text-xs">Immutable</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Category: {question.profile_categories?.name || 'Unknown'}
                    </p>
                  </div>
                  <Select
                    value={question.decay_config_key || 'default'}
                    onValueChange={(value) => {
                      updateQuestionMutation.mutate({ 
                        questionId: question.id, 
                        configKey: value === 'default' ? null : value 
                      });
                    }}
                    disabled={question.is_immutable}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Use Category Default</SelectItem>
                      {configs?.map(config => (
                        <SelectItem key={config.config_key} value={config.config_key}>
                          {config.interval_type} {config.interval_days ? `(${config.interval_days}d)` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
