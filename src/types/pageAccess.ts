export interface PageAccess {
  id: string;
  path: string;
  label: string;
  roles: string[];
}

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
