
import { Badge } from "@/components/ui/badge";

type UserRole = 'candidate' | 'manager' | 'admin';

interface ProfileHeaderProps {
  userRole?: UserRole;
}

// Helper function to get role badge color
const getRoleBadgeVariant = (role: UserRole) => {
  switch (role) {
    case 'admin':
      return 'destructive';
    case 'manager':
      return 'default';
    case 'candidate':
    default:
      return 'secondary';
  }
};

export const ProfileHeader = ({ userRole }: ProfileHeaderProps) => {
  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight">User Profile</h2>
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Manage your personal information
        </p>
        {userRole && (
          <Badge variant={getRoleBadgeVariant(userRole)} className="capitalize">
            {userRole}
          </Badge>
        )}
      </div>
    </div>
  );
};
