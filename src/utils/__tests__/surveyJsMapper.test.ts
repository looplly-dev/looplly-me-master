import { loopllyToSurveyJs, surveyJsToLooplly } from '@/utils/surveyJsMapper';

describe('surveyJsMapper', () => {
  it('converts select_multiple to SurveyJS checkbox with choices', () => {
    const question: any = {
      question_key: 'fruits',
      question_text: 'Select your fruits',
      question_type: 'select_multiple',
      level: 1,
      category_id: 'cat1',
      is_required: true,
      options: [
        { value: 'apple', label: 'Apple' },
        { value: 'banana', label: 'Banana' }
      ],
      validation_rules: { minLength: 1 }
    };

    const el = loopllyToSurveyJs(question);
    expect(el.type).toBe('checkbox');
    expect(el.name).toBe('fruits');
    expect(el.title).toBe('Select your fruits');
    expect(el.isRequired).toBe(true);
    expect(el.choices).toEqual([
      { value: 'apple', text: 'Apple' },
      { value: 'banana', text: 'Banana' }
    ]);

    // Custom properties are preserved
    expect(el['@level']).toBe(1);
    expect(el['@category_id']).toBe('cat1');
  });

  it('converts SurveyJS checkbox back to select_multiple and preserves @ fields', () => {
    const element: any = {
      type: 'checkbox',
      name: 'colors',
      title: 'Pick colors',
      isRequired: false,
      choices: [
        { value: 'red', text: 'Red' },
        { value: 'blue', text: 'Blue' }
      ],
      '@level': 2,
      '@category_id': 'cat2',
      '@display_order': 3,
      '@is_draft': true
    };

    const q = surveyJsToLooplly(element, 'fallback', 9);
    expect(q.question_key).toBe('colors');
    expect(q.question_text).toBe('Pick colors');
    expect(q.question_type).toBe('select_multiple');
    expect(q.level).toBe(2); // from @level
    expect(q.category_id).toBe('cat2'); // from @category_id
    expect(q.display_order).toBe(3);
    expect(q.is_draft).toBe(true);
    expect(q.options).toEqual([
      { value: 'red', label: 'Red' },
      { value: 'blue', label: 'Blue' }
    ]);
  });
});
