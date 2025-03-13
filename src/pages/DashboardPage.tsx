import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SideNav } from "@/components/ui/dashboard/SideNav";
import { Dashboard } from "@/components/ui/Dashboard";
import { Header } from "@/components/ui/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, BarChart3, Bell } from "lucide-react";
import { toast } from "sonner";

// This is the canonical UserRole type used throughout the application
// It matches the user_role enum in the Supabase database
export type UserRole = 'candidate' | 'salesperson' | 'manager' | 'admin';

interface Application {
  id: string;
  status: string;
  job_id: string;
  candidate_id: string;
  jobs: {
    title: string;
  };
}

interface Visit {
  id: string;
  shop_name: string;
  status: string;
  salesperson_id: string;
  created_at: string;
  salesperson_name?: string;
}

interface Approval {
  id: string;
  status: string;
  manager_id: string;
  created_at: string;
  manager_name?: string;
}

const DashboardPage = () => {
  const [userRole, setUserRole] = useState<UserRole>('candidate');
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<Approval[]>([]);
  const [recentVisits, setRecentVisits] = useState<Visit[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
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
        
        // Fetch different data based on user role
        if (profileData?.role === 'manager' || profileData?.role === 'admin') {
          // For managers and admins - get pending applications
          const { data: applications } = await supabase
            .from('applications')
            .select('id, status, job_id, candidate_id, jobs!inner(title)')
            .eq('status', 'pending');
            
          // For managers and admins - get pending shop visits
          const { data: visitData } = await supabase
            .from('shop_visits')
            .select('id, shop_name, status, salesperson_id, created_at');
            
          // Separately fetch salespeople profiles to avoid relationship errors
          if (visitData && visitData.length > 0) {
            const salespersonIds = [...new Set(visitData.map(visit => visit.salesperson_id))];
            
            const { data: salespeopleData } = await supabase
              .from('profiles')
              .select('id, full_name, email')
              .in('id', salespersonIds);
              
            // Map salespeople data to visits
            const mappedVisits = visitData.map(visit => {
              const salesperson = salespeopleData?.find(s => s.id === visit.salesperson_id);
              return {
                ...visit,
                salesperson_name: salesperson?.full_name || salesperson?.email || 'Unknown'
              };
            });
            
            setRecentVisits(mappedVisits);
          }
          
          // For admins only - get pending manager approvals
          if (profileData?.role === 'admin') {
            const { data: approvals } = await supabase
              .from('manager_approvals')
              .select('id, status, manager_id, created_at');
              
            if (approvals && approvals.length > 0) {
              const managerIds = [...new Set(approvals.map(approval => approval.manager_id))];
              
              const { data: managersData } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .in('id', managerIds);
                
              // Map manager data to approvals
              const mappedApprovals = approvals.map(approval => {
                const manager = managersData?.find(m => m.id === approval.manager_id);
                return {
                  ...approval,
                  manager_name: manager?.full_name || manager?.email || 'Unknown'
                };
              });
              
              setPendingApprovals(mappedApprovals);
            }
          }
        }
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
    <div className="min-h-screen flex">
      <SideNav role={userRole} />
      <div className="flex-1">
        <Header />
        <Dashboard />
      </div>
    </div>
  );
};

export default DashboardPage;
