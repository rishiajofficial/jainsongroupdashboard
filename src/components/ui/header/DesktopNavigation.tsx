
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./UserMenu";

type UserRole = 'candidate' | 'manager' | 'admin';

interface UserData {
  email?: string;
  avatarUrl?: string;
  role?: UserRole;
}

interface DesktopNavigationProps {
  isAuthenticated: boolean;
  user: UserData | null;
  onLogout: () => Promise<void>;
}

export function DesktopNavigation({ isAuthenticated, user, onLogout }: DesktopNavigationProps) {
  return (
    <nav className="hidden md:flex items-center gap-6">
      <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
        Home
      </Link>
      
      <Link to="/jobs" className="text-sm font-medium transition-colors hover:text-primary">
        Jobs
      </Link>
      
      {isAuthenticated ? (
        <>
          <Link to="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
            Dashboard
          </Link>
          
          {/* Role-specific navigation links */}
          {user?.role === 'candidate' && (
            <>
              <Link to="/applications" className="text-sm font-medium transition-colors hover:text-primary">
                My Applications
              </Link>
            </>
          )}
          
          {user?.role === 'manager' && (
            <>
              <Link to="/jobs/manage" className="text-sm font-medium transition-colors hover:text-primary">
                Manage Jobs
              </Link>
              <Link to="/applications/review" className="text-sm font-medium transition-colors hover:text-primary">
                Review Applications
              </Link>
            </>
          )}
          
          {user?.role === 'admin' && (
            <Link to="/admin/approvals" className="text-sm font-medium transition-colors hover:text-primary">
              Manager Approvals
            </Link>
          )}
          
          <UserMenu user={user} onLogout={onLogout} />
        </>
      ) : (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Log in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/signup">Sign up</Link>
          </Button>
        </div>
      )}
    </nav>
  );
}
