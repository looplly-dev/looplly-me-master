// Reusable form validation hook
import { useState, useCallback } from 'react';
import { ValidationResult } from '@/utils/validation';

interface UseFormValidationProps<T> {
  initialData: T;
  validateFn: (data: T) => ValidationResult;
}

export const useFormValidation = <T>({ initialData, validateFn }: UseFormValidationProps<T>) => {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);

  const updateField = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateFormData = useCallback((data: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  const validate = useCallback(() => {
    const result = validateFn(formData);
    setErrors(result.errors);
    setIsValid(result.isValid);
    return result;
  }, [formData, validateFn]);

  const reset = useCallback(() => {
    setFormData(initialData);
    setErrors([]);
    setIsValid(false);
  }, [initialData]);

  return {
    formData,
    errors,
    isValid,
    updateField,
    updateFormData,
    validate,
    reset,
    setFormData
  };
};