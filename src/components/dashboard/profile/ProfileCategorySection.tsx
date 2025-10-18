import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Users, 
  DollarSign, 
  Briefcase, 
  Home, 
  Car,
  AlertCircle
} from 'lucide-react';
import type { ProfileCategory } from '@/hooks/useProfileQuestions';
import { QuestionRenderer } from './QuestionRenderer';
import type { AddressComponents } from '@/services/googlePlacesService';

interface ProfileCategorySectionProps {
  category: ProfileCategory;
  onAnswerChange: (questionId: string, value: any) => void;
  onAddressChange?: (address: AddressComponents) => void;
  isSaving?: boolean;
}

const iconMap: Record<string, any> = {
  Shield,
  Users,
  DollarSign,
  Briefcase,
  Home,
  Car
};

export const ProfileCategorySection = ({
  category,
  onAnswerChange,
  onAddressChange,
  isSaving
}: ProfileCategorySectionProps) => {
  const Icon = iconMap[category.icon || 'Shield'];
  const completionPercentage = Math.round(
    (category.completedCount / category.totalCount) * 100
  );

  return (
    <AccordionItem value={category.id} className="border rounded-lg px-4">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-base">{category.display_name}</h3>
              {category.description && (
                <p className="text-xs text-muted-foreground">{category.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={completionPercentage === 100 ? "default" : "secondary"}
              className="gap-1"
            >
              {category.completedCount}/{category.totalCount}
            </Badge>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-4">
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completion</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {category.questions.map((question) => (
              <QuestionRenderer
                key={question.id}
                question={question}
                onAnswerChange={onAnswerChange}
                onAddressChange={onAddressChange}
                disabled={isSaving}
              />
            ))}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
