
import { UserRole } from "@/pages/DashboardPage";

export interface PageAccessRule {
  id: string;
  page_path: string;
  page_name: string;
  allowed_roles: UserRole[];
  is_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PageConfig {
  path: string;
  name: string;
  description: string;
  defaultRoles: UserRole[];
}

// Define all configurable pages in the system
export const CONFIGURABLE_PAGES: PageConfig[] = [
  // Candidate Pages
  { path: "/dashboard", name: "Dashboard", description: "Main dashboard page", defaultRoles: ['candidate', 'salesperson', 'manager', 'admin'] },
  { path: "/jobs", name: "Browse Jobs", description: "View available job listings", defaultRoles: ['candidate'] },
  { path: "/applications", name: "My Applications", description: "View submitted applications", defaultRoles: ['candidate'] },
  { path: "/assessments/candidate", name: "My Assessments", description: "Take assigned assessments", defaultRoles: ['candidate'] },
  { path: "/salesperson-tracker", name: "Track Visits", description: "Record shop visits", defaultRoles: ['candidate', 'salesperson'] },
  { path: "/training", name: "Training Videos", description: "Access training materials", defaultRoles: ['candidate', 'salesperson', 'manager', 'admin'] },
  
  // Salesperson Pages
  { path: "/salesperson-stats", name: "Salesperson Stats", description: "View sales performance metrics", defaultRoles: ['salesperson', 'manager'] },
  
  // Manager Pages
  { path: "/jobs/manage", name: "Manage Jobs", description: "Create and manage job listings", defaultRoles: ['manager'] },
  { path: "/applications/review", name: "Review Applications", description: "Review job applications", defaultRoles: ['manager'] },
  { path: "/assessments/templates", name: "Assessment Templates", description: "Manage assessment templates", defaultRoles: ['manager'] },
  { path: "/assessments/assign", name: "Assign Assessments", description: "Assign assessments to candidates", defaultRoles: ['manager'] },
  { path: "/salesperson-dashboard", name: "Sales Tracking Dashboard", description: "Monitor salesperson activities", defaultRoles: ['manager'] },
  { path: "/training/manage", name: "Training Management", description: "Manage training content", defaultRoles: ['manager'] },
  { path: "/training/performance", name: "Training Performance", description: "View training performance metrics", defaultRoles: ['manager'] },
  
  // Admin Pages
  { path: "/admin/approvals", name: "Manager Approvals", description: "Approve manager requests", defaultRoles: ['admin'] },
  { path: "/admin/users", name: "User Management", description: "Manage system users", defaultRoles: ['admin'] },
  { path: "/admin/jobs", name: "Jobs Overview", description: "Overview of all jobs", defaultRoles: ['admin'] },
  { path: "/admin/stats", name: "Platform Stats", description: "View platform statistics", defaultRoles: ['admin'] },
  { path: "/settings", name: "Settings", description: "User settings", defaultRoles: ['candidate', 'salesperson', 'manager', 'admin'] },
  { path: "/profile", name: "User Profile", description: "User profile page", defaultRoles: ['candidate', 'salesperson', 'manager', 'admin'] },
];
