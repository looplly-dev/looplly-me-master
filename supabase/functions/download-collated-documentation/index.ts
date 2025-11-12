import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user authentication and role
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is super_admin
    const { data: hasRole, error: roleError } = await supabase.rpc('has_role', {
      user_id: user.id,
      role_name: 'super_admin'
    });

    if (roleError || !hasRole) {
      throw new Error('Insufficient permissions - super_admin role required');
    }

    console.log(`Generating collated documentation for user: ${user.id}`);

    // Fetch all documentation ordered by category and title
    const { data: docs, error: docsError } = await supabase
      .from('documentation')
      .select('*')
      .order('category', { ascending: true })
      .order('title', { ascending: true });

    if (docsError) {
      console.error('Error fetching documentation:', docsError);
      throw docsError;
    }

    if (!docs || docs.length === 0) {
      throw new Error('No documentation found');
    }

    console.log(`Found ${docs.length} documents to collate`);

    // Group documents by category for TOC
    const categoryCounts = new Map<string, { count: number; titles: string[] }>();
    docs.forEach(doc => {
      const category = doc.category || 'Uncategorized';
      if (!categoryCounts.has(category)) {
        categoryCounts.set(category, { count: 0, titles: [] });
      }
      const cat = categoryCounts.get(category)!;
      cat.count++;
      cat.titles.push(doc.title);
    });

    // Build the collated text file
    const timestamp = new Date().toISOString();
    const separator = '='.repeat(80);
    const categorySeparator = '#'.repeat(80);
    const docSeparator = '-'.repeat(80);

    let output = '';

    // Header
    output += `${separator}\n`;
    output += `LOOPLLY DOCUMENTATION - COMPLETE COLLECTION\n`;
    output += `Generated: ${timestamp}\n`;
    output += `Total Documents: ${docs.length}\n`;
    output += `${separator}\n\n`;

    // Table of Contents
    output += `TABLE OF CONTENTS\n`;
    output += `${docSeparator}\n\n`;
    
    let tocIndex = 1;
    for (const [category, info] of categoryCounts.entries()) {
      output += `${tocIndex}. ${category} (${info.count} document${info.count !== 1 ? 's' : ''})\n`;
      info.titles.forEach(title => {
        output += `   - ${title}\n`;
      });
      output += `\n`;
      tocIndex++;
    }

    output += `\n${separator}\n\n`;

    // Document content grouped by category
    let currentCategory = '';
    
    docs.forEach((doc, index) => {
      const category = doc.category || 'Uncategorized';
      
      // Category header (when category changes)
      if (category !== currentCategory) {
        currentCategory = category;
        output += `\n${categorySeparator}\n`;
        output += `# CATEGORY: ${category}\n`;
        output += `${categorySeparator}\n\n`;
      }

      // Document header
      output += `${docSeparator}\n`;
      output += `DOCUMENT: ${doc.title}\n`;
      output += `${docSeparator}\n`;
      output += `ID: ${doc.id}\n`;
      output += `Category: ${doc.category || 'None'}\n`;
      output += `Audience: ${doc.audience || 'all'}\n`;
      output += `Status: ${doc.status || 'draft'}\n`;
      output += `Version: ${doc.version || 1}\n`;
      output += `Tags: ${doc.tags ? doc.tags.join(', ') : 'None'}\n`;
      output += `Description: ${doc.description || 'No description'}\n`;
      output += `${docSeparator}\n\n`;

      // Document content
      output += doc.content;
      output += `\n\n\n`;
    });

    // Footer
    output += `${separator}\n`;
    output += `END OF DOCUMENTATION COLLECTION\n`;
    output += `${separator}\n`;

    console.log(`Successfully generated collated documentation (${output.length} characters)`);

    // Log the download action
    await supabase.from('documentation_access_log').insert({
      user_id: user.id,
      action: 'download_collated',
      result_count: docs.length
    });

    // Return as downloadable text file
    const filename = `looplly-documentation-collated-${new Date().toISOString().split('T')[0]}.txt`;
    
    return new Response(output, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Error generating collated documentation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
