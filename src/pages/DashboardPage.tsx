
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SideNav } from "@/components/ui/dashboard/SideNav";
import { Dashboard } from "@/components/ui/Dashboard";
import { Header } from "@/components/ui/Header";
import { toast } from "sonner";
import { DashboardSettingsProvider } from "@/contexts/DashboardSettingsContext";
import { PageAccessProvider } from "@/contexts/PageAccessContext";

// This is the canonical UserRole type used throughout the application
// It matches the user_role enum in the Supabase database
export type UserRole = 'candidate' | 'salesperson' | 'manager' | 'admin';

const DashboardPage = () => {
  const [userRole, setUserRole] = useState<UserRole>('candidate');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No session found, redirecting to login");
          navigate("/login");
          return;
        }
        
        // Get user profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          toast.error("Failed to load profile data");
          return;
        }
        
        setUserRole(profileData?.role || 'candidate');
      } catch (error) {
        console.error("Dashboard error:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [navigate]);

  return (
    <PageAccessProvider>
      <DashboardSettingsProvider>
        <div className="min-h-screen flex">
          <SideNav role={userRole} />
          <div className="flex-1">
            <Header />
            <Dashboard />
          </div>
        </div>
      </DashboardSettingsProvider>
    </PageAccessProvider>
  );
};

export default DashboardPage;
