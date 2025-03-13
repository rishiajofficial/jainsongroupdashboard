
import { Link } from "react-router-dom";
import { Briefcase, FileText, Map } from "lucide-react";
import { usePageAccess } from "@/contexts/PageAccessContext";

interface CandidateNavigationProps {
  variant: 'desktop' | 'mobile';
  onClose?: () => void;
}

export function CandidateNavigation({ variant, onClose = () => {} }: CandidateNavigationProps) {
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
    if (isLoading) return false; // Hide during loading to prevent flickering
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
      
      {isPageAccessible("/jobs") && (
        <Link 
          to="/jobs" 
          className={linkClass}
          onClick={handleClick}
        >
          {isMobile && <Briefcase className="h-4 w-4 inline mr-2" />}
          Browse Jobs
        </Link>
      )}
      
      {isPageAccessible("/applications") && (
        <Link 
          to="/applications" 
          className={linkClass}
          onClick={handleClick}
        >
          {isMobile && <FileText className="h-4 w-4 inline mr-2" />}
          My Applications
        </Link>
      )}
      
      {isPageAccessible("/assessments/candidate") && (
        <Link 
          to="/assessments/candidate" 
          className={linkClass}
          onClick={handleClick}
        >
          {isMobile && <FileText className="h-4 w-4 inline mr-2" />}
          My Assessments
        </Link>
      )}
      
      {isPageAccessible("/salesperson-tracker") && (
        <Link 
          to="/salesperson-tracker" 
          className={linkClass}
          onClick={handleClick}
        >
          {isMobile && <Map className="h-4 w-4 inline mr-2" />}
          Track Visits
        </Link>
      )}
    </div>
  );
}
