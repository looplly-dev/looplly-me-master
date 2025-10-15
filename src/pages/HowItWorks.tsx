import { useState } from 'react';
import { 
  UserPlus, 
  FileText, 
  Play, 
  DollarSign, 
  Share2, 
  Shield, 
  Smartphone,
  Target,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  Users,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SEOHead from '@/components/seo/SEOHead';
import { howToSchema, organizationSchema } from '@/utils/structuredData';

const steps = [
  {
    id: '1',
    icon: UserPlus,
    title: 'Sign Up for Free',
    description: 'Create your Looplly account in under 2 minutes. No fees, no hidden costs, no credit card required.',
    details: [
      'Provide basic information (email, age, location)',
      'Verify your email address',
      'Complete a quick demographic survey',
      'Start earning immediately'
    ],
    timeEstimate: '2 minutes',
    reward: '$0.50 welcome bonus',
    image: '/screenshots/signup.png'
  },
  {
    id: '2',
    icon: FileText,
    title: 'Complete Your Profile',
    description: 'Fill out your detailed profile to unlock personalized, high-paying earning opportunities.',
    details: [
      'Share interests, shopping habits, and preferences',
      'Upload profile picture (optional)',
      'Set notification preferences',
      'Enable location services for local opportunities'
    ],
    timeEstimate: '5-10 minutes',
    reward: '$2.00 profile bonus',
    image: '/screenshots/profile-setup.png'
  },
  {
    id: '3',
    icon: Target,
    title: 'Choose Your Earning Methods',
    description: 'Select from multiple ways to earn money that fit your lifestyle and preferences.',
    details: [
      'Paid surveys ($0.50-$5.00 each)',
      'Video advertisements ($0.05-$1.50 each)',
      'Data sharing programs ($5-$50/month passive)',
      'Referral program ($0.35 per qualified friend)'
    ],
    timeEstimate: 'Ongoing',
    reward: 'Up to $200+/month',
    image: '/screenshots/earning-methods.png'
  },
  {
    id: '4',
    icon: DollarSign,
    title: 'Start Earning Money',
    description: 'Begin completing activities and watch your balance grow in real-time.',
    details: [
      'Complete surveys on topics you care about',
      'Watch entertaining video content',
      'Enable passive data collection',
      'Invite friends and family'
    ],
    timeEstimate: 'Flexible',
    reward: 'Instant credits',
    image: '/screenshots/earning.png'
  },
  {
    id: '5',
    icon: CheckCircle,
    title: 'Cash Out Your Earnings',
    description: 'Withdraw your money once you reach the $5 minimum through multiple payout methods.',
    details: [
      'PayPal - Instant transfer, no fees',
      'Bank transfer - 1-3 business days',
      'Gift cards - Instant delivery, 100+ brands',
      'Crypto payments - Bitcoin, Ethereum (coming soon)'
    ],
    timeEstimate: 'Instant to 3 days',
    reward: 'Real money in your account',
    image: '/screenshots/payout.png'
  }
];

const earningMethods = [
  {
    icon: FileText,
    name: 'Paid Surveys',
    description: 'Share your opinions on products, services, and brands',
    earning: '$0.50 - $5.00',
    timeRange: '5-20 minutes',
    difficulty: 'Easy',
    frequency: '10-50 daily'
  },
  {
    icon: Play,
    name: 'Video Rewards',
    description: 'Watch advertisements, trailers, and promotional content',
    earning: '$0.05 - $1.50',
    timeRange: '30 seconds - 5 minutes',
    difficulty: 'Very Easy',
    frequency: 'Unlimited'
  },
  {
    icon: Shield,
    name: 'Data Sharing',
    description: 'Securely share anonymous browsing and purchase data',
    earning: '$5.00 - $50.00',
    timeRange: 'Passive/Automatic',
    difficulty: 'Effortless',
    frequency: 'Monthly'
  },
  {
    icon: Share2,
    name: 'Referral Program',
    description: 'Invite friends and earn when they complete activities',
    earning: '$0.35 per referral',
    timeRange: 'One-time setup',
    difficulty: 'Easy',
    frequency: 'Unlimited'
  }
];

const benefits = [
  {
    icon: Clock,
    title: 'Flexible Schedule',
    description: 'Earn money on your own time, anywhere, anytime'
  },
  {
    icon: Smartphone,
    title: 'Mobile Optimized',
    description: 'Works perfectly on phones, tablets, and computers'
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Bank-level security with complete data control'
  },
  {
    icon: DollarSign,
    title: 'Multiple Payouts',
    description: 'PayPal, bank transfer, gift cards, and more'
  }
];

const stats = [
  { label: 'Active Users', value: '500,000+', icon: Users },
  { label: 'Total Paid Out', value: '$50M+', icon: DollarSign },
  { label: 'Average Monthly Earnings', value: '$127', icon: TrendingUp },
  { label: 'User Rating', value: '4.6/5', icon: Star }
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState('1');

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema,
      howToSchema(steps.map(step => ({
        name: step.title,
        text: step.description,
        image: step.image
      })))
    ]
  };

  return (
    <>
      <SEOHead
        title="How Looplly Works - Step-by-Step Guide to Earning Money Online"
        description="Learn exactly how to start earning money with Looplly. Complete surveys, watch videos, share data, and refer friends. Simple steps to earn $50-200+ monthly."
        keywords="how looplly works, earn money online guide, survey app tutorial, passive income steps, referral earnings, data sharing rewards"
        url="https://looplly.me/how-it-works"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-20 px-4 text-center bg-gradient-to-b from-primary/5 to-background">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              How Looplly Works
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Turn your daily digital activities into cash in 5 simple steps. 
              Join over 500,000 users earning money with Looplly.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-2 bg-card px-4 py-2 rounded-full border">
                  <stat.icon className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{stat.value}</span>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                5 Simple Steps to Start Earning
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Getting started with Looplly is quick and easy. Follow these steps to begin earning money today.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Step Navigation */}
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <Card 
                    key={step.id}
                    className={`cursor-pointer transition-all ${
                      activeStep === step.id ? 'border-primary shadow-lg' : 'hover:shadow-md'
                    }`}
                    onClick={() => setActiveStep(step.id)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          activeStep === step.id ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                        }`}>
                          <step.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold">{step.title}</span>
                            <Badge variant={activeStep === step.id ? 'default' : 'secondary'}>
                              Step {step.id}
                            </Badge>
                          </div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    {activeStep === step.id && (
                      <CardContent className="pt-0">
                        <p className="text-muted-foreground mb-4">{step.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            <span>{step.timeEstimate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-success" />
                            <span className="text-success font-medium">{step.reward}</span>
                          </div>
                        </div>
                        <ul className="space-y-2">
                          {step.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>

              {/* Active Step Details */}
              <div className="sticky top-8">
                <Card className="border-2 border-primary/20">
                  <CardContent className="p-0">
                    <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-t-lg flex items-center justify-center">
                      <div className="text-center">
                        {React.createElement(steps[parseInt(activeStep) - 1].icon, {
                          className: "h-16 w-16 text-primary mb-4 mx-auto"
                        })}
                        <h3 className="text-xl font-bold text-foreground">
                          {steps[parseInt(activeStep) - 1].title}
                        </h3>
                        <p className="text-muted-foreground mt-2 px-4">
                          {steps[parseInt(activeStep) - 1].description}
                        </p>
                      </div>
                    </div>
                    <div className="p-6">
                      <Button className="w-full" size="lg">
                        Get Started - It's Free
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Earning Methods */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Multiple Ways to Earn Money
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Choose the earning methods that work best for your lifestyle and maximize your income potential.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {earningMethods.map((method, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-4">
                      <method.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{method.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Earning:</span>
                        <span className="font-semibold text-success">{method.earning}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Time:</span>
                        <span className="font-semibold">{method.timeRange}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Available:</span>
                        <span className="font-semibold">{method.frequency}</span>
                      </div>
                    </div>
                    <Badge 
                      variant={method.difficulty === 'Very Easy' ? 'default' : 'secondary'}
                      className="w-full justify-center"
                    >
                      {method.difficulty}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Why Choose Looplly?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join hundreds of thousands of users who trust Looplly for reliable, flexible online earnings.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center border-none shadow-md">
                  <CardContent className="p-6">
                    <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-4">
                      <benefit.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Earning Money?
            </h2>
            <p className="text-xl mb-8 text-primary-foreground/90">
              Join over 500,000 users who have earned more than $50 million with Looplly. 
              Sign up now and get your $0.50 welcome bonus!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                Start Earning Now - Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                View FAQ
              </Button>
            </div>
            <p className="text-sm mt-4 text-primary-foreground/70">
              No credit card required • Start earning in 2 minutes • $5 minimum cashout
            </p>
          </div>
        </section>
      </div>
    </>
  );
}