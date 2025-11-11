import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkCookieConsent();
  }, []);

  const checkCookieConsent = async () => {
    const localConsent = localStorage.getItem("cookieConsent");
    if (localConsent) {
      const { analytics } = JSON.parse(localConsent);
      if (analytics) {
        enableAnalytics();
      }
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("cookie_consent_given_at, cookie_consent_preferences")
        .eq("user_id", user.id)
        .single();

      if (profile?.cookie_consent_given_at) {
        const preferences = (profile.cookie_consent_preferences as any) || { analytics: false, marketing: false };
        localStorage.setItem("cookieConsent", JSON.stringify(preferences));
        if (preferences.analytics) {
          enableAnalytics();
        }
        return;
      }
    }

    setShowBanner(true);
  };

  const enableAnalytics = () => {
    // Enable Google Analytics or other analytics tools here
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
    }
  };

  const handleAcceptAll = async () => {
    setIsLoading(true);
    const preferences = { analytics: true, marketing: true };
    await saveConsent(preferences);
    enableAnalytics();
    setShowBanner(false);
    setIsLoading(false);
  };

  const handleEssentialOnly = async () => {
    setIsLoading(true);
    const preferences = { analytics: false, marketing: false };
    await saveConsent(preferences);
    setShowBanner(false);
    setIsLoading(false);
  };

  const saveConsent = async (preferences: any) => {
    localStorage.setItem("cookieConsent", JSON.stringify(preferences));

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({
          cookie_consent_given_at: new Date().toISOString(),
          cookie_consent_preferences: preferences,
        })
        .eq("user_id", user.id);
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="max-w-4xl mx-auto p-6 shadow-lg border-border bg-card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2 text-foreground">We value your privacy</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We use cookies to enhance your experience, analyze site traffic, and deliver personalized content. 
              You can choose to accept all cookies or only essential ones required for the site to function.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={handleAcceptAll}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                Accept All
              </Button>
              <Button 
                onClick={handleEssentialOnly}
                disabled={isLoading}
                variant="outline"
              >
                Essential Only
              </Button>
              <Button 
                variant="ghost"
                className="text-sm"
                onClick={() => window.location.href = '/privacy-policy'}
              >
                Learn More
              </Button>
            </div>
          </div>
          <button
            onClick={handleEssentialOnly}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </Card>
    </div>
  );
};

export default CookieConsent;
