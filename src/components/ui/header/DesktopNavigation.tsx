
import { Link } from "react-router-dom";
import { UserMenu } from "./UserMenu";
import { PublicNavigation } from "@/components/navigation/PublicNavigation";
import { CandidateNavigation } from "@/components/navigation/CandidateNavigation";
import { ManagerNavigation } from "@/components/navigation/ManagerNavigation";
import { AdminNavigation } from "@/components/navigation/AdminNavigation";

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
    <nav className="hidden md:flex items-center justify-between w-full">
      <div className="flex items-center gap-6">
        {!isAuthenticated ? (
          <PublicNavigation variant="desktop" />
        ) : user?.role === 'candidate' ? (
          <CandidateNavigation variant="desktop" />
        ) : user?.role === 'manager' ? (
          <ManagerNavigation variant="desktop" />
        ) : user?.role === 'admin' ? (
          <AdminNavigation variant="desktop" />
        ) : (
          <CandidateNavigation variant="desktop" />
        )}
      </div>
      
      {isAuthenticated ? (
        <UserMenu user={user} onLogout={onLogout} />
      ) : null}
    </nav>
  );
}
