import CommunityTab from '@/components/dashboard/CommunityTab';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import SEOHead from '@/components/seo/SEOHead';
import { getCommunityPageSchema } from '@/utils/structuredData';

export default function Community() {
  return (
    <>
      <SEOHead
        title="Looplly Community - Connect With Earners Worldwide"
        description="Join thousands of Looplly users earning $50-200+ monthly. Share tips, strategies, and success stories in our supportive community of online earners."
        keywords="looplly community, online earning community, survey tips, earning strategies, money making community, success stories"
        url="https://looplly.me/community"
        structuredData={{
          "@context": "https://schema.org",
          "@graph": getCommunityPageSchema()
        }}
      />
      <DashboardLayout>
        <CommunityTab />
      </DashboardLayout>
    </>
  );
}
