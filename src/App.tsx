import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import AuthProvider from "./components/auth/AuthProvider";
import LoopllyApp from "./components/LoopllyApp";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminContent from "./pages/AdminContent";
import AdminBadges from "./pages/AdminBadges";
import AdminRedemptions from "./pages/AdminRedemptions";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminAgents from "./pages/AdminAgents";
import AdminMigration from "./pages/AdminMigration";
import AdminStreakConfig from "./pages/AdminStreakConfig";
import AdminProfileDecay from "./pages/AdminProfileDecay";
import ResetPassword from "./components/auth/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/content" element={<AdminContent />} />
              <Route path="/admin/badges" element={<AdminBadges />} />
              <Route path="/admin/redemptions" element={<AdminRedemptions />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/agents" element={<AdminAgents />} />
              <Route path="/admin/migration" element={<AdminMigration />} />
              <Route path="/admin/streak-config" element={<AdminStreakConfig />} />
              <Route path="/admin/profile-decay" element={<AdminProfileDecay />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/*" element={<LoopllyApp />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
