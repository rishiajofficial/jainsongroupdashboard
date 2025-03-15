
import { UserRole } from "@/pages/DashboardPage";

export interface PageAccess {
  id: string;
  path: string;
  label: string;
  roles: string[];
}

export interface PageAccessRule {
  id: string;
  page_path: string;
  page_name: string;
  allowed_roles: UserRole[];
  is_enabled: boolean;
}

export interface ConfigurablePage {
  path: string;
  name: string;
  defaultRoles: UserRole[];
  description: string;
}

export const CONFIGURABLE_PAGES: ConfigurablePage[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    defaultRoles: ['salesperson', 'manager', 'admin', 'candidate'],
    description: 'Main dashboard page showing overview of system'
  },
  {
    path: '/training',
    name: 'Training Videos',
    defaultRoles: ['salesperson', 'manager'],
    description: 'Access to training video library'
  },
  {
    path: '/training/manage',
    name: 'Manage Training',
    defaultRoles: ['manager', 'admin'],
    description: 'Upload and manage training videos'
  },
  {
    path: '/training/performance',
    name: 'Training Performance',
    defaultRoles: ['manager', 'admin'],
    description: 'View training completion statistics'
  },
  {
    path: '/jobs',
    name: 'Job Postings',
    defaultRoles: ['candidate', 'manager', 'admin'],
    description: 'View available job postings'
  },
  {
    path: '/jobs/manage',
    name: 'Manage Jobs',
    defaultRoles: ['manager', 'admin'],
    description: 'Create and manage job postings'
  },
  {
    path: '/applications',
    name: 'Applications',
    defaultRoles: ['manager', 'admin'],
    description: 'View and manage job applications'
  },
  {
    path: '/admin/approvals',
    name: 'Admin Approvals',
    defaultRoles: ['admin'],
    description: 'Approve access requests'
  },
  {
    path: '/admin/users',
    name: 'Admin Users',
    defaultRoles: ['admin'],
    description: 'Manage user accounts'
  },
  {
    path: '/admin/dashboard-settings',
    name: 'Admin Dashboard Settings',
    defaultRoles: ['admin'],
    description: 'Configure dashboard widgets and settings'
  },
  {
    path: '/admin/page-access',
    name: 'Admin Page Access',
    defaultRoles: ['admin'],
    description: 'Control page visibility for different user roles'
  },
  {
    path: '/profile',
    name: 'User Profile',
    defaultRoles: ['salesperson', 'manager', 'admin', 'candidate'],
    description: 'View and edit user profile'
  },
  {
    path: '/settings',
    name: 'Settings',
    defaultRoles: ['salesperson', 'manager', 'admin', 'candidate'],
    description: 'User application settings'
  }
];

export const pageAccessList: PageAccess[] = [
  {
    id: 'dashboard',
    path: '/dashboard',
    label: 'Dashboard',
    roles: ['salesperson', 'manager', 'admin'],
  },
  {
    id: 'training',
    path: '/training',
    label: 'Training Videos',
    roles: ['salesperson', 'manager'],
  },
  {
    id: 'training-manage',
    path: '/training/manage',
    label: 'Manage Training',
    roles: ['manager'],
  },
  {
    id: 'jobs',
    path: '/jobs',
    label: 'Job Postings',
    roles: ['salesperson', 'manager'],
  },
  {
    id: 'jobs-manage',
    path: '/jobs/manage',
    label: 'Manage Jobs',
    roles: ['manager', 'admin'],
  },
  {
    id: 'applications',
    path: '/applications',
    label: 'Applications',
    roles: ['manager'],
  },
  {
    id: 'admin-approvals',
    path: '/admin/approvals',
    label: 'Admin Approvals',
    roles: ['admin'],
  },
  {
    id: 'admin-users',
    path: '/admin/users',
    label: 'Admin Users',
    roles: ['admin'],
  },
  {
    id: 'admin-page-access',
    path: '/admin/page-access',
    label: 'Admin Page Access',
    roles: ['admin'],
  },
  {
    id: 'admin-dashboard-settings',
    path: '/admin/dashboard-settings',
    label: 'Admin Dashboard Settings',
    roles: ['admin'],
  },
  {
    id: 'profile',
    path: '/profile',
    label: 'User Profile',
    roles: ['salesperson', 'manager', 'admin'],
  },
  {
    id: 'settings',
    path: '/settings',
    label: 'Settings',
    roles: ['salesperson', 'manager', 'admin'],
  },
];
