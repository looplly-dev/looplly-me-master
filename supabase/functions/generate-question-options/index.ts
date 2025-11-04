import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question_key, question_text, question_type, option_count = 8 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    if (!question_text || !question_key) {
      throw new Error('question_text and question_key are required');
    }

    const prompt = `Generate ${option_count} mutually exclusive answer options for the question: "${question_text}"

Question context: ${question_key}
Question type: ${question_type}

Requirements:
- Options should be comprehensive and cover common scenarios
- Use clear, simple language
- Ensure options are mutually exclusive (no overlap)
- Include an "Other" or "Prefer not to say" option if appropriate
- Use proper capitalization for each option

Return ONLY a valid JSON array in this EXACT format:
[
  { "value": "option_key", "label": "Option Label" },
  { "value": "other", "label": "Other" }
]

Important:
- "value" should be lowercase with underscores (e.g., "full_time", "part_time")
- "label" should be user-friendly (e.g., "Full-time", "Part-time")
- Return ONLY the JSON array, no markdown, no explanation`;

    console.log('Calling Lovable AI for options generation');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are a survey design expert. Generate comprehensive, mutually exclusive answer options. Always return valid JSON arrays.' 
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please wait a moment and try again.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits in Settings → Workspace → Usage.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    let generatedContent = data.choices?.[0]?.message?.content?.trim() || '';

    console.log('Raw AI response:', generatedContent);

    // Clean up markdown formatting if present
    generatedContent = generatedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse the JSON
    let options;
    try {
      options = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      throw new Error('AI returned invalid JSON format');
    }

    // Validate options
    if (!Array.isArray(options) || options.length < 3) {
      throw new Error('AI must return at least 3 options');
    }

    // Sanitize and validate each option
    const sanitizedOptions = options.map((opt: any) => {
      if (!opt.label || !opt.value) {
        throw new Error('Each option must have "label" and "value" properties');
      }
      return {
        label: opt.label.trim(),
        value: opt.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
      };
    });

    console.log('Generated options:', sanitizedOptions);

    return new Response(
      JSON.stringify({ 
        options: sanitizedOptions,
        confidence: 0.85 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-question-options:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
