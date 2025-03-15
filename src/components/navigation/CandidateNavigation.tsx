
import { Link } from "react-router-dom";
import { Briefcase, FileText, Map, ClipboardCheck, GraduationCap } from "lucide-react";
import { usePageAccess } from "@/contexts/PageAccessContext";
import { useEffect } from "react";

interface CandidateNavigationProps {
  variant: 'desktop' | 'mobile';
  onClose?: () => void;
}

export function CandidateNavigation({ variant, onClose = () => {} }: CandidateNavigationProps) {
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

  // Define navigation items
  const navItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: <Briefcase className="h-4 w-4 inline mr-2" />,
      // Dashboard is always visible
      isVisible: true
    },
    {
      path: "/jobs",
      label: "Browse Jobs",
      icon: <Briefcase className="h-4 w-4 inline mr-2" />,
      isVisible: isPageVisible("/jobs", "candidate")
    },
    {
      path: "/applications",
      label: "My Applications",
      icon: <FileText className="h-4 w-4 inline mr-2" />,
      isVisible: isPageVisible("/applications", "candidate")
    },
    {
      path: "/assessments/candidate",
      label: "My Assessments",
      icon: <ClipboardCheck className="h-4 w-4 inline mr-2" />,
      isVisible: isPageVisible("/assessments/candidate", "candidate")
    },
    {
      path: "/salesperson-tracker",
      label: "Track Visits",
      icon: <Map className="h-4 w-4 inline mr-2" />,
      isVisible: isPageVisible("/salesperson-tracker", "candidate")
    },
    {
      path: "/training",
      label: "Training Videos",
      icon: <GraduationCap className="h-4 w-4 inline mr-2" />,
      isVisible: isPageVisible("/training", "candidate")
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
