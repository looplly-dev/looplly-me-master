import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "./components/auth/AuthProvider";
import LoopllyApp from "./components/LoopllyApp";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminContent from "./pages/AdminContent";
import AdminBadges from "./pages/AdminBadges";
import AdminRedemptions from "./pages/AdminRedemptions";
import AdminAnalytics from "./pages/AdminAnalytics";

const queryClient = new QueryClient();

const App = () => (
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
            <Route path="/*" element={<LoopllyApp />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
