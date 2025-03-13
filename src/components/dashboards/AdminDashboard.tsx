
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Briefcase, Shield, Settings2, UserCog, LayoutDashboard, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDashboardSettings } from "@/contexts/DashboardSettingsContext";
import { UserRole } from "@/pages/DashboardPage";
import { supabase } from "@/integrations/supabase/client";

interface ProfileData {
  fullName: string;
  email: string;
  role?: UserRole;
}

// Stats widgets for Admin Dashboard
function AdminStatsWidgets() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    pendingApprovals: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        // Get total users count
        const { count: usersCount, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
          
        // Get total jobs count
        const { count: jobsCount, error: jobsError } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true });
          
        // Get total applications count
        const { count: applicationsCount, error: applicationsError } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true });
          
        // Get pending approvals count
        const { count: approvalsCount, error: approvalsError } = await supabase
          .from('manager_approvals')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
          
        setStats({
          totalUsers: usersCount || 0,
          totalJobs: jobsCount || 0,
          totalApplications: applicationsCount || 0,
          pendingApprovals: approvalsCount || 0
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-5 w-24 bg-muted rounded-md"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded-md"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <p className="text-xs text-muted-foreground mt-1">
            All registered platform users
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Job Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalJobs}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Active and inactive listings
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalApplications}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Total job applications
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Manager approvals pending
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminDashboard({ userData }: { userData: ProfileData | null }) {
  const navigate = useNavigate();
  const { isWidgetVisible } = useDashboardSettings();

  return (
    <div className="space-y-6">
      {/* Stats Section - conditionally rendered */}
      {isWidgetVisible('jobs_overview', 'admin') && <AdminStatsWidgets />}
      
      {/* System Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings2 className="mr-2 h-5 w-5" />
            System Configuration
          </CardTitle>
          <CardDescription>
            Configure system-wide settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={() => navigate("/admin/page-access")} 
              className="w-full justify-start"
            >
              <Shield className="mr-2 h-4 w-4" />
              Page Access Control
            </Button>
            
            <Button 
              onClick={() => navigate("/admin/dashboard-settings")} 
              className="w-full justify-start"
              variant="default"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard Widget Settings
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* User Management Section */}
      {isWidgetVisible('quick_actions', 'admin') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              Manage system users and approvals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={() => navigate("/admin/approvals")} 
                className="w-full justify-start"
                variant="outline"
              >
                <Shield className="mr-2 h-4 w-4" />
                Manager Approval Requests
              </Button>
              
              <Button 
                onClick={() => navigate("/admin/users")} 
                className="w-full justify-start"
                variant="outline"
              >
                <UserCog className="mr-2 h-4 w-4" />
                User Management
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Job Listings Section */}
      {isWidgetVisible('jobs_overview', 'admin') && (
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
              variant="outline"
            >
              View All Jobs
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Platform Stats Section */}
      {isWidgetVisible('applications_stats', 'admin') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Platform Statistics
            </CardTitle>
            <CardDescription>
              View overall platform metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate("/admin/stats")} 
              className="w-full sm:w-auto"
              variant="outline"
            >
              View Detailed Statistics
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
