import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { AddressAutocomplete } from '@/components/ui/address-autocomplete';
import type { ProfileQuestion } from '@/hooks/useProfileQuestions';
import type { AddressComponents } from '@/services/googlePlacesService';

interface QuestionRendererProps {
  question: ProfileQuestion;
  onAnswerChange: (questionId: string, value: any) => void;
  onAddressChange?: (address: AddressComponents) => void;
  disabled?: boolean;
}

export const QuestionRenderer = ({
  question,
  onAnswerChange,
  onAddressChange,
  disabled = false
}: QuestionRendererProps) => {
  const [value, setValue] = useState<any>(
    question.user_answer?.answer_value || 
    question.user_answer?.answer_json || 
    ''
  );

  // Debounce text inputs
  useEffect(() => {
    if (question.question_type === 'text' || question.question_type === 'email' || question.question_type === 'phone') {
      const timer = setTimeout(() => {
        if (value && value !== question.user_answer?.answer_value) {
          onAnswerChange(question.id, value);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [value]);

  const handleChange = (newValue: any) => {
    setValue(newValue);
    
    // Immediate save for non-text inputs
    if (question.question_type !== 'text' && question.question_type !== 'email' && question.question_type !== 'phone') {
      onAnswerChange(question.id, newValue);
    }
  };

  const renderInput = () => {
    switch (question.question_type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <Input
            type={question.question_type === 'email' ? 'email' : question.question_type === 'phone' ? 'tel' : 'text'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={question.placeholder || ''}
            disabled={disabled}
            className="max-w-md"
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={question.placeholder || ''}
            disabled={disabled}
            className="max-w-md"
          />
        );

      case 'select':
        return (
          <Select
            value={value}
            onValueChange={handleChange}
            disabled={disabled}
          >
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder={question.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'max-w-md justify-start text-left font-normal',
                  !value && 'text-muted-foreground'
                )}
                disabled={disabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => handleChange(date?.toISOString())}
                disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        );

      case 'address':
        return (
          <AddressAutocomplete
            value={value}
            onChange={(address) => {
              setValue(address.formatted_address);
              if (onAddressChange) {
                onAddressChange(address);
              }
            }}
            placeholder={question.placeholder || 'Start typing your address...'}
            className="max-w-md"
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={value === true || value === 'true'}
              onCheckedChange={handleChange}
              disabled={disabled}
            />
            <Label>{value ? 'Yes' : 'No'}</Label>
          </div>
        );

      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={question.placeholder || ''}
            disabled={disabled}
            className="max-w-md"
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <Label className="text-sm font-medium">
            {question.question_text}
            {question.is_required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {question.help_text && (
            <p className="text-xs text-muted-foreground mt-1">{question.help_text}</p>
          )}
        </div>
        {question.user_answer?.is_stale && (
          <Badge variant="outline" className="border-warning text-warning gap-1 flex-shrink-0">
            <AlertCircle className="h-3 w-3" />
            Needs Update
          </Badge>
        )}
      </div>
      {renderInput()}
    </div>
  );
};
