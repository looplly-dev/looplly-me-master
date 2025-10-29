#!/usr/bin/env node

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import matter from 'gray-matter';

const DOCS_DIR = './docs';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function getAllMarkdownFiles(dir) {
  const files = [];
  
  async function walk(currentDir) {
    try {
      const entries = await readdir(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(currentDir, entry.name);
        
        if (entry.isDirectory()) {
          await walk(fullPath);
        } else if (entry.name.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${currentDir}:`, error.message);
    }
  }
  
  await walk(dir);
  return files;
}

async function parseDocument(filePath, source) {
  try {
    const content = await readFile(filePath, 'utf-8');
    const { data: frontmatter, content: body } = matter(content);
    
    // Generate ID from filename if not in frontmatter
    const filename = filePath.split('/').pop().replace('.md', '');
    const id = frontmatter.id || filename.toLowerCase().replace(/_/g, '-');
    
    // Build path for reference
    const pathParts = source === 'public' 
      ? filePath.split('public')[1] 
      : filePath.split('docs')[1] || filePath;
    
    return {
      id,
      title: frontmatter.title || filename.replace(/_/g, ' '),
      content: body,
      category: frontmatter.category || 'Uncategorized',
      tags: frontmatter.tags || [],
      description: frontmatter.description || '',
      audience: frontmatter.audience || 'all',
      status: frontmatter.status || 'published',
      path: pathParts,
      source
    };
  } catch (err) {
    console.error(`Failed to parse ${filePath}:`, err.message);
    return null;
  }
}

async function seedDocumentation() {
  console.log('🔍 Discovering documentation files from /docs...');
  
  const projectMarkdownFiles = await getAllMarkdownFiles(DOCS_DIR);
  
  console.log(`✅ Found ${projectMarkdownFiles.length} files in /docs`);
  
  console.log('📖 Parsing frontmatter and content...');
  const docs = (await Promise.all(
    projectMarkdownFiles.map(file => parseDocument(file, 'docs'))
  )).filter(Boolean);
  
  console.log(`✅ Parsed ${docs.length} documents from single source of truth (/docs)`);
  
  console.log(`🚀 Seeding ${docs.length} documents to Knowledge Centre...`);
  
  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/seed-documentation`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ docs })
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Seeded ${result.stats.success} documents successfully`);
      if (result.stats.failed > 0) {
        console.warn(`⚠️  ${result.stats.failed} documents failed`);
        result.errors?.forEach(err => console.error(`   - ${err}`));
      }
    } else {
      console.error('❌ Seeding failed:', result.message || result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run seeding
seedDocumentation().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
