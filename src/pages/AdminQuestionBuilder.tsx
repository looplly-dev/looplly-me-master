import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertCircle, 
  Search, 
  Filter, 
  Layers,
  Globe,
  MapPin,
  CheckCircle,
  Clock,
  Calendar,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AdminQuestionBuilder() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['profile-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile_categories')
        .select('*')
        .order('level, display_order');
      if (error) throw error;
      return data;
    }
  });

  // Fetch questions with category info
  const { data: questions, isLoading } = useQuery({
    queryKey: ['question-builder-questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile_questions')
        .select('*, profile_categories(name, display_name, level)')
        .order('level, display_order');
      if (error) throw error;
      return data;
    }
  });

  const filteredQuestions = questions?.filter(q => {
    const matchesSearch = q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          q.question_key.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || q.level === parseInt(filterLevel);
    const matchesCategory = filterCategory === 'all' || q.category_id === filterCategory;
    return matchesSearch && matchesLevel && matchesCategory;
  });

  const getQuestionTypeIcon = (type: string) => {
    const iconMap: Record<string, JSX.Element> = {
      text: <span className="text-xs">Aa</span>,
      select: <Layers className="h-3 w-3" />,
      multiselect: <CheckCircle className="h-3 w-3" />,
      date: <Calendar className="h-3 w-3" />,
      address: <MapPin className="h-3 w-3" />,
    };
    return iconMap[type] || <AlertCircle className="h-3 w-3" />;
  };

  const getDecayBadge = (decayKey: string | null) => {
    if (!decayKey) return null;
    const decayLabels: Record<string, string> = {
      immutable: 'Never',
      rare_change: 'Rare',
      occasional_change: 'Occasional',
      frequent_change: 'Frequent',
    };
    return <Badge variant="outline" className="text-xs">{decayLabels[decayKey] || decayKey}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Question Builder</h1>
          <p className="text-muted-foreground mt-1">
            Visual overview of profile questions and categories (Read-Only Mode)
          </p>
        </div>

        {/* Phase Notice */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Phase 1: Read-Only Viewer</AlertTitle>
          <AlertDescription>
            This is the foundation view. Edit and create functionality will be added in future phases.
            See <code className="text-xs bg-muted px-1 py-0.5 rounded">docs/PROFILING/QUESTION_BUILDER_GUIDE.md</code> for roadmap.
          </AlertDescription>
        </Alert>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search Questions
                </Label>
                <Input
                  placeholder="Search by text or key..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Level
                </Label>
                <Select value={filterLevel} onValueChange={setFilterLevel}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="1">Level 1 (Registration)</SelectItem>
                    <SelectItem value="2">Level 2 (Required)</SelectItem>
                    <SelectItem value="3">Level 3 (Progressive)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Category
                </Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Question Overview</TabsTrigger>
            <TabsTrigger value="by-level">By Level</TabsTrigger>
            <TabsTrigger value="by-category">By Category</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>All Questions ({filteredQuestions?.length || 0})</CardTitle>
                <CardDescription>Complete list of profile questions</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-muted-foreground">Loading questions...</p>
                ) : (
                  <div className="space-y-3">
                    {filteredQuestions?.map((question) => (
                      <Card key={question.id} className="border-l-4 border-l-primary/30">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              {/* Question Header */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                                  {getQuestionTypeIcon(question.question_type)}
                                  <span className="text-xs font-mono">{question.question_type}</span>
                                </div>
                                <Badge variant="outline">Level {question.level}</Badge>
                                <Badge variant={question.applicability === 'global' ? 'default' : 'secondary'}>
                                  {question.applicability === 'global' ? (
                                    <><Globe className="mr-1 h-3 w-3" />Global</>
                                  ) : (
                                    <><MapPin className="mr-1 h-3 w-3" />Country-Specific</>
                                  )}
                                </Badge>
                                {question.is_required && <Badge variant="destructive">Required</Badge>}
                                {question.is_immutable && <Badge variant="outline">Immutable</Badge>}
                                {getDecayBadge(question.decay_config_key)}
                              </div>

                              {/* Question Text */}
                              <h3 className="font-medium text-lg">{question.question_text}</h3>
                              
                              {/* Metadata */}
                              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                                <span>
                                  <strong>Key:</strong> <code className="bg-muted px-1 py-0.5 rounded text-xs">{question.question_key}</code>
                                </span>
                                <span>
                                  <strong>Category:</strong> {question.profile_categories?.display_name || 'N/A'}
                                </span>
                                {question.staleness_days && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Stale after {question.staleness_days} days
                                  </span>
                                )}
                                {question.country_codes && (
                                  <span>
                                    <strong>Countries:</strong> {question.country_codes.join(', ')}
                                  </span>
                                )}
                              </div>

                              {/* Help Text */}
                              {question.help_text && (
                                <p className="text-sm text-muted-foreground italic">{question.help_text}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="by-level" className="space-y-4 mt-4">
            {[1, 2, 3].map(level => {
              const levelQuestions = filteredQuestions?.filter(q => q.level === level);
              return (
                <Card key={level}>
                  <CardHeader>
                    <CardTitle>Level {level} Questions ({levelQuestions?.length || 0})</CardTitle>
                    <CardDescription>
                      {level === 1 && 'Collected during initial registration'}
                      {level === 2 && 'Required for basic profile completion'}
                      {level === 3 && 'Progressive profiling - collected over time'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {levelQuestions?.map(q => (
                        <div key={q.id} className="p-3 border rounded-lg hover:bg-accent/50">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{q.question_text}</span>
                            {q.is_required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {q.question_key} • {q.question_type}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="by-category" className="space-y-4 mt-4">
            {categories?.map(category => {
              const categoryQuestions = filteredQuestions?.filter(q => q.category_id === category.id);
              if (!categoryQuestions?.length) return null;

              return (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>{category.display_name}</span>
                      <Badge variant="outline">Level {category.level}</Badge>
                    </CardTitle>
                    <CardDescription>
                      {category.description || 'No description'} • {categoryQuestions.length} questions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {categoryQuestions.map(q => (
                        <div key={q.id} className="p-3 border rounded-lg hover:bg-accent/50">
                          <div className="flex items-center gap-2 mb-1">
                            {getQuestionTypeIcon(q.question_type)}
                            <span className="text-sm font-medium">{q.question_text}</span>
                            {q.is_required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {q.question_key}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
