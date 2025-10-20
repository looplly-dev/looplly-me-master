import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Check, Sparkles } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const QUESTION_TYPES = [
  { value: 'text', label: 'Text Input', description: 'Short text response' },
  { value: 'textarea', label: 'Long Text', description: 'Multi-line text response' },
  { value: 'number', label: 'Number', description: 'Numeric input' },
  { value: 'select', label: 'Single Select', description: 'Choose one option' },
  { value: 'multi-select', label: 'Multi Select', description: 'Choose multiple options' },
  { value: 'date', label: 'Date', description: 'Date picker' },
  { value: 'address', label: 'Address', description: 'Full address with autocomplete' },
  { value: 'boolean', label: 'Yes/No', description: 'Boolean toggle' },
];

const questionSchema = z.object({
  question_type: z.string().min(1, 'Question type is required'),
  question_text: z.string().min(3, 'Question text must be at least 3 characters'),
  question_key: z.string().min(2, 'Question key must be at least 2 characters').regex(/^[a-z_]+$/, 'Must be lowercase with underscores only'),
  help_text: z.string().optional(),
  placeholder: z.string().optional(),
  is_required: z.boolean().default(false),
  category_id: z.string().uuid('Please select a category'),
  level: z.number().min(1).max(3),
  decay_config_key: z.string().min(1, 'Decay configuration is required'),
  applicability: z.enum(['global', 'country-specific']),
  country_codes: z.array(z.string()).optional(),
  options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  validation_rules: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
  }).optional(),
});

type QuestionFormData = z.infer<typeof questionSchema>;

interface AddQuestionWizardProps {
  open: boolean;
  onClose: () => void;
  defaultLevel?: number;
}

export function AddQuestionWizard({ open, onClose, defaultLevel }: AddQuestionWizardProps) {
  const [step, setStep] = useState(1);
  const [options, setOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [newOptionLabel, setNewOptionLabel] = useState('');
  const queryClient = useQueryClient();

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question_type: '',
      question_text: '',
      question_key: '',
      help_text: '',
      placeholder: '',
      is_required: false,
      level: defaultLevel || 2,
      applicability: 'global',
      country_codes: [],
      options: [],
      validation_rules: {},
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['profile_categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data;
    },
  });

  const { data: decayConfigs } = useQuery({
    queryKey: ['profile_decay_config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile_decay_config')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  const createQuestionMutation = useMutation({
    mutationFn: async (data: QuestionFormData) => {
      const { error } = await supabase.from('profile_questions').insert({
        question_type: data.question_type,
        question_text: data.question_text,
        question_key: data.question_key,
        help_text: data.help_text || null,
        placeholder: data.placeholder || null,
        is_required: data.is_required,
        category_id: data.category_id,
        level: data.level,
        decay_config_key: data.decay_config_key,
        applicability: data.applicability,
        country_codes: data.applicability === 'country-specific' ? data.country_codes : null,
        options: options.length > 0 ? options : null,
        validation_rules: data.validation_rules || {},
        is_active: true,
        display_order: 999,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Question created successfully');
      queryClient.invalidateQueries({ queryKey: ['profile_questions'] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(`Failed to create question: ${error.message}`);
    },
  });

  const handleClose = () => {
    form.reset();
    setStep(1);
    setOptions([]);
    setNewOptionLabel('');
    onClose();
  };

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(step);
    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid) setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const handleSubmit = form.handleSubmit((data) => {
    createQuestionMutation.mutate(data);
  });

  const getFieldsForStep = (currentStep: number): string[] => {
    switch (currentStep) {
      case 1: return ['question_type'];
      case 2: return ['question_text', 'question_key', 'help_text', 'placeholder'];
      case 3: return ['is_required'];
      case 4: return ['decay_config_key'];
      case 5: return ['applicability', 'country_codes'];
      case 6: return ['category_id', 'level'];
      default: return [];
    }
  };

  const addOption = () => {
    if (newOptionLabel.trim()) {
      const value = newOptionLabel.toLowerCase().replace(/\s+/g, '_');
      setOptions([...options, { label: newOptionLabel, value }]);
      setNewOptionLabel('');
    }
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const selectedType = form.watch('question_type');
  const selectedApplicability = form.watch('applicability');
  const isSelectType = ['select', 'multi-select'].includes(selectedType);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {defaultLevel ? `Add Level ${defaultLevel} Question` : 'Add New Question'}
          </DialogTitle>
          <DialogDescription>
            Step {step} of 6 - {getStepTitle(step)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1: Question Type */}
          {step === 1 && (
            <div className="space-y-4">
              <Label>Select Question Type</Label>
              <div className="grid grid-cols-2 gap-3">
                {QUESTION_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => form.setValue('question_type', type.value)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedType === type.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-muted-foreground">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Basic Configuration */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="question_text">Question Text *</Label>
                <Input
                  id="question_text"
                  {...form.register('question_text')}
                  placeholder="What is your employment status?"
                />
                {form.formState.errors.question_text && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.question_text.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="question_key">Question Key *</Label>
                <Input
                  id="question_key"
                  {...form.register('question_key')}
                  placeholder="employment_status"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Unique identifier (lowercase, underscores only)
                </p>
                {form.formState.errors.question_key && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.question_key.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="help_text">Help Text</Label>
                <Textarea
                  id="help_text"
                  {...form.register('help_text')}
                  placeholder="Optional guidance for users"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="placeholder">Placeholder</Label>
                <Input
                  id="placeholder"
                  {...form.register('placeholder')}
                  placeholder="e.g., Select an option..."
                />
              </div>
            </div>
          )}

          {/* Step 3: Type-Specific Configuration */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_required">Required Field</Label>
                  <p className="text-sm text-muted-foreground">Users must answer this question</p>
                </div>
                <Switch
                  id="is_required"
                  checked={form.watch('is_required')}
                  onCheckedChange={(checked) => form.setValue('is_required', checked)}
                />
              </div>

              <Separator />

              {isSelectType && (
                <div className="space-y-3">
                  <Label>Options</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newOptionLabel}
                      onChange={(e) => setNewOptionLabel(e.target.value)}
                      placeholder="Add option..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                    />
                    <Button type="button" onClick={addOption} variant="outline">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {options.map((opt, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-2">
                        {opt.label}
                        <button onClick={() => removeOption(idx)} className="hover:text-destructive">×</button>
                      </Badge>
                    ))}
                  </div>
                  {isSelectType && options.length === 0 && (
                    <p className="text-sm text-destructive">At least one option is required for select types</p>
                  )}
                </div>
              )}

              {selectedType === 'number' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min">Minimum Value</Label>
                    <Input
                      id="min"
                      type="number"
                      onChange={(e) => form.setValue('validation_rules.min', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max">Maximum Value</Label>
                    <Input
                      id="max"
                      type="number"
                      onChange={(e) => form.setValue('validation_rules.max', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Decay Configuration */}
          {step === 4 && (
            <div className="space-y-4">
              <Label>How often should this answer be refreshed?</Label>
              <div className="grid gap-3">
                {decayConfigs?.map((config) => (
                  <button
                    key={config.config_key}
                    type="button"
                    onClick={() => form.setValue('decay_config_key', config.config_key)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      form.watch('decay_config_key') === config.config_key
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium">{config.config_key}</div>
                    <div className="text-sm text-muted-foreground">{config.description}</div>
                  </button>
                ))}
              </div>
              {form.formState.errors.decay_config_key && (
                <p className="text-sm text-destructive">{form.formState.errors.decay_config_key.message}</p>
              )}
            </div>
          )}

          {/* Step 5: Applicability */}
          {step === 5 && (
            <div className="space-y-4">
              <Label>Question Applicability</Label>
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() => form.setValue('applicability', 'global')}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedApplicability === 'global'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium">Global</div>
                  <div className="text-sm text-muted-foreground">Available to all users worldwide</div>
                </button>

                <button
                  type="button"
                  onClick={() => form.setValue('applicability', 'country-specific')}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedApplicability === 'country-specific'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium">Country-Specific</div>
                  <div className="text-sm text-muted-foreground">Only for selected countries</div>
                </button>
              </div>

              {selectedApplicability === 'country-specific' && (
                <div className="mt-4">
                  <Label htmlFor="country_codes">Country Codes (comma-separated)</Label>
                  <Input
                    id="country_codes"
                    placeholder="US,UK,IN"
                    onChange={(e) => form.setValue('country_codes', e.target.value.split(',').map(c => c.trim()))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Enter 2-letter country codes</p>
                </div>
              )}
            </div>
          )}

          {/* Step 6: Assignment */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="category_id">Category *</Label>
                <Select onValueChange={(value) => form.setValue('category_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.category_id && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.category_id.message}</p>
                )}
              </div>

              {defaultLevel ? (
                <div className="space-y-2">
                  <Label>Profile Level</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Level {defaultLevel}</Badge>
                    <span className="text-sm text-muted-foreground">
                      (pre-selected)
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This question will be added to Level {defaultLevel}
                  </p>
                </div>
              ) : (
                <div>
                  <Label htmlFor="level">Profile Level *</Label>
                  <Select onValueChange={(value) => form.setValue('level', parseInt(value))} defaultValue="2">
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Level 1 (Basic)</SelectItem>
                      <SelectItem value="2">Level 2 (Intermediate)</SelectItem>
                      <SelectItem value="3">Level 3 (Advanced)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium">Review Summary</h4>
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">Type:</span> {selectedType}</p>
                  <p><span className="text-muted-foreground">Question:</span> {form.watch('question_text')}</p>
                  <p><span className="text-muted-foreground">Required:</span> {form.watch('is_required') ? 'Yes' : 'No'}</p>
                  <p><span className="text-muted-foreground">Applicability:</span> {selectedApplicability}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {step > 1 && (
              <Button type="button" variant="outline" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            {step < 6 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={isSelectType && step === 3 && options.length === 0}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={createQuestionMutation.isPending}
              >
                <Check className="h-4 w-4 mr-1" />
                {createQuestionMutation.isPending ? 'Creating...' : 'Create Question'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getStepTitle(step: number): string {
  switch (step) {
    case 1: return 'Choose Question Type';
    case 2: return 'Basic Configuration';
    case 3: return 'Type-Specific Settings';
    case 4: return 'Decay Configuration';
    case 5: return 'Applicability';
    case 6: return 'Assignment & Review';
    default: return '';
  }
}
