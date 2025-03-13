
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { SideNav } from "@/components/ui/dashboard/SideNav";
import { toast } from "sonner";

// Create a consistent UserRole type that includes 'salesperson'
export type UserRole = 'candidate' | 'salesperson' | 'manager' | 'admin';

const DashboardPage = () => {
  const [userRole, setUserRole] = useState<UserRole>('candidate');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          console.error("Auth check error:", error);
          navigate("/login");
          return;
        }
        
        // Fetch user profile to get role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (profile?.role) {
          setUserRole(profile.role as UserRole);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Dashboard auth check error:", error);
        toast.error("Authentication Error - Please sign in to access the dashboard");
        navigate("/login");
      }
    };
    
    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <SideNav role={userRole} />
        <main className="flex-1 p-6">
          <h2 className="text-3xl font-bold tracking-tight">Welcome to HiringDash</h2>
          <p className="text-muted-foreground mb-6">
            {userRole === 'candidate' ? 'Find your next opportunity' : 
             userRole === 'salesperson' ? 'Track your sales visits' :
             userRole === 'manager' ? 'Manage your hiring process efficiently' :
             'Administer the hiring platform'}
          </p>
          {/* Dashboard content will be directly determined by the route */}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default DashboardPage;
