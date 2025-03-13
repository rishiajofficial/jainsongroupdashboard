
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface PublicNavigationProps {
  variant: 'desktop' | 'mobile'; 
  onClose?: () => void;
}

export function PublicNavigation({ variant, onClose = () => {} }: PublicNavigationProps) {
  const isMobile = variant === 'mobile';
  
  const linkClass = isMobile 
    ? "block py-2 text-sm font-medium transition-colors hover:text-primary"
    : "text-sm font-medium transition-colors hover:text-primary";

  const handleClick = () => {
    if (isMobile) onClose();
  };

  return (
    <>
      <div className={isMobile ? "space-y-4" : "flex items-center gap-6"}>
        <Link 
          to="/" 
          className={linkClass}
          onClick={handleClick}
        >
          Home
        </Link>
        
        <Link 
          to="/candidates" 
          className={linkClass}
          onClick={handleClick}
        >
          For Candidates
        </Link>
        
        <Link 
          to="/employers" 
          className={linkClass}
          onClick={handleClick}
        >
          For Employers
        </Link>
        
        <Link 
          to="/jobs" 
          className={linkClass}
          onClick={handleClick}
        >
          Jobs
        </Link>
      </div>
      
      {isMobile ? (
        <div className="pt-2 border-t border-border/40 space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            asChild 
            className="w-full justify-start"
          >
            <Link 
              to="/login"
              onClick={handleClick}
            >
              Log in
            </Link>
          </Button>
          <Button 
            size="sm" 
            asChild 
            className="w-full justify-start"
          >
            <Link 
              to="/signup"
              onClick={handleClick}
            >
              Sign up
            </Link>
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login" onClick={handleClick}>Log in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/signup" onClick={handleClick}>Sign up</Link>
          </Button>
        </div>
      )}
    </>
  );
}
