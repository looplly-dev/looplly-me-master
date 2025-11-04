import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Globe, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Users,
  AlertCircle,
  Layers,
  Calendar,
  FileText,
  Settings
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface QuestionDetailModalProps {
  question: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuestionDetailModal({ question, open, onOpenChange }: QuestionDetailModalProps) {
  // Fetch answer statistics
  const { data: answerStats } = useQuery({
    queryKey: ['question-answer-stats', question.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile_answers')
        .select('id, user_id, answer_value, answer_json, last_updated')
        .eq('question_id', question.id);
      
      if (error) throw error;
      
      const totalAnswers = data.length;
      const uniqueUsers = new Set(data.map(a => a.user_id)).size;
      const recentAnswers = data.filter(a => {
        const lastUpdate = new Date(a.last_updated);
        const daysSince = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
        return daysSince <= 30;
      }).length;

      return {
        totalAnswers,
        uniqueUsers,
        recentAnswers
      };
    },
    enabled: open
  });

  // Fetch country-specific options if applicable
  const { data: countryOptions } = useQuery({
    queryKey: ['country-options', question.id],
    queryFn: async () => {
      if (question.applicability !== 'country_specific') return null;
      
      const { data, error } = await supabase
        .from('country_question_options')
        .select('*')
        .eq('question_id', question.id);
      
      if (error) throw error;
      return data;
    },
    enabled: open && question.applicability === 'country_specific'
  });

  const getQuestionTypeIcon = (type: string) => {
    const iconMap: Record<string, JSX.Element> = {
      text: <FileText className="h-4 w-4" />,
      select: <Layers className="h-4 w-4" />,
      multiselect: <CheckCircle className="h-4 w-4" />,
      date: <Calendar className="h-4 w-4" />,
      address: <MapPin className="h-4 w-4" />,
      email: <FileText className="h-4 w-4" />,
      phone: <FileText className="h-4 w-4" />,
      number: <FileText className="h-4 w-4" />,
      boolean: <CheckCircle className="h-4 w-4" />,
    };
    return iconMap[type] || <AlertCircle className="h-4 w-4" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getQuestionTypeIcon(question.question_type)}
            Question Details
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <div className="font-medium text-foreground">{question.question_text}</div>
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <Badge variant={question.is_draft ? "secondary" : "default"}>
                {question.is_draft ? "Draft" : "Published"}
              </Badge>
              <Badge variant="outline">Level {question.level}</Badge>
              <Badge variant="outline">{question.question_key}</Badge>
              {question.short_id && <Badge variant="outline">ID: {question.short_id}</Badge>}
              <Badge variant={question.is_active ? "default" : "secondary"}>
                {question.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Question Metadata */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex flex-wrap gap-2">
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
                  {question.is_active ? (
                    <Badge className="bg-green-500">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Type</div>
                    <div className="font-medium">{question.question_type}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Category</div>
                    <div className="font-medium">{question.profile_categories?.display_name || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Display Order</div>
                    <div className="font-medium">{question.display_order}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Required</div>
                    <div className="font-medium">{question.is_required ? '✅ Yes' : '❌ No'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Applicability</div>
                    <div className="font-medium">{question.applicability || 'global'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Decay Config</div>
                    <div className="font-medium">{question.decay_config_key || 'None'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Statistics */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Usage Statistics
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-primary">{answerStats?.uniqueUsers || 0}</div>
                    <div className="text-sm text-muted-foreground">Users Answered</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary">{answerStats?.totalAnswers || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Answers</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary">{answerStats?.recentAnswers || 0}</div>
                    <div className="text-sm text-muted-foreground">Last 30 Days</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Decay Configuration */}
            {question.decay_config_key && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Decay Configuration
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Config Key:</span>
                      <span className="ml-2 font-medium">{question.decay_config_key}</span>
                    </div>
                    {question.staleness_days && (
                      <div>
                        <span className="text-muted-foreground">Staleness Period:</span>
                        <span className="ml-2 font-medium">{question.staleness_days} days</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Options */}
            {question.options && Array.isArray(question.options) && question.options.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Answer Options ({question.options.length})
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {question.options.map((opt: any, idx: number) => (
                      <div key={idx} className="p-2 bg-muted rounded-md text-sm flex items-center gap-2">
                        <span className="text-muted-foreground">#{idx + 1}</span>
                        <span className="font-medium">{typeof opt === 'string' ? opt : opt.label || opt.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Country-Specific Options */}
            {countryOptions && countryOptions.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Country-Specific Options ({countryOptions.length} countries)
                  </h3>
                  <div className="space-y-3">
                    {countryOptions.map((config: any) => (
                      <div key={config.id} className="p-3 border rounded-md">
                        <div className="font-medium mb-2 flex items-center gap-2">
                          <Badge variant="outline">{config.country_code}</Badge>
                          {config.is_fallback && (
                            <Badge variant="secondary" className="text-xs">Fallback</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {Array.isArray(config.options) 
                            ? config.options.slice(0, 5).map((o: any) => typeof o === 'string' ? o : o.label || o.value).join(', ') 
                              + (config.options.length > 5 ? ` +${config.options.length - 5} more` : '')
                            : 'No options'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Validation Rules */}
            {question.validation_rules && Object.keys(question.validation_rules).length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Validation Rules
                  </h3>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(question.validation_rules, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* Help Text & Placeholder */}
            {(question.help_text || question.placeholder) && (
              <>
                <Separator />
                <div className="space-y-3">
                  {question.help_text && (
                    <div>
                      <div className="text-sm font-medium mb-1">Help Text</div>
                      <div className="text-sm text-muted-foreground p-2 bg-muted rounded-md">
                        {question.help_text}
                      </div>
                    </div>
                  )}
                  {question.placeholder && (
                    <div>
                      <div className="text-sm font-medium mb-1">Placeholder</div>
                      <div className="text-sm text-muted-foreground p-2 bg-muted rounded-md">
                        {question.placeholder}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Raw DB Data */}
            <Separator />
            <details className="space-y-2">
              <summary className="text-sm font-semibold cursor-pointer hover:text-primary">
                🔍 View Raw Database JSON
              </summary>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto max-h-64 overflow-y-auto">
                {JSON.stringify(question, null, 2)}
              </pre>
            </details>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
