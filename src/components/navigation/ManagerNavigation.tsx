
import { Link } from "react-router-dom";
import { Bell, Briefcase, ClipboardList, Map, Shield, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUnreadApplications } from "@/hooks/useUnreadApplications";

interface ManagerNavigationProps {
  variant: 'desktop' | 'mobile';
  onClose?: () => void;
}

export function ManagerNavigation({ variant, onClose = () => {} }: ManagerNavigationProps) {
  const { unreadCount } = useUnreadApplications();
  const hasUnread = unreadCount > 0;
  const isMobile = variant === 'mobile';

  const linkClass = isMobile 
    ? "block py-2 text-sm font-medium transition-colors hover:text-primary"
    : "text-sm font-medium transition-colors hover:text-primary";

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isMobile) onClose();
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
      
      <Link 
        to="/jobs/manage" 
        className={linkClass}
        onClick={handleClick}
      >
        {isMobile && <Briefcase className="h-4 w-4 inline mr-2" />}
        Manage Jobs
      </Link>
      
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
      
      <Link 
        to="/assessments/templates" 
        className={linkClass}
        onClick={handleClick}
      >
        {isMobile && <ClipboardList className="h-4 w-4 inline mr-2" />}
        Assessment Templates
      </Link>
      
      <Link 
        to="/assessments/assign" 
        className={linkClass}
        onClick={handleClick}
      >
        {isMobile && <ClipboardList className="h-4 w-4 inline mr-2" />}
        Assign Assessments
      </Link>
      
      <Link 
        to="/salesperson-dashboard" 
        className={linkClass}
        onClick={handleClick}
      >
        {isMobile && <Map className="h-4 w-4 inline mr-2" />}
        Sales Tracking
      </Link>
    </div>
  );
}
