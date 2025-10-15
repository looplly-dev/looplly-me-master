import ReferTab from '@/components/dashboard/ReferTab';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import SEOHead from '@/components/seo/SEOHead';
import { getReferPageSchema } from '@/utils/structuredData';

export default function Refer() {
  return (
    <>
      <SEOHead
        title="Referral Program - Earn $0.35 Per Friend You Refer"
        description="Invite friends to Looplly and earn $0.35 for each qualified referral. Share your unique link and build passive income through our referral rewards program."
        keywords="referral program, refer friends, passive income, referral bonus, earn money referring, affiliate program, invite friends earn money"
        url="https://looplly.me/refer"
        structuredData={{
          "@context": "https://schema.org",
          "@graph": getReferPageSchema()
        }}
      />
      <DashboardLayout>
        <ReferTab />
      </DashboardLayout>
    </>
  );
}
