import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  gapId: string;
  countryCode: string;
  questionId: string;
  questionKey: string;
}

interface AIGeneratedOptions {
  options: Array<{
    value: string;
    label: string;
    local_context?: string;
  }>;
  sources: string[];
  confidence: number;
  notes?: string;
}

interface QuestionMetadata {
  question_text: string;
  category: string;
  level: number;
  question_type: string;
  question_key: string;
}

// Prompt templates based on question type
const PROMPT_TEMPLATES = {
  household_income: (country: string, questionText: string) => `
You are a market research expert specializing in economic data localization. Generate household income ranges for ${country}.

**Task**: Create 6-10 income bands appropriate for ${country}'s economy for the question: "${questionText}"

**Requirements**:
1. Use the local currency (e.g., Birr for Ethiopia, Rupees for India, Naira for Nigeria)
2. Base ranges on current economic data from World Bank, IMF, or national statistics offices
3. Provide context showing USD equivalent for international understanding
4. Label each range appropriately (e.g., "Lower income", "Middle income", "Upper-middle income")
5. Ensure ranges cover the full economic spectrum from poverty line to affluent households

**Output Format** (JSON only, no additional text):
{
  "options": [
    {
      "value": "10000-25000",
      "label": "Lower income",
      "local_context": "~$120-$300 USD/month"
    }
  ],
  "sources": ["World Bank 2024", "National Statistics Office"],
  "confidence": 85,
  "notes": "Based on 2024 economic data"
}

Provide culturally appropriate, well-researched income bands with high confidence.`,

  beverage_brands: (country: string, questionText: string) => `
You are a consumer market research expert specializing in beverage industry analysis. Generate popular beverage brands for ${country}.

**Task**: Identify 8-15 popular beverage brands for the question: "${questionText}"

**Requirements**:
1. Include both local/regional brands AND international brands available in ${country}
2. Cover different beverage categories (soft drinks, juices, energy drinks, etc.)
3. Prioritize brands with significant market share or cultural relevance
4. Note if certain brands are regional specialties
5. Provide context about local preferences or cultural significance

**Output Format** (JSON only, no additional text):
{
  "options": [
    {
      "value": "coca-cola",
      "label": "Coca-Cola",
      "local_context": "Widely available international brand"
    },
    {
      "value": "local-brand",
      "label": "Local Brand Name",
      "local_context": "Popular regional specialty"
    }
  ],
  "sources": ["Market research reports", "Local retail data"],
  "confidence": 80,
  "notes": "Mix of international and local brands"
}`,

  automotive_preferences: (country: string, questionText: string) => `
You are an automotive market analyst specializing in consumer preferences. Generate automotive options for ${country}.

**Task**: Identify popular vehicle types and brands for the question: "${questionText}"

**Requirements**:
1. Include vehicle types appropriate for ${country}'s roads and infrastructure
2. List popular brands with significant market presence
3. Consider price tiers relevant to local economy
4. Note cultural preferences (e.g., SUVs, compact cars, motorcycles)
5. Include both new and used market considerations if relevant

**Output Format** (JSON only, no additional text):
{
  "options": [
    {
      "value": "toyota",
      "label": "Toyota",
      "local_context": "Most popular brand, known for reliability"
    }
  ],
  "sources": ["Automotive industry reports", "Sales data"],
  "confidence": 75,
  "notes": "Focused on affordable and reliable options"
}`,

  generic: (country: string, questionText: string) => `
You are a market research expert specializing in cultural localization. Generate appropriate options for ${country}.

**Task**: Create 6-12 culturally appropriate options for the question: "${questionText}"

**Requirements**:
1. Research local context and cultural norms for ${country}
2. Provide options that reflect local reality and preferences
3. Ensure options are comprehensive and mutually exclusive
4. Use local terminology and references where appropriate
5. Provide context for international understanding

**Output Format** (JSON only, no additional text):
{
  "options": [
    {
      "value": "option-key",
      "label": "Option Label",
      "local_context": "Additional context"
    }
  ],
  "sources": ["Research sources"],
  "confidence": 70,
  "notes": "Context about the options"
}`
};

function buildPrompt(questionKey: string, country: string, questionText: string): string {
  const template = PROMPT_TEMPLATES[questionKey as keyof typeof PROMPT_TEMPLATES] || PROMPT_TEMPLATES.generic;
  return template(country, questionText);
}

function calculateConfidence(aiResponse: AIGeneratedOptions): number {
  let score = 70; // Base score
  
  // +10 if has official sources
  const officialSources = ['World Bank', 'IMF', 'National Statistics', 'Government', 'Central Bank'];
  if (aiResponse.sources.some(s => officialSources.some(os => s.includes(os)))) {
    score += 10;
  }
  
  // +5 if includes local context
  if (aiResponse.options.every(o => o.local_context)) {
    score += 5;
  }
  
  // +10 if option count is reasonable (5-12)
  if (aiResponse.options.length >= 5 && aiResponse.options.length <= 12) {
    score += 10;
  }
  
  // +5 if AI provided notes
  if (aiResponse.notes) {
    score += 5;
  }
  
  return Math.min(score, 100);
}

function sanitizeOutput(options: AIGeneratedOptions): AIGeneratedOptions {
  return {
    ...options,
    options: options.options.map(opt => ({
      value: opt.value.replace(/[<>]/g, ''),
      label: opt.label.replace(/[<>]/g, ''),
      local_context: opt.local_context?.replace(/[<>]/g, '')
    })),
    notes: options.notes?.replace(/[<>]/g, '')
  };
}

function parseAIResponse(content: string): AIGeneratedOptions {
  let jsonContent = content.trim();
  
  // Remove markdown code blocks
  if (jsonContent.startsWith('```json')) {
    jsonContent = jsonContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
  } else if (jsonContent.startsWith('```')) {
    jsonContent = jsonContent.replace(/```\n?/, '').replace(/\n?```$/, '');
  }
  
  // Remove leading text before JSON
  const jsonStart = jsonContent.indexOf('{');
  if (jsonStart > 0) {
    jsonContent = jsonContent.substring(jsonStart);
  }
  
  try {
    const parsed = JSON.parse(jsonContent);
    
    // Validate structure
    if (!parsed.options || !Array.isArray(parsed.options)) {
      throw new Error('Missing or invalid "options" array');
    }
    
    return parsed as AIGeneratedOptions;
  } catch (error) {
    console.error('[AUTO-GEN] JSON parse error:', error);
    console.error('[AUTO-GEN] Raw content:', content);
    throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
  }
}

async function callOpenAI(prompt: string, apiKey: string): Promise<AIGeneratedOptions> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a market research expert specializing in localization. Always respond with valid JSON only.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2000
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) {
      throw new Error('OpenAI API key is invalid. Please check your configuration.');
    } else if (response.status === 429) {
      throw new Error('OpenAI rate limit exceeded. Please try again later.');
    } else if (response.status === 402) {
      throw new Error('OpenAI payment required. Please check your billing.');
    }
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('OpenAI returned empty response');
  }

  return parseAIResponse(content);
}

async function callAnthropic(prompt: string, apiKey: string): Promise<AIGeneratedOptions> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: prompt
      }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) {
      throw new Error('Anthropic API key is invalid. Please check your configuration.');
    } else if (response.status === 429) {
      throw new Error('Anthropic rate limit exceeded. Please try again later.');
    } else if (response.status === 402) {
      throw new Error('Anthropic payment required. Please check your billing.');
    }
    throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text;
  
  if (!content) {
    throw new Error('Anthropic returned empty response');
  }

  return parseAIResponse(content);
}

async function callGoogleGemini(prompt: string, apiKey: string): Promise<AIGeneratedOptions> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401 || response.status === 403) {
      throw new Error('Google Gemini API key is invalid. Please check your configuration.');
    } else if (response.status === 429) {
      throw new Error('Google Gemini rate limit exceeded. Please try again later.');
    }
    throw new Error(`Google Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!content) {
    throw new Error('Google Gemini returned empty response');
  }

  return parseAIResponse(content);
}

function mockResponse(questionKey: string, countryCode: string): AIGeneratedOptions {
  const mockDatabase: Record<string, Record<string, any>> = {
    household_income: {
      ET: {
        options: [
          { value: '0-5000', label: 'Less than 5,000 ETB', local_context: '~$0-$90 USD/month' },
          { value: '5000-10000', label: '5,000 - 10,000 ETB', local_context: '~$90-$180 USD/month' },
          { value: '10000-20000', label: '10,000 - 20,000 ETB', local_context: '~$180-$360 USD/month' },
          { value: '20000-30000', label: '20,000 - 30,000 ETB', local_context: '~$360-$540 USD/month' },
          { value: '30000+', label: '30,000+ ETB', local_context: '~$540+ USD/month' }
        ],
        confidence: 85
      },
      ZA: {
        options: [
          { value: '0-5000', label: 'R0 - R5,000', local_context: '~$0-$300 USD/month' },
          { value: '5000-10000', label: 'R5,000 - R10,000', local_context: '~$300-$600 USD/month' },
          { value: '10000-20000', label: 'R10,000 - R20,000', local_context: '~$600-$1,200 USD/month' },
          { value: '20000-40000', label: 'R20,000 - R40,000', local_context: '~$1,200-$2,400 USD/month' },
          { value: '40000+', label: 'R40,000+', local_context: '~$2,400+ USD/month' }
        ],
        confidence: 85
      },
      NG: {
        options: [
          { value: '0-50000', label: 'Less than ₦50,000', local_context: '~$0-$120 USD/month' },
          { value: '50000-100000', label: '₦50,000 - ₦100,000', local_context: '~$120-$240 USD/month' },
          { value: '100000-200000', label: '₦100,000 - ₦200,000', local_context: '~$240-$480 USD/month' },
          { value: '200000-400000', label: '₦200,000 - ₦400,000', local_context: '~$480-$960 USD/month' },
          { value: '400000+', label: '₦400,000+', local_context: '~$960+ USD/month' }
        ],
        confidence: 85
      }
    },
    beverage_brands: {
      ET: {
        options: [
          { value: 'habesha_beer', label: 'Habesha Beer', local_context: 'Popular local Ethiopian beer' },
          { value: 'bedele', label: 'Bedele Special Beer', local_context: 'Local brewery brand' },
          { value: 'coca-cola', label: 'Coca-Cola', local_context: 'International soft drink' },
          { value: 'pepsi', label: 'Pepsi', local_context: 'International soft drink' },
          { value: 'ambo', label: 'Ambo Mineral Water', local_context: 'Local mineral water brand' }
        ],
        confidence: 80
      },
      ZA: {
        options: [
          { value: 'castle', label: 'Castle Lager', local_context: 'South African beer brand' },
          { value: 'black_label', label: 'Black Label', local_context: 'Popular SA beer' },
          { value: 'coca-cola', label: 'Coca-Cola', local_context: 'International soft drink' },
          { value: 'appletiser', label: 'Appletiser', local_context: 'Local sparkling apple juice' },
          { value: 'iron_brew', label: 'Iron Brew', local_context: 'Local soft drink' }
        ],
        confidence: 80
      }
    }
  };

  const questionData = mockDatabase[questionKey] || {};
  const countryData = questionData[countryCode] || {
    options: [
      { value: 'option1', label: 'Option 1', local_context: 'Standard option' },
      { value: 'option2', label: 'Option 2', local_context: 'Standard option' },
      { value: 'option3', label: 'Option 3', local_context: 'Standard option' }
    ],
    confidence: 65
  };

  return {
    options: countryData.options,
    sources: ['Mock Data (Development Mode)'],
    confidence: countryData.confidence,
    notes: 'Mock data for development. Configure AI provider in Admin → Integrations for real generation.'
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const aiProvider = Deno.env.get('AI_PROVIDER') || 'mock';
    const aiApiKey = Deno.env.get('AI_PROVIDER_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { gapId, countryCode, questionId, questionKey } = await req.json() as RequestBody;

    console.log(`[AUTO-GEN] Starting generation for gap ${gapId}`);
    console.log(`[AUTO-GEN] Country: ${countryCode}, Question: ${questionKey}`);

    // Validate country code (ISO 3166-1 alpha-2)
    if (!/^[A-Z]{2}$/.test(countryCode)) {
      return new Response(
        JSON.stringify({ error: 'Invalid country code format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch question metadata
    const { data: question, error: questionError } = await supabase
      .from('profile_questions')
      .select('question_text, category, level, question_type, question_key')
      .eq('id', questionId)
      .single();

    if (questionError || !question) {
      console.error('[AUTO-GEN] Question not found:', questionError);
      return new Response(
        JSON.stringify({ error: 'Question not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get country name for better context
    const countryNames: Record<string, string> = {
      'ZA': 'South Africa', 'NG': 'Nigeria', 'KE': 'Kenya', 
      'ET': 'Ethiopia', 'GB': 'United Kingdom', 'IN': 'India',
      'US': 'United States', 'CA': 'Canada', 'AU': 'Australia'
    };
    const countryName = countryNames[countryCode] || countryCode;

    // Build AI prompt
    const prompt = buildPrompt(questionKey, countryName, question.question_text);

    let aiResponse: AIGeneratedOptions;

    // Route to correct provider or use mock
    if (!aiApiKey || aiProvider === 'mock') {
      console.log('[AUTO-GEN] Using MOCK data (no provider configured)');
      aiResponse = mockResponse(questionKey, countryCode);
    } else {
      console.log(`[AUTO-GEN] Using AI provider: ${aiProvider}`);
      
      try {
        switch (aiProvider) {
          case 'openai':
            aiResponse = await callOpenAI(prompt, aiApiKey);
            break;
          case 'anthropic':
            aiResponse = await callAnthropic(prompt, aiApiKey);
            break;
          case 'google':
            aiResponse = await callGoogleGemini(prompt, aiApiKey);
            break;
          default:
            console.warn(`[AUTO-GEN] Unknown provider "${aiProvider}", falling back to mock`);
            aiResponse = mockResponse(questionKey, countryCode);
        }
      } catch (error) {
        console.error('[AUTO-GEN] Provider error:', error);
        
        // Update gap status with error
        await supabase
          .from('country_profiling_gaps')
          .update({ 
            status: 'failed', 
            error_log: error instanceof Error ? error.message : 'Unknown provider error'
          })
          .eq('id', gapId);
        
        return new Response(
          JSON.stringify({ error: error instanceof Error ? error.message : 'AI generation failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate response structure
    if (!aiResponse.options || !Array.isArray(aiResponse.options) || aiResponse.options.length === 0) {
      console.error('[AUTO-GEN] Invalid AI response structure');
      await supabase
        .from('country_profiling_gaps')
        .update({ 
          status: 'validation_failed', 
          error_log: 'AI response missing required fields',
          draft_options: aiResponse as any
        })
        .eq('id', gapId);
      
      return new Response(
        JSON.stringify({ error: 'Invalid AI response structure' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize output
    const sanitizedResponse = sanitizeOutput(aiResponse);

    // Calculate confidence score
    const confidence = calculateConfidence(sanitizedResponse);

    console.log(`[AUTO-GEN] Confidence: ${confidence}%, Options: ${sanitizedResponse.options.length}`);

    // Update database with generated options
    const { error: updateError } = await supabase
      .from('country_profiling_gaps')
      .update({
        draft_options: sanitizedResponse,
        confidence_score: confidence,
        status: 'pending_review',
        generated_at: new Date().toISOString()
      })
      .eq('id', gapId);

    if (updateError) {
      console.error('[AUTO-GEN] Database update failed:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to save generated options' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[AUTO-GEN] Successfully generated options for gap ${gapId}`);

    return new Response(
      JSON.stringify({
        success: true,
        gapId,
        confidence,
        optionsCount: sanitizedResponse.options.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[AUTO-GEN] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
