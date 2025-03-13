import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { convertSupabaseVisit, SupabaseShopVisit } from "@/utils/salesperson-dashboard";
import { UserRole } from "@/pages/DashboardPage";

export interface Salesperson {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

export interface ShopVisit {
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

export interface DailyStats {
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

export const useSalespersonDashboard = () => {
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
        .eq('role', 'salesperson');
        
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
            const salesperson = peopleData?.find(p => p.id === visit.salesperson_id);
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

  return {
    isLoading,
    salespeople,
    recentVisits,
    dailyStats,
    dateRange,
    setDateRange,
    role,
    exportData
  };
};
