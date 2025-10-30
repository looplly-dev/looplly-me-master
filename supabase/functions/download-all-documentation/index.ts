import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { zipSync, strToU8 } from "https://esm.sh/fflate@0.8.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DocumentRow {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  description: string;
  audience: string;
  parent: string | null;
  status: string;
  version: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is super_admin
    const { data: isSuperAdmin, error: roleError } = await supabase
      .rpc('has_role', { p_user_id: user.id, p_role: 'super_admin' });

    if (roleError || !isSuperAdmin) {
      console.error('Role check failed:', roleError);
      return new Response(JSON.stringify({ error: 'Insufficient permissions. Super admin access required.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch all documents
    const { data: documents, error: docsError } = await supabase
      .from('documentation')
      .select('id, title, content, category, tags, description, audience, parent, status, version')
      .order('category', { ascending: true })
      .order('title', { ascending: true });

    if (docsError) {
      console.error('Error fetching documents:', docsError);
      return new Response(JSON.stringify({ error: 'Failed to fetch documents' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!documents || documents.length === 0) {
      return new Response(JSON.stringify({ error: 'No documents found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Preparing ZIP with ${documents.length} documents`);

    // Create file structure for ZIP
    const zipFiles: { [key: string]: Uint8Array } = {};
    const timestamp = new Date().toISOString().split('T')[0];

    for (const doc of documents as DocumentRow[]) {
      // Build frontmatter
      const frontmatter = [
        '---',
        `title: "${doc.title.replace(/"/g, '\\"')}"`,
        `slug: "${doc.id}"`,
        `category: "${doc.category}"`,
        `description: "${doc.description.replace(/"/g, '\\"')}"`,
        `audience: "${doc.audience}"`,
        `tags: [${doc.tags.map(t => `"${t}"`).join(', ')}]`,
        `status: "${doc.status}"`,
        `version: "${doc.version}"`,
        `last_updated: "${timestamp}"`,
        '---',
        '',
      ].join('\n');

      // Determine file path based on category
      const category = doc.category.toLowerCase().replace(/\s+/g, '-');
      const fileName = `${doc.id}.md`;
      const sanitizedParent = doc.parent ? doc.parent.replace(/[^a-zA-Z0-9-_]/g, '-') : '';

      let filePath = '';
      if (sanitizedParent) {
        filePath = `looplly-documentation-${timestamp}/${category}/${sanitizedParent}/${fileName}`;
      } else {
        filePath = `looplly-documentation-${timestamp}/${category}/${fileName}`;
      }

      // Convert markdown content to Uint8Array
      const fileContent = frontmatter + doc.content;
      zipFiles[filePath] = strToU8(fileContent);
    }

    // Create ZIP file using fflate
    const zipData = zipSync(zipFiles, {
      level: 6, // Compression level (0-9)
      mem: 8    // Memory level (1-9)
    });

    // Log audit entry
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'documentation_bulk_download',
      metadata: {
        document_count: documents.length,
        timestamp: new Date().toISOString(),
        file_size_kb: Math.round(zipData.length / 1024),
      },
    });

    console.log(`Download completed successfully - ZIP size: ${(zipData.length / 1024).toFixed(2)} KB`);

    // Return ZIP file with proper type casting for Deno
    return new Response(zipData as unknown as BodyInit, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="looplly-documentation-${timestamp}.zip"`,
      },
    });

  } catch (error: any) {
    console.error('Download error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
