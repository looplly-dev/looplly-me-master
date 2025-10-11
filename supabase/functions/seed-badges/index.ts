import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const expandedBadges = {
  socialConnector: [
    { id: 'first_referral', name: 'Network Pioneer', description: 'Invited your first friend to join the earning journey', tier: 'bronze', repPoints: 15, rarity: 'common', icon: 'Users', shape: 'circle', category: 'social', requirement: null },
    { id: 'social_butterfly', name: 'Connection Catalyst', description: 'Successfully referred 5 active members to the community', tier: 'silver', repPoints: 50, rarity: 'rare', icon: 'Users', shape: 'hexagon', category: 'social', requirement: '5 referrals' },
    { id: 'influence_master', name: 'Community Leader', description: 'Built a network of 10+ active referrals - true leadership', tier: 'gold', repPoints: 100, rarity: 'epic', icon: 'Crown', shape: 'star', category: 'social', requirement: '10 referrals' },
    { id: 'viral_marketer', name: 'Viral Champion', description: 'Created a viral network of 25+ successful referrals', tier: 'platinum', repPoints: 250, rarity: 'epic', icon: 'Sparkles', shape: 'diamond', category: 'social', requirement: '25 referrals' },
    { id: 'network_god', name: 'Network Deity', description: 'Legendary achievement: 50+ active referrals', tier: 'diamond', repPoints: 500, rarity: 'legendary', icon: 'Crown', shape: 'star', category: 'social', requirement: '50 referrals' }
  ],
  speedDemon: [
    { id: 'quick_start', name: 'Lightning Rookie', description: 'Completed your first survey in record time', tier: 'bronze', repPoints: 10, rarity: 'common', icon: 'Zap', shape: 'circle', category: 'speed', requirement: null },
    { id: 'speed_streak', name: 'Velocity Master', description: 'Completed 10 surveys under optimal time with perfect quality', tier: 'silver', repPoints: 40, rarity: 'rare', icon: 'Zap', shape: 'diamond', category: 'speed', requirement: '10 fast surveys' },
    { id: 'time_lord', name: 'Efficiency Sage', description: 'Mastered the perfect balance: fast completion + high quality', tier: 'gold', repPoints: 75, rarity: 'epic', icon: 'Target', shape: 'hexagon', category: 'speed', requirement: '25 fast surveys' },
    { id: 'instant_expert', name: 'Quantum Processor', description: 'Achieved superhuman survey completion speeds (50+ optimal surveys)', tier: 'platinum', repPoints: 150, rarity: 'epic', icon: 'Sparkles', shape: 'star', category: 'speed', requirement: '50 fast surveys' },
    { id: 'flash_legend', name: 'Speed Force Avatar', description: 'Transcended time itself: 100+ lightning-fast perfect surveys', tier: 'diamond', repPoints: 300, rarity: 'legendary', icon: 'Crown', shape: 'diamond', category: 'speed', requirement: '100 fast surveys' }
  ],
  perfectionist: [
    { id: 'first_perfect', name: 'Quality Seeker', description: 'Achieved your first perfect 100% quality score', tier: 'bronze', repPoints: 20, rarity: 'common', icon: 'Star', shape: 'circle', category: 'perfection', requirement: null },
    { id: 'consistency_king', name: 'Precision Elite', description: 'Maintained 95%+ quality across 25 consecutive surveys', tier: 'silver', repPoints: 60, rarity: 'rare', icon: 'Target', shape: 'hexagon', category: 'perfection', requirement: '25 quality surveys' },
    { id: 'flawless_master', name: 'Perfection Incarnate', description: 'Achieved the impossible: 50 perfect surveys in a row', tier: 'gold', repPoints: 120, rarity: 'epic', icon: 'Diamond', shape: 'star', category: 'perfection', requirement: '50 perfect surveys' },
    { id: 'quality_deity', name: 'Excellence Transcendent', description: 'Godlike achievement: 100 consecutive perfect surveys', tier: 'platinum', repPoints: 250, rarity: 'epic', icon: 'Crown', shape: 'diamond', category: 'perfection', requirement: '100 perfect surveys' },
    { id: 'perfection_myth', name: 'Mythical Perfectionist', description: 'Legendary status: 200+ perfect surveys - you are the standard', tier: 'diamond', repPoints: 500, rarity: 'legendary', icon: 'Sparkles', shape: 'star', category: 'perfection', requirement: '200 perfect surveys' }
  ],
  explorer: [
    { id: 'category_curious', name: 'Survey Scout', description: 'Explored your first 3 different survey categories', tier: 'bronze', repPoints: 15, rarity: 'common', icon: 'MapPin', shape: 'circle', category: 'exploration', requirement: '3 categories' },
    { id: 'diversity_champion', name: 'Category Conqueror', description: 'Mastered 10+ different survey categories - true versatility', tier: 'silver', repPoints: 45, rarity: 'rare', icon: 'Award', shape: 'hexagon', category: 'exploration', requirement: '10 categories' },
    { id: 'universal_solver', name: 'Research Renaissance', description: 'Conquered every available survey category - ultimate explorer', tier: 'gold', repPoints: 90, rarity: 'epic', icon: 'Trophy', shape: 'star', category: 'exploration', requirement: '15 categories' },
    { id: 'global_navigator', name: 'Worldwide Wanderer', description: 'Completed surveys in multiple countries/regions', tier: 'platinum', repPoints: 180, rarity: 'epic', icon: 'MapPin', shape: 'diamond', category: 'exploration', requirement: '5 regions' },
    { id: 'dimension_walker', name: 'Omni-Explorer', description: 'Transcended boundaries: surveys across all platforms and formats', tier: 'diamond', repPoints: 350, rarity: 'legendary', icon: 'Sparkles', shape: 'star', category: 'exploration', requirement: '25 platforms' }
  ]
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the default tenant
    const { data: tenant, error: tenantError } = await supabaseClient
      .from('tenants')
      .select('id')
      .eq('slug', 'looplly-internal')
      .single();

    if (tenantError || !tenant) {
      throw new Error('Default tenant not found');
    }

    const allBadges = [
      ...expandedBadges.socialConnector,
      ...expandedBadges.speedDemon,
      ...expandedBadges.perfectionist,
      ...expandedBadges.explorer
    ];

    const badgesToInsert = allBadges.map(badge => ({
      name: badge.name,
      description: badge.description,
      tier: badge.tier,
      category: badge.category,
      rep_points: badge.repPoints,
      rarity: badge.rarity,
      icon_name: badge.icon,
      shape: badge.shape,
      requirement: badge.requirement,
      is_active: true,
      tenant_id: tenant.id,
      icon_url: null
    }));

    const { data, error } = await supabaseClient
      .from('badge_catalog')
      .insert(badgesToInsert)
      .select();

    if (error) throw error;

    console.log(`Successfully seeded ${data.length} badges`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: data.length,
        message: `Successfully seeded ${data.length} badges`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error seeding badges:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});