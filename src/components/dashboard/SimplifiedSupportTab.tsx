import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageCircle, 
  HelpCircle, 
  Send,
  CheckCircle,
  Lightbulb,
  BookOpen,
  Phone,
  Flame,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqCategories = [
  {
    id: 'earning',
    title: 'Earning & Payments',
    icon: DollarSign,
    iconColor: 'text-green-500',
    description: 'Learn about earning money and getting paid',
    faqs: [
      {
        question: "How do I earn money?",
        answer: "Complete surveys, watch videos, and do micro-tasks. Tap the daily check-in for instant $0.50!"
      },
      {
        question: "When can I cash out?", 
        answer: "M-Pesa: $2.50 minimum, Airtime: $5.00, PayPal/Crypto: $10.00. Complete your profile first!"
      },
      {
        question: "How long until I get paid?",
        answer: "Payments are processed within 24-48 hours after approval."
      },
      {
        question: "Why complete my profile?",
        answer: "Profile completion unlocks all earning opportunities and enables withdrawals for security."
      }
    ]
  },
  {
    id: 'streaks',
    title: 'Streak System',
    icon: Flame,
    iconColor: 'text-orange-500',
    description: 'Everything about daily streaks and badges',
    faqs: [
      {
        question: "How does the Streak System work?",
        answer: "Build your streak by checking in daily! Each consecutive day increases your streak count. You have a 7-day grace period if you miss a day - your streak continues but enters grace mode. Miss 8+ days and your streak resets to Day 1."
      },
      {
        question: "What happens if I miss days?",
        answer: "Miss 1-7 days: Your streak continues with grace period active. You'll see a notification to come back. Miss 8+ consecutive days: Your streak resets to Day 1, but your milestone badges stay with you forever!"
      },
      {
        question: "What are Streak Milestone Badges?",
        answer: "One-time achievements earned based on your longest streak ever: Week Warrior (7 days), Month Master (30 days), Quarter Champion (90 days), and Annual Legend (365 days). Once earned, they're yours forever - even if your streak resets!"
      },
      {
        question: "Do I lose my badges if my streak resets?",
        answer: "No! Milestone badges are permanent achievements. They're based on your longest streak ever, not your current streak. Once earned, they stay with you forever. New badges will be released in Year 2!"
      }
    ]
  }
];

export default function SimplifiedSupportTab() {
  const [showContactForm, setShowContactForm] = useState(false);
  const [expandedHelp, setExpandedHelp] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate form submission
    toast({
      title: "✨ Message Sent!",
      description: "Our support team will respond within 24 hours.",
    });
    
    setFormData({ name: '', email: '', subject: '', message: '' });
    setShowContactForm(false);
  };

  if (showContactForm) {
    return (
      <div className="p-4 pb-20 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Contact Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={4}
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowContactForm(false)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Quick Help Section */}
      <Card className="bg-card shadow-sm border border-primary/20">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
              <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
              <span className="leading-tight">Frequently Asked Questions</span>
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="single" collapsible defaultValue="earning" className="space-y-3">
            {faqCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <AccordionItem key={category.id} value={category.id} className="border rounded-lg bg-background/50">
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <IconComponent className={`h-5 w-5 ${category.iconColor}`} />
                  <div className="text-left min-w-0 flex-1">
                    <div className="font-semibold text-sm sm:text-base truncate">{category.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{category.description}</div>
                  </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-2 pt-2">
                      {category.faqs.map((item, index) => {
                        const faqKey = `${category.id}-${index}`;
                        return (
                          <Card key={faqKey} className="bg-background/30">
                            <CardContent className="p-3">
                              <Button
                                variant="ghost"
                                className="w-full justify-between text-left h-auto p-0"
                                onClick={() => setExpandedHelp(expandedHelp === faqKey ? null : faqKey)}
                              >
                                <span className="font-medium text-xs sm:text-sm leading-tight pr-2">{item.question}</span>
                                <HelpCircle className="h-4 w-4 flex-shrink-0" />
                              </Button>
                              
                              {expandedHelp === faqKey && (
                                <div className="mt-3 pt-3 border-t border-border">
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {item.answer}
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>

      {/* Contact Options */}
      <div className="grid grid-cols-1 gap-4">
        <Card className="bg-card shadow-sm border border-green-200 dark:border-green-900/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-success/20 rounded-lg">
                <MessageCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold">Send us a Message</h3>
                <p className="text-sm text-muted-foreground">Get personalized help from our team</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowContactForm(true)}
              className="w-full"
              variant="outline"
            >
              Contact Support
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border border-blue-200 dark:border-blue-900/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-info/20 rounded-lg">
                <BookOpen className="h-5 w-5 text-info" />
              </div>
              <div>
                <h3 className="font-semibold">Help Center</h3>
                <p className="text-sm text-muted-foreground">Browse guides and tutorials</p>
              </div>
            </div>
            <Button 
              variant="outline"
              className="w-full"
              onClick={() => window.open('https://help.looplly.com', '_blank')}
            >
              Visit Help Center
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Response Time Info */}
      <Card className="bg-card shadow-sm border border-amber-200 dark:border-amber-900/30">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <CheckCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm mb-1">Response Times</h3>
              <p className="text-xs text-muted-foreground">
                • Quick Help: Instant answers<br />
                • Support Messages: Within 24 hours<br />
                • Payment Issues: Priority response (2-4 hours)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}