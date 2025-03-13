
import { Link } from "react-router-dom";
import { Briefcase, FileText, Map, ClipboardCheck } from "lucide-react";

interface CandidateNavigationProps {
  variant: 'desktop' | 'mobile';
  onClose?: () => void;
}

export function CandidateNavigation({ variant, onClose = () => {} }: CandidateNavigationProps) {
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
        to="/jobs" 
        className={linkClass}
        onClick={handleClick}
      >
        {isMobile && <Briefcase className="h-4 w-4 inline mr-2" />}
        Browse Jobs
      </Link>
      
      <Link 
        to="/applications" 
        className={linkClass}
        onClick={handleClick}
      >
        {isMobile && <FileText className="h-4 w-4 inline mr-2" />}
        My Applications
      </Link>
      
      <Link 
        to="/assessments/candidate" 
        className={linkClass}
        onClick={handleClick}
      >
        {isMobile && <ClipboardCheck className="h-4 w-4 inline mr-2" />}
        My Assessments
      </Link>
      
      <Link 
        to="/salesperson-tracker" 
        className={linkClass}
        onClick={handleClick}
      >
        {isMobile && <Map className="h-4 w-4 inline mr-2" />}
        Track Visits
      </Link>
    </div>
  );
}
