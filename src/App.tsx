
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { Suspense, lazy } from "react";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Pages
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import NotFound from "@/pages/NotFound";
import DashboardPage from "@/pages/DashboardPage";
import CandidateLanding from "./pages/landing/CandidateLanding";
import EmployerLanding from "./pages/landing/EmployerLanding";
import Settings from "./pages/Settings";
import UserProfile from "./pages/UserProfile";
import Jobs from "./pages/Jobs";
import TrainingVideos from "./pages/TrainingVideos";
import TrainingVideo from "./pages/TrainingVideo";
import TrainingPerformance from "./pages/TrainingPerformance";
import TrainingManage from "./pages/TrainingManage";
import Applications from "./pages/Applications";
import ApplicationsReview from "./pages/ApplicationsReview";
import JobsManage from "./pages/JobsManage";
import JobApplicationPage from "./pages/JobApplicationPage";
import AdminUsers from "./pages/AdminUsers";
import AdminApprovals from "./pages/AdminApprovals";
import AdminPageAccess from "./pages/AdminPageAccess";
import AdminDashboardSettings from "./pages/AdminDashboardSettings";
import SalespersonDashboard from "./pages/SalespersonDashboard";
import SalespersonTracker from "./pages/SalespersonTracker";
import CandidateAssessments from "./pages/CandidateAssessments";
import AssignAssessment from "./pages/AssignAssessment";
import AssessmentTemplates from "./pages/AssessmentTemplates";
import EditAssessmentTemplate from "./pages/EditAssessmentTemplate";

// Guards
import { PageAccessGuard } from "@/components/guards/PageAccessGuard";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Router>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/candidates" element={<CandidateLanding />} />
              <Route path="/employers" element={<EmployerLanding />} />
              <Route path="/jobs/:id/apply" element={<JobApplicationPage />} />
              <Route path="/jobs" element={<Jobs />} />

              {/* Protected routes */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/settings" element={<PageAccessGuard><Settings /></PageAccessGuard>} />
              <Route path="/profile" element={<PageAccessGuard><UserProfile /></PageAccessGuard>} />
              
              {/* Training */}
              <Route path="/training" element={<PageAccessGuard><TrainingVideos /></PageAccessGuard>} />
              <Route path="/training/video/:id" element={<PageAccessGuard><TrainingVideo /></PageAccessGuard>} />
              <Route path="/training/performance" element={<PageAccessGuard><TrainingPerformance /></PageAccessGuard>} />
              <Route path="/training/manage" element={<PageAccessGuard><TrainingManage /></PageAccessGuard>} />
              
              {/* Applications */}
              <Route path="/applications" element={<PageAccessGuard><Applications /></PageAccessGuard>} />
              <Route path="/applications/review" element={<PageAccessGuard><ApplicationsReview /></PageAccessGuard>} />
              
              {/* Jobs */}
              <Route path="/jobs/manage" element={<PageAccessGuard><JobsManage /></PageAccessGuard>} />
              
              {/* Admin */}
              <Route path="/admin/users" element={<PageAccessGuard><AdminUsers /></PageAccessGuard>} />
              <Route path="/admin/approvals" element={<PageAccessGuard><AdminApprovals /></PageAccessGuard>} />
              <Route path="/admin/page-access" element={<PageAccessGuard><AdminPageAccess /></PageAccessGuard>} />
              <Route path="/admin/dashboard-settings" element={<PageAccessGuard><AdminDashboardSettings /></PageAccessGuard>} />
              
              {/* Salesperson */}
              <Route path="/salesperson/dashboard" element={<PageAccessGuard><SalespersonDashboard /></PageAccessGuard>} />
              <Route path="/salesperson/tracker" element={<PageAccessGuard><SalespersonTracker /></PageAccessGuard>} />
              
              {/* Assessments */}
              <Route path="/assessments" element={<PageAccessGuard><CandidateAssessments /></PageAccessGuard>} />
              <Route path="/assessments/assign" element={<PageAccessGuard><AssignAssessment /></PageAccessGuard>} />
              <Route path="/assessment-templates" element={<PageAccessGuard><AssessmentTemplates /></PageAccessGuard>} />
              <Route path="/assessment-templates/:id" element={<PageAccessGuard><EditAssessmentTemplate /></PageAccessGuard>} />
              
              {/* Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
        <Toaster />
        <SonnerToaster position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
