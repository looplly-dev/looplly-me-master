import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutocompleteRequest {
  query: string;
}

interface PlaceDetailsRequest {
  placeId: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    
    if (!apiKey) {
      throw new Error('GOOGLE_PLACES_API_KEY not configured');
    }

    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint') || 'autocomplete';

    if (endpoint === 'autocomplete') {
      const { query } = await req.json() as AutocompleteRequest;
      
      if (!query) {
        return new Response(
          JSON.stringify({ error: 'Missing query parameter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${apiKey}`
      );

      const data = await response.json();

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } 
    
    else if (endpoint === 'details') {
      const { placeId } = await req.json() as PlaceDetailsRequest;
      
      if (!placeId) {
        return new Response(
          JSON.stringify({ error: 'Missing placeId parameter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`
      );

      const data = await response.json();

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid endpoint. Use ?endpoint=autocomplete or ?endpoint=details' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[GOOGLE-PLACES] Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
