import WalletTab from '@/components/dashboard/WalletTab';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import SEOHead from '@/components/seo/SEOHead';
import { getWalletPageSchema } from '@/utils/structuredData';

export default function Wallet() {
  return (
    <>
      <SEOHead
        title="Digital Wallet - Track Your Earnings & Manage Payouts"
        description="Monitor your Looplly earnings in real-time. Track your balance, view transaction history, and manage secure payouts via PayPal, bank transfer, or gift cards."
        keywords="digital wallet, track earnings, payout methods, PayPal cash out, bank transfer, gift card rewards, transaction history, balance tracking"
        url="https://looplly.me/wallet"
        structuredData={{
          "@context": "https://schema.org",
          "@graph": getWalletPageSchema()
        }}
      />
      <DashboardLayout>
        <WalletTab />
      </DashboardLayout>
    </>
  );
}
