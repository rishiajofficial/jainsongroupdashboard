import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TrainingVideos from '@/pages/TrainingVideos';
import TrainingVideo from '@/pages/TrainingVideo';
import TrainingManage from '@/pages/TrainingManage';
import TrainingPerformance from '@/pages/TrainingPerformance';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import AdminApprovals from '@/pages/AdminApprovals';
import AdminUsers from '@/pages/AdminUsers';
import AdminDashboardSettings from '@/pages/AdminDashboardSettings';
import AdminPageAccess from '@/pages/AdminPageAccess';
import Jobs from '@/pages/Jobs';
import JobsManage from '@/pages/JobsManage';
import Applications from '@/pages/Applications';
import ApplicationsReview from '@/pages/ApplicationsReview';
import JobApplicationPage from '@/pages/JobApplicationPage';
import DashboardPage from '@/pages/DashboardPage';
import SalespersonDashboard from '@/pages/SalespersonDashboard';
import UserProfile from '@/pages/UserProfile';
import Settings from '@/pages/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
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
