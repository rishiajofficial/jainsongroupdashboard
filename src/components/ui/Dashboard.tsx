
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardSidebar } from "./dashboard/DashboardSidebar";
import { CandidateDashboard } from "./dashboard/CandidateDashboard";
import { ManagerDashboard } from "./dashboard/ManagerDashboard";
import { AdminDashboard } from "./dashboard/AdminDashboard";
import { useUserProfile } from "@/hooks/useUserProfile";

export function Dashboard() {
  const { isLoading, userData } = useUserProfile();
  const navigate = useNavigate();

  const renderDashboardContent = () => {
    if (!userData) return null;

    switch (userData.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'manager':
        return <ManagerDashboard />;
      case 'candidate':
      default:
        return <CandidateDashboard />;
    }
  };

  return (
    <div className="flex flex-1 animate-fade-up">
      <DashboardSidebar userData={userData} />
      
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
