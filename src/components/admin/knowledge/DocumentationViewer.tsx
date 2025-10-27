import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Printer, Copy, Check, Clock, Edit, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { documentationIndex, DocumentationItem } from '@/data/documentationIndex';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/hooks/useAuth';
import VersionHistory from './VersionHistory';
import Breadcrumbs from './Breadcrumbs';
import FeedbackWidget from './FeedbackWidget';
import RelatedDocuments from './RelatedDocuments';
import TableOfContents from './TableOfContents';
import ProgressBar from './ProgressBar';
import { calculateReadTime } from '@/utils/readTime';
import { extractHeadings } from '@/utils/extractHeadings';
import { useReadingProgress } from '@/hooks/useReadingProgress';

interface DocumentationViewerProps {
  onBack?: () => void;
}

export default function DocumentationViewer({ onBack }: DocumentationViewerProps) {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();
  const documentId = docId || '';
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [version, setVersion] = useState<number>(1);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [headings, setHeadings] = useState<any[]>([]);
  const { hasRole } = useRole();
  const { authState } = useAuth();
  const { progress, updateProgress } = useReadingProgress(documentId);

  const doc = documentationIndex.find(d => d.id === documentId);
  const readTime = content ? calculateReadTime(content) : 0;

  // SECURITY: Audit log document views
  useEffect(() => {
    if (doc && authState.user) {
      supabase
        .from('documentation_access_log')
        .insert({
          user_id: authState.user.id,
          document_id: documentId,
          action: 'view'
        })
        .then(({ error }) => {
          if (error) console.error('Failed to log document view:', error);
        });
    }
  }, [doc, documentId, authState.user]);

  useEffect(() => {
    if (!doc) return;

    const loadDocument = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('documentation')
          .select('content, version')
          .eq('id', documentId)
          .maybeSingle();

        if (error) {
          console.error('Error loading document:', error);
          toast.error('Failed to load document');
          setContent('# Error\n\nFailed to load document content.');
        } else if (data) {
          const docData = data as any;
          setContent(docData.content);
          setVersion(docData.version || 1);
          setHeadings(extractHeadings(docData.content));
        } else {
          setContent('# Document Not Found\n\nThis document has not been seeded into the database yet. Please use the "Seed Documentation" button in the Knowledge Centre to populate the database with all documentation files.');
        }
      } catch (error) {
        console.error('Error loading document:', error);
        toast.error('Failed to load document');
        setContent('# Error\n\nFailed to load document content.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [doc, documentId]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/admin/knowledge');
    }
  };

  if (!doc) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Document not found</p>
          <Button onClick={handleBack} className="mt-4 mx-auto block">
            Back to Knowledge Center
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <ProgressBar progress={progress} />
      <div className="flex gap-6">
        <div className="flex-1 space-y-4">
          {/* Breadcrumbs */}
          <Breadcrumbs items={[{ label: doc.category }, { label: doc.title }]} />

          {/* Header */}
          <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Knowledge Centre
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowVersionHistory(true)}>
            <Clock className="h-4 w-4 mr-2" />
            History
          </Button>
          {/* TEMPORARILY HIDDEN - Edit button */}
          {false && (hasRole('admin') || hasRole('super_admin')) && (
            <Button variant="outline" onClick={() => navigate(`/admin/knowledge/edit/${documentId}`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {/* TEMPORARILY HIDDEN - Print button */}
          {false && (
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          )}
        </div>
      </div>

      {/* Document Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-2xl">{doc.title}</CardTitle>
                <Badge variant="outline">v{version}</Badge>
                {readTime > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {readTime} min read
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-2">{doc.description}</p>
            </div>
            <Badge>{doc.category}</Badge>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {doc.tags.map(tag => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Document Content */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');
                    const inline = !className || !className.includes('language-');
                    
                    return !inline && match ? (
                      <div className="relative group">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleCopyCode(codeString)}
                        >
                          {copiedCode === codeString ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <SyntaxHighlighter
                          style={oneDark as any}
                          language={match[1]}
                          PreTag="div"
                        >
                          {codeString}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feedback & Related Docs */}
      <div className="grid gap-4 md:grid-cols-2">
        <FeedbackWidget documentId={documentId} />
        <RelatedDocuments documentId={documentId} />
      </div>
    </div>

    {/* Table of Contents Sidebar */}
    <div className="w-64">
      <TableOfContents headings={headings} />
    </div>
  </div>

      <VersionHistory
        docId={documentId}
        currentVersion={version}
        open={showVersionHistory}
        onOpenChange={setShowVersionHistory}
        onRestore={() => {
          // Reload the document after restore
          const loadDocument = async () => {
            try {
              const { data, error } = await supabase
                .from('documentation')
                .select('content, version')
                .eq('id', documentId)
                .maybeSingle();

              if (error) throw error;
              if (data) {
                const docData = data as any;
                setContent(docData.content);
                setVersion(docData.version || 1);
              }
            } catch (error) {
              console.error('Error reloading document:', error);
            }
          };
          loadDocument();
        }}
      />
    </>
  );
}
