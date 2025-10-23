import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import AuthProvider from "./components/auth/AuthProvider";
import { useAnalytics } from "./hooks/useAnalytics";
import LoopllyApp from "./components/LoopllyApp";
import AdminDashboard from "./pages/AdminDashboard";
import AdminTeam from "./pages/AdminTeam";
import AdminUsers from "./pages/AdminUsers";
import AdminContent from "./pages/AdminContent";
import AdminBadges from "./pages/AdminBadges";
import AdminRedemptions from "./pages/AdminRedemptions";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminIntegrations from "./pages/AdminIntegrations";
import AdminAgents from "./pages/AdminAgents";
import AdminMigration from "./pages/AdminMigration";
import AdminStreakConfig from "./pages/AdminStreakConfig";
import AdminProfileDecay from "./pages/AdminProfileDecay";
import AdminProfileQuestions from "./pages/AdminProfileQuestions";
import AdminQuestionBuilder from "./pages/AdminQuestionBuilder";
import AdminQuestions from "./pages/AdminQuestions";
import AdminEarningRules from "./pages/AdminEarningRules";
import AdminKnowledge from "./pages/AdminKnowledge";
import AdminKnowledgeDoc from "./pages/AdminKnowledgeDoc";
import AdminCountryBlocklist from "./pages/AdminCountryBlocklist";
import AdminSimulator from "./pages/AdminSimulator";
import Knowledge from "./pages/Knowledge";
import KnowledgeDoc from "./pages/KnowledgeDoc";
import SimulatorSession from "./pages/SimulatorSession";
import ResetPassword from "./components/auth/ResetPassword";
import ResetPasswordRequired from "./pages/ResetPasswordRequired";
import AdminLogin from "./components/auth/AdminLogin";
import AdminResetPassword from "./pages/AdminResetPassword";

const queryClient = new QueryClient();

const AppContent = () => {
  // Track page views automatically on route changes
  useAnalytics();
  
  return (
    <Routes>
      {/* Admin Login - Must be before protected routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/reset-password" element={<AdminResetPassword />} />
              
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
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
              <Route path="/admin/knowledge/:docId" element={<AdminKnowledgeDoc />} />
              <Route path="/admin/country-blocklist" element={<AdminCountryBlocklist />} />
              
              {/* B2B Knowledge Routes */}
              <Route path="/knowledge" element={<Knowledge />} />
              <Route path="/knowledge/:docId" element={<KnowledgeDoc />} />
              
              {/* Simulator Session Route */}
              <Route path="/simulator-session" element={<SimulatorSession />} />
              
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/reset-password-required" element={<ResetPasswordRequired />} />
              <Route path="/*" element={<LoopllyApp />} />
            </Routes>
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
