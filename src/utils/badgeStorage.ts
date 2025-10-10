import { supabase } from '@/integrations/supabase/client';

export interface SavedBadge {
  name: string;
  id: string;
  created_at: string;
  metadata: {
    badgeName?: string;
    tier?: string;
    category?: string;
  };
}

/**
 * Upload a badge image to Supabase Storage
 * @param base64Image - Base64 encoded image data
 * @param badgeName - Name of the badge
 * @param tier - Badge tier
 * @param category - Badge category
 * @returns Public URL of the uploaded badge or null if failed
 */
export async function uploadBadgeToStorage(
  base64Image: string,
  badgeName: string,
  tier: string,
  category: string
): Promise<string | null> {
  try {
    // Convert base64 to blob
    const base64Data = base64Image.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });
    
    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = badgeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const filename = `${sanitizedName}-${tier.toLowerCase()}-${timestamp}.png`;
    
    // Upload to Supabase Storage with metadata
    const { data, error } = await supabase.storage
      .from('badges')
      .upload(filename, blob, {
        contentType: 'image/png',
        upsert: false,
        cacheControl: '3600',
      });
    
    if (error) {
      console.error('Upload error:', error);
      return null;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('badges')
      .getPublicUrl(filename);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Badge upload error:', error);
    return null;
  }
}

/**
 * List all saved badges from Supabase Storage
 * @returns Array of saved badge metadata
 */
export async function listSavedBadges(): Promise<SavedBadge[]> {
  try {
    const { data, error } = await supabase.storage
      .from('badges')
      .list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      });
    
    if (error) {
      console.error('List error:', error);
      return [];
    }
    
    return (data || []).map(file => ({
      name: file.name,
      id: file.id,
      created_at: file.created_at,
      metadata: file.metadata as { badgeName?: string; tier?: string; category?: string }
    }));
  } catch (error) {
    console.error('Badge list error:', error);
    return [];
  }
}

/**
 * Get public URL for a badge
 * @param filename - Name of the badge file
 * @returns Public URL
 */
export function getBadgePublicUrl(filename: string): string {
  const { data } = supabase.storage
    .from('badges')
    .getPublicUrl(filename);
  
  return data.publicUrl;
}
