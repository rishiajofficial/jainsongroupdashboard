
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User, Briefcase, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarFooter,
  SidebarTrigger 
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useUnreadApplications } from "@/hooks/useUnreadApplications";

type UserRole = 'candidate' | 'manager' | 'admin';

interface ProfileData {
  fullName: string;
  email: string;
  role: UserRole;
}

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<ProfileData | null>(null);
  const { unreadCount } = useUnreadApplications();
  const navigate = useNavigate();

  useEffect(() => {
    // Load user data from Supabase
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, email, role')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          return;
        }

        if (data) {
          setUserData({
            fullName: data.full_name || "",
            email: data.email || "",
            role: data.role as UserRole,
          });
        }
      } catch (error) {
        console.error("Error in profile fetch:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const renderSidebar = () => {
    if (!userData) return null;

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
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center">
                          <ClipboardList className="mr-2 h-4 w-4" />
                          Review Applications
                        </div>
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
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center">
                          <ClipboardList className="mr-2 h-4 w-4" />
                          Review Applications
                        </div>
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
  };

  const renderDashboardContent = () => {
    if (!userData) return null;

    switch (userData.role) {
      case 'admin':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Admin Dashboard
                </CardTitle>
                <CardDescription>
                  Manage system settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    onClick={() => navigate("/applications/review")} 
                    className="w-full sm:w-auto"
                  >
                    Review Applications
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Job Listings
                </CardTitle>
                <CardDescription>
                  View and manage all job listings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate("/jobs")} 
                  className="w-full sm:w-auto"
                >
                  View All Jobs
                </Button>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'manager':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Manage Job Listings
                </CardTitle>
                <CardDescription>
                  Create and manage job postings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => navigate("/jobs/create")} 
                  className="w-full sm:w-auto"
                >
                  Create New Job Listing
                </Button>
                <Button 
                  onClick={() => navigate("/jobs/manage")} 
                  variant="outline" 
                  className="w-full sm:w-auto"
                >
                  Manage My Job Listings
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ClipboardList className="mr-2 h-5 w-5" />
                  Applications
                </CardTitle>
                <CardDescription>
                  Review candidate applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate("/applications/review")} 
                  className="w-full sm:w-auto"
                >
                  Review Applications
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">{unreadCount}</Badge>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'candidate':
      default:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Job Opportunities
                </CardTitle>
                <CardDescription>
                  Browse available job listings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate("/jobs")} 
                  className="w-full sm:w-auto"
                >
                  Browse Available Jobs
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ClipboardList className="mr-2 h-5 w-5" />
                  My Applications
                </CardTitle>
                <CardDescription>
                  Track your job applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate("/applications")} 
                  className="w-full sm:w-auto"
                >
                  View My Applications
                </Button>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-1 animate-fade-up">
      {renderSidebar()}
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome to SalesMan</h2>
            <p className="text-muted-foreground">
              {userData?.role === 'candidate' ? 'Find your next opportunity' : 
               userData?.role === 'manager' ? 'Manage your hiring process efficiently' :
               'Administer the hiring platform'}
            </p>
          </div>

          {/* Welcome Card */}
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Home</CardTitle>
              <CardDescription>
                {isLoading 
                  ? "Loading..." 
                  : userData 
                    ? `Welcome back, ${userData.fullName || userData.email}` 
                    : "Welcome to your dashboard"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : (
                <div>
                  <p className="text-muted-foreground mb-2">
                    You are currently logged in as a <span className="font-semibold capitalize">{userData?.role || 'candidate'}</span>.
                  </p>
                  {renderDashboardContent()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
