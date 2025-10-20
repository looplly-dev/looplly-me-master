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
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
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
  SlidersHorizontal,
  Eye,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { QuestionDetailModal } from '@/components/admin/questions/QuestionDetailModal';

function AdminQuestionBuilderContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterApplicability, setFilterApplicability] = useState<string>('all');
  const [filterRequired, setFilterRequired] = useState<string>('all');
  const [filterDecay, setFilterDecay] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

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
    const matchesType = filterType === 'all' || q.question_type === filterType;
    const matchesApplicability = filterApplicability === 'all' || q.applicability === filterApplicability;
    const matchesRequired = filterRequired === 'all' || 
      (filterRequired === 'required' && q.is_required) ||
      (filterRequired === 'optional' && !q.is_required);
    const matchesDecay = filterDecay === 'all' || q.decay_config_key === filterDecay;
    
    return matchesSearch && matchesLevel && matchesCategory && matchesType && 
           matchesApplicability && matchesRequired && matchesDecay;
  });

  const handleQuestionClick = (question: any) => {
    setSelectedQuestion(question);
    setDetailModalOpen(true);
  };

  const activeFilterCount = [
    filterLevel !== 'all',
    filterCategory !== 'all',
    filterType !== 'all',
    filterApplicability !== 'all',
    filterRequired !== 'all',
    filterDecay !== 'all',
  ].filter(Boolean).length;

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
      <div className="max-w-7xl mx-auto space-y-6">
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
          <AlertTitle>Phase 2: Enhanced Viewing</AlertTitle>
          <AlertDescription>
            Click any question to see detailed statistics and metadata. Advanced filtering now available.
          </AlertDescription>
        </Alert>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              {/* Primary Filters Row */}
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
                      <SelectItem value="1">Level 1</SelectItem>
                      <SelectItem value="2">Level 2</SelectItem>
                      <SelectItem value="3">Level 3</SelectItem>
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

              {/* Advanced Filters - Mobile Sheet, Desktop Inline */}
              <div className="flex items-center gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="md:hidden">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Advanced Filters
                      {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-2">{activeFilterCount}</Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[80vh]">
                    <SheetHeader>
                      <SheetTitle>Advanced Filters</SheetTitle>
                    </SheetHeader>
                    <div className="grid gap-4 mt-4">
                      <div>
                        <Label>Question Type</Label>
                        <Select value={filterType} onValueChange={setFilterType}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="select">Select</SelectItem>
                            <SelectItem value="multiselect">Multi-Select</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="address">Address</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="phone">Phone</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Applicability</Label>
                        <Select value={filterApplicability} onValueChange={setFilterApplicability}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="global">Global</SelectItem>
                            <SelectItem value="country_specific">Country-Specific</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Required Status</Label>
                        <Select value={filterRequired} onValueChange={setFilterRequired}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="required">Required Only</SelectItem>
                            <SelectItem value="optional">Optional Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Decay Interval</Label>
                        <Select value={filterDecay} onValueChange={setFilterDecay}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="immutable">Never</SelectItem>
                            <SelectItem value="rare_change">Rare</SelectItem>
                            <SelectItem value="occasional_change">Occasional</SelectItem>
                            <SelectItem value="frequent_change">Frequent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Desktop Advanced Filters */}
                <div className="hidden md:grid md:grid-cols-4 gap-4 flex-1">
                  <div>
                    <Label>Type</Label>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="select">Select</SelectItem>
                        <SelectItem value="multiselect">Multi-Select</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="address">Address</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Applicability</Label>
                    <Select value={filterApplicability} onValueChange={setFilterApplicability}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="global">Global</SelectItem>
                        <SelectItem value="country_specific">Country-Specific</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={filterRequired} onValueChange={setFilterRequired}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="required">Required</SelectItem>
                        <SelectItem value="optional">Optional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Decay</Label>
                    <Select value={filterDecay} onValueChange={setFilterDecay}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="immutable">Never</SelectItem>
                        <SelectItem value="rare_change">Rare</SelectItem>
                        <SelectItem value="occasional_change">Occasional</SelectItem>
                        <SelectItem value="frequent_change">Frequent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
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
                      <Card 
                        key={question.id} 
                        className="border-l-4 border-l-primary/30 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleQuestionClick(question)}
                      >
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
                             
                             {/* View Details Button */}
                             <Button 
                               variant="ghost" 
                               size="sm"
                               onClick={(e) => {
                                 e.stopPropagation();
                                 handleQuestionClick(question);
                               }}
                             >
                               <Eye className="h-4 w-4 mr-1" />
                               Details
                             </Button>
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

        {/* Question Detail Modal */}
        {selectedQuestion && (
          <QuestionDetailModal
            question={selectedQuestion}
            open={detailModalOpen}
            onOpenChange={setDetailModalOpen}
          />
        )}
      </div>
    </AdminLayout>
  );
}

export default function AdminQuestionBuilder() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <AdminQuestionBuilderContent />
      </AdminLayout>
    </ProtectedRoute>
  );
}
