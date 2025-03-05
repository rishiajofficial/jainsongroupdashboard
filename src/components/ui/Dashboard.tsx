
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User, Briefcase, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";

type UserRole = 'candidate' | 'manager' | 'admin';

interface ProfileData {
  fullName: string;
  email: string;
  role: UserRole;
}

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<ProfileData | null>(null);
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

  const renderRoleBasedContent = () => {
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
                    onClick={() => navigate("/admin/approvals")} 
                    className="w-full sm:w-auto"
                  >
                    View Manager Approval Requests
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
    <div className="space-y-8 animate-fade-up">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome to HiringDash</h2>
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
              {renderRoleBasedContent()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
