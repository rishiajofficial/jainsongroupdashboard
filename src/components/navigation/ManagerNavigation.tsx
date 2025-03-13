
import { Link } from "react-router-dom";
import { Bell, Briefcase, ClipboardList, GraduationCap, Map, Shield, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUnreadApplications } from "@/hooks/useUnreadApplications";
import { usePageAccess } from "@/contexts/PageAccessContext";

interface ManagerNavigationProps {
  variant: 'desktop' | 'mobile';
  onClose?: () => void;
}

export function ManagerNavigation({ variant, onClose = () => {} }: ManagerNavigationProps) {
  const { unreadCount } = useUnreadApplications();
  const hasUnread = unreadCount > 0;
  const isMobile = variant === 'mobile';
  const { accessRules, isLoading } = usePageAccess();

  const linkClass = isMobile 
    ? "block py-2 text-sm font-medium transition-colors hover:text-primary"
    : "text-sm font-medium transition-colors hover:text-primary";

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isMobile) onClose();
  };
  
  // Check if a page is accessible (enabled)
  const isPageAccessible = (path: string) => {
    if (isLoading) return true; // Show all during loading
    const rule = accessRules.find(r => r.page_path === path);
    return rule && rule.is_enabled;
  };

  return (
    <div className={isMobile ? "space-y-4" : "flex items-center gap-6"}>
      <Link 
        to="/dashboard" 
        className={linkClass}
        onClick={handleClick}
      >
        {isMobile && <Briefcase className="h-4 w-4 inline mr-2" />}
        Dashboard
      </Link>
      
      {isPageAccessible("/jobs/manage") && (
        <Link 
          to="/jobs/manage" 
          className={linkClass}
          onClick={handleClick}
        >
          {isMobile && <Briefcase className="h-4 w-4 inline mr-2" />}
          Manage Jobs
        </Link>
      )}
      
      {isPageAccessible("/applications/review") && (
        <Link 
          to="/applications/review" 
          className={isMobile ? "flex items-center justify-between py-2 text-sm font-medium transition-colors hover:text-primary" : `${linkClass} relative`}
          onClick={handleClick}
        >
          <span>
            {isMobile && <ClipboardList className="h-4 w-4 inline mr-2" />}
            Review Applications
          </span>
          {hasUnread && (
            <Badge 
              variant="destructive" 
              className={isMobile ? "ml-2 px-1 min-w-5 h-5 flex items-center justify-center rounded-full" : "absolute -top-2 -right-4 px-1 min-w-5 h-5 flex items-center justify-center rounded-full"}
            >
              {unreadCount}
            </Badge>
          )}
        </Link>
      )}
      
      {isPageAccessible("/assessments/templates") && (
        <Link 
          to="/assessments/templates" 
          className={linkClass}
          onClick={handleClick}
        >
          {isMobile && <ClipboardList className="h-4 w-4 inline mr-2" />}
          Assessment Templates
        </Link>
      )}
      
      {isPageAccessible("/assessments/assign") && (
        <Link 
          to="/assessments/assign" 
          className={linkClass}
          onClick={handleClick}
        >
          {isMobile && <ClipboardList className="h-4 w-4 inline mr-2" />}
          Assign Assessments
        </Link>
      )}
      
      {isPageAccessible("/salesperson-dashboard") && (
        <Link 
          to="/salesperson-dashboard" 
          className={linkClass}
          onClick={handleClick}
        >
          {isMobile && <Map className="h-4 w-4 inline mr-2" />}
          Sales Tracking
        </Link>
      )}
      
      {isPageAccessible("/training/manage") && (
        <Link 
          to="/training/manage" 
          className={linkClass}
          onClick={handleClick}
        >
          {isMobile && <GraduationCap className="h-4 w-4 inline mr-2" />}
          Training Management
        </Link>
      )}
    </div>
  );
}
