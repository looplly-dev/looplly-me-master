import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { documentationIndex } from '@/data/documentationIndex';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function DocumentationEditor() {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [changeSummary, setChangeSummary] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [version, setVersion] = useState(1);

  const doc = documentationIndex.find(d => d.id === docId);

  useEffect(() => {
    if (docId) {
      loadDocument();
    }
  }, [docId]);

  const loadDocument = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('documentation')
        .select('content, version')
        .eq('id', docId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        const docData = data as any;
        setContent(docData.content || '');
        setVersion(docData.version || 1);
      } else {
        // Document not yet seeded, start with empty content
        setContent('');
      }
    } catch (error) {
      console.error('Error loading document:', error);
      toast.error('Failed to load document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!changeSummary.trim()) {
      toast.error('Please provide a change summary');
      return;
    }

    try {
      setIsSaving(true);
      
      const user = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('documentation')
        .update({
          content,
          changed_by: user.data.user?.id,
          change_summary: changeSummary,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', docId);

      if (error) throw error;

      toast.success('Document updated successfully');
      setChangeSummary('');
      navigate(`/admin/knowledge/doc/${docId}`);
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!doc) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Document not found</p>
          <Button onClick={() => navigate('/admin/knowledge')} className="mt-4 mx-auto block">
            Back to Knowledge Centre
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(`/admin/knowledge/doc/${docId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Document
        </Button>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isSaving || !changeSummary.trim()}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Document Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">{doc.title}</CardTitle>
                <Badge variant="outline">v{version}</Badge>
              </div>
              <p className="text-muted-foreground mt-2">{doc.description}</p>
            </div>
            <Badge>{doc.category}</Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Change Summary */}
      <Card>
        <CardContent className="pt-6 space-y-2">
          <Label htmlFor="change-summary">
            Change Summary <span className="text-destructive">*</span>
          </Label>
          <Input
            id="change-summary"
            placeholder="Describe what changed in this version..."
            value={changeSummary}
            onChange={(e) => setChangeSummary(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Required for version tracking. Explain what changes you made.
          </p>
        </CardContent>
      </Card>

      {/* Editor */}
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="edit">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="edit" className="space-y-2">
              <Label htmlFor="content">Markdown Content</Label>
              <Textarea
                id="content"
                className="min-h-[600px] font-mono text-sm"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your documentation in Markdown..."
              />
              <p className="text-xs text-muted-foreground">
                Supports Markdown formatting with GitHub Flavored Markdown (GFM)
              </p>
            </TabsContent>
            
            <TabsContent value="preview">
              <div className="prose prose-slate dark:prose-invert max-w-none min-h-[600px] p-4 border rounded-md">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeString = String(children).replace(/\n$/, '');
                      const inline = !className || !className.includes('language-');
                      
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={oneDark as any}
                          language={match[1]}
                          PreTag="div"
                        >
                          {codeString}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    }
                  }}
                >
                  {content || '*No content to preview*'}
                </ReactMarkdown>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
