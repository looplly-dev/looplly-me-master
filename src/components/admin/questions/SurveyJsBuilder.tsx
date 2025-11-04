import { useEffect, useRef, useState } from 'react';
import { SurveyCreator, SurveyCreatorComponent } from 'survey-creator-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Loader2 } from 'lucide-react';
import { useSurveyJsSync } from '@/hooks/useSurveyJsSync';
import { 
  surveyJsonToLoopllyQuestions, 
  categoryToSurveyPage,
  getDefaultSurveyJson 
} from '@/utils/surveyJsMapper';

// Import SurveyJS styles
import 'survey-core/defaultV2.css';
import 'survey-creator-core/survey-creator-core.css';

interface Category {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  questions: any[];
}

interface SurveyJsBuilderProps {
  level: 1 | 2 | 3;
  categories: Category[];
  onClose: () => void;
}

export function SurveyJsBuilder({ level, categories, onClose }: SurveyJsBuilderProps) {
  const creatorRef = useRef<SurveyCreator | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { save, isSaving } = useSurveyJsSync();

  useEffect(() => {
    // Initialize SurveyJS Creator
    const creator = new SurveyCreator({
      showLogicTab: true,
      showJSONEditorTab: true,
      showThemeTab: false,
      isAutoSave: false,
      showTranslationTab: false,
      allowModifyPages: true
    });

    // Convert existing questions to SurveyJS format
    let surveyJson;
    if (categories.length > 0 && categories.some(c => c.questions.length > 0)) {
      surveyJson = {
        title: `Level ${level} Profile Questions`,
        description: `Configure questions for Level ${level}`,
        pages: categories.map(cat => 
          categoryToSurveyPage(cat.display_name, cat.description || null, cat.questions)
        ).filter(page => page.elements.length > 0)
      };
    } else {
      surveyJson = getDefaultSurveyJson(level);
    }

    creator.JSON = surveyJson;
    
    // Customize creator options
    creator.showToolbox = true;
    creator.showPropertyGrid = true;
    
    creatorRef.current = creator;
    setIsInitialized(true);

    return () => {
      creatorRef.current = null;
    };
  }, [level, categories]);

  const handleSave = async () => {
    if (!creatorRef.current) return;

    try {
      const surveyJson = creatorRef.current.JSON;
      
      // Get the first category ID as default (or use first from categories)
      const defaultCategoryId = categories.length > 0 ? categories[0].id : '';
      
      // Convert SurveyJS JSON to Looplly questions
      const questions = surveyJsonToLoopllyQuestions(surveyJson, defaultCategoryId, level);
      
      if (questions.length === 0) {
        throw new Error('No questions to save');
      }

      // Save to database
      save(questions);
      onClose();
    } catch (error: any) {
      console.error('Error saving questions:', error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Visual Question Builder - Level {level}</DialogTitle>
          <DialogDescription>
            Drag and drop to build your survey. Changes will sync to the database when you save.
          </DialogDescription>
        </DialogHeader>

        <Alert className="my-2">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Tip:</strong> Questions are organized by pages (categories). You can add, edit, or reorder questions using the visual editor.
            Custom properties like decay configuration and country-specific options can be managed after saving.
          </AlertDescription>
        </Alert>
        
        <div className="flex-1 overflow-auto border rounded-md">
          {isInitialized && creatorRef.current ? (
            <SurveyCreatorComponent creator={creatorRef.current} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save to Database'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
