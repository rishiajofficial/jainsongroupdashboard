
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, ClipboardCheck, Map, GraduationCap, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserRole } from "@/pages/DashboardPage";
import { useState, useEffect } from "react";
import { useDashboardSettings } from "@/contexts/DashboardSettingsContext";
import { supabase } from "@/integrations/supabase/client";

interface ProfileData {
  fullName: string;
  email: string;
  role?: UserRole;
}

function SalespersonStatsWidget() {
  const [stats, setStats] = useState({
    totalVisits: 0,
    completedVisits: 0,
    trainingProgress: 0,
    quizScores: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        // Get shop visits statistics
        const { data: visitsData, error: visitsError } = await supabase
          .from('shop_visits')
          .select('status')
          .eq('salesperson_id', session.user.id);
          
        if (visitsError) throw visitsError;
        
        const totalVisits = visitsData?.length || 0;
        const completedVisits = visitsData?.filter(
          visit => visit.status === 'completed'
        ).length || 0;
        
        // Get training statistics
        const { data: trainingData, error: trainingError } = await supabase
          .from('training_video_progress')
          .select('progress_percentage, video_id')
          .eq('user_id', session.user.id);
          
        if (trainingError) throw trainingError;
        
        // Calculate average training progress
        const trainingProgress = trainingData?.length 
          ? trainingData.reduce((sum, item) => sum + (item.progress_percentage || 0), 0) / trainingData.length
          : 0;
        
        // Get quiz scores
        const { data: quizData, error: quizError } = await supabase
          .from('training_quiz_results')
          .select('score, total_questions')
          .eq('user_id', session.user.id);
          
        if (quizError) throw quizError;
        
        // Calculate average quiz score
        const quizScores = quizData?.length 
          ? quizData.reduce((sum, item) => sum + ((item.score / item.total_questions) * 100 || 0), 0) / quizData.length
          : 0;
        
        setStats({
          totalVisits,
          completedVisits,
          trainingProgress,
          quizScores
        });
      } catch (error) {
        console.error("Error fetching salesperson stats:", error);
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
          <CardTitle className="text-sm font-medium">Total Shop Visits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalVisits}</div>
          <p className="text-xs text-muted-foreground mt-1">
            All recorded shop visits
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalVisits > 0 ? Math.round((stats.completedVisits / stats.totalVisits) * 100) : 0}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.completedVisits} of {stats.totalVisits} visits completed
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Training Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(stats.trainingProgress)}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            Average video completion
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Quiz Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(stats.quizScores)}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            Average quiz performance
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function SalespersonDashboard({ userData }: { userData: ProfileData | null }) {
  const navigate = useNavigate();
  const { isWidgetVisible } = useDashboardSettings();

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      {isWidgetVisible('visits_stats', 'salesperson') && <SalespersonStatsWidget />}
      
      {/* Shop Visit Tracking Section */}
      {isWidgetVisible('quick_actions', 'salesperson') && (
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
      
      {/* My Stats Section */}
      {isWidgetVisible('visits_stats', 'salesperson') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              My Stats
            </CardTitle>
            <CardDescription>
              View your sales performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate("/salesperson-stats")} 
              variant="outline" 
              className="w-full sm:w-auto"
            >
              View My Statistics
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Training Videos Section */}
      {isWidgetVisible('training_stats', 'salesperson') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <GraduationCap className="mr-2 h-5 w-5" />
              Training Videos
            </CardTitle>
            <CardDescription>
              Access training materials and complete quizzes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate("/training")} 
              className="w-full sm:w-auto"
            >
              View Training Videos
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
