
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  BarChart4,
  Briefcase,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Map,
  ShoppingBag,
  Users,
  UserCheck,
  Settings2,
} from 'lucide-react';
import { UserRole } from '@/pages/DashboardPage';
import { usePageAccess } from '@/contexts/PageAccessContext';
import { useEffect, useState } from 'react';

// Define navigation items by user role
const navigationItems = {
  candidate: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/jobs", label: "Browse Jobs", icon: Briefcase },
    { href: "/applications", label: "My Applications", icon: FileText },
    { href: "/assessments/candidate", label: "My Assessments", icon: ClipboardCheck },
    { href: "/salesperson-tracker", label: "Track Visits", icon: Map },
  ],
  salesperson: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/salesperson-tracker", label: "Record a Visit", icon: Map },
    { href: "/salesperson-stats", label: "My Stats", icon: BarChart4 },
    { href: "/training", label: "Training Videos", icon: GraduationCap },
  ],
  manager: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/applications/review", label: "Review Candidates", icon: UserCheck },
    { href: "/jobs/manage", label: "Manage Jobs", icon: Briefcase },
    { href: "/salesperson-dashboard", label: "Review Salespersons", icon: Users },
    { href: "/manager-stats", label: "Statistics", icon: BarChart4 },
    { href: "/training/manage", label: "Manage Training", icon: GraduationCap },
    { href: "/training/performance", label: "Training Performance", icon: ClipboardCheck },
  ],
  admin: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/approvals", label: "Manager Approvals", icon: UserCheck },
    { href: "/admin/users", label: "User Management", icon: Users },
    { href: "/admin/page-access", label: "Page Access", icon: FileText },
    { href: "/admin/dashboard-settings", label: "Dashboard Settings", icon: Settings2 },
    { href: "/admin/stats", label: "Platform Stats", icon: BarChart4 },
  ]
};

interface SideNavProps {
  role: UserRole;
}

export function SideNav({ role }: SideNavProps) {
  const location = useLocation();
  const { isPageVisible, isLoading, accessRules, refreshRules } = usePageAccess();
  const [visibleItems, setVisibleItems] = useState<any[]>([]);
  const defaultItems = navigationItems[role] || navigationItems.candidate;
  
  // Load page access rules when the component mounts or role changes
  useEffect(() => {
    // Force refresh rules when component mounts or role changes
    refreshRules();
  }, [role, refreshRules]);
  
  // Update visible items when rules or role changes
  useEffect(() => {
    // Filter items based on visibility rules
    const filteredItems = defaultItems.filter(item => 
      // Always show admin pages to admins, and dashboard to everyone
      role === 'admin' || 
      item.href === '/dashboard' || 
      isPageVisible(item.href, role)
    );
    
    setVisibleItems(filteredItems);
  }, [defaultItems, role, isPageVisible, accessRules]);

  return (
    <nav className="w-56 bg-background border-r border-border min-h-[calc(100vh-4rem)] pt-6">
      <div className="px-3 py-2">
        <div className="space-y-1">
          <h2 className="mb-4 px-4 text-lg font-semibold tracking-tight">
            Navigation
          </h2>
          {isLoading ? (
            // Show loading skeleton for nav items
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-muted animate-pulse mb-1"></div>
            ))
          ) : (
            visibleItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  location.pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))
          )}
        </div>
      </div>
    </nav>
  );
}
