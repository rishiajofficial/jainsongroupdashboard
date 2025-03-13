import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/ui/Header";
import { SideNav } from "@/components/ui/dashboard/SideNav";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, BarChart3, Bell } from "lucide-react";

// Create a consistent UserRole type that includes 'salesperson'
export type UserRole = 'candidate' | 'salesperson' | 'manager' | 'admin';

interface RecentActivity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'application' | 'job' | 'assessment' | 'visit';
}

const DashboardPage = () => {
  const [userRole, setUserRole] = useState<UserRole>('candidate');
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
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
          fetchRecentActivities(profile.role as UserRole, session.user.id);
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

  const fetchRecentActivities = async (role: UserRole, userId: string) => {
    try {
      let activities: RecentActivity[] = [];
      
      // Different queries based on user role
      if (role === 'candidate') {
        // Fetch recent applications
        const { data: applications } = await supabase
          .from('applications')
          .select('id, status, created_at, jobs(title)')
          .eq('candidate_id', userId)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (applications) {
          applications.forEach(app => {
            activities.push({
              id: app.id,
              title: `Application ${app.status}`,
              description: `Your application for ${app.jobs?.title || 'a job'} is ${app.status}`,
              timestamp: app.created_at,
              type: 'application'
            });
          });
        }
        
        // Fetch recent assessments
        const { data: assessments } = await supabase
          .from('assessments')
          .select('id, status, created_at, assessment_templates(title)')
          .eq('candidate_id', userId)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (assessments) {
          assessments.forEach(assessment => {
            activities.push({
              id: assessment.id,
              title: `Assessment ${assessment.status}`,
              description: `Your assessment for ${assessment.assessment_templates?.title || 'a job'} is ${assessment.status}`,
              timestamp: assessment.created_at,
              type: 'assessment'
            });
          });
        }
      } else if (role === 'salesperson') {
        // Fetch recent shop visits
        const { data: visits } = await supabase
          .from('shop_visits')
          .select('id, shop_name, status, created_at')
          .eq('salesperson_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (visits) {
          visits.forEach(visit => {
            activities.push({
              id: visit.id,
              title: `Shop Visit ${visit.status}`,
              description: `Visit to ${visit.shop_name} is ${visit.status}`,
              timestamp: visit.created_at,
              type: 'visit'
            });
          });
        }
      } else if (role === 'manager' || role === 'admin') {
        // Fetch recent applications for managers
        const { data: applications } = await supabase
          .from('applications')
          .select('id, status, created_at, jobs(title)')
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (applications) {
          applications.forEach(app => {
            activities.push({
              id: app.id,
              title: `New Application`,
              description: `New application for ${app.jobs?.title || 'a job'} received`,
              timestamp: app.created_at,
              type: 'application'
            });
          });
        }
        
        // For managers, fetch recent shop visits from salespeople
        if (role === 'manager') {
          const { data: visits } = await supabase
            .from('shop_visits')
            .select('id, shop_name, status, created_at, salesperson_id')
            .order('created_at', { ascending: false })
            .limit(5);
            
          if (visits) {
            for (const visit of visits) {
              const { data: salesperson } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', visit.salesperson_id)
                .single();
                
              activities.push({
                id: visit.id,
                title: `Salesperson Visit`,
                description: `${salesperson?.full_name || 'A salesperson'} visited ${visit.shop_name}`,
                timestamp: visit.created_at,
                type: 'visit'
              });
            }
          }
        }
        
        // For admins, fetch pending manager approvals
        if (role === 'admin') {
          const { data: approvals } = await supabase
            .from('manager_approvals')
            .select('id, status, created_at, manager_id')
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(5);
            
          if (approvals) {
            for (const approval of approvals) {
              const { data: manager } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', approval.manager_id)
                .single();
                
              activities.push({
                id: approval.id,
                title: `Pending Approval`,
                description: `${manager?.full_name || 'Someone'} is waiting for manager approval`,
                timestamp: approval.created_at,
                type: 'application'
              });
            }
          }
        }
      }
      
      // Sort all activities by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivities(activities.slice(0, 10)); // Show 10 most recent activities
      
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </main>
      </div>
    );
  }

  // Format the date for activities
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <SideNav role={userRole} />
        <main className="flex-1 p-6">
          <h2 className="text-3xl font-bold tracking-tight mb-6">Welcome to Jainson Group</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {userRole === 'candidate' ? 'Applications' : 
                   userRole === 'salesperson' ? 'Shop Visits' : 
                   userRole === 'manager' ? 'Active Jobs' : 'Platform Users'}
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userRole === 'candidate' ? '5' : 
                   userRole === 'salesperson' ? '12' : 
                   userRole === 'manager' ? '8' : '124'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {userRole === 'candidate' ? '+2 this month' :
                   userRole === 'salesperson' ? '+5 this week' :
                   userRole === 'manager' ? '2 new applications' : 
                   '+15 from last month'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {userRole === 'candidate' ? 'Pending Assessments' :
                   userRole === 'salesperson' ? 'Success Rate' :
                   userRole === 'manager' ? 'Candidates' :
                   'Approval Requests'}
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userRole === 'candidate' ? '2' :
                   userRole === 'salesperson' ? '68%' :
                   userRole === 'manager' ? '24' :
                   '5'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {userRole === 'candidate' ? 'Due this week' :
                   userRole === 'salesperson' ? '+8% from last month' :
                   userRole === 'manager' ? '5 in interview stage' :
                   'Waiting for your action'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {userRole === 'candidate' ? 'Time Since Application' :
                   userRole === 'salesperson' ? 'Time in Field' :
                   userRole === 'manager' ? 'Avg. Response Time' :
                   'System Uptime'}
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userRole === 'candidate' ? '3 days' :
                   userRole === 'salesperson' ? '18 hrs' :
                   userRole === 'manager' ? '1.5 days' :
                   '99.9%'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {userRole === 'candidate' ? 'For senior sales role' :
                   userRole === 'salesperson' ? 'This week' :
                   userRole === 'manager' ? 'To applicant inquiries' :
                   'Last 30 days'}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest notifications and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivities.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">No recent activity to display</p>
              ) : (
                <div className="space-y-6">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex justify-between items-start border-b border-border pb-4 last:border-0 last:pb-0">
                      <div>
                        <h4 className="font-medium text-sm">{activity.title}</h4>
                        <p className="text-muted-foreground text-sm mt-1">{activity.description}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(activity.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;
