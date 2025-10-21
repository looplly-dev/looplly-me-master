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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      console.error('[AUTO-GEN] LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    console.log(`[AUTO-GEN] Calling Lovable AI with google/gemini-2.5-pro`);

    // Call Lovable AI with retry logic
    let retries = 0;
    const maxRetries = 3;
    let aiResponse: AIGeneratedOptions | null = null;

    while (retries < maxRetries && !aiResponse) {
      try {
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-pro',
            messages: [
              { role: 'system', content: 'You are a market research expert specializing in localization and cultural adaptation. Always respond with valid JSON only.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 2000
          }),
        });

        if (response.status === 429) {
          console.warn('[AUTO-GEN] Rate limit hit, waiting before retry...');
          await supabase
            .from('country_profiling_gaps')
            .update({ status: 'rate_limited', error_log: 'Rate limit exceeded, will retry' })
            .eq('id', gapId);
          
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 2000));
          retries++;
          continue;
        }

        if (response.status === 402) {
          console.error('[AUTO-GEN] Payment required');
          await supabase
            .from('country_profiling_gaps')
            .update({ status: 'payment_required', error_log: 'AI service payment required' })
            .eq('id', gapId);
          
          return new Response(
            JSON.stringify({ error: 'Payment required for AI service' }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[AUTO-GEN] AI API error:', response.status, errorText);
          throw new Error(`AI API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
          throw new Error('No content in AI response');
        }

        console.log(`[AUTO-GEN] AI Response received`);

        // Parse JSON response (handle markdown code blocks)
        let jsonContent = content.trim();
        if (jsonContent.startsWith('```json')) {
          jsonContent = jsonContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
        } else if (jsonContent.startsWith('```')) {
          jsonContent = jsonContent.replace(/```\n?/, '').replace(/\n?```$/, '');
        }

        aiResponse = JSON.parse(jsonContent);
        break;

      } catch (error) {
        console.error(`[AUTO-GEN] Attempt ${retries + 1} failed:`, error);
        retries++;
        if (retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 2000));
        }
      }
    }

    if (!aiResponse) {
      console.error('[AUTO-GEN] All retry attempts failed');
      await supabase
        .from('country_profiling_gaps')
        .update({ status: 'failed', error_log: 'Failed after multiple retry attempts' })
        .eq('id', gapId);
      
      return new Response(
        JSON.stringify({ error: 'Failed to generate options' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
