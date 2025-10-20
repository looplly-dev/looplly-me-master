import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { QuestionInlineCard } from '@/components/admin/questions/QuestionInlineCard';
import { CountryOptionsDialog } from '@/components/admin/questions/CountryOptionsDialog';
import { AddQuestionWizard } from '@/components/admin/questions/AddQuestionWizard';

function AdminQuestionsContent() {
  const [countryOptionsQuestion, setCountryOptionsQuestion] = useState<any>(null);
  const [showAddWizard, setShowAddWizard] = useState(false);

  // Fetch all data in one query
  const { data: questionsData, isLoading } = useQuery({
    queryKey: ['admin-questions-unified'],
    queryFn: async () => {
      const [questionsRes, categoriesRes, configsRes] = await Promise.all([
        supabase
          .from('profile_questions')
          .select('*, profile_categories(id, name, display_name, icon)')
          .order('display_order'),
        supabase
          .from('profile_categories')
          .select('*')
          .order('display_order'),
        supabase
          .from('profile_decay_config')
          .select('*')
      ]);

      if (questionsRes.error) throw questionsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      if (configsRes.error) throw configsRes.error;

      return {
        questions: questionsRes.data || [],
        categories: categoriesRes.data || [],
        configs: configsRes.data || []
      };
    }
  });

  const groupQuestionsByCategory = (level: number) => {
    if (!questionsData) return [];
    
    const levelQuestions = questionsData.questions.filter(q => q.level === level);
    const categoriesWithQuestions = questionsData.categories
      .filter(cat => cat.level === level)
      .map(cat => ({
        ...cat,
        questions: levelQuestions.filter(q => q.category_id === cat.id)
      }))
      .filter(cat => cat.questions.length > 0);

    return categoriesWithQuestions;
  };

  const getDecayLabel = (question: any) => {
    if (question.is_immutable) return 'Immutable';
    if (!question.decay_config_key) return 'Category Default';
    
    const config = questionsData?.configs.find(c => c.config_key === question.decay_config_key);
    return config ? `${config.interval_type} (${config.interval_days}d)` : 'Unknown';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Profile Questions & Configuration</h1>
          <p className="text-muted-foreground">Manage questions organized by profile level</p>
        </div>
        <Button onClick={() => setShowAddWizard(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>

      <Tabs defaultValue="1" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="1">Level 1 (Registration)</TabsTrigger>
          <TabsTrigger value="2">Level 2 (Required)</TabsTrigger>
          <TabsTrigger value="3">Level 3 (Progressive)</TabsTrigger>
        </TabsList>

        <TabsContent value="1" className="space-y-4 mt-6">
          {groupQuestionsByCategory(1).map(category => (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {category.icon && <span className="text-xl">{category.icon}</span>}
                  {category.display_name}
                </CardTitle>
                {category.description && (
                  <CardDescription>{category.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {category.questions.map(question => (
                  <QuestionInlineCard
                    key={question.id}
                    question={question}
                    decayLabel={getDecayLabel(question)}
                    onManageCountries={() => setCountryOptionsQuestion(question)}
                  />
                ))}
              </CardContent>
            </Card>
          ))}
          {groupQuestionsByCategory(1).length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No questions at this level yet
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="2" className="space-y-4 mt-6">
          {groupQuestionsByCategory(2).map(category => (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {category.icon && <span className="text-xl">{category.icon}</span>}
                  {category.display_name}
                </CardTitle>
                {category.description && (
                  <CardDescription>{category.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {category.questions.map(question => (
                  <QuestionInlineCard
                    key={question.id}
                    question={question}
                    decayLabel={getDecayLabel(question)}
                    onManageCountries={() => setCountryOptionsQuestion(question)}
                  />
                ))}
              </CardContent>
            </Card>
          ))}
          {groupQuestionsByCategory(2).length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No questions at this level yet
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="3" className="space-y-4 mt-6">
          {groupQuestionsByCategory(3).map(category => (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {category.icon && <span className="text-xl">{category.icon}</span>}
                  {category.display_name}
                </CardTitle>
                {category.description && (
                  <CardDescription>{category.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {category.questions.map(question => (
                  <QuestionInlineCard
                    key={question.id}
                    question={question}
                    decayLabel={getDecayLabel(question)}
                    onManageCountries={() => setCountryOptionsQuestion(question)}
                  />
                ))}
              </CardContent>
            </Card>
          ))}
          {groupQuestionsByCategory(3).length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No questions at this level yet
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {countryOptionsQuestion && (
        <CountryOptionsDialog
          question={countryOptionsQuestion}
          onClose={() => setCountryOptionsQuestion(null)}
        />
      )}

      <AddQuestionWizard
        open={showAddWizard}
        onClose={() => setShowAddWizard(false)}
      />
    </div>
  );
}

export default function AdminQuestions() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <AdminQuestionsContent />
      </AdminLayout>
    </ProtectedRoute>
  );
}
