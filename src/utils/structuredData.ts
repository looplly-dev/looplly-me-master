// Structured Data schemas for different pages and contexts

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://looplly.me/#organization",
  "name": "Looplly",
  "url": "https://looplly.me",
  "logo": {
    "@type": "ImageObject",
    "@id": "https://looplly.me/#logo",
    "url": "https://looplly.me/logo.png",
    "caption": "Looplly",
    "width": 200,
    "height": 200
  },
  "sameAs": [
    "https://twitter.com/LoopllyApp",
    "https://facebook.com/LoopllyApp", 
    "https://instagram.com/loopllyapp",
    "https://linkedin.com/company/looplly"
  ],
  "description": "Looplly helps people earn money through surveys, video watching, data sharing, and referrals.",
  "foundingDate": "2024",
  "slogan": "Turn Your Digital Life Into Cash",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "email": "support@looplly.me",
    "url": "https://looplly.me/support"
  }
};

export const webApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": "https://looplly.me/#webapp",
  "name": "Looplly",
  "url": "https://looplly.me",
  "description": "Earn real money from surveys, videos, and data sharing with Looplly. Join thousands earning $50-200+ monthly.",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web, iOS, Android",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "Free to join and start earning"
  },
  "author": {
    "@id": "https://looplly.me/#organization"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.6",
    "bestRating": "5",
    "worstRating": "1",
    "ratingCount": "2347"
  },
  "featureList": [
    "Paid Surveys",
    "Video Rewards",
    "Data Sharing Earnings",
    "Referral Program",
    "Instant Payments",
    "Mobile Optimized"
  ]
};

export const rewardProgramSchema = {
  "@context": "https://schema.org",
  "@type": "LoyaltyProgram",
  "name": "Looplly Rewards Program",
  "description": "Earn money through surveys, videos, data sharing, and referrals",
  "programMembershipUsed": {
    "@type": "ProgramMembership",
    "membershipNumber": "Free Membership",
    "programName": "Looplly Rewards"
  },
  "offers": [
    {
      "@type": "Offer",
      "name": "Survey Completion",
      "description": "Earn $0.50-$5.00 per completed survey",
      "price": "0.50-5.00",
      "priceCurrency": "USD"
    },
    {
      "@type": "Offer", 
      "name": "Video Viewing",
      "description": "Earn $0.05-$1.50 per video watched",
      "price": "0.05-1.50",
      "priceCurrency": "USD"
    },
    {
      "@type": "Offer",
      "name": "Data Sharing",
      "description": "Earn $5-$50 monthly from passive data sharing",
      "price": "5.00-50.00",
      "priceCurrency": "USD"
    },
    {
      "@type": "Offer",
      "name": "Referral Bonus",
      "description": "Earn $0.35 per qualified referral",
      "price": "0.35",
      "priceCurrency": "USD"
    }
  ]
};

export const faqPageSchema = (faqs: Array<{question: string, answer: string}>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

export const breadcrumbSchema = (items: Array<{name: string, url: string}>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

export const howToSchema = (steps: Array<{name: string, text: string, image?: string}>) => ({
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Start Earning with Looplly",
  "description": "Step-by-step guide to earning money with Looplly",
  "step": steps.map((step, index) => ({
    "@type": "HowToStep",
    "position": index + 1,
    "name": step.name,
    "text": step.text,
    ...(step.image && {
      "image": {
        "@type": "ImageObject",
        "url": step.image
      }
    })
  }))
});

// Page-specific structured data generators
export const getEarnPageSchema = () => [
  organizationSchema,
  webApplicationSchema,
  rewardProgramSchema,
  howToSchema([
    {
      name: "Sign Up",
      text: "Create your free Looplly account in under 2 minutes"
    },
    {
      name: "Complete Profile",
      text: "Fill out your profile to unlock personalized earning opportunities"
    },
    {
      name: "Start Earning",
      text: "Complete surveys, watch videos, or enable data sharing to start earning"
    },
    {
      name: "Cash Out",
      text: "Withdraw your earnings via PayPal, bank transfer, or gift cards"
    }
  ])
];

export const getCommunityPageSchema = () => [
  organizationSchema,
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Looplly Community",
    "description": "Join thousands of users earning money through Looplly's reward programs"
  }
];

export const getReferPageSchema = () => [
  organizationSchema,
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Looplly Referral Program",
    "description": "Earn $0.35 for every friend you refer to Looplly. Share your link and start earning passive income.",
    "mainEntity": {
      "@type": "OfferCatalog",
      "name": "Referral Rewards",
      "itemListElement": [
        {
          "@type": "Offer",
          "name": "Friend Referral Bonus",
          "description": "Earn $0.35 when a friend signs up and completes their first activity",
          "price": "0.35",
          "priceCurrency": "USD"
        }
      ]
    }
  }
];

export const getWalletPageSchema = () => [
  organizationSchema,
  {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    "name": "Looplly Digital Wallet",
    "description": "Secure digital wallet to track and manage your Looplly earnings",
    "provider": {
      "@id": "https://looplly.me/#organization"
    },
    "featureList": [
      "Real-time balance tracking",
      "Transaction history",
      "Multiple payout methods",
      "Secure encrypted storage"
    ]
  }
];