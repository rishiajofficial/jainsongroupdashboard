
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, ClipboardCheck, Map, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDashboardSettings } from "@/contexts/DashboardSettingsContext";
import { supabase } from "@/integrations/supabase/client";

interface ProfileData {
  fullName: string;
  email: string;
}

function CandidateStatsWidget() {
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    pendingAssessments: 0,
    completedAssessments: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        // Get applications statistics
        const { data: applicationsData, error: applicationsError } = await supabase
          .from('applications')
          .select('status')
          .eq('candidate_id', session.user.id);
          
        if (applicationsError) throw applicationsError;
        
        const totalApps = applicationsData?.length || 0;
        const pendingApps = applicationsData?.filter(app => app.status === 'pending').length || 0;
        
        // Get assessment statistics
        const { data: assessmentsData, error: assessmentsError } = await supabase
          .from('candidate_assessments')
          .select('status')
          .eq('candidate_id', session.user.id);
          
        if (assessmentsError) throw assessmentsError;
        
        const pendingAssessments = assessmentsData?.filter(
          assessment => assessment.status === 'assigned' || assessment.status === 'in_progress'
        ).length || 0;
        
        const completedAssessments = assessmentsData?.filter(
          assessment => assessment.status === 'completed'
        ).length || 0;
        
        setStats({
          totalApplications: totalApps,
          pendingApplications: pendingApps,
          pendingAssessments,
          completedAssessments
        });
      } catch (error) {
        console.error("Error fetching candidate stats:", error);
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
          <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalApplications}</div>
          <p className="text-xs text-muted-foreground mt-1">
            All jobs you've applied to
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
          <CardTitle className="text-sm font-medium">Pending Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingAssessments}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Assessments to complete
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Completed Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completedAssessments}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Assessments you've finished
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function CandidateDashboard({ userData }: { userData: ProfileData | null }) {
  const navigate = useNavigate();
  const { isWidgetVisible } = useDashboardSettings();

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      {isWidgetVisible('jobs_overview', 'candidate') && <CandidateStatsWidget />}
      
      {/* Job Opportunities Section */}
      {isWidgetVisible('quick_actions', 'candidate') && (
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
      )}
      
      {/* My Applications Section */}
      {isWidgetVisible('applications_stats', 'candidate') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardCheck className="mr-2 h-5 w-5" />
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
      )}
      
      {/* My Assessments Section */}
      {isWidgetVisible('assessment_stats', 'candidate') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardCheck className="mr-2 h-5 w-5" />
              My Assessments
            </CardTitle>
            <CardDescription>
              Take and view your assigned assessments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate("/assessments/candidate")} 
              className="w-full sm:w-auto"
            >
              View My Assessments
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Shop Visit Tracking Section */}
      {isWidgetVisible('visits_stats', 'candidate') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Map className="mr-2 h-5 w-5" />
              Shop Visit Tracking
            </CardTitle>
            <CardDescription>
              Record your shop visits and sales pitches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate("/salesperson-tracker")} 
              className="w-full sm:w-auto"
            >
              Track Shop Visits
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
