
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/pages/DashboardPage";
import { useDashboardSettings } from "@/contexts/DashboardSettingsContext";
import { useTrainingProgress, useQuizResults } from "@/hooks/useDashboardWidgets";

interface DashboardProps {
  userData: {
    fullName: string;
    email: string;
    role: UserRole;
  };
}

export function SalespersonDashboard({ userData }: DashboardProps) {
  const { isWidgetVisible } = useDashboardSettings();
  const [userId, setUserId] = useState<string>("");
  const [shopVisits, setShopVisits] = useState<any[]>([]);
  const [visitsLoading, setVisitsLoading] = useState(true);
  const { data: trainingProgress, loading: progressLoading } = useTrainingProgress(userId);
  const { data: quizResults, loading: quizLoading } = useQuizResults(userId);

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

    const fetchShopVisits = async () => {
      try {
        const { data, error } = await supabase
          .from("shop_visits")
          .select("*")
          .eq("salesperson_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setShopVisits(data || []);
      } catch (error) {
        console.error("Error fetching shop visits:", error);
      } finally {
        setVisitsLoading(false);
      }
    };

    fetchShopVisits();
  }, [userId]);

  if (!userId) {
    return <div className="text-center text-muted-foreground">Loading dashboard...</div>;
  }

  // Calculate averages manually from the results
  const trainingStats = {
    total: trainingProgress?.length || 0,
    avgProgress: trainingProgress?.length 
      ? Math.round(trainingProgress.reduce((sum: number, item: any) => sum + item.progress_percentage, 0) / trainingProgress.length) 
      : 0
  };

  const quizStats = {
    total: quizResults?.length || 0,
    avgScore: quizResults?.length 
      ? Math.round(quizResults.reduce((sum: number, item: any) => sum + (item.score / item.total_questions * 100), 0) / quizResults.length) 
      : 0
  };

  const visitStats = {
    total: shopVisits.length,
    completed: shopVisits.filter(visit => visit.status === "completed").length,
    pending: shopVisits.filter(visit => visit.status === "pending").length,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {isWidgetVisible('visits_stats', userData.role) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Shop Visits</CardTitle>
          </CardHeader>
          <CardContent>
            {visitsLoading ? (
              <div className="h-32 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Visits</span>
                  <span className="font-semibold">{visitStats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-semibold">{visitStats.completed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="font-semibold">{visitStats.pending}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isWidgetVisible('training_stats', userData.role) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Training Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {progressLoading ? (
              <div className="h-32 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Training Videos</span>
                  <span className="font-semibold">{trainingStats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average Progress</span>
                  <span className="font-semibold">{trainingStats.avgProgress}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average Quiz Score</span>
                  <span className="font-semibold">{quizStats.avgScore}%</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isWidgetVisible('recent_activities', userData.role) && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Recent Shop Visits</CardTitle>
          </CardHeader>
          <CardContent>
            {visitsLoading ? (
              <div className="h-32 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : shopVisits.length > 0 ? (
              <div className="space-y-4">
                {shopVisits.slice(0, 5).map((visit) => (
                  <div key={visit.id} className="border-b pb-2 last:border-0">
                    <div className="font-medium">{visit.shop_name}</div>
                    <div className="text-sm text-muted-foreground">
                      Status: <span className="capitalize">{visit.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">No recent shop visits</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
