import { Header } from "@/components/ui/Header";
import { SideNav } from "@/components/ui/dashboard/SideNav";
import { SalespersonDashboard } from "./SalespersonDashboard";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <SideNav role="salesperson" />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight mb-8">
              Dashboard
            </h1>
            <SalespersonDashboard />
          </div>
        </main>
      </div>
    </div>
  );
}
