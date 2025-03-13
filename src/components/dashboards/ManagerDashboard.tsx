
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, ClipboardList, Map, GraduationCap, BarChart3, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePageAccess } from "@/contexts/PageAccessContext";
import { useDashboardSettings } from "@/contexts/DashboardSettingsContext";
import { supabase } from "@/integrations/supabase/client";

interface ProfileData {
  fullName: string;
  email: string;
}

function ManagerStatsWidget() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    pendingApplications: 0,
    totalEmployees: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        // Get jobs statistics - for jobs created by this manager
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('status')
          .eq('created_by', session.user.id);
          
        if (jobsError) throw jobsError;
        
        const totalJobs = jobsData?.length || 0;
        const activeJobs = jobsData?.filter(job => job.status === 'active').length || 0;
        
        // Get pending applications for jobs created by this manager
        const { data: applicationsData, error: applicationsError } = await supabase
          .from('applications')
          .select('applications.id, jobs!inner(created_by)')
          .eq('status', 'pending')
          .eq('jobs.created_by', session.user.id);
          
        if (applicationsError) throw applicationsError;
        
        const pendingApplications = applicationsData?.length || 0;
        
        // Get number of employees (salespeople) assigned to this manager
        const { data: employeesData, error: employeesError } = await supabase
          .from('salesperson_managers')
          .select('salesperson_id')
          .eq('manager_id', session.user.id);
          
        if (employeesError) throw employeesError;
        
        const totalEmployees = employeesData?.length || 0;
        
        setStats({
          totalJobs,
          activeJobs,
          pendingApplications,
          totalEmployees
        });
      } catch (error) {
        console.error("Error fetching manager stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Job Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalJobs}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Jobs you've created
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeJobs}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Currently accepting applications
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingApplications}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Applications awaiting review
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalEmployees}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Salespeople on your team
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function ManagerDashboard({ userData }: { userData: ProfileData | null }) {
  const navigate = useNavigate();
  const { accessRules, isLoading: isPageAccessLoading } = usePageAccess();
  const { isWidgetVisible } = useDashboardSettings();

  // Check if a page is accessible (enabled)
  const isPageAccessible = (path: string) => {
    if (isPageAccessLoading) return true; // Show all during loading
    const rule = accessRules.find(r => r.page_path === path);
    return rule && rule.is_enabled;
  };

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      {isWidgetVisible('jobs_overview', 'manager') && <ManagerStatsWidget />}
      
      {/* Manage Job Listings Section */}
      {isWidgetVisible('quick_actions', 'manager') && isPageAccessible("/jobs/manage") && (
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
      )}
      
      {/* Applications Section */}
      {isWidgetVisible('applications_stats', 'manager') && isPageAccessible("/applications/review") && (
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
      )}
      
      {/* Candidate Reviews Section */}
      {isWidgetVisible('assessment_stats', 'manager') && (
        isPageAccessible("/assessments/templates") || isPageAccessible("/assessments/assign")
      ) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="mr-2 h-5 w-5" />
              Candidate Assessments
            </CardTitle>
            <CardDescription>
              Create and assign assessments to candidates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPageAccessible("/assessments/templates") && (
              <Button 
                onClick={() => navigate("/assessments/templates")} 
                className="w-full sm:w-auto"
              >
                Manage Assessment Templates
              </Button>
            )}
            {isPageAccessible("/assessments/assign") && (
              <Button 
                onClick={() => navigate("/assessments/assign")} 
                variant="outline"
                className="w-full sm:w-auto"
              >
                Assign Assessments
              </Button>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Sales Tracking Section */}
      {isWidgetVisible('visits_stats', 'manager') && isPageAccessible("/salesperson-dashboard") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Map className="mr-2 h-5 w-5" />
              Sales Tracking
            </CardTitle>
            <CardDescription>
              Monitor salesperson activities in the field
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate("/salesperson-dashboard")} 
              className="w-full sm:w-auto"
            >
              View Sales Tracking Dashboard
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Training Management Section */}
      {isWidgetVisible('training_stats', 'manager') && (
        isPageAccessible("/training/manage") || isPageAccessible("/training/performance")
      ) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <GraduationCap className="mr-2 h-5 w-5" />
              Training Management
            </CardTitle>
            <CardDescription>
              Manage training videos and quizzes for employees
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPageAccessible("/training/manage") && (
              <Button 
                onClick={() => navigate("/training/manage")} 
                className="w-full sm:w-auto"
              >
                Manage Training Content
              </Button>
            )}
            {isPageAccessible("/training/performance") && (
              <Button 
                onClick={() => navigate("/training/performance")} 
                variant="outline"
                className="w-full sm:w-auto"
              >
                View Training Performance
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
