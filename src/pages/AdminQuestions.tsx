/**
 * LEVEL 1 QUESTION EDITING - SUPER ADMIN ONLY
 * 
 * Security Warning: Level 1 questions are immutable identity fields.
 * Editing them can affect:
 * - User authentication (mobile, email)
 * - Fraud prevention (name, DOB, address)
 * - KYC verification status
 * - Data isolation queries (country codes)
 * 
 * Only Super Admins can edit Level 1. Regular admins see these as locked.
 * Always test changes in staging before production deployment.
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useRole } from '@/hooks/useRole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Info, AlertTriangle, Lightbulb, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { QuestionInlineCard } from '@/components/admin/questions/QuestionInlineCard';
import { CountryOptionsDialog } from '@/components/admin/questions/CountryOptionsDialog';
import { AddQuestionWizard } from '@/components/admin/questions/AddQuestionWizard';
import { QuestionDetailModal } from '@/components/admin/questions/QuestionDetailModal';
import { QuestionPreviewModal } from '@/components/admin/questions/QuestionPreviewModal';
import { SurveyJsBuilder } from '@/components/admin/questions/SurveyJsBuilder';
import { CategoryManagement } from '@/components/admin/categories/CategoryManagement';

function AdminQuestionsContent() {
  const { isSuperAdmin } = useRole();
  const [countryOptionsQuestion, setCountryOptionsQuestion] = useState<any>(null);
  const [showAddWizard, setShowAddWizard] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [showDrafts, setShowDrafts] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<any>(null);
  const [editQuestion, setEditQuestion] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'visual'>('list');
  const [visualBuilderLevel, setVisualBuilderLevel] = useState<number | null>(null);

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

  const groupQuestionsByCategory = (level: number, includeDrafts: boolean = false) => {
    if (!questionsData) return [];
    
    const levelQuestions = questionsData.questions.filter(q => 
      q.level === level && (includeDrafts || !q.is_draft)
    );
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
      <div>
        <h1 className="text-3xl font-bold">Profile Questions & Configuration</h1>
        <p className="text-muted-foreground">Manage questions organized by profile level</p>
      </div>

      <Tabs defaultValue="1" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="1">Level 1 (Registration)</TabsTrigger>
          <TabsTrigger value="2">Level 2 (Dashboard Modal)</TabsTrigger>
          <TabsTrigger value="3">Level 3 (Progressive)</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="1" className="space-y-4 mt-6">
          <Alert className={isSuperAdmin() 
            ? "border-green-500 bg-green-50 dark:bg-green-950" 
            : "border-blue-500 bg-blue-50 dark:bg-blue-950"
          }>
            {isSuperAdmin() ? (
              <ShieldCheck className="h-4 w-4 text-green-600" />
            ) : (
              <Info className="h-4 w-4 text-blue-600" />
            )}
            <AlertTitle className={isSuperAdmin() 
              ? "text-green-900 dark:text-green-100" 
              : "text-blue-900 dark:text-blue-100"
            }>
              {isSuperAdmin() 
                ? "🔓 Super Admin: Level 1 Questions Unlocked" 
                : "🔒 Level 1 Questions Are Locked"
              }
            </AlertTitle>
            <AlertDescription className={isSuperAdmin() 
              ? "text-green-800 dark:text-green-200" 
              : "text-blue-800 dark:text-blue-200"
            }>
              {isSuperAdmin() 
                ? "You can edit Level 1 registration fields (First Name, Last Name, DOB, Mobile, Password, GPS). Use caution—these fields are tied to account creation and fraud prevention logic."
                : "Level 1 contains registration fields captured during sign-up (First Name, Last Name, DOB, Mobile, Password, GPS). These are locked and require Super Admin approval. Contact a Super Admin if changes are needed."
              }
            </AlertDescription>
          </Alert>

          <div className="flex items-center gap-2 mb-4">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              📋 List View
            </Button>
            <Button
              variant={viewMode === 'visual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setViewMode('visual');
                setVisualBuilderLevel(1);
              }}
              disabled={!isSuperAdmin()}
            >
              🎨 Visual Builder
            </Button>
          </div>

          {viewMode === 'visual' && visualBuilderLevel === 1 ? (
            <SurveyJsBuilder
              level={1}
              categories={groupQuestionsByCategory(1)}
              onClose={() => setViewMode('list')}
            />
          ) : (
            <>
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
                    onSettings={() => {
                      setSelectedQuestion(question);
                      setShowDetailModal(true);
                    }}
                    onEdit={() => {
                      setEditQuestion(question);
                      setShowAddWizard(true);
                    }}
                    onPreview={() => setPreviewQuestion(question)}
                    isEditable={isSuperAdmin()}
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
            </>
          )}
        </TabsContent>

        <TabsContent value="2" className="space-y-4 mt-6">
          <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-900 dark:text-yellow-100">
              Level 2: Dashboard Modal (Pre-Earning Profiling)
            </AlertTitle>
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              Level 2 questions are captured via dashboard modal after registration. Users must complete Level 2 + mobile verification before accessing surveys.
              <br /><br />
              <strong>Current Required Questions (6):</strong> Gender, Address, Ethnicity, HHI, PHI, SEC
              <br />
              <strong>Optional:</strong> Email (for newsletters only, NOT account recovery)
              <br /><br />
              <strong>⚠️ Important:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Changes affect all users' ability to access earning opportunities</li>
                <li>SEC questions with scoring logic require dev team involvement</li>
                <li>Use <strong>Draft Mode</strong> to test changes before publishing</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                📋 List View
              </Button>
              <Button
                variant={viewMode === 'visual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setViewMode('visual');
                  setVisualBuilderLevel(2);
                }}
              >
                🎨 Visual Builder
              </Button>
              <Button 
                variant={showDrafts ? "default" : "outline"}
                size="sm"
                onClick={() => setShowDrafts(prev => !prev)}
              >
                {showDrafts ? "Showing Drafts" : "Showing Published"}
              </Button>
            </div>
            
            <Button 
              variant="outline"
              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950"
              onClick={() => {
                setSelectedLevel(2);
                setShowAddWizard(true);
              }}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Add Level 2 Question
            </Button>
          </div>

          {viewMode === 'visual' && visualBuilderLevel === 2 ? (
            <SurveyJsBuilder
              level={2}
              categories={groupQuestionsByCategory(2, showDrafts)}
              onClose={() => setViewMode('list')}
            />
          ) : (
            <>
              {groupQuestionsByCategory(2, showDrafts).map(category => (
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
                    onSettings={() => {
                      setSelectedQuestion(question);
                      setShowDetailModal(true);
                    }}
                    onEdit={() => {
                      setEditQuestion(question);
                      setShowAddWizard(true);
                    }}
                    onPreview={() => setPreviewQuestion(question)}
                    isEditable={true}
                  />
                ))}
              </CardContent>
            </Card>
          ))}
          {groupQuestionsByCategory(2, showDrafts).length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No questions at this level yet
              </CardContent>
            </Card>
          )}
            </>
          )}
        </TabsContent>

        <TabsContent value="3" className="space-y-4 mt-6">
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Level 3 Questions</AlertTitle>
            <AlertDescription>
              Level 3 questions are progressive profiling fields (employment, automotive, lifestyle). Use this builder to add contextual questions triggered by surveys, milestones, or time.
            </AlertDescription>
          </Alert>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                📋 List View
              </Button>
              <Button
                variant={viewMode === 'visual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setViewMode('visual');
                  setVisualBuilderLevel(3);
                }}
              >
                🎨 Visual Builder
              </Button>
            </div>
            
            <Button 
              onClick={() => {
                setSelectedLevel(3);
                setShowAddWizard(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Level 3 Question
            </Button>
          </div>

          {viewMode === 'visual' && visualBuilderLevel === 3 ? (
            <SurveyJsBuilder
              level={3}
              categories={groupQuestionsByCategory(3)}
              onClose={() => setViewMode('list')}
            />
          ) : (
            <>
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
                    onSettings={() => {
                      setSelectedQuestion(question);
                      setShowDetailModal(true);
                    }}
                    onEdit={() => {
                      setEditQuestion(question);
                      setShowAddWizard(true);
                    }}
                    onPreview={() => setPreviewQuestion(question)}
                    isEditable={true}
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
            </>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4 mt-6">
          <CategoryManagement />
        </TabsContent>
      </Tabs>

      {countryOptionsQuestion && (
        <CountryOptionsDialog
          question={countryOptionsQuestion}
          onClose={() => setCountryOptionsQuestion(null)}
        />
      )}

      {showDetailModal && selectedQuestion && (
        <QuestionDetailModal
          question={selectedQuestion}
          open={showDetailModal}
          onOpenChange={setShowDetailModal}
        />
      )}

      <QuestionPreviewModal
        question={previewQuestion}
        open={!!previewQuestion}
        onOpenChange={(open) => !open && setPreviewQuestion(null)}
      />

      <AddQuestionWizard
        open={showAddWizard} 
        onClose={() => {
          setShowAddWizard(false);
          setSelectedLevel(null);
          setEditQuestion(null);
        }}
        defaultLevel={selectedLevel}
        editQuestion={editQuestion}
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
