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
    const { question_key, question_type, category, type = 'question' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build prompt based on type
    let prompt = '';
    if (type === 'help_text') {
      prompt = `Generate a short, helpful guidance text (1-2 sentences, under 100 characters) for the question with key: "${question_key}".

The help text should:
- Explain why we're asking this question
- Clarify any ambiguity
- Reassure users about data privacy if sensitive
- Be concise and friendly

Example: "We use this to match you with relevant opportunities in your area."

Return ONLY the help text, no extra formatting.`;
    } else {
      const typeDescriptions: Record<string, string> = {
        text: 'Create a clear, user-friendly question for collecting',
        textarea: 'Create an open-ended question that asks users to describe their',
        number: 'Create a question asking for a numeric value related to',
        select: 'Create a question that asks users to choose their',
        'multi-select': 'Create a question that asks users to select all applicable options for',
        date: 'Create a question asking for a date related to',
        address: 'Create a question asking users to provide their',
        boolean: 'Create a yes/no question about',
      };

      const typeDesc = typeDescriptions[question_type] || 'Create a question about';
      const categoryContext = category ? ` in the ${category} category` : '';

      prompt = `${typeDesc} "${question_key}"${categoryContext}.

Requirements:
- Clear and concise (under 100 characters)
- User-friendly and conversational tone
- No jargon or technical terms
- Appropriate for a profiling questionnaire
- Make it actionable (what exactly should the user provide?)

Return ONLY the question text, no quotes or extra formatting.`;
    }

    console.log('Calling Lovable AI with prompt:', prompt);

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
            content: 'You are a UX expert specializing in survey questions. Generate clear, concise, user-friendly text that makes users feel comfortable answering.' 
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
    const generatedText = data.choices?.[0]?.message?.content?.trim() || '';

    console.log('Generated text:', generatedText);

    return new Response(
      JSON.stringify({ 
        [type === 'help_text' ? 'help_text' : 'question_text']: generatedText,
        confidence: 0.85 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-question-text:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
