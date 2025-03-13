
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import '@/App.css';

// Public pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import NotFound from '@/pages/NotFound';

// Protected pages
import DashboardPage from '@/pages/DashboardPage';
import Jobs from '@/pages/Jobs';
import JobsManage from '@/pages/JobsManage';
import Applications from '@/pages/Applications';
import ApplicationsReview from '@/pages/ApplicationsReview';
import JobApplicationPage from '@/pages/JobApplicationPage';
import AdminApprovals from '@/pages/AdminApprovals';
import AdminUsers from '@/pages/AdminUsers';
import AdminPageAccess from '@/pages/AdminPageAccess';
import AdminDashboardSettings from '@/pages/AdminDashboardSettings';
import UserProfile from '@/pages/UserProfile';
import Settings from '@/pages/Settings';
import SalespersonTracker from '@/pages/SalespersonTracker';
import SalespersonDashboard from '@/pages/SalespersonDashboard';
import AssessmentTemplates from '@/pages/AssessmentTemplates';
import EditAssessmentTemplate from '@/pages/EditAssessmentTemplate';
import AssignAssessment from '@/pages/AssignAssessment';
import CandidateAssessments from '@/pages/CandidateAssessments';
import TrainingVideos from '@/pages/TrainingVideos';
import TrainingVideo from '@/pages/TrainingVideo';
import TrainingManage from '@/pages/TrainingManage';
import TrainingPerformance from '@/pages/TrainingPerformance';

// Landing pages
import CandidateLanding from '@/pages/landing/CandidateLanding';
import EmployerLanding from '@/pages/landing/EmployerLanding';

// Guards
import PageAccessGuard from '@/components/guards/PageAccessGuard';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/candidates" element={<CandidateLanding />} />
        <Route path="/employers" element={<EmployerLanding />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <PageAccessGuard>
            <DashboardPage />
          </PageAccessGuard>
        } />
        
        {/* User Profile routes */}
        <Route path="/profile" element={
          <PageAccessGuard>
            <UserProfile />
          </PageAccessGuard>
        } />
        <Route path="/settings" element={
          <PageAccessGuard>
            <Settings />
          </PageAccessGuard>
        } />
        
        {/* Jobs routes */}
        <Route path="/jobs" element={
          <PageAccessGuard requiredRole="candidate" redirectPath="/dashboard">
            <Jobs />
          </PageAccessGuard>
        } />
        <Route path="/jobs/manage" element={
          <PageAccessGuard requiredRole="manager" redirectPath="/dashboard">
            <JobsManage />
          </PageAccessGuard>
        } />
        <Route path="/job/:id/apply" element={
          <PageAccessGuard requiredRole="candidate" redirectPath="/dashboard">
            <JobApplicationPage />
          </PageAccessGuard>
        } />
        
        {/* Applications routes */}
        <Route path="/applications" element={
          <PageAccessGuard requiredRole="candidate" redirectPath="/dashboard">
            <Applications />
          </PageAccessGuard>
        } />
        <Route path="/applications/review" element={
          <PageAccessGuard requiredRole="manager" redirectPath="/dashboard">
            <ApplicationsReview />
          </PageAccessGuard>
        } />
        
        {/* Assessment routes */}
        <Route path="/assessments/templates" element={
          <PageAccessGuard requiredRole="manager" redirectPath="/dashboard">
            <AssessmentTemplates />
          </PageAccessGuard>
        } />
        <Route path="/assessments/templates/edit/:id" element={
          <PageAccessGuard requiredRole="manager" redirectPath="/dashboard">
            <EditAssessmentTemplate />
          </PageAccessGuard>
        } />
        <Route path="/assessments/assign" element={
          <PageAccessGuard requiredRole="manager" redirectPath="/dashboard">
            <AssignAssessment />
          </PageAccessGuard>
        } />
        <Route path="/assessments/candidate" element={
          <PageAccessGuard requiredRole="candidate" redirectPath="/dashboard">
            <CandidateAssessments />
          </PageAccessGuard>
        } />
        
        {/* Training routes */}
        <Route path="/training" element={
          <PageAccessGuard requiredRole="salesperson" redirectPath="/dashboard">
            <TrainingVideos />
          </PageAccessGuard>
        } />
        <Route path="/training/video/:id" element={
          <PageAccessGuard requiredRole="salesperson" redirectPath="/dashboard">
            <TrainingVideo />
          </PageAccessGuard>
        } />
        <Route path="/training/manage" element={
          <PageAccessGuard requiredRole="manager" redirectPath="/dashboard">
            <TrainingManage />
          </PageAccessGuard>
        } />
        <Route path="/training/performance" element={
          <PageAccessGuard requiredRole="manager" redirectPath="/dashboard">
            <TrainingPerformance />
          </PageAccessGuard>
        } />
        
        {/* Salesperson routes */}
        <Route path="/salesperson-tracker" element={
          <PageAccessGuard requiredRole="salesperson" redirectPath="/dashboard">
            <SalespersonTracker />
          </PageAccessGuard>
        } />
        <Route path="/salesperson-dashboard" element={
          <PageAccessGuard requiredRole="manager" redirectPath="/dashboard">
            <SalespersonDashboard />
          </PageAccessGuard>
        } />
        
        {/* Admin routes */}
        <Route path="/admin/approvals" element={
          <PageAccessGuard requiredRole="admin" redirectPath="/dashboard">
            <AdminApprovals />
          </PageAccessGuard>
        } />
        <Route path="/admin/users" element={
          <PageAccessGuard requiredRole="admin" redirectPath="/dashboard">
            <AdminUsers />
          </PageAccessGuard>
        } />
        <Route path="/admin/page-access" element={
          <PageAccessGuard requiredRole="admin" redirectPath="/dashboard">
            <AdminPageAccess />
          </PageAccessGuard>
        } />
        <Route path="/admin/dashboard-settings" element={
          <PageAccessGuard requiredRole="admin" redirectPath="/dashboard">
            <AdminDashboardSettings />
          </PageAccessGuard>
        } />
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
