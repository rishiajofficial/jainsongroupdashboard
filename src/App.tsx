
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
import Jobs from "./pages/Jobs";
import JobApplicationPage from "./pages/JobApplicationPage";
import Applications from "./pages/Applications";
import JobsManage from "./pages/JobsManage";
import ApplicationsReview from "./pages/ApplicationsReview";
import CandidateLanding from "./pages/landing/CandidateLanding";
import EmployerLanding from "./pages/landing/EmployerLanding";
import AssessmentTemplates from "./pages/AssessmentTemplates";
import EditAssessmentTemplate from "./pages/EditAssessmentTemplate";
import AssignAssessment from "./pages/AssignAssessment";
import CandidateAssessments from "./pages/CandidateAssessments";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/candidates" element={<CandidateLanding />} />
          <Route path="/employers" element={<EmployerLanding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin/approvals" element={<AdminApprovals />} />
          
          {/* Jobs routes */}
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:jobId/apply" element={<JobApplicationPage />} />
          <Route path="/jobs/create" element={<JobsManage />} />
          <Route path="/jobs/manage" element={<JobsManage />} />
          
          {/* Applications routes */}
          <Route path="/applications" element={<Applications />} />
          <Route path="/applications/review" element={<ApplicationsReview />} />
          
          {/* Assessment routes */}
          <Route path="/assessments/templates" element={<AssessmentTemplates />} />
          <Route path="/assessments/templates/:templateId" element={<EditAssessmentTemplate />} />
          <Route path="/assessments/templates/new" element={<EditAssessmentTemplate />} />
          <Route path="/assessments/assign" element={<AssignAssessment />} />
          <Route path="/assessments/candidate" element={<CandidateAssessments />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
