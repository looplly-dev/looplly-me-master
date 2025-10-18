import { Accordion } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useProfileQuestions } from '@/hooks/useProfileQuestions';
import { useProfileAnswers } from '@/hooks/useProfileAnswers';
import { ProfileHeader } from './profile/ProfileHeader';
import { LevelCompletionAlert } from './profile/LevelCompletionAlert';
import { ProfileCategorySection } from './profile/ProfileCategorySection';

export default function ProfileTab() {
  const {
    level2Categories,
    level3Categories,
    level2Complete,
    level3Percentage,
    staleQuestionCount,
    isLoading
  } = useProfileQuestions();

  const { saveAnswer, saveAddress, isSaving } = useProfileAnswers();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate Level 2 completion percentage
  const level2RequiredQuestions = level2Categories.flatMap(c => 
    c.questions.filter(q => q.is_required)
  );
  const level2CompletedRequired = level2RequiredQuestions.filter(
    q => q.user_answer?.answer_value || q.user_answer?.answer_json
  ).length;
  const level2Percentage = level2RequiredQuestions.length > 0
    ? Math.round((level2CompletedRequired / level2RequiredQuestions.length) * 100)
    : 0;

  // Get categories with stale data for auto-expand
  const staleCategories = [
    ...level2Categories.filter(c => c.staleCount > 0),
    ...level3Categories.filter(c => c.staleCount > 0)
  ];
  const defaultOpenCategories = staleCategories.length > 0
    ? staleCategories.map(c => c.id)
    : level2Complete ? [] : [level2Categories[0]?.id].filter(Boolean);

  return (
    <div className="py-4 space-y-6 max-w-4xl mx-auto">
      {/* Level Completion Status */}
      <LevelCompletionAlert
        level2Complete={level2Complete}
        staleCount={staleQuestionCount}
        completionPercentage={level2Percentage}
      />

      {/* Profile Header with Stats */}
      <ProfileHeader
        level2Complete={level2Complete}
        level3Percentage={level3Percentage}
      />

      {/* Level 2 - Essential Profile (Required) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Essential Profile (Required)</span>
            <span className="text-sm font-normal text-muted-foreground">
              Complete to unlock earning
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion 
            type="multiple" 
            defaultValue={defaultOpenCategories}
            className="space-y-2"
          >
            {level2Categories.map((category) => (
              <ProfileCategorySection
                key={category.id}
                category={category}
                onAnswerChange={saveAnswer}
                onAddressChange={saveAddress}
                isSaving={isSaving}
              />
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Level 3 - Extended Profile (Optional) */}
      {level2Complete && level3Categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Extended Profile (Optional)</span>
              <span className="text-sm font-normal text-muted-foreground">
                Complete for better survey matches
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="space-y-2">
              {level3Categories.map((category) => (
                <ProfileCategorySection
                  key={category.id}
                  category={category}
                  onAnswerChange={saveAnswer}
                  onAddressChange={saveAddress}
                  isSaving={isSaving}
                />
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
