import { Helmet } from "react-helmet-async";
import { Card } from "@/components/ui/card";

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - Looplly</title>
        <meta name="description" content="Looplly's privacy policy and data protection practices" />
      </Helmet>
      
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <h1 className="text-3xl font-bold mb-6 text-foreground">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground mb-8">Last Updated: 11 November 2025</p>
            
            <div className="space-y-6 text-foreground">
              <section>
                <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
                <p>
                  Looplly ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                </p>
                <p className="mt-2">
                  Our physical mailing address is: 16192 Coastal Highway, Lewes, Delaware 19958, USA.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>
                <h3 className="text-xl font-medium mb-2">Personal Information</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Name, email address, phone number</li>
                  <li>Date of birth (for age verification)</li>
                  <li>Location data (with your consent)</li>
                  <li>Profile information and preferences</li>
                  <li>Survey responses and activity data</li>
                </ul>
                
                <h3 className="text-xl font-medium mb-2 mt-4">Technical Information</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Device information and identifiers</li>
                  <li>IP address and browser type</li>
                  <li>Usage data and analytics</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Information</h2>
                <ul className="list-disc pl-6 space-y-1">
                  <li>To provide and maintain our services</li>
                  <li>To match you with relevant surveys and opportunities</li>
                  <li>To process rewards and transactions</li>
                  <li>To communicate with you about your account</li>
                  <li>To improve our platform and user experience</li>
                  <li>To comply with legal obligations</li>
                  <li>To detect and prevent fraud or abuse</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">4. Data Sharing</h2>
                <p>
                  We may share your information with:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li><strong>Survey Partners:</strong> De-identified and aggregated data only</li>
                  <li><strong>Service Providers:</strong> Third parties who assist in operating our platform</li>
                  <li><strong>Payment Processors:</strong> For reward redemption (we do not store card or bank details)</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                </ul>
                <p className="mt-2">
                  We commit to de-identifying and aggregating data before sharing with third parties to protect your privacy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">5. Data Security</h2>
                <p>
                  We implement industry-standard security measures to protect your information, including encryption, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">6. Your Rights</h2>
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your data</li>
                  <li>Export your data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Withdraw consent for data processing</li>
                </ul>
                <p className="mt-2">
                  To exercise these rights, please contact us at privacy@looplly.com or use the data export feature in your account settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">7. Cookies</h2>
                <p>
                  We use cookies and similar technologies to improve your experience. You can manage your cookie preferences through our cookie consent banner or your browser settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">8. Children's Privacy</h2>
                <p>
                  Our services are not intended for individuals under 18 years of age. We do not knowingly collect information from children.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">9. International Data Transfers</h2>
                <p>
                  Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">10. Legal Compliance</h2>
                <p>
                  Looplly complies with South Africa's Protection of Personal Information Act (POPIA) and aligns with GDPR principles where applicable. We are committed to maintaining the highest standards of data protection.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">11. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through our platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">12. Contact Us</h2>
                <p>
                  If you have questions about this Privacy Policy, please contact us at:
                </p>
                <ul className="mt-2 space-y-1">
                  <li>Email: privacy@looplly.com</li>
                  <li>Address: 16192 Coastal Highway, Lewes, Delaware 19958, USA</li>
                </ul>
              </section>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
