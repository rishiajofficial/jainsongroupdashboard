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
import { useEffect, useState } from 'react';
import { usePageAccess } from '@/contexts/PageAccessContext';

// Define navigation items by user role
const navigationItems = {
  candidate: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/jobs", label: "Browse Jobs", icon: Briefcase },
    { href: "/applications", label: "My Applications", icon: FileText },
    { href: "/assessments", label: "My Assessments", icon: ClipboardCheck },
    { href: "/training", label: "Training Videos", icon: GraduationCap },
    { href: "/profile", label: "My Profile", icon: Users },
  ],
  salesperson: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/salesperson/tracker", label: "Record a Visit", icon: Map },
    { href: "/training", label: "Training Videos", icon: GraduationCap },
    { href: "/profile", label: "My Profile", icon: Users },
  ],
  manager: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/applications/review", label: "Review Candidates", icon: UserCheck },
    { href: "/jobs/manage", label: "Manage Jobs", icon: Briefcase },
    { href: "/training", label: "Training Videos", icon: GraduationCap },
    { href: "/training/manage", label: "Manage Training", icon: GraduationCap },
    { href: "/training/performance", label: "Training Performance", icon: ClipboardCheck },
    { href: "/profile", label: "My Profile", icon: Users },
  ],
  admin: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "User Management", icon: Users },
    { href: "/admin/approvals", label: "Manager Approvals", icon: UserCheck },
    { href: "/admin/page-access", label: "Page Access", icon: FileText },
    { href: "/admin/dashboard-settings", label: "Dashboard Settings", icon: Settings2 },
    { href: "/training", label: "Training Videos", icon: GraduationCap },
    { href: "/profile", label: "My Profile", icon: Users },
  ]
};

interface SideNavProps {
  role: UserRole;
}

export function SideNav({ role }: SideNavProps) {
  const location = useLocation();
  const [visibleItems, setVisibleItems] = useState<any[]>([]);
  const { isPageVisible, refreshRules } = usePageAccess();
  const defaultItems = navigationItems[role] || navigationItems.candidate;
  
  // Update visible items when role changes and check visibility
  useEffect(() => {
    // Filter items based on page access rules
    const filteredItems = defaultItems.filter(item => {
      // Dashboard and profile are always visible
      if (item.href === '/dashboard' || item.href === '/profile') {
        return true;
      }
      
      return isPageVisible(item.href, role);
    });
    
    setVisibleItems(filteredItems);
  }, [role, defaultItems, isPageVisible]);
  
  // Refresh rules when component mounts
  useEffect(() => {
    refreshRules();
  }, [refreshRules]);

  return (
    <nav className="w-56 bg-background border-r border-border min-h-[calc(100vh-4rem)] pt-6">
      <div className="px-3 py-2">
        <div className="space-y-1">
          <h2 className="mb-4 px-4 text-lg font-semibold tracking-tight">
            Navigation
          </h2>
          {visibleItems.map((item) => (
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
          ))}
        </div>
      </div>
    </nav>
  );
}
