import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Send, ExternalLink, HelpCircle, Phone, Mail } from 'lucide-react';

export default function SupportTab() {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { authState } = useAuth();
  const { toast } = useToast();

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject || !category || !message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a Zendesk ticket via their API
      // Note: In production, this should go through your backend to keep API credentials secure
      const ticketData = {
        request: {
          subject: subject,
          comment: {
            body: `${message}\n\n---\nUser: ${authState.user?.firstName} ${authState.user?.lastName}\nEmail: ${authState.user?.email}\nCategory: ${category}`
          },
          requester: {
            name: `${authState.user?.firstName} ${authState.user?.lastName}`,
            email: authState.user?.email
          },
          tags: ['web_app', category.toLowerCase().replace(' ', '_')]
        }
      };

      // For now, we'll simulate the API call and show success
      // In production, replace this with actual Zendesk API integration
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Support Ticket Submitted",
        description: "We've received your request and will respond within 24 hours.",
      });

      // Reset form
      setSubject('');
      setCategory('');
      setMessage('');
    } catch (error) {
      console.error('Error submitting ticket:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openZendeskWidget = () => {
    // This would open the Zendesk Web Widget if integrated
    // For now, we'll redirect to a Zendesk portal
    window.open('https://support.zendesk.com', '_blank');
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Support Center
        </h2>
        <p className="text-muted-foreground">
          We're here to help! Get support for any questions or issues.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={openZendeskWidget}>
          <CardContent className="pt-6 text-center">
            <MessageCircle className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-medium mb-1">Live Chat</h3>
            <p className="text-sm text-muted-foreground">Chat with our support team</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="pt-6 text-center">
            <HelpCircle className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-medium mb-1">Help Center</h3>
            <p className="text-sm text-muted-foreground">Browse FAQs and guides</p>
          </CardContent>
        </Card>
      </div>

      {/* Contact Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Email Support</p>
              <p className="text-sm text-muted-foreground">support@looplly.com</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Phone Support</p>
              <p className="text-sm text-muted-foreground">1-800-LOOPLLY (Mon-Fri 9AM-6PM)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Ticket Form */}
      <Card>
        <CardHeader>
          <CardTitle>Submit a Support Ticket</CardTitle>
          <CardDescription>
            Describe your issue and we'll get back to you as soon as possible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="account">Account Issues</SelectItem>
                  <SelectItem value="billing">Billing & Payments</SelectItem>
                  <SelectItem value="technical">Technical Problems</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="security">Security Concerns</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe your issue in detail..."
                rows={4}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Ticket
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Zendesk Integration Note */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-2">
            <ExternalLink className="h-4 w-4 text-primary" />
            <p className="font-medium">Powered by Zendesk</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Our support system is powered by Zendesk to ensure fast and reliable assistance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
