
import { Link } from "react-router-dom";
import { Shield, Users, Settings2, BarChart } from "lucide-react";
import { usePageAccess } from "@/contexts/PageAccessContext";
import { useEffect } from "react";

interface AdminNavigationProps {
  variant: 'desktop' | 'mobile';
  onClose?: () => void;
}

export function AdminNavigation({ variant, onClose = () => {} }: AdminNavigationProps) {
  const isMobile = variant === 'mobile';
  const { isPageVisible, refreshRules } = usePageAccess();
  
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

  // Define navigation items - for admin, we check visibility but also always show admin-specific pages
  const navItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: <Shield className="h-4 w-4 inline mr-2" />,
      // Dashboard is always visible
      isVisible: true
    },
    {
      path: "/admin/approvals",
      label: "Manager Approvals",
      icon: <Shield className="h-4 w-4 inline mr-2" />,
      // Admin pages are always visible to admins
      isVisible: true
    },
    {
      path: "/admin/users",
      label: "User Management",
      icon: <Users className="h-4 w-4 inline mr-2" />,
      isVisible: true
    },
    {
      path: "/admin/page-access",
      label: "Page Access",
      icon: <Settings2 className="h-4 w-4 inline mr-2" />,
      isVisible: true
    },
    {
      path: "/admin/stats",
      label: "Platform Stats",
      icon: <BarChart className="h-4 w-4 inline mr-2" />,
      isVisible: true
    }
  ];

  return (
    <div className={isMobile ? "space-y-4" : "flex items-center gap-6"}>
      {navItems.map((item) => (
        <Link 
          key={item.path}
          to={item.path} 
          className={linkClass}
          onClick={handleClick}
        >
          {isMobile && item.icon}
          {item.label}
        </Link>
      ))}
    </div>
  );
}
