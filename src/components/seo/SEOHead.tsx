import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
  structuredData?: object;
  additionalMeta?: Array<{
    name?: string;
    property?: string;
    content: string;
  }>;
}

export default function SEOHead({
  title = 'Looplly - Earn Real Money from Surveys, Videos & Data Sharing',
  description = 'Turn your daily digital activities into cash with Looplly. Earn money through paid surveys, watching videos, sharing data insights, and referring friends. Join thousands earning $50-200+ monthly.',
  keywords = 'earn money online, paid surveys, watch videos for money, data sharing rewards, referral earnings, passive income, side hustle, cash rewards, survey app, money making app',
  image = 'https://looplly.me/og-image.jpg',
  url = 'https://looplly.me',
  type = 'website',
  noindex = false,
  structuredData,
  additionalMeta = []
}: SEOHeadProps) {
  const fullTitle = title.includes('Looplly') ? title : `${title} | Looplly`;
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />
      
      {/* Robots */}
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Looplly" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@LoopllyApp" />
      <meta name="twitter:creator" content="@LoopllyApp" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={title} />
      
      {/* Additional Meta Tags */}
      {additionalMeta.map((meta, index) => (
        <meta
          key={index}
          {...(meta.name ? { name: meta.name } : { property: meta.property })}
          content={meta.content}
        />
      ))}
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}