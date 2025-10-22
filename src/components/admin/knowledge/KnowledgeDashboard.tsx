import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, BookOpen, Search, FileText, Sparkles } from 'lucide-react';
import DocumentationSearch from './DocumentationSearch';
import QuickReference from './QuickReference';
import { documentationIndex } from '@/data/documentationIndex';

export default function KnowledgeDashboard() {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = Array.from(new Set(documentationIndex.map(doc => doc.category)));
  const categoryCounts = categories.map(cat => ({
    category: cat,
    count: documentationIndex.filter(doc => doc.category === cat).length
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Knowledge Center</h1>
        <p className="text-muted-foreground">
          Self-service documentation for all platform features, rules, and systems
        </p>
      </div>

      {/* Implementation Status Banner */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Next Step: Client-Side Documentation Browser
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            <strong>What it is:</strong> A fast, reliable documentation browser that searches and displays 
            all system documentation files (.md) stored in the docs/ folder. No external dependencies required.
          </p>
          <div className="space-y-2 text-sm">
            <p><strong>✓ Features included:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
              <li>Full-text search with fuzzy matching</li>
              <li>Category organization and filtering</li>
              <li>Markdown rendering with syntax highlighting</li>
              <li>Quick reference cards for key rules</li>
              <li>Table of contents auto-generation</li>
              <li>Print and copy functionality</li>
            </ul>
          </div>
          <Badge variant="secondary" className="mt-3">
            Phase 1 - Foundation
          </Badge>
        </CardContent>
      </Card>

      {/* Search Section */}
      <DocumentationSearch 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Categories Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Browse by Category
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {categoryCounts.map(({ category, count }) => (
            <Card key={category} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">{category}</CardTitle>
                <CardDescription>{count} documents</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" size="sm" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Browse
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Reference */}
      <QuickReference />

      {/* Recent Documents */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Popular Documents
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documentationIndex.slice(0, 6).map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{doc.title}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {doc.category}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {doc.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {doc.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
