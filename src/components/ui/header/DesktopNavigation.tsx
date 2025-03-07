
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./UserMenu";
import { Badge } from "@/components/ui/badge";
import { useUnreadApplications } from "@/hooks/useUnreadApplications";

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
  const { unreadCount } = useUnreadApplications();
  const isManager = user?.role === 'manager';
  const hasUnread = isManager && unreadCount > 0;

  return (
    <nav className="hidden md:flex items-center gap-6">
      <Link to="/jobs" className="text-sm font-medium transition-colors hover:text-primary">
        Jobs
      </Link>
      
      {isAuthenticated ? (
        <>
          <Link to="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
            Dashboard
          </Link>
          
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
