

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { badgeName, tier, category, iconTheme, type = 'badge' } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Generating ${type} for ${badgeName} (${tier} tier, ${category} category)`);

    const tierColors = getTierColors(tier);
    const size = type === 'badge' ? '512x512px' : '256x256px';
    
    let prompt: string;
    
    if (type === 'tier-icon') {
      prompt = `Create a ${tier} tier emblem icon for a gamified reputation system. Style: glossy 3D badge with ${tierColors} gradient, bold psychedelic aesthetic, neon glow effects, gaming badge look. Symbol: ${iconTheme}. Bright bold colors inspired by African sunsets and Indian festivals, high contrast, modern design, dark background, ${size} PNG.`;
    } else {
      prompt = `Create a circular badge icon for a ${tier} tier achievement badge called "${badgeName}" with ${category} theme. Style: vibrant psychedelic gradients with ${tierColors}, bold 3D effect with glossy finish, modern gaming aesthetic, neon glow effects. The badge should be round like a Pokéball, featuring ${iconTheme} symbolism. High contrast, bright bold colors inspired by African sunsets and Indian festivals. Perfect circle shape, dark background, PNG format, ${size}.`;
    }

    console.log('Calling Lovable AI with prompt:', prompt);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      console.error("No image generated in response:", JSON.stringify(data));
      throw new Error("No image was generated");
    }

    console.log(`Successfully generated ${type} for ${badgeName}`);

    return new Response(JSON.stringify({ 
      imageUrl,
      badgeName,
      tier,
      category 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error in generate-badge-image function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

function getTierColors(tier: string): string {
  switch (tier) {
    case 'Diamond':
      return 'cyan, teal, electric blue with crystalline sparkles and diamond shimmer';
    case 'Platinum':
      return 'purple, blue, iridescent with misty effects and Victoria Falls inspiration';
    case 'Gold':
      return 'rich gold, amber, yellow with lion\'s mane accents and Sahara sunset glow';
    case 'Silver':
      return 'silver, gray, blue-gray with storm cloud effects and Serengeti inspiration';
    case 'Bronze':
      return 'warm orange, amber, bronze with sunset glow and turmeric fire';
    case 'Elite':
      return 'rainbow holographic with legendary aura, supreme multicolor gradient';
    default:
      return 'vibrant multicolor with psychedelic effects';
  }
}
