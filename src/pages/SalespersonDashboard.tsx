
import { Header } from "@/components/ui/Header";
import { SideNav } from "@/components/ui/dashboard/SideNav";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Map } from "lucide-react";
import { Link } from "react-router-dom";
import { StatsCards } from "@/components/salesperson-dashboard/StatsCards";
import { RecentVisits } from "@/components/salesperson-dashboard/RecentVisits";
import { useSalespersonDashboard } from "@/hooks/useSalespersonDashboard";

const SalespersonDashboard = () => {
  const {
    isLoading,
    salespeople,
    recentVisits,
    dailyStats,
    dateRange,
    setDateRange,
    role,
    exportData
  } = useSalespersonDashboard();

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
              <RecentVisits 
                visits={recentVisits} 
                salespeople={salespeople}
                isLoading={isLoading}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SalespersonDashboard;
