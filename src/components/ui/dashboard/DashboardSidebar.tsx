
import { User, Briefcase, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUnreadApplications } from "@/hooks/useUnreadApplications";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger 
} from "@/components/ui/sidebar";

type UserRole = 'candidate' | 'manager' | 'admin';

interface DashboardSidebarProps {
  userData: {
    fullName: string;
    email: string;
    role: UserRole;
  };
}

export function DashboardSidebar({ userData }: DashboardSidebarProps) {
  const { unreadCount } = useUnreadApplications();
  const navigate = useNavigate();

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4 border-b">
        <h2 className="text-xl font-bold">SalesMan</h2>
        <p className="text-sm text-muted-foreground capitalize">
          {userData.role}
        </p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-start" 
                onClick={() => navigate("/dashboard")}
              >
                <User className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {/* Candidate-specific menu items */}
          {userData.role === 'candidate' && (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/jobs")}
                  >
                    <Briefcase className="mr-2 h-4 w-4" />
                    Browse Jobs
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/applications")}
                  >
                    <ClipboardList className="mr-2 h-4 w-4" />
                    My Applications
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
          
          {/* Manager-specific menu items */}
          {userData.role === 'manager' && (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/jobs/manage")}
                  >
                    <Briefcase className="mr-2 h-4 w-4" />
                    Manage Jobs
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/applications/review")}
                  >
                    <div className="flex items-center w-full">
                      <ClipboardList className="mr-2 h-4 w-4" />
                      <span>Review Applications</span>
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-2">{unreadCount}</Badge>
                      )}
                    </div>
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
          
          {/* Admin-specific menu items */}
          {userData.role === 'admin' && (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/jobs/manage")}
                  >
                    <Briefcase className="mr-2 h-4 w-4" />
                    Manage Jobs
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/applications/review")}
                  >
                    <div className="flex items-center w-full">
                      <ClipboardList className="mr-2 h-4 w-4" />
                      <span>Review Applications</span>
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-2">{unreadCount}</Badge>
                      )}
                    </div>
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <SidebarTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            Toggle Sidebar
          </Button>
        </SidebarTrigger>
      </SidebarFooter>
    </Sidebar>
  );
}
