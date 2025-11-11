import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import AuthProvider from "./components/auth/AuthProvider";
import { useAnalytics } from "./hooks/useAnalytics";
import LoopllyApp from "./components/LoopllyApp";
import CookieConsent from "./components/legal/CookieConsent";
import Footer from "./components/layout/Footer";

// Lazy load admin pages for better performance
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminAuthLogs = lazy(() => import("./pages/AdminAuthLogs"));
const AdminTeam = lazy(() => import("./pages/AdminTeam"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminContent = lazy(() => import("./pages/AdminContent"));
const AdminBadges = lazy(() => import("./pages/AdminBadges"));
const AdminRedemptions = lazy(() => import("./pages/AdminRedemptions"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const AdminIntegrations = lazy(() => import("./pages/AdminIntegrations"));
const AdminAgents = lazy(() => import("./pages/AdminAgents"));
const AdminMigration = lazy(() => import("./pages/AdminMigration"));
const AdminStreakConfig = lazy(() => import("./pages/AdminStreakConfig"));
const AdminProfileDecay = lazy(() => import("./pages/AdminProfileDecay"));
const AdminProfileQuestions = lazy(() => import("./pages/AdminProfileQuestions"));
const AdminQuestionBuilder = lazy(() => import("./pages/AdminQuestionBuilder"));
const AdminQuestions = lazy(() => import("./pages/AdminQuestions"));
const AdminEarningRules = lazy(() => import("./pages/AdminEarningRules"));
const AdminKnowledge = lazy(() => import("./pages/AdminKnowledge"));
const AdminKnowledgeDoc = lazy(() => import("./pages/AdminKnowledgeDoc"));
const AdminKnowledgeEdit = lazy(() => import("./pages/AdminKnowledgeEdit"));
const AdminCountryBlocklist = lazy(() => import("./pages/AdminCountryBlocklist"));
const AdminSimulator = lazy(() => import("./pages/AdminSimulator"));
const SimulatorSession = lazy(() => import("./pages/SimulatorSession"));
const SimulatorApp = lazy(() => import("./pages/SimulatorApp"));
const ResetPassword = lazy(() => import("./components/auth/ResetPassword"));
const ResetPasswordRequired = lazy(() => import("./pages/ResetPasswordRequired"));
const AdminLogin = lazy(() => import("./components/auth/AdminLogin"));
const AdminResetPassword = lazy(() => import("./pages/AdminResetPassword"));
const ProtectedRoute = lazy(() => import("./components/auth/ProtectedRoute"));
const ProfileComplete = lazy(() => import("./pages/ProfileComplete"));
const VerifyMobile = lazy(() => import("./pages/VerifyMobile"));

// Lazy load privacy policy page
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));

const queryClient = new QueryClient();

const AppContent = () => {
  // Track page views automatically on route changes
  useAnalytics();
  
  return (
    <>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }
      >
        <Routes>
        {/* Admin Login - Must be before protected routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/reset-password" element={<AdminResetPassword />} />
        
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/auth-logs" element={<AdminAuthLogs />} />
        <Route path="/admin/team" element={<AdminTeam />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/content" element={<AdminContent />} />
        <Route path="/admin/badges" element={<AdminBadges />} />
        <Route path="/admin/redemptions" element={<AdminRedemptions />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/integrations" element={<AdminIntegrations />} />
        <Route path="/admin/agents" element={<AdminAgents />} />
        <Route path="/admin/migration" element={<AdminMigration />} />
        <Route path="/admin/streak-config" element={<AdminStreakConfig />} />
        <Route path="/admin/questions" element={<AdminQuestions />} />
        <Route path="/admin/profile-decay" element={<AdminProfileDecay />} />
        <Route path="/admin/profile-questions" element={<AdminProfileQuestions />} />
        <Route path="/admin/question-builder" element={<AdminQuestionBuilder />} />
        <Route path="/admin/earning-rules" element={<AdminEarningRules />} />
        <Route path="/admin/simulator" element={<AdminSimulator />} />
        <Route path="/admin/knowledge" element={<AdminKnowledge />} />
        <Route path="/admin/knowledge/doc/:docId" element={<AdminKnowledgeDoc />} />
        <Route path="/admin/knowledge/edit/:docId" element={<AdminKnowledgeEdit />} />
        <Route path="/admin/country-blocklist" element={<AdminCountryBlocklist />} />
        
        {/* Simulator Routes - No ProtectedRoute wrappers */}
        <Route path="/simulator/session" element={<SimulatorSession />} />
        <Route path="/simulator/*" element={<SimulatorApp />} />
        
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password-required" element={<ResetPasswordRequired />} />
        
        {/* Profile & Verification Routes */}
        <Route path="/profile/complete" element={<ProtectedRoute><ProfileComplete /></ProtectedRoute>} />
        <Route path="/verify-mobile" element={<ProtectedRoute><VerifyMobile /></ProtectedRoute>} />
        
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        
        <Route path="/*" element={<LoopllyApp />} />
        </Routes>
      </Suspense>
      
      <CookieConsent />
      <Footer />
    </>
  );
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
