import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
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
import { Plus, Trash2, Save, AlertTriangle, Sparkles, Smartphone, Monitor, Tablet } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuestionRenderer } from '@/components/dashboard/profile/QuestionRenderer';
import { cn } from '@/lib/utils';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';

const QUESTION_TYPES = [
  { value: 'text', label: 'Single Textbox', icon: '📝' },
  { value: 'textarea', label: 'Comment Box', icon: '💬' },
  { value: 'number', label: 'Number', icon: '🔢' },
  { value: 'select', label: 'Multiple Choice (single answer)', icon: '🔘' },
  { value: 'multi-select', label: 'Checkboxes (multiple answers)', icon: '☑️' },
  { value: 'date', label: 'Date Picker', icon: '📅' },
  { value: 'address', label: 'Address', icon: '📍' },
  { value: 'boolean', label: 'Yes/No', icon: '✓' },
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
  applicability: z.enum(['global', 'country_specific']),
  country_codes: z.array(z.string()).optional(),
  options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  validation_rules: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
  }).optional(),
  is_draft: z.boolean().default(false),
});

type QuestionFormData = z.infer<typeof questionSchema>;

interface AddQuestionWizardProps {
  open: boolean;
  onClose: () => void;
  defaultLevel?: number;
  editQuestion?: any;
}

export function AddQuestionWizard({ open, onClose, defaultLevel, editQuestion }: AddQuestionWizardProps) {
  const [activeTab, setActiveTab] = useState('edit');
  const [options, setOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [newOptionLabel, setNewOptionLabel] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const isEditMode = !!editQuestion;

  // Pre-fill form when editing
  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: isEditMode && editQuestion ? {
      question_type: editQuestion.question_type || '',
      question_text: editQuestion.question_text || '',
      question_key: editQuestion.question_key || '',
      help_text: editQuestion.help_text || '',
      placeholder: editQuestion.placeholder || '',
      is_required: editQuestion.is_required || false,
      category_id: editQuestion.category_id || '',
      level: editQuestion.level || defaultLevel || 2,
      decay_config_key: editQuestion.decay_config_key || '',
      applicability: editQuestion.applicability || 'global',
      country_codes: editQuestion.country_codes || [],
      options: editQuestion.options || [],
      validation_rules: editQuestion.validation_rules || {},
      is_draft: editQuestion.is_draft !== undefined ? editQuestion.is_draft : (defaultLevel === 2),
    } : {
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
      is_draft: (defaultLevel === 2),
    },
  });

  // Reset form when editQuestion changes or dialog opens
  useEffect(() => {
    if (open) {
      if (isEditMode && editQuestion) {
        // Reset form with the current question's data
        form.reset({
          question_type: editQuestion.question_type || '',
          question_text: editQuestion.question_text || '',
          question_key: editQuestion.question_key || '',
          help_text: editQuestion.help_text || '',
          placeholder: editQuestion.placeholder || '',
          is_required: editQuestion.is_required || false,
          category_id: editQuestion.category_id || '',
          level: editQuestion.level || defaultLevel || 2,
          decay_config_key: editQuestion.decay_config_key || '',
          applicability: editQuestion.applicability || 'global',
          country_codes: editQuestion.country_codes || [],
          options: editQuestion.options || [],
          validation_rules: editQuestion.validation_rules || {},
          is_draft: editQuestion.is_draft !== undefined ? editQuestion.is_draft : (defaultLevel === 2),
        });
        
        // Update options state
        if (editQuestion.options) {
          setOptions(Array.isArray(editQuestion.options) ? editQuestion.options : []);
        } else {
          setOptions([]);
        }
      } else {
        // Reset to empty form for create mode
        form.reset({
          question_type: '',
          question_text: '',
          question_key: '',
          help_text: '',
          placeholder: '',
          is_required: false,
          category_id: '',
          level: defaultLevel || 2,
          decay_config_key: '',
          applicability: 'global',
          country_codes: [],
          options: [],
          validation_rules: {},
          is_draft: (defaultLevel === 2),
        });
        setOptions([]);
      }
      setActiveTab('edit'); // Reset to first tab
    }
  }, [editQuestion, open, isEditMode, form, defaultLevel]);

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
      if (isEditMode) {
        // Update existing question
        const { error } = await supabase
          .from('profile_questions')
          .update({
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
            country_codes: data.applicability === 'country_specific' ? data.country_codes : null,
            options: options.length > 0 ? options : null,
            validation_rules: data.validation_rules || {},
            is_draft: data.is_draft,
          })
          .eq('id', editQuestion.id);
        if (error) throw error;
      } else {
        // Check for duplicate question_key before creating
        const { data: existing } = await supabase
          .from('profile_questions')
          .select('id')
          .eq('question_key', data.question_key)
          .single();
        
        if (existing) {
          throw new Error(`Question with key "${data.question_key}" already exists`);
        }

        // Insert new question
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
          country_codes: data.applicability === 'country_specific' ? data.country_codes : null,
          options: options.length > 0 ? options : null,
          validation_rules: data.validation_rules || {},
          is_active: true,
          is_draft: data.is_draft,
          display_order: 999,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(isEditMode ? 'Question updated successfully' : 'Question created successfully');
      queryClient.invalidateQueries({ queryKey: ['profile_questions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-questions-unified'] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} question: ${error.message}`);
    },
  });

  const handleClose = () => {
    form.reset();
    setActiveTab('edit');
    setOptions([]);
    setNewOptionLabel('');
    setValidationErrors([]);
    onClose();
  };

  const handleSubmit = async () => {
    // Clear previous errors
    setValidationErrors([]);
    
    // Sync options state with form before validation
    form.setValue('options', options);
    
    // Trigger validation
    const isValid = await form.trigger();
    
    if (!isValid) {
      const errors = form.formState.errors;
      
      // Field name mapping for user-friendly labels
      const fieldLabels: Record<string, string> = {
        question_type: 'Question Type',
        question_text: 'Question Text',
        question_key: 'Question Key',
        help_text: 'Help Text',
        placeholder: 'Placeholder',
        category_id: 'Category',
        level: 'Level',
        decay_config_key: 'Decay Configuration',
        applicability: 'Applicability',
        country_codes: 'Country Codes',
      };
      
      // Dynamically collect all error fields
      const errorFields = Object.keys(errors).map(key => 
        fieldLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      );
      
      // Dev mode logging
      if (import.meta.env.DEV) {
        console.log('Form validation errors:', errors);
        console.log('Missing fields:', errorFields);
      }
      
      // Set errors for inline display
      setValidationErrors(errorFields);
      
      // Navigate to first tab with error
      if (errors.question_text || errors.question_type || errors.question_key || errors.help_text || errors.placeholder) {
        setActiveTab('edit');
      } else if (errors.category_id || errors.level || errors.decay_config_key || errors.applicability) {
        setActiveTab('assignment');
      }
      
      const errorMessage = errorFields.length > 0 
        ? `Please fix the following fields: ${errorFields.join(', ')}`
        : 'Please check all required fields and try again';
      
      toast.error(errorMessage);
      return;
    }
    
    // Additional validation for select types
    if (isSelectType && options.length === 0) {
      const errorMsg = 'Please add at least one option for select/multi-select questions';
      setValidationErrors([errorMsg]);
      toast.error(errorMsg);
      setActiveTab('options');
      return;
    }
    
    // Get form data and submit
    const data = form.getValues();
    createQuestionMutation.mutate(data);
  };

  const addOption = () => {
    if (newOptionLabel.trim()) {
      const value = newOptionLabel.toLowerCase().replace(/\s+/g, '_');
      const updatedOptions = [...options, { label: newOptionLabel, value }];
      setOptions(updatedOptions);
      form.setValue('options', updatedOptions); // Sync with form
      setNewOptionLabel('');
    }
  };

  const removeOption = (index: number) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    setOptions(updatedOptions);
    form.setValue('options', updatedOptions); // Sync with form
  };

  const handleAIGenerateText = async () => {
    const questionKey = form.watch('question_key');
    const questionType = form.watch('question_type');
    
    if (!questionKey) {
      toast.error('Please fill in question key first');
      return;
    }

    setIsGenerating(true);
    try {
      const body: any = { question_key: questionKey };
      if (questionType) body.question_type = questionType;

      const { data, error } = await supabase.functions.invoke('generate-question-text', {
        body
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      if (data?.question_text) {
        form.setValue('question_text', data.question_text);
        toast.success('AI generated question text!');
      }
    } catch (error: any) {
      const errorMsg = error.message || String(error);
      if (errorMsg.includes('Rate limit') || errorMsg.includes('429')) {
        toast.error('⏸️ AI rate limit reached. Please wait a moment and try again.');
      } else if (errorMsg.includes('credits') || errorMsg.includes('402')) {
        toast.error('💳 AI credits depleted. Please add credits in Settings → Workspace → Usage.');
      } else {
        toast.error(`Failed to generate: ${errorMsg}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAIGenerateOptions = async () => {
    const questionKey = form.watch('question_key');
    const questionText = form.watch('question_text');
    const questionType = form.watch('question_type');
    
    if (!questionKey || !questionText) {
      toast.error('Please fill in question key and text first');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-question-options', {
        body: { question_key: questionKey, question_text: questionText, question_type: questionType }
      });

      if (error) throw error;
      
      if (data?.options && Array.isArray(data.options)) {
        const nonEmptyOptions = options.filter(opt => opt.label?.trim() || opt.value?.trim());
        const updatedOptions = [...nonEmptyOptions, ...data.options];
        setOptions(updatedOptions);
        form.setValue('options', updatedOptions); // Sync with form
        toast.success(`Added ${data.options.length} AI-generated options!`);
      }
    } catch (error: any) {
      if (error.message?.includes('Rate limit') || error.message?.includes('429')) {
        toast.error('⏸️ AI rate limit reached. Please wait a moment and try again.');
      } else if (error.message?.includes('credits') || error.message?.includes('402')) {
        toast.error('💳 AI credits depleted. Please add credits in Settings → Workspace → Usage.');
      } else {
        toast.error('Failed to generate options');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAIGenerateHelpText = async () => {
    const questionKey = form.watch('question_key');
    const questionType = form.watch('question_type');
    
    if (!questionKey) {
      toast.error('Please fill in question key first');
      return;
    }

    setIsGenerating(true);
    try {
      const body: any = { question_key: questionKey, type: 'help_text' };
      if (questionType) body.question_type = questionType;

      const { data, error } = await supabase.functions.invoke('generate-question-text', {
        body
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      if (data?.help_text) {
        form.setValue('help_text', data.help_text);
        toast.success('AI generated help text!');
      }
    } catch (error: any) {
      const errorMsg = error.message || String(error);
      if (errorMsg.includes('Rate limit') || errorMsg.includes('429')) {
        toast.error('⏸️ AI rate limit reached. Please wait a moment and try again.');
      } else if (errorMsg.includes('credits') || errorMsg.includes('402')) {
        toast.error('💳 AI credits depleted. Please add credits in Settings → Workspace → Usage.');
      } else {
        toast.error(`Failed to generate: ${errorMsg}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedType = form.watch('question_type');
  const selectedApplicability = form.watch('applicability');
  const selectedLevel = form.watch('level');
  const isDraft = form.watch('is_draft');
  const isSelectType = ['select', 'multi-select'].includes(selectedType);
  
  // Filter categories by selected level
  const filteredCategories = categories?.filter(cat => cat.level === Number(selectedLevel)) || [];
  
  // Check which tabs have errors
  const errors = form.formState.errors;
  const hasEditErrors = !!(errors.question_text || errors.question_type || errors.question_key || errors.help_text || errors.placeholder);
  const hasAssignmentErrors = !!(errors.category_id || errors.level || errors.decay_config_key || errors.applicability || errors.country_codes);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? `Edit Question: ${editQuestion.question_text}` : defaultLevel ? `Add Level ${defaultLevel} Question` : 'Add New Question'}
          </DialogTitle>
        </DialogHeader>

        {validationErrors.length > 0 && (
          <Alert variant="destructive" className="absolute top-4 right-4 max-w-sm z-10">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Please fix the following fields:</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="edit" className="relative">
                Edit
                {hasEditErrors && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive" />
                )}
              </TabsTrigger>
              <TabsTrigger value="options">Options</TabsTrigger>
              <TabsTrigger value="assignment" className="relative">
                Assignment
                {hasAssignmentErrors && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive" />
                )}
              </TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            {/* Edit Tab */}
            <TabsContent value="edit" className="space-y-6 py-4">
              <FormField
                control={form.control}
                name="question_text"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Question Text</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAIGenerateText}
                        disabled={!form.watch('question_key') || isGenerating}
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
                        {isGenerating ? 'Generating...' : 'AI Suggest'}
                      </Button>
                    </div>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="What is your employment status?"
                        rows={3}
                        className="resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="question_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a question type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {QUESTION_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <span>{type.icon}</span>
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="question_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Key</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="employment_status"
                      />
                    </FormControl>
                    <FormDescription>
                      Unique identifier (lowercase, underscores only)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isSelectType && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Answer Choices</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAIGenerateOptions}
                      disabled={!form.watch('question_text') || isGenerating}
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      {isGenerating ? 'Generating...' : 'AI Generate'}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground w-8">{idx + 1}.</span>
                        <Input value={opt.label} disabled className="flex-1" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Input
                        value={newOptionLabel}
                        onChange={(e) => setNewOptionLabel(e.target.value)}
                        placeholder="Add option..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addOption();
                          }
                        }}
                      />
                      <Button type="button" onClick={addOption} variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                  {isSelectType && options.length === 0 && (
                    <p className="text-sm text-destructive">At least one option is required</p>
                  )}
                </div>
              )}

              <FormField
                control={form.control}
                name="help_text"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Help Text (Optional)</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAIGenerateHelpText}
                        disabled={!form.watch('question_key') || isGenerating}
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
                        {isGenerating ? 'Generating...' : 'AI Suggest'}
                      </Button>
                    </div>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Additional guidance for users..."
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="placeholder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placeholder (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Select an option..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            {/* Options Tab */}
            <TabsContent value="options" className="space-y-6 py-4">
              <FormField
                control={form.control}
                name="is_required"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Require an answer to this question</FormLabel>
                      <FormDescription>
                        Users must provide an answer before proceeding
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {Number(selectedLevel) === 2 && (
                <FormField
                  control={form.control}
                  name="is_draft"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Draft Mode</FormLabel>
                        <FormDescription>
                          Draft questions are invisible to users. Use this to test changes safely 
                          before publishing to production.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {selectedType === 'number' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min">Minimum Value</Label>
                    <Input
                      id="min"
                      type="number"
                      onChange={(e) => form.setValue('validation_rules.min', parseInt(e.target.value))}
                      placeholder="Min"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max">Maximum Value</Label>
                    <Input
                      id="max"
                      type="number"
                      onChange={(e) => form.setValue('validation_rules.max', parseInt(e.target.value))}
                      placeholder="Max"
                    />
                  </div>
                </div>
              )}

              <Separator />

              <FormField
                control={form.control}
                name="decay_config_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Refresh Frequency</FormLabel>
                    <FormDescription>
                      How often should this answer be refreshed?
                    </FormDescription>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select refresh frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {decayConfigs?.map((config) => (
                          <SelectItem key={config.config_key} value={config.config_key}>
                            {config.config_key} - {config.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <FormField
                control={form.control}
                name="applicability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Availability</FormLabel>
                    <FormControl>
                      <div className="grid gap-3">
                        <div
                          onClick={() => field.onChange('global')}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            field.value === 'global'
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="font-medium">Global</div>
                          <div className="text-sm text-muted-foreground">Available to all users worldwide</div>
                        </div>
                        <div
                          onClick={() => field.onChange('country_specific')}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            field.value === 'country_specific'
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="font-medium">Country-Specific</div>
                          <div className="text-sm text-muted-foreground">Only for selected countries</div>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedApplicability === 'country_specific' && (
                <FormField
                  control={form.control}
                  name="country_codes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country Codes</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="US,UK,IN"
                          onChange={(e) => field.onChange(e.target.value.split(',').map(c => c.trim()))}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter 2-letter country codes, separated by commas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </TabsContent>

            {/* Assignment Tab */}
            <TabsContent value="assignment" className="space-y-6 py-4">
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.display_name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-muted-foreground">
                            No categories for Level {selectedLevel}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Showing categories for Level {selectedLevel} only
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {defaultLevel ? (
                <div className="space-y-2">
                  <Label>Profile Level</Label>
                  <div className="flex items-center gap-2 p-4 border rounded-lg bg-muted/50">
                    <Badge variant="secondary">Level {defaultLevel}</Badge>
                    <span className="text-sm text-muted-foreground">
                      (pre-selected from tab context)
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This question will be added to Level {defaultLevel}
                  </p>
                </div>
              ) : (
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Level</FormLabel>
                      <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Level 1 - Identity & Security</SelectItem>
                          <SelectItem value="2">Level 2 - Demographics & Earning</SelectItem>
                          <SelectItem value="3">Level 3 - Progressive Profiling</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Assign this question to a specific profile level
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Separator />

              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  Summary
                </h4>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Question:</span>
                    <span className="font-medium">{form.watch('question_text') || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">{selectedType || 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Required:</span>
                    <span className="font-medium">{form.watch('is_required') ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Availability:</span>
                    <span className="font-medium capitalize">{selectedApplicability}</span>
                  </div>
                  {isSelectType && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Options:</span>
                      <span className="font-medium">{options.length} choices</span>
                    </div>
                  )}
                </div>
              </div>

              {Number(selectedLevel) === 2 && (
                <Alert variant={isDraft ? "default" : "destructive"} className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Level 2 Impact Warning</AlertTitle>
                  <AlertDescription>
                    This question affects earning eligibility. 
                    {isDraft 
                      ? " It's in draft mode and won't be visible to users yet."
                      : " ⚠️ IT WILL BE IMMEDIATELY VISIBLE TO ALL USERS."}
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Live Preview</h3>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewDevice('mobile')}
                    >
                      <Smartphone className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant={previewDevice === 'tablet' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewDevice('tablet')}
                    >
                      <Tablet className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewDevice('desktop')}
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-6 bg-background">
                  <div
                    className={cn(
                      "mx-auto transition-all",
                      previewDevice === 'mobile' && "max-w-[375px]",
                      previewDevice === 'tablet' && "max-w-[768px]",
                      previewDevice === 'desktop' && "max-w-full"
                    )}
                  >
                    {form.watch('question_text') ? (
                      <QuestionRenderer
                        question={{
                          id: 'preview',
                          question_text: form.watch('question_text'),
                          question_type: form.watch('question_type') as any,
                          question_key: form.watch('question_key') || 'preview',
                          help_text: form.watch('help_text') || undefined,
                          placeholder: form.watch('placeholder') || undefined,
                          is_required: form.watch('is_required'),
                          options: isSelectType ? options : undefined,
                          level: form.watch('level'),
                          category_id: form.watch('category_id'),
                          display_order: 0,
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString(),
                          is_immutable: false,
                          decay_config_key: form.watch('decay_config_key'),
                          applicability: form.watch('applicability') as 'global' | 'country-specific',
                          country_codes: form.watch('country_codes') || null,
                          validation_rules: form.watch('validation_rules') || null,
                          is_draft: form.watch('is_draft'),
                          targeting_tags: null,
                          question_group: null,
                          conditional_logic: null,
                          decay_interval_days: null,
                        } as any}
                        onAnswerChange={() => {}}
                        disabled={false}
                      />
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <p>Fill in the question text to see a preview</p>
                      </div>
                    )}
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Preview Notes</AlertTitle>
                  <AlertDescription>
                    This preview shows how the question will appear to users. Some features like validation may not be fully functional in preview mode.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>
        </Form>

        <DialogFooter className="flex justify-between items-center">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={createQuestionMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {createQuestionMutation.isPending ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Question' : 'Save Question')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
