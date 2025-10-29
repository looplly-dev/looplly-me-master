import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, conversationHistory = [] } = await req.json();
    
    console.log('Received question:', question);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Search for relevant documentation
    const { data: docs, error: searchError } = await supabase
      .from('documentation')
      .select('title, content, category, id')
      .or(`title.ilike.%${question}%,content.ilike.%${question}%`)
      .limit(5);

    if (searchError) {
      console.error('Search error:', searchError);
    }

    // Build context from relevant docs
    let context = '';
    if (docs && docs.length > 0) {
      context = 'Here are the most relevant documentation sections:\n\n';
      docs.forEach((doc, idx) => {
        context += `[Document ${idx + 1}: ${doc.title}]\n${doc.content.substring(0, 1000)}...\n\n`;
      });
    }

    // Prepare messages for AI
    const messages = [
      {
        role: 'system',
        content: `You are Looplly's helpful Knowledge Centre assistant. Answer questions about how Looplly works based on the documentation provided.

Key guidelines:
- Be clear, concise, and helpful
- If you don't have enough information in the documentation, say so
- Reference specific features or sections when relevant
- Use a friendly, professional tone
- Format your response with markdown for better readability

${context}`
      },
      ...conversationHistory,
      {
        role: 'user',
        content: question
      }
    ];

    console.log('Calling Lovable AI...');

    // Call Lovable AI Gateway
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        stream: true,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI API error: ${errorText}`);
    }

    // Stream the response back
    return new Response(aiResponse.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
      },
    });

  } catch (error) {
    console.error('Knowledge chat error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
