/**
 * Bidirectional mapper between SurveyJS format and Looplly profile_questions schema
 * Preserves all custom properties and handles type conversions
 */

// Type mapping between Looplly and SurveyJS
const TYPE_MAP: Record<string, string> = {
  text: 'text',
  number: 'text',
  email: 'text',
  phone: 'text',
  select: 'dropdown',
  select_single: 'dropdown',
  select_multiple: 'checkbox',
  date: 'text',
  address: 'text',
  boolean: 'boolean'
};

const REVERSE_TYPE_MAP: Record<string, string> = {
  text: 'text',
  dropdown: 'select_single',
  checkbox: 'select_multiple',
  boolean: 'boolean',
  radiogroup: 'select_single',
  comment: 'text'
};

interface SurveyElement {
  type: string;
  name: string;
  title?: string;
  description?: string;
  isRequired?: boolean;
  placeholder?: string;
  choices?: Array<{ value: string; text: string }>;
  inputType?: string;
  validators?: any[];
  [key: string]: any;
}

interface SurveyPage {
  name: string;
  title?: string;
  description?: string;
  elements: SurveyElement[];
}

interface SurveyJSON {
  pages: SurveyPage[];
  [key: string]: any;
}

interface ProfileQuestion {
  id?: string;
  question_key: string;
  question_text: string;
  question_type: string;
  level: number;
  category_id: string;
  options?: any;
  is_required?: boolean;
  help_text?: string;
  placeholder?: string;
  validation_rules?: any;
  decay_config_key?: string;
  country_codes?: string[];
  display_order?: number;
  is_draft?: boolean;
  is_immutable?: boolean;
  [key: string]: any;
}

/**
 * Convert Looplly question to SurveyJS element
 */
export function loopllyToSurveyJs(question: ProfileQuestion): SurveyElement {
  const surveyType = TYPE_MAP[question.question_type] || 'text';
  
  const element: SurveyElement = {
    type: surveyType,
    name: question.question_key,
    title: question.question_text,
    isRequired: question.is_required || false,
    description: question.help_text || undefined,
    placeholder: question.placeholder || undefined
  };

  // Add input type for special text fields
  if (question.question_type === 'number') {
    element.inputType = 'number';
  } else if (question.question_type === 'email') {
    element.inputType = 'email';
  } else if (question.question_type === 'phone') {
    element.inputType = 'tel';
  } else if (question.question_type === 'date') {
    element.inputType = 'date';
  }

  // Add choices for select types
  if (question.options && Array.isArray(question.options)) {
    element.choices = question.options.map((opt: any) => ({
      value: opt.value || opt,
      text: opt.label || opt.text || opt.value || opt
    }));
  }

  // Add validators
  if (question.validation_rules) {
    element.validators = [];
    const rules = question.validation_rules;
    
    if (rules.minLength) {
      element.validators.push({ type: 'text', minLength: rules.minLength });
    }
    if (rules.maxLength) {
      element.validators.push({ type: 'text', maxLength: rules.maxLength });
    }
    if (rules.min) {
      element.validators.push({ type: 'numeric', minValue: rules.min });
    }
    if (rules.max) {
      element.validators.push({ type: 'numeric', maxValue: rules.max });
    }
    if (rules.pattern) {
      element.validators.push({ type: 'regex', regex: rules.pattern });
    }
  }

  // Store custom Looplly properties with @ prefix
  element['@level'] = question.level;
  element['@category_id'] = question.category_id;
  element['@decay_config_key'] = question.decay_config_key;
  element['@country_codes'] = question.country_codes;
  element['@display_order'] = question.display_order;
  element['@is_draft'] = question.is_draft;
  element['@is_immutable'] = question.is_immutable;
  element['@id'] = question.id;

  return element;
}

/**
 * Convert SurveyJS element to Looplly question
 */
export function surveyJsToLooplly(
  element: SurveyElement,
  categoryId: string,
  level: number
): ProfileQuestion {
  // Determine question type
  let questionType = REVERSE_TYPE_MAP[element.type] || 'text';
  
  if (element.inputType === 'number') questionType = 'number';
  else if (element.inputType === 'email') questionType = 'email';
  else if (element.inputType === 'tel') questionType = 'phone';
  else if (element.inputType === 'date') questionType = 'date';

  const question: ProfileQuestion = {
    question_key: element.name,
    question_text: element.title || element.name,
    question_type: questionType,
    level: element['@level'] || level,
    category_id: element['@category_id'] || categoryId,
    is_required: element.isRequired || false,
    help_text: element.description || undefined,
    placeholder: element.placeholder || undefined,
    display_order: element['@display_order'] || 0,
    is_draft: element['@is_draft'] || false,
    is_immutable: element['@is_immutable'] || false
  };

  // Add id if exists (for updates)
  if (element['@id']) {
    question.id = element['@id'];
  }

  // Convert choices back to options
  if (element.choices && Array.isArray(element.choices)) {
    question.options = element.choices.map((choice: any) => ({
      value: choice.value || choice,
      label: choice.text || choice.value || choice
    }));
  }

  // Convert validators back to validation_rules
  if (element.validators && element.validators.length > 0) {
    const rules: any = {};
    
    element.validators.forEach((validator: any) => {
      if (validator.type === 'text') {
        if (validator.minLength) rules.minLength = validator.minLength;
        if (validator.maxLength) rules.maxLength = validator.maxLength;
      } else if (validator.type === 'numeric') {
        if (validator.minValue !== undefined) rules.min = validator.minValue;
        if (validator.maxValue !== undefined) rules.max = validator.maxValue;
      } else if (validator.type === 'regex') {
        if (validator.regex) rules.pattern = validator.regex;
      }
    });
    
    if (Object.keys(rules).length > 0) {
      question.validation_rules = rules;
    }
  }

  // Restore custom Looplly properties
  if (element['@decay_config_key']) {
    question.decay_config_key = element['@decay_config_key'];
  }
  if (element['@country_codes']) {
    question.country_codes = element['@country_codes'];
  }

  return question;
}

/**
 * Convert a category of questions to a SurveyJS page
 */
export function categoryToSurveyPage(
  categoryName: string,
  categoryDescription: string | null,
  questions: ProfileQuestion[]
): SurveyPage {
  return {
    name: categoryName,
    title: categoryName,
    description: categoryDescription || undefined,
    elements: questions.map(q => loopllyToSurveyJs(q))
  };
}

/**
 * Convert full SurveyJS JSON to Looplly questions array
 */
export function surveyJsonToLoopllyQuestions(
  json: SurveyJSON,
  defaultCategoryId: string,
  defaultLevel: number
): ProfileQuestion[] {
  const questions: ProfileQuestion[] = [];
  
  json.pages.forEach(page => {
    page.elements.forEach((element, index) => {
      const question = surveyJsToLooplly(
        element,
        element['@category_id'] || defaultCategoryId,
        element['@level'] || defaultLevel
      );
      
      // Set display order based on position if not set
      if (question.display_order === 0) {
        question.display_order = index;
      }
      
      questions.push(question);
    });
  });
  
  return questions;
}

/**
 * Get default SurveyJS JSON for a level
 */
export function getDefaultSurveyJson(level: number): SurveyJSON {
  return {
    title: `Level ${level} Profile Questions`,
    description: `Configure questions for Level ${level}`,
    pages: [
      {
        name: 'page1',
        title: 'Questions',
        elements: []
      }
    ]
  };
}
