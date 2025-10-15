import SimplifiedEarnTab from '@/components/dashboard/SimplifiedEarnTab';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import SEOHead from '@/components/seo/SEOHead';
import { getEarnPageSchema } from '@/utils/structuredData';

export default function Earn() {
  return (
    <>
      <SEOHead
        title="Earn Money Online - Complete Surveys, Watch Videos & Share Data"
        description="Start earning money today with Looplly! Complete paid surveys ($0.50-$5), watch rewarding videos ($0.05-$1.50), and earn passive income through secure data sharing ($5-$50/month)."
        keywords="earn money online, paid surveys, watch videos for cash, data sharing rewards, online income, side hustle, make money from home, survey rewards"
        url="https://looplly.me/"
        structuredData={{
          "@context": "https://schema.org",
          "@graph": getEarnPageSchema()
        }}
      />
      <DashboardLayout>
        <SimplifiedEarnTab />
      </DashboardLayout>
    </>
  );
}
