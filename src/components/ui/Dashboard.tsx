
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ManagerDashboard } from "@/components/dashboards/ManagerDashboard";
import { CandidateDashboard } from "@/components/dashboards/CandidateDashboard";
import { SalespersonDashboard } from "@/components/dashboards/SalespersonDashboard";
import { AdminDashboard } from "@/components/dashboards/AdminDashboard";
import { SideNav } from "@/components/ui/dashboard/SideNav";

type UserRole = 'candidate' | 'salesperson' | 'manager' | 'admin';

interface ProfileData {
  fullName: string;
  email: string;
  role: UserRole;
}

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<ProfileData | null>(null);

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
        return <AdminDashboard userData={userData} />;
        
      case 'manager':
        return <ManagerDashboard userData={userData} />;
        
      case 'salesperson':
        return <SalespersonDashboard userData={userData} />;
        
      case 'candidate':
      default:
        return <CandidateDashboard userData={userData} />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex animate-fade-up">
      {userData && <SideNav role={userData.role} />}
      <div className="flex-1 p-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome to HiringDash</h2>
          <p className="text-muted-foreground">
            {userData?.role === 'candidate' ? 'Find your next opportunity' : 
             userData?.role === 'salesperson' ? 'Track your sales visits' :
             userData?.role === 'manager' ? 'Manage your hiring process efficiently' :
             'Administer the hiring platform'}
          </p>
        </div>

        {/* Welcome Card */}
        <Card className="mt-6">
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
                <p className="text-muted-foreground mb-4">
                  You are currently logged in as a <span className="font-semibold capitalize">{userData?.role || 'candidate'}</span>.
                </p>
                {renderRoleBasedContent()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
