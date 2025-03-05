
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";
import UserProfile from "./pages/UserProfile";
import Settings from "./pages/Settings";
import AdminApprovals from "./pages/AdminApprovals";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin/approvals" element={<AdminApprovals />} />
          {/* Jobs and Applications routes - These will be implemented later */}
          <Route path="/jobs" element={<NotFound />} />
          <Route path="/jobs/create" element={<NotFound />} />
          <Route path="/jobs/manage" element={<NotFound />} />
          <Route path="/applications" element={<NotFound />} />
          <Route path="/applications/review" element={<NotFound />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
