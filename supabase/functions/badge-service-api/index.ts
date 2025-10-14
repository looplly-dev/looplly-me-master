import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-tenant-api-key',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract tenant identification (API key or auth token)
    const tenantApiKey = req.headers.get('x-tenant-api-key');
    const authHeader = req.headers.get('authorization');
    
    let tenantId: string | null = null;
    let userId: string | null = null;

    // Authenticate via tenant API key (for external companies)
    if (tenantApiKey) {
      const { data: tenant } = await supabase
        .rpc('validate_tenant_api_key', { api_key_input: tenantApiKey });
      
      if (!tenant) {
        return new Response(JSON.stringify({ error: 'Invalid API key' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      tenantId = tenant;
    } 
    // Authenticate via user JWT (for internal use)
    else if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      userId = user.id;
      
      // Get user's tenant
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('user_id', userId)
        .maybeSingle();
      
      tenantId = profile?.tenant_id || null;
    } else {
      return new Response(JSON.stringify({ error: 'Missing authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { pathname } = new URL(req.url);
    const segments = pathname.split('/').filter(Boolean);
    const action = segments[segments.length - 1];

    console.log(`Badge Service API - Action: ${action}, Tenant: ${tenantId}, User: ${userId}`);

    // Route to appropriate handler
    switch (action) {
      case 'generate':
        return await handleGenerate(req, supabase, tenantId, userId);
      case 'list':
        return await handleList(req, supabase, tenantId);
      case 'award':
        return await handleAward(req, supabase, tenantId, userId);
      case 'user-badges':
        return await handleUserBadges(req, supabase, tenantId, userId);
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

  } catch (error) {
    console.error('Badge Service API Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function handleGenerate(req: Request, supabase: any, tenantId: string | null, userId: string | null) {
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
    throw new Error("No image was generated");
  }

  // Log audit event
  if (tenantId && userId) {
    await supabase.rpc('log_audit_event', {
      p_tenant_id: tenantId,
      p_user_id: userId,
      p_action: 'badge.generate',
      p_resource_type: 'badge',
      p_resource_id: null,
      p_metadata: { badgeName, tier, category, type }
    });
  }

  return new Response(JSON.stringify({ 
    imageUrl,
    badgeName,
    tier,
    category 
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

async function handleList(req: Request, supabase: any, tenantId: string | null) {
  if (!tenantId) {
    return new Response(JSON.stringify({ error: 'Tenant ID required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const { data: badges, error } = await supabase
    .from('badge_catalog')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .order('tier', { ascending: true });

  if (error) {
    throw error;
  }

  return new Response(JSON.stringify({ badges }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleAward(req: Request, supabase: any, tenantId: string | null, userId: string | null) {
  if (!tenantId) {
    return new Response(JSON.stringify({ error: 'Tenant ID required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const { targetUserId, badgeId } = await req.json();

  if (!targetUserId || !badgeId) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Award the badge
  const { data: awarded, error } = await supabase
    .from('user_badges')
    .insert({
      user_id: targetUserId,
      badge_id: badgeId
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      return new Response(JSON.stringify({ error: 'Badge already awarded' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    throw error;
  }

  // Log audit event
  if (userId) {
    await supabase.rpc('log_audit_event', {
      p_tenant_id: tenantId,
      p_user_id: userId,
      p_action: 'badge.award',
      p_resource_type: 'user_badge',
      p_resource_id: awarded.id,
      p_metadata: { targetUserId, badgeId }
    });
  }

  return new Response(JSON.stringify({ success: true, badge: awarded }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleUserBadges(req: Request, supabase: any, tenantId: string | null, userId: string | null) {
  const url = new URL(req.url);
  const targetUserId = url.searchParams.get('userId') || userId;

  if (!targetUserId) {
    return new Response(JSON.stringify({ error: 'User ID required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const { data: userBadges, error } = await supabase
    .from('user_badges')
    .select(`
      *,
      badge:badge_catalog(*)
    `)
    .eq('user_id', targetUserId)
    .order('awarded_at', { ascending: false });

  if (error) {
    throw error;
  }

  return new Response(JSON.stringify({ badges: userBadges }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

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
