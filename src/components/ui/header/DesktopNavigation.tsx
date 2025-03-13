
import { Link } from "react-router-dom";
import { UserMenu } from "./UserMenu";
import { PublicNavigation } from "@/components/navigation/PublicNavigation";

type UserRole = 'candidate' | 'salesperson' | 'manager' | 'admin';

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
  // This component is now only used for public navigation
  return (
    <nav className="hidden md:flex items-center justify-end w-full">
      <div className="flex items-center gap-6">
        {!isAuthenticated ? (
          <PublicNavigation variant="desktop" />
        ) : (
          <UserMenu user={user} onLogout={onLogout} />
        )}
      </div>
    </nav>
  );
}
