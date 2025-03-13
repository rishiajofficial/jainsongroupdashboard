
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

// Candidate/Public Routes
import Jobs from "./pages/Jobs";
import JobApplicationPage from "./pages/JobApplicationPage";
import Applications from "./pages/Applications";
import CandidateAssessments from "./pages/CandidateAssessments";
import SalespersonTracker from "./pages/SalespersonTracker";
import CandidateLanding from "./pages/landing/CandidateLanding";

// Manager Routes
import JobsManage from "./pages/JobsManage";
import ApplicationsReview from "./pages/ApplicationsReview";
import AssessmentTemplates from "./pages/AssessmentTemplates";
import EditAssessmentTemplate from "./pages/EditAssessmentTemplate";
import AssignAssessment from "./pages/AssignAssessment";
import SalespersonDashboard from "./pages/SalespersonDashboard";
import EmployerLanding from "./pages/landing/EmployerLanding";

// Admin Routes
import AdminApprovals from "./pages/AdminApprovals";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Common Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="/settings" element={<Settings />} />
          
          {/* Candidate/Public Routes */}
          <Route path="/candidates" element={<CandidateLanding />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:jobId/apply" element={<JobApplicationPage />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/assessments/candidate" element={<CandidateAssessments />} />
          <Route path="/salesperson-tracker" element={<SalespersonTracker />} />
          
          {/* Manager Routes */}
          <Route path="/employers" element={<EmployerLanding />} />
          <Route path="/jobs/create" element={<JobsManage />} />
          <Route path="/jobs/manage" element={<JobsManage />} />
          <Route path="/applications/review" element={<ApplicationsReview />} />
          <Route path="/assessments/templates" element={<AssessmentTemplates />} />
          <Route path="/assessments/templates/:templateId" element={<EditAssessmentTemplate />} />
          <Route path="/assessments/templates/new" element={<EditAssessmentTemplate />} />
          <Route path="/assessments/assign" element={<AssignAssessment />} />
          <Route path="/salesperson-dashboard" element={<SalespersonDashboard />} />
          
          {/* Admin Routes */}
          <Route path="/admin/approvals" element={<AdminApprovals />} />
          
          {/* Catch-all Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
