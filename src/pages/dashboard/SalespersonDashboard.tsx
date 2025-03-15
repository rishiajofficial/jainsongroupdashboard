import { Header } from "@/components/ui/Header";
import { SideNav } from "@/components/ui/dashboard/SideNav";
import { DashboardHeader } from "@/components/ui/dashboard/DashboardHeader";
import { RecentActivity } from "@/components/ui/dashboard/RecentActivity";
import { PerformanceSummary } from "@/components/ui/dashboard/PerformanceSummary";
import { useAuth } from "@/hooks/useAuth";

export default function SalespersonDashboard() {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <SideNav role={role as any} />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <DashboardHeader name={user?.name || "Salesperson"} />
            <PerformanceSummary />
            <RecentActivity />
          </div>
        </main>
      </div>
    </div>
  );
}
