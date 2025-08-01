import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminSettings from "./pages/admin/AdminSettings";
import PaymentSettings from "./pages/admin/PaymentSettings";
import ContentManagement from "./pages/admin/ContentManagement";
import MemberContent from "./pages/member/MemberContent";
import MemberSubscription from "./pages/member/MemberSubscription";
import MemberProfile from "./pages/member/MemberProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route 
              path="/auth" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <Auth />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            >
              {/* Rotas para membros */}
              <Route path="products" element={<MemberContent />} />
              <Route path="lessons" element={<MemberContent />} />
              <Route path="downloads" element={<MemberContent />} />
              <Route path="subscription" element={<MemberSubscription />} />
              <Route path="profile" element={<MemberProfile />} />
              
              {/* Rotas para admin */}
              <Route path="admin" element={<AdminSettings />} />
              <Route path="admin/users" element={<AdminSettings />} />
              <Route path="admin/products" element={<ContentManagement />} />
              <Route path="admin/content" element={<ContentManagement />} />
              <Route path="admin/payments" element={<PaymentSettings />} />
              <Route path="admin/settings" element={<AdminSettings />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
