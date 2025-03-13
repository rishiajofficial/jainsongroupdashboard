
import { Link } from "react-router-dom";
import { Briefcase, ClipboardCheck, GraduationCap, Map, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUnreadApplications } from "@/hooks/useUnreadApplications";
import { usePageAccess } from "@/contexts/PageAccessContext";
import { useEffect } from "react";

interface ManagerNavigationProps {
  variant: 'desktop' | 'mobile';
  onClose?: () => void;
}

export function ManagerNavigation({ variant, onClose = () => {} }: ManagerNavigationProps) {
  const { unreadCount } = useUnreadApplications();
  const { isPageVisible, refreshRules } = usePageAccess();
  const hasUnread = unreadCount > 0;
  const isMobile = variant === 'mobile';

  // Refresh rules when component mounts
  useEffect(() => {
    refreshRules();
  }, [refreshRules]);

  const linkClass = isMobile 
    ? "block py-2 text-sm font-medium transition-colors hover:text-primary"
    : "text-sm font-medium transition-colors hover:text-primary";

  const handleClick = () => {
    if (isMobile) onClose();
  };

  // Define navigation items
  const navItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: <Briefcase className="h-4 w-4 inline mr-2" />,
      // Dashboard is always visible
      isVisible: true,
      badge: null
    },
    {
      path: "/jobs/manage",
      label: "Manage Jobs",
      icon: <Briefcase className="h-4 w-4 inline mr-2" />,
      isVisible: isPageVisible("/jobs/manage", "manager"),
      badge: null
    },
    {
      path: "/applications/review",
      label: "Review Applications",
      icon: <ClipboardCheck className="h-4 w-4 inline mr-2" />,
      isVisible: isPageVisible("/applications/review", "manager"),
      badge: hasUnread ? (
        <Badge 
          variant="destructive" 
          className={isMobile ? "ml-2 px-1 min-w-5 h-5 flex items-center justify-center rounded-full" : "absolute -top-2 -right-4 px-1 min-w-5 h-5 flex items-center justify-center rounded-full"}
        >
          {unreadCount}
        </Badge>
      ) : null
    },
    {
      path: "/assessments/templates",
      label: "Assessment Templates",
      icon: <ClipboardCheck className="h-4 w-4 inline mr-2" />,
      isVisible: isPageVisible("/assessments/templates", "manager"),
      badge: null
    },
    {
      path: "/assessments/assign",
      label: "Assign Assessments",
      icon: <ClipboardCheck className="h-4 w-4 inline mr-2" />,
      isVisible: isPageVisible("/assessments/assign", "manager"),
      badge: null
    },
    {
      path: "/salesperson-dashboard",
      label: "Sales Tracking",
      icon: <Map className="h-4 w-4 inline mr-2" />,
      isVisible: isPageVisible("/salesperson-dashboard", "manager"),
      badge: null
    },
    {
      path: "/training/manage",
      label: "Training Management",
      icon: <GraduationCap className="h-4 w-4 inline mr-2" />,
      isVisible: isPageVisible("/training/manage", "manager"),
      badge: null
    }
  ];

  // Filter items based on visibility
  const visibleItems = navItems.filter(item => item.isVisible);

  return (
    <div className={isMobile ? "space-y-4" : "flex items-center gap-6"}>
      {visibleItems.map((item) => (
        <Link 
          key={item.path}
          to={item.path} 
          className={isMobile ? (
            item.badge ? "flex items-center justify-between py-2 text-sm font-medium transition-colors hover:text-primary" : linkClass
          ) : (
            item.badge ? `${linkClass} relative` : linkClass
          )}
          onClick={handleClick}
        >
          <span>
            {isMobile && item.icon}
            {item.label}
          </span>
          {item.badge}
        </Link>
      ))}
    </div>
  );
}
