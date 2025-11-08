import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutocompleteRequest {
  query: string;
  countryCode?: string; // ISO country code (e.g., "ZA", "NG", "US")
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

    const body = await req.json();
    
    // Auto-detect operation type based on body content
    if (body.placeId) {
      // Place Details request
      const { placeId } = body as PlaceDetailsRequest;
      
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
    } else {
      // Autocomplete request
      const { query, countryCode } = body as AutocompleteRequest;
      
      if (!query) {
        return new Response(
          JSON.stringify({ error: 'Missing query parameter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Build API URL with country restriction
      let apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${apiKey}`;
      
      // Add country filter if provided (restricts results to specific country)
      if (countryCode) {
        apiUrl += `&components=country:${countryCode.toLowerCase()}`;
        console.log(`[GOOGLE-PLACES] Restricting autocomplete to country: ${countryCode}`);
      }

      const response = await fetch(apiUrl);
      const data = await response.json();

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
