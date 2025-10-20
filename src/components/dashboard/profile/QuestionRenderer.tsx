import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { AddressFieldsInput } from '@/components/ui/address-fields-input';
import type { AddressComponents } from '@/services/googlePlacesService';
import { Switch } from '@/components/ui/switch';
import { Calendar as CalendarIcon, AlertCircle, Lock, Clock } from 'lucide-react';
import type { ProfileQuestion } from '@/hooks/useProfileQuestions';

interface QuestionRendererProps {
  question: ProfileQuestion;
  onAnswerChange: (questionId: string, value: any) => void;
  onAddressChange?: (address: AddressComponents) => void;
  disabled?: boolean;
}

export function QuestionRenderer({ question, onAnswerChange, onAddressChange, disabled }: QuestionRendererProps) {
  const [value, setValue] = useState<any>(
    question.user_answer?.answer_json || question.user_answer?.answer_value || ''
  );

  const isLocked = question.is_immutable && !!question.user_answer?.answer_value;
  
  // Calculate days until expiry
  const daysUntilExpiry = question.user_answer?.last_updated && question.decay_interval_days
    ? question.decay_interval_days - Math.floor(
        (Date.now() - new Date(question.user_answer.last_updated).getTime()) / (1000 * 60 * 60 * 24)
      )
    : null;

  useEffect(() => {
    if (question.question_type === 'text' || question.question_type === 'email' || question.question_type === 'phone') {
      const timer = setTimeout(() => {
        if (value !== (question.user_answer?.answer_value || '')) {
          onAnswerChange(question.id, value);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [value, question.id, question.question_type, question.user_answer?.answer_value, onAnswerChange]);

  const handleChange = (newValue: any) => {
    setValue(newValue);
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
            id={question.id}
            type={question.question_type === 'email' ? 'email' : question.question_type === 'phone' ? 'tel' : 'text'}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={question.placeholder || ''}
            disabled={disabled || isLocked}
            className="w-full"
          />
        );

      case 'number':
        return (
          <Input
            id={question.id}
            type="number"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={question.placeholder || ''}
            disabled={disabled || isLocked}
            className="w-full"
          />
        );

      case 'select':
        return (
          <Select value={value} onValueChange={handleChange} disabled={disabled || isLocked}>
            <SelectTrigger className="w-full">
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
                variant={'outline'}
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !value && 'text-muted-foreground'
                )}
                disabled={disabled || isLocked}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => {
                  if (date) {
                    handleChange(date.toISOString());
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case 'address':
        return (
          <AddressFieldsInput
            value={question.user_answer?.answer_json}
            onChange={(address) => {
              setValue(address);
              if (onAddressChange) {
                onAddressChange(address);
              }
            }}
            disabled={disabled || isLocked}
          />
        );

      case 'boolean':
        return (
          <Switch
            id={question.id}
            checked={value === true || value === 'true'}
            onCheckedChange={handleChange}
            disabled={disabled || isLocked}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Label htmlFor={question.id} className="flex items-center gap-2">
          {question.question_text}
          {question.is_required && <span className="text-destructive">*</span>}
        </Label>
        <div className="flex items-center gap-2">
          {isLocked && (
            <Badge variant="secondary" className="gap-1 flex-shrink-0">
              <Lock className="h-3 w-3" />
              Locked
            </Badge>
          )}
        </div>
      </div>
      {renderInput()}
      <div className="space-y-1">
        {question.help_text && (
          <p className="text-sm text-muted-foreground">{question.help_text}</p>
        )}
        {isLocked && (
          <p className="text-xs text-muted-foreground italic">
            This field is locked for data integrity. Contact support to update.
          </p>
        )}
      </div>
    </div>
  );
}
