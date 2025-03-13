
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useSalespersonManagers, useUsersByRole } from "@/hooks/useDashboardWidgets";
import { UserRole } from "@/pages/DashboardPage";
import { useDashboardSettings } from "@/contexts/DashboardSettingsContext";

interface DashboardProps {
  userData: {
    fullName: string;
    email: string;
    role: UserRole;
  };
}

export function ManagerDashboard({ userData }: DashboardProps) {
  const { isWidgetVisible } = useDashboardSettings();
  const [userId, setUserId] = useState<string>("");
  const [applications, setApplications] = useState<any[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const { data: salespeople, loading: salespeopleLoading } = useUsersByRole('salesperson');
  const { data: team, loading: teamLoading } = useSalespersonManagers(userId);

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
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setApplications(data || []);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setApplicationsLoading(false);
      }
    };

    fetchApplications();
  }, [userId]);

  const applicationStats = {
    total: applications.length,
    pending: applications.filter(app => app.status === "pending").length,
    review: applications.filter(app => app.status === "review").length,
    interview: applications.filter(app => app.status === "interview").length,
    offered: applications.filter(app => app.status === "offered").length,
    rejected: applications.filter(app => app.status === "rejected").length,
  };

  const teamStats = {
    total: salespeople?.length || 0,
    managed: team?.length || 0
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {isWidgetVisible('jobs_overview', userData.role) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Applications Overview</CardTitle>
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
                  <span className="font-semibold">{applicationStats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="font-semibold">{applicationStats.pending}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">In Review</span>
                  <span className="font-semibold">{applicationStats.review}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interview Stage</span>
                  <span className="font-semibold">{applicationStats.interview}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Offered</span>
                  <span className="font-semibold">{applicationStats.offered}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isWidgetVisible('visits_stats', userData.role) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Team Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {salespeopleLoading || teamLoading ? (
              <div className="h-32 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Salespeople</span>
                  <span className="font-semibold">{teamStats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">My Team</span>
                  <span className="font-semibold">{teamStats.managed}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isWidgetVisible('pending_approvals', userData.role) && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {applicationsLoading ? (
              <div className="h-32 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : applications.length > 0 ? (
              <div className="space-y-4">
                {applications.slice(0, 5).map((app) => (
                  <div key={app.id} className="border-b pb-2 last:border-0">
                    <div className="font-medium">Application #{app.id.substring(0, 8)}</div>
                    <div className="text-sm text-muted-foreground">
                      Status: <span className="capitalize">{app.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">No recent applications</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
