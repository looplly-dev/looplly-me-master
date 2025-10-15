import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import SEOHead from './SEOHead';
import { faqPageSchema } from '@/utils/structuredData';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

interface FAQProps {
  title?: string;
  description?: string;
  faqs: FAQItem[];
  categories?: string[];
}

const defaultFAQs: FAQItem[] = [
  {
    id: '1',
    question: 'How much money can I earn with Looplly?',
    answer: 'Earnings vary based on your activity level and location. Most users earn $50-200 per month through a combination of surveys ($0.50-$5 each), video rewards ($0.05-$1.50 each), data sharing ($5-50/month), and referrals ($0.35 each). Active users in high-demand demographics can earn significantly more.',
    category: 'earnings'
  },
  {
    id: '2', 
    question: 'How do I get paid and when?',
    answer: 'You can cash out once you reach $5.00 minimum. We offer multiple payout methods: PayPal (instant), bank transfer (1-3 business days), and gift cards (instant). There are no fees for PayPal or gift card redemptions. Bank transfers may have small fees depending on your bank.',
    category: 'payments'
  },
  {
    id: '3',
    question: 'Is Looplly safe and legitimate?',
    answer: 'Yes, Looplly is completely legitimate and secure. We use bank-level encryption to protect your data, never share personal information without consent, and have paid out millions to our users. We are registered and comply with data protection laws including GDPR and CCPA.',
    category: 'safety'
  },
  {
    id: '4',
    question: 'What types of surveys and tasks are available?',
    answer: 'We offer diverse earning opportunities: market research surveys, product feedback, brand awareness studies, video advertisements, app testing, website reviews, and passive data collection. Tasks are personalized based on your demographics and interests.',
    category: 'activities'
  },
  {
    id: '5',
    question: 'How does the referral program work?',
    answer: 'Earn $0.35 for each friend who signs up using your referral link and completes their first earning activity. There is no limit to referrals. Your friends also benefit by getting a welcome bonus and priority access to high-paying opportunities.',
    category: 'referrals'
  },
  {
    id: '6',
    question: 'What data do you collect and how is it used?',
    answer: 'We only collect data you explicitly consent to share. This may include browsing patterns, purchase behavior, app usage, and survey responses. All data is anonymized and aggregated before sharing with research partners. You control what data you share and can opt out anytime.',
    category: 'privacy'
  },
  {
    id: '7',
    question: 'Can I use Looplly on mobile devices?',
    answer: 'Yes! Looplly works perfectly on smartphones, tablets, and computers. Our mobile-optimized web app provides the same earning opportunities as desktop. We also have dedicated iOS and Android apps for the best mobile experience.',
    category: 'technical'
  },
  {
    id: '8',
    question: 'Are there any age or location restrictions?',
    answer: 'You must be at least 13 years old to join (18+ for certain activities). Looplly is available in the US, Canada, UK, Australia, and 40+ other countries. Earning opportunities may vary by location based on market research demand in your area.',
    category: 'eligibility'
  },
  {
    id: '9',
    question: 'What makes Looplly different from other reward apps?',
    answer: 'Looplly offers the highest earning potential through our premium survey partnerships, passive data sharing options, and generous referral program. We focus on transparency, instant payouts, and providing consistent earning opportunities rather than one-time bonuses.',
    category: 'platform'
  },
  {
    id: '10',
    question: 'How do I maximize my earnings?',
    answer: 'To maximize earnings: complete your profile thoroughly, enable push notifications for new opportunities, try different activity types, participate in data sharing programs, refer friends actively, and check the app daily for fresh surveys and videos.',
    category: 'tips'
  }
];

export default function FAQ({ title, description, faqs = defaultFAQs, categories }: FAQProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredFAQs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const faqCategories = categories || [
    'all',
    ...Array.from(new Set(faqs.map(faq => faq.category).filter(Boolean)))
  ];

  return (
    <>
      <SEOHead
        title={title || 'Frequently Asked Questions - Looplly Help Center'}
        description={description || 'Get answers to common questions about earning money with Looplly, including payouts, surveys, data sharing, referrals, and account safety.'}
        keywords="looplly faq, earn money questions, survey app help, payout questions, referral program, data sharing safety, how to earn money online"
        structuredData={faqPageSchema(faqs.map(faq => ({
          question: faq.question,
          answer: faq.answer
        })))}
      />
      
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              {title || 'Frequently Asked Questions'}
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {description || 'Find answers to the most common questions about earning money with Looplly. Can\'t find what you\'re looking for? Contact our support team.'}
          </p>
        </div>

        {/* Category Filter */}
        {faqCategories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {faqCategories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.map((faq) => (
            <Card key={faq.id} className="overflow-hidden">
              <Collapsible
                open={openItems.includes(faq.id)}
                onOpenChange={() => toggleItem(faq.id)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardTitle className="flex items-center justify-between text-left">
                      <h3 className="text-lg font-semibold pr-4">{faq.question}</h3>
                      <div className="flex-shrink-0">
                        {openItems.includes(faq.id) ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>

        {/* Additional Help Section */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Our support team is here to help! Get personalized assistance with your account, 
                technical issues, or any other questions about earning with Looplly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
                  Contact Support
                </button>
                <button className="border border-border px-6 py-3 rounded-lg hover:bg-muted transition-colors">
                  Join Community
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}