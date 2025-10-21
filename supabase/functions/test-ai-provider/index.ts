import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestRequest {
  provider: 'openai' | 'anthropic' | 'google';
  apiKey: string;
  prompt: string;
}

async function testOpenAI(apiKey: string, prompt: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful assistant. Respond with a brief test message.' },
        { role: 'user', content: prompt || 'Hello, this is a test.' }
      ],
      max_tokens: 100
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API request failed');
  }

  const data = await response.json();
  return {
    success: true,
    provider: 'openai',
    response: data.choices[0].message.content,
    model: data.model,
    usage: data.usage
  };
}

async function testAnthropic(apiKey: string, prompt: string) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: prompt || 'Hello, this is a test.'
      }],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Anthropic API request failed');
  }

  const data = await response.json();
  return {
    success: true,
    provider: 'anthropic',
    response: data.content[0].text,
    model: data.model,
    usage: data.usage
  };
}

async function testGoogleGemini(apiKey: string, prompt: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt || 'Hello, this is a test.' }]
        }],
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Google Gemini API request failed');
  }

  const data = await response.json();
  return {
    success: true,
    provider: 'google',
    response: data.candidates[0].content.parts[0].text,
    model: 'gemini-pro'
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { provider, apiKey, prompt } = await req.json() as TestRequest;

    if (!provider || !apiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing provider or apiKey' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[TEST-AI] Testing ${provider} provider`);

    let result;
    switch (provider) {
      case 'openai':
        result = await testOpenAI(apiKey, prompt);
        break;
      case 'anthropic':
        result = await testAnthropic(apiKey, prompt);
        break;
      case 'google':
        result = await testGoogleGemini(apiKey, prompt);
        break;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }

    console.log(`[TEST-AI] ${provider} test successful`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[TEST-AI] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
