
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useCandidateAssessments } from "@/hooks/useDashboardWidgets";
import { UserRole } from "@/pages/DashboardPage";
import { useDashboardSettings } from "@/contexts/DashboardSettingsContext";

interface DashboardProps {
  userData: {
    fullName: string;
    email: string;
    role: UserRole;
  };
}

export function CandidateDashboard({ userData }: DashboardProps) {
  const { isWidgetVisible } = useDashboardSettings();
  const [userId, setUserId] = useState<string>("");
  const [applications, setApplications] = useState<any[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const { data: assessments, loading: assessmentsLoading } = useCandidateAssessments(userId);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          setUserId(session.user.id);
        }
      } catch (error) {
        console.error("Error getting session:", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchApplications = async () => {
      try {
        const { data, error } = await supabase
          .from("applications")
          .select("*, jobs:job_id(title)")
          .eq("candidate_id", userId);

        if (error) throw error;
        setApplications(data || []);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setApplicationsLoading(false);
      }
    };

    const fetchJobs = async () => {
      try {
        const { data, error } = await supabase
          .from("jobs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) throw error;
        setJobs(data || []);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setJobsLoading(false);
      }
    };

    fetchApplications();
    fetchJobs();
  }, [userId]);

  if (!userId) {
    return <div className="text-center text-muted-foreground">Loading dashboard...</div>;
  }

  const jobsOverview = applications.reduce(
    (acc, app) => {
      if (app.status === "submitted") acc.submitted++;
      else if (app.status === "review") acc.under_review++;
      else if (app.status === "interview") acc.interviews++;
      else if (app.status === "offered") acc.offers++;
      else if (app.status === "rejected") acc.rejected++;
      return acc;
    },
    { submitted: 0, under_review: 0, interviews: 0, offers: 0, rejected: 0 }
  );

  const assessmentStats = {
    total: assessments?.length || 0,
    completed: assessments?.filter((a: any) => a.status === "completed").length || 0,
    pending: assessments?.filter((a: any) => a.status === "assigned").length || 0,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {isWidgetVisible('jobs_overview', userData.role) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Job Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {applicationsLoading ? (
              <div className="h-32 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Applications</span>
                  <span className="font-semibold">{applications.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Under Review</span>
                  <span className="font-semibold">{jobsOverview.under_review}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interviews</span>
                  <span className="font-semibold">{jobsOverview.interviews}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Offers</span>
                  <span className="font-semibold">{jobsOverview.offers}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isWidgetVisible('assessment_stats', userData.role) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            {assessmentsLoading ? (
              <div className="h-32 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Assessments</span>
                  <span className="font-semibold">{assessmentStats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-semibold">{assessmentStats.completed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="font-semibold">{assessmentStats.pending}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isWidgetVisible('recent_activities', userData.role) && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Recent Job Postings</CardTitle>
          </CardHeader>
          <CardContent>
            {jobsLoading ? (
              <div className="h-32 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : jobs.length > 0 ? (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job.id} className="border-b pb-2 last:border-0">
                    <div className="font-medium">{job.title}</div>
                    <div className="text-sm text-muted-foreground">{job.location}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">No recent job postings</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
