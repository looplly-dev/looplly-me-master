import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import matter from 'https://esm.sh/gray-matter@4.0.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Authentication required',
          message: 'Please provide a valid Authorization header'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // ========================================
    // 1. CHECK IF THIS IS A CI/SERVICE CALL
    // ========================================
    const isTrustedServiceCall = authHeader === `Bearer ${supabaseServiceKey}`;
    
    if (isTrustedServiceCall) {
      console.log('[seed-documentation] ✅ Trusted CI/service call - bypassing user checks');
    } else {
      // ========================================
      // 2. VERIFY USER AUTHENTICATION & ADMIN ROLE
      // ========================================
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });

      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      
      if (userError || !user) {
        console.error('[seed-documentation] Auth error:', userError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid authentication',
            message: 'Unable to verify user identity'
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[seed-documentation] Authenticated user: ${user.id} (${user.email})`);

      const { data: roleData, error: roleError } = await supabaseClient
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'super_admin', 'tester'])
        .maybeSingle();

      if (roleError) {
        console.error('[seed-documentation] Role check error:', roleError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Role verification failed',
            message: roleError.message
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!roleData) {
        console.warn(`[seed-documentation] Non-admin user attempted seeding: ${user.email}`);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Insufficient permissions',
            message: 'Only administrators can seed documentation'
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[seed-documentation] Admin verified: ${roleData.role}`);
    }

    console.log('[seed-documentation] Starting documentation seeding process...');

    // Parse request body
    let inputDocs: any[] | null = null;
    try {
      const body = await req.json();
      if (Array.isArray(body?.docs)) inputDocs = body.docs;
    } catch (_) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid request body',
          message: 'Expected JSON body with "docs" array'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!inputDocs || inputDocs.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No documents provided',
          message: 'Please provide an array of documents with rawContent'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📥 Received ${inputDocs.length} documents for seeding...`);

    // Use service role key for actual seeding operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    console.log(`📦 Parsing and seeding ${inputDocs.length} documents...`);
    
    for (const doc of inputDocs) {
      try {
        // Parse markdown with gray-matter (server-side where Buffer is available)
        const { data: frontmatter, content: body } = matter(doc.rawContent);
        
        // Extract metadata from frontmatter or use defaults
        const filename = doc.path.split('/').pop()?.replace('.md', '') || doc.id;
        const title = frontmatter.title || filename.replace(/_/g, ' ');
        const category = frontmatter.category || 'Uncategorized';
        const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : [];
        const description = frontmatter.description || '';
        const audience = frontmatter.audience || 'all';
        const status = frontmatter.status || 'published';
        
        console.log(`  Parsing: ${title} (${doc.id})`);
        
        // Check existing to avoid no-op updates
        const { data: existing, error: fetchError } = await supabase
          .from('documentation')
          .select('title, content, category, tags, description, audience, status')
          .eq('id', doc.id)
          .maybeSingle();

        if (fetchError) {
          console.warn(`  ! Could not fetch existing ${doc.id} (proceeding with upsert):`, fetchError.message);
        }

        const isUnchanged = existing &&
          existing.title === title &&
          (existing.content || '').trim() === body.trim() &&
          (existing.category || 'Uncategorized') === category &&
          JSON.stringify(existing.tags || []) === JSON.stringify(tags) &&
          (existing.description || '') === description &&
          (existing.audience || 'all') === audience &&
          (existing.status || 'published') === status;

        if (isUnchanged) {
          console.log(`  ↷ Skipped (no changes): ${title}`);
          successCount++;
          continue;
        }

        // Upsert to database
        const { error: insertError } = await supabase
          .from('documentation')
          .upsert({
            id: doc.id,
            title,
            content: body.trim(),
            category,
            tags,
            description,
            audience,
            parent: null,
            status
          }, {
            onConflict: 'id'
          });

        if (insertError) {
          console.error(`  ✗ Failed to insert ${doc.id}:`, insertError);
          errors.push(`${doc.id}: ${insertError.message}`);
          errorCount++;
        } else {
          console.log(`  ✓ Seeded: ${title}`);
          successCount++;
        }
      } catch (error) {
        console.error(`  ✗ Error processing ${doc.id}:`, error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(`${doc.id}: ${errorMessage}`);
        errorCount++;
      }
    }

    console.log(`\n✅ Seeding complete: ${successCount} success, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: errorCount === 0 || successCount > 0,
        message: `Successfully seeded ${successCount} of ${inputDocs.length} documents`,
        errors: errors.length > 0 ? errors : undefined,
        stats: {
          total: inputDocs.length,
          success: successCount,
          failed: errorCount
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Seeding error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
