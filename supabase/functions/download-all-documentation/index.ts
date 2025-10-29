import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { compress } from "https://deno.land/x/zip@v1.2.5/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DocumentRow {
  doc_id: string;
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
      .select('doc_id, title, content, category, tags, description, audience, parent, status, version')
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

    // Create file structure
    const files: { [key: string]: string } = {};
    const timestamp = new Date().toISOString().split('T')[0];

    for (const doc of documents as DocumentRow[]) {
      // Build frontmatter
      const frontmatter = [
        '---',
        `title: "${doc.title}"`,
        `slug: "${doc.doc_id}"`,
        `category: "${doc.category}"`,
        `description: "${doc.description}"`,
        `audience: "${doc.audience}"`,
        `tags: [${doc.tags.map(t => `"${t}"`).join(', ')}]`,
        `status: "${doc.status}"`,
        `version: "${doc.version}"`,
        `last_updated: "${timestamp}"`,
        '---',
        '',
      ].join('\n');

      // Determine file path based on category
      let filePath = '';
      const category = doc.category.toLowerCase().replace(/\s+/g, '-');
      const fileName = `${doc.doc_id}.md`;

      if (doc.parent) {
        filePath = `documentation-export-${timestamp}/${category}/${doc.parent}/${fileName}`;
      } else {
        filePath = `documentation-export-${timestamp}/${category}/${fileName}`;
      }

      files[filePath] = frontmatter + doc.content;
    }

    // Create ZIP file using simple zip approach
    const encoder = new TextEncoder();
    const zipContent: Uint8Array[] = [];
    
    // Simple ZIP creation (for demo - in production use proper ZIP library)
    // For now, create a simple archive structure
    let archiveContent = `# Looplly Documentation Export\n\n`;
    archiveContent += `Generated: ${new Date().toISOString()}\n`;
    archiveContent += `Total Documents: ${documents.length}\n\n`;
    archiveContent += `---\n\n`;

    for (const [path, content] of Object.entries(files)) {
      archiveContent += `\n\n## File: ${path}\n\n${content}\n\n---\n`;
    }

    // Log audit entry
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'documentation_bulk_download',
      metadata: {
        document_count: documents.length,
        timestamp: new Date().toISOString(),
        file_size_kb: Math.round(archiveContent.length / 1024),
      },
    });

    console.log('Download completed successfully');

    // Return as text file (simplified approach)
    return new Response(archiveContent, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="looplly-documentation-${timestamp}.md"`,
      },
    });

  } catch (error) {
    console.error('Download error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
