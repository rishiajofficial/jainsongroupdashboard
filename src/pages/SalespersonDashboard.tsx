
import { useState, useEffect } from "react";
import { Header } from "@/components/ui/Header";
import { SideNav } from "@/components/ui/dashboard/SideNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Download, User, Map } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { Json } from "@/integrations/supabase/types";
import { UserRole } from "@/pages/DashboardPage";

// Helper function to format dates consistently across the component
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options);
};

interface SupabaseShopVisit {
  id: string;
  location: Json;
  audio_url?: string | null;
  created_at: string;
  salesperson_id: string;
  shop_name: string;
  notes?: string | null;
  status: 'pending' | 'completed' | 'failed';
  updated_at: string;
}

interface ShopVisit {
  id: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  audio_url?: string;
  created_at: string;
  salesperson_id: string;
  shop_name: string;
  notes?: string;
  status: 'pending' | 'completed' | 'failed';
}

interface Salesperson {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

interface DailyStats {
  date: string;
  totalVisits: number;
  completedVisits: number;
  hasRecordings: number;
  salespeople: {
    [id: string]: {
      name: string;
      visits: number;
    }
  }
}

const convertSupabaseVisit = (visit: SupabaseShopVisit): ShopVisit => {
  let locationObj = typeof visit.location === 'string' 
    ? JSON.parse(visit.location as string) 
    : visit.location;
  
  return {
    id: visit.id,
    location: {
      latitude: locationObj.latitude,
      longitude: locationObj.longitude,
      address: locationObj.address
    },
    audio_url: visit.audio_url || undefined,
    created_at: visit.created_at,
    salesperson_id: visit.salesperson_id,
    shop_name: visit.shop_name,
    notes: visit.notes || undefined,
    status: visit.status
  };
};

const SalespersonDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [salespeople, setSalespeople] = useState<Salesperson[]>([]);
  const [recentVisits, setRecentVisits] = useState<ShopVisit[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today');
  const [role, setRole] = useState<UserRole>('manager');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          description: "Authentication required. Please log in to view the dashboard",
          variant: "destructive",
        });
        return;
      }
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', sessionData.session.user.id)
        .single();
        
      if (profileData?.role !== 'manager' && profileData?.role !== 'admin') {
        toast({
          description: "Access denied. Only managers can access this dashboard",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }
      
      const { data: peopleData, error: peopleError } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('role', ['salesperson']);
        
      if (peopleError) throw peopleError;
      setSalespeople(peopleData as Salesperson[]);
      
      const today = new Date();
      let startDate = new Date();
      
      if (dateRange === 'today') {
        startDate.setHours(0, 0, 0, 0);
      } else if (dateRange === 'week') {
        startDate.setDate(today.getDate() - 7);
      } else if (dateRange === 'month') {
        startDate.setMonth(today.getMonth() - 1);
      }
      
      const startDateStr = startDate.toISOString();
      const endDateStr = today.toISOString();
      
      const { data: visitsData, error: visitsError } = await supabase
        .from('shop_visits')
        .select(`
          id,
          location,
          audio_url,
          created_at,
          salesperson_id,
          shop_name,
          notes,
          status
        `)
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr)
        .order('created_at', { ascending: false });
        
      if (visitsError) throw visitsError;
      
      const convertedVisits = visitsData 
        ? visitsData.map(item => convertSupabaseVisit(item as SupabaseShopVisit)) 
        : [];
      
      setRecentVisits(convertedVisits);
      
      const stats: DailyStats[] = [];
      const dateMap = new Map<string, DailyStats>();
      
      if (convertedVisits.length > 0) {
        convertedVisits.forEach((visit: ShopVisit) => {
          const date = new Date(visit.created_at).toISOString().split('T')[0];
          
          if (!dateMap.has(date)) {
            dateMap.set(date, {
              date,
              totalVisits: 0,
              completedVisits: 0,
              hasRecordings: 0,
              salespeople: {}
            });
          }
          
          const dayStat = dateMap.get(date)!;
          dayStat.totalVisits++;
          
          if (visit.status === 'completed') {
            dayStat.completedVisits++;
          }
          
          if (visit.audio_url) {
            dayStat.hasRecordings++;
          }
          
          if (!dayStat.salespeople[visit.salesperson_id]) {
            const salesperson = peopleData.find(p => p.id === visit.salesperson_id);
            dayStat.salespeople[visit.salesperson_id] = {
              name: salesperson ? salesperson.full_name || salesperson.email : 'Unknown',
              visits: 0
            };
          }
          
          dayStat.salespeople[visit.salesperson_id].visits++;
        });
      }
      
      dateMap.forEach(stat => stats.push(stat));
      stats.sort((a, b) => b.date.localeCompare(a.date));
      
      setDailyStats(stats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = () => {
    try {
      let csvContent = "Date,Salesperson,Shop Name,Status,Has Recording\n";
      
      recentVisits.forEach(visit => {
        const salesperson = salespeople.find(p => p.id === visit.salesperson_id);
        const salespersonName = salesperson ? salesperson.full_name || salesperson.email : 'Unknown';
        const date = new Date(visit.created_at).toLocaleDateString();
        
        csvContent += `${date},"${salespersonName}","${visit.shop_name}",${visit.status},${visit.audio_url ? 'Yes' : 'No'}\n`;
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `salesperson-visits-${dateRange}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        description: "Could not export visit data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <SideNav role={role} />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Salesperson Dashboard</h1>
                <p className="text-muted-foreground">Monitor field activities and recordings</p>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={exportData}
                  disabled={isLoading || recentVisits.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
                
                <Button asChild>
                  <Link to="/salesperson-tracker">
                    <Map className="mr-2 h-4 w-4" />
                    New Shop Visit
                  </Link>
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="today" onValueChange={(value) => setDateRange(value as any)}>
              <TabsList>
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="week">Last 7 Days</TabsTrigger>
                <TabsTrigger value="month">Last 30 Days</TabsTrigger>
              </TabsList>
              
              <TabsContent value="today" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatsCards data={dailyStats} isLoading={isLoading} />
                </div>
              </TabsContent>
              
              <TabsContent value="week" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatsCards data={dailyStats} isLoading={isLoading} />
                </div>
              </TabsContent>
              
              <TabsContent value="month" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatsCards data={dailyStats} isLoading={isLoading} />
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="space-y-6">
              <h2 className="text-xl font-semibold tracking-tight">Recent Shop Visits</h2>
              
              {isLoading ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : recentVisits.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No shop visits recorded in this period
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {recentVisits.map((visit) => {
                    const salesperson = salespeople.find(p => p.id === visit.salesperson_id);
                    
                    return (
                      <Card key={visit.id}>
                        <CardHeader className="pb-2">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <CardTitle className="text-lg flex items-center">
                              {visit.shop_name}
                              {visit.status === 'completed' && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Completed
                                </span>
                              )}
                              {visit.status === 'pending' && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  In Progress
                                </span>
                              )}
                              {visit.status === 'failed' && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Cancelled
                                </span>
                              )}
                            </CardTitle>
                            <CardDescription>
                              {formatDate(visit.created_at)}
                            </CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="text-sm space-y-2">
                              <div className="flex items-start gap-2">
                                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <span>
                                  <strong>Salesperson:</strong> {salesperson ? salesperson.full_name || salesperson.email : 'Unknown'}
                                </span>
                              </div>
                              
                              <div className="flex items-start gap-2">
                                <Map className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <span>
                                  <strong>Location:</strong> Lat: {visit.location.latitude.toFixed(6)}, 
                                  Long: {visit.location.longitude.toFixed(6)}
                                </span>
                              </div>
                            </div>
                            
                            {visit.audio_url && (
                              <div>
                                <h4 className="text-sm font-medium mb-1">Sales Pitch Recording</h4>
                                <audio controls src={visit.audio_url} className="w-full h-8" />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const StatsCards = ({ data, isLoading }: { data: DailyStats[]; isLoading: boolean }) => {
  const totalVisits = data.reduce((sum, day) => sum + day.totalVisits, 0);
  const completedVisits = data.reduce((sum, day) => sum + day.completedVisits, 0);
  const recordingsCount = data.reduce((sum, day) => sum + day.hasRecordings, 0);
  
  const salespeople: {[id: string]: { name: string, visits: number }} = {};
  
  data.forEach(day => {
    Object.entries(day.salespeople).forEach(([id, info]) => {
      if (!salespeople[id]) {
        salespeople[id] = { name: info.name, visits: 0 };
      }
      salespeople[id].visits += info.visits;
    });
  });
  
  const topSalespeople = Object.entries(salespeople)
    .sort((a, b) => b[1].visits - a[1].visits)
    .slice(0, 5);
  
  if (isLoading) {
    return (
      <>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Total Visits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recordings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </>
    );
  }
  
  return (
    <>
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Total Visits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalVisits}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {data.length > 0 ? `Last updated: ${formatDate(data[0].date)}` : 'No data available'}
          </div>
        </CardContent>
      </Card>
      
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Completion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {totalVisits > 0 ? Math.round((completedVisits / totalVisits) * 100) : 0}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {completedVisits} of {totalVisits} visits completed
          </div>
        </CardContent>
      </Card>
      
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Recordings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{recordingsCount}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {recordingsCount > 0 
              ? `${Math.round((recordingsCount / completedVisits) * 100)}% of completed visits`
              : 'No recordings available'}
          </div>
        </CardContent>
      </Card>
      
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Top Salespeople</CardTitle>
        </CardHeader>
        <CardContent>
          {topSalespeople.length > 0 ? (
            <div className="space-y-4">
              {topSalespeople.map(([id, info]) => (
                <div key={id} className="flex justify-between items-center">
                  <span className="font-medium">{info.name}</span>
                  <span className="text-sm px-2 py-1 bg-primary/10 rounded">
                    {info.visits} {info.visits === 1 ? 'visit' : 'visits'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground p-4">
              No salesperson data available
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default SalespersonDashboard;
