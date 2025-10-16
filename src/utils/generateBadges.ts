import { supabase } from '@/integrations/supabase/client';
import { badgeSystem } from '@/mock_data';

// Create expandedBadgeCategories for backward compatibility
const expandedBadgeCategories = {
  socialConnector: badgeSystem.socialConnector,
  speedDemon: badgeSystem.speedDemon,
  perfectionist: badgeSystem.perfectionist,
  explorer: badgeSystem.explorer
};

interface GenerateBadgeParams {
  badgeId: string;
  badgeName: string;
  tier: string;
  category: string;
  iconTheme: string;
  type?: 'badge' | 'tier-icon';
}

/**
 * Generate a single badge or tier icon using the Badge Service API
 */
export async function generateBadgeImage(params: GenerateBadgeParams): Promise<string | null> {
  try {
    console.log(`Generating image for ${params.badgeName}...`);
    
    const { data, error } = await supabase.functions.invoke('generate-badge-image', {
      body: {
        badgeName: params.badgeName,
        tier: params.tier,
        category: params.category,
        iconTheme: params.iconTheme,
        type: params.type || 'badge'
      }
    });

    if (error) {
      console.error(`Error generating ${params.badgeName}:`, error);
      return null;
    }

    if (data?.imageUrl) {
      console.log(`✅ Generated ${params.badgeName}`);
      return data.imageUrl;
    }

    return null;
  } catch (error) {
    console.error(`Failed to generate ${params.badgeName}:`, error);
    return null;
  }
}

/**
 * Batch generate all badges with progress tracking
 */
export async function generateAllBadges(
  onProgress?: (current: number, total: number, badgeName: string) => void
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  
  // Collect all badges from all categories
  const allBadges = [
    ...expandedBadgeCategories.socialConnector,
    ...expandedBadgeCategories.speedDemon,
    ...expandedBadgeCategories.perfectionist,
    ...expandedBadgeCategories.explorer
  ];

  const total = allBadges.length;
  let current = 0;

  // Icon theme mapping based on badge name/category
  const getIconTheme = (badge: any) => {
    const name = badge.name.toLowerCase();
    if (name.includes('network') || name.includes('connection')) return 'connected people and network nodes';
    if (name.includes('community') || name.includes('influencer')) return 'group of people and social connections';
    if (name.includes('lightning') || name.includes('speed') || name.includes('velocity')) return 'lightning bolt and speed lines';
    if (name.includes('quantum') || name.includes('processor')) return 'quantum particles and energy waves';
    if (name.includes('flash') || name.includes('sonic')) return 'sonic boom and motion blur';
    if (name.includes('quality') || name.includes('precision') || name.includes('perfect')) return 'diamond checkmark and precision tools';
    if (name.includes('master') || name.includes('virtuoso')) return 'master craftsman and excellence symbols';
    if (name.includes('explorer') || name.includes('scout') || name.includes('pioneer')) return 'compass and exploration map';
    if (name.includes('conqueror') || name.includes('champion')) return 'victory flag and trophy';
    return 'achievement star and excellence badge';
  };

  for (const badge of allBadges) {
    current++;
    onProgress?.(current, total, badge.name);

    const imageUrl = await generateBadgeImage({
      badgeId: badge.id,
      badgeName: badge.name,
      tier: badge.tier,
      category: badge.category || 'achievement',
      iconTheme: getIconTheme(badge),
      type: 'badge'
    });

    if (imageUrl) {
      results.set(badge.id, imageUrl);
    }

    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return results;
}

/**
 * Generate tier icons (Bronze, Silver, Gold, Platinum, Diamond, Elite)
 */
export async function generateTierIcons(
  onProgress?: (current: number, total: number, tierName: string) => void
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  
  const tiers = [
    { name: 'Bronze', theme: 'bronze medal with sunset glow', tier: 'Bronze' },
    { name: 'Silver', theme: 'silver shield with storm effects', tier: 'Silver' },
    { name: 'Gold', theme: 'gold crown with lion\'s mane', tier: 'Gold' },
    { name: 'Platinum', theme: 'platinum star with misty aura', tier: 'Platinum' },
    { name: 'Diamond', theme: 'diamond crystal with sparkles', tier: 'Diamond' },
    { name: 'Elite', theme: 'supreme crown with star accents', tier: 'Elite' }
  ];

  const total = tiers.length;

  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i];
    onProgress?.(i + 1, total, tier.name);

    const imageUrl = await generateBadgeImage({
      badgeId: `tier-${tier.name.toLowerCase()}`,
      badgeName: `${tier.name} Tier`,
      tier: tier.tier,
      category: 'tier',
      iconTheme: tier.theme,
      type: 'tier-icon'
    });

    if (imageUrl) {
      results.set(tier.name.toLowerCase(), imageUrl);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return results;
}

/**
 * Helper to download base64 image and save locally
 */
export function downloadBase64Image(base64Data: string, filename: string) {
  const link = document.createElement('a');
  link.href = base64Data;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
