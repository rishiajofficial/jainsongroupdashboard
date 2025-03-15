
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Pages organized by directory
// Training pages
import TrainingVideos from '@/pages/training/TrainingVideos';
import TrainingVideo from '@/pages/training/TrainingVideo';
import TrainingManage from '@/pages/training/TrainingManage';
import TrainingPerformance from '@/pages/training/TrainingPerformance';

// Auth pages
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';

// Admin pages
import AdminApprovals from '@/pages/admin/AdminApprovals';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminDashboardSettings from '@/pages/admin/AdminDashboardSettings';
import AdminPageAccess from '@/pages/admin/AdminPageAccess';

// Jobs pages
import Jobs from '@/pages/jobs/Jobs';
import JobsManage from '@/pages/jobs/JobsManage';

// Applications pages
import Applications from '@/pages/applications/Applications';
import ApplicationsReview from '@/pages/applications/ApplicationsReview';
import JobApplicationPage from '@/pages/applications/JobApplicationPage';

// Dashboard pages
import DashboardPage from '@/pages/dashboard/DashboardPage';
import SalespersonDashboard from '@/pages/dashboard/SalespersonDashboard';

// Profile pages
import UserProfile from '@/pages/profile/UserProfile';
import Settings from '@/pages/profile/Settings';

// Import landing page
import Index from '@/pages/Index';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/salesperson-dashboard" element={<SalespersonDashboard />} />
        
        {/* Training Routes */}
        <Route path="/training" element={<TrainingVideos />} />
        <Route path="/training/video/:id" element={<TrainingVideo />} />
        <Route path="/training/manage" element={<TrainingManage />} />
        <Route path="/training/performance" element={<TrainingPerformance />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Admin Routes */}
        <Route path="/admin/approvals" element={<AdminApprovals />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/dashboard-settings" element={<AdminDashboardSettings />} />
        <Route path="/admin/page-access" element={<AdminPageAccess />} />
        
        {/* Jobs Routes */}
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/manage" element={<JobsManage />} />
        
        {/* Applications Routes */}
        <Route path="/applications" element={<Applications />} />
        <Route path="/applications/review/:id" element={<ApplicationsReview />} />
        <Route path="/job-application/:jobId" element={<JobApplicationPage />} />
        
        {/* Profile Routes */}
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;
