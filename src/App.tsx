
import {
  Route,
  Routes,
} from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Signup from "@/pages/Signup";
import Login from "@/pages/Login";
import DashboardPage from "@/pages/DashboardPage";
import NotFound from "@/pages/NotFound";
import Settings from "@/pages/Settings";
import Applications from "@/pages/Applications";
import Jobs from "@/pages/Jobs";
import JobsManage from "@/pages/JobsManage";
import ApplicationsReview from "@/pages/ApplicationsReview";
import UserProfile from "@/pages/UserProfile";
import AssessmentTemplates from "@/pages/AssessmentTemplates";
import EditAssessmentTemplate from "@/pages/EditAssessmentTemplate";
import CandidateAssessments from "@/pages/CandidateAssessments";
import AssignAssessment from "@/pages/AssignAssessment";
import AdminApprovals from "@/pages/AdminApprovals";
import JobApplicationPage from "@/pages/JobApplicationPage";
import SalespersonTracker from "@/pages/SalespersonTracker";
import SalespersonDashboard from "@/pages/SalespersonDashboard";
import TrainingVideos from "@/pages/TrainingVideos";
import TrainingVideo from "@/pages/TrainingVideo";
import TrainingManage from "@/pages/TrainingManage";
import TrainingPerformance from "@/pages/TrainingPerformance";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/manage" element={<JobsManage />} />
        <Route path="/applications/review" element={<ApplicationsReview />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/assessments/templates" element={<AssessmentTemplates />} />
        <Route path="/assessments/templates/edit/:id" element={<EditAssessmentTemplate />} />
        <Route path="/assessments/candidate" element={<CandidateAssessments />} />
        <Route path="/assessments/assign" element={<AssignAssessment />} />
        <Route path="/admin/approvals" element={<AdminApprovals />} />
        <Route path="/jobs/:id/apply" element={<JobApplicationPage />} />
        <Route path="/salesperson-tracker" element={<SalespersonTracker />} />
        <Route path="/salesperson-dashboard" element={<SalespersonDashboard />} />
        
        {/* Training Routes */}
        <Route path="/training" element={<TrainingVideos />} />
        <Route path="/training/video/:id" element={<TrainingVideo />} />
        <Route path="/training/manage" element={<TrainingManage />} />
        <Route path="/training/performance" element={<TrainingPerformance />} />
      </Routes>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
