
import { Link } from "react-router-dom";
import { Shield, Users, Settings2, BarChart } from "lucide-react";

interface AdminNavigationProps {
  variant: 'desktop' | 'mobile';
  onClose?: () => void;
}

export function AdminNavigation({ variant, onClose = () => {} }: AdminNavigationProps) {
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
        {isMobile && <Shield className="h-4 w-4 inline mr-2" />}
        Dashboard
      </Link>
      
      <Link 
        to="/admin/approvals" 
        className={linkClass}
        onClick={handleClick}
      >
        {isMobile && <Shield className="h-4 w-4 inline mr-2" />}
        Manager Approvals
      </Link>
      
      <Link 
        to="/admin/users" 
        className={linkClass}
        onClick={handleClick}
      >
        {isMobile && <Users className="h-4 w-4 inline mr-2" />}
        User Management
      </Link>
      
      <Link 
        to="/admin/page-access" 
        className={linkClass}
        onClick={handleClick}
      >
        {isMobile && <Settings2 className="h-4 w-4 inline mr-2" />}
        Page Access
      </Link>
      
      <Link 
        to="/admin/stats" 
        className={linkClass}
        onClick={handleClick}
      >
        {isMobile && <BarChart className="h-4 w-4 inline mr-2" />}
        Platform Stats
      </Link>
    </div>
  );
}
