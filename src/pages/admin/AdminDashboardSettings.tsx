
import { Header } from "@/components/ui/Header";
import { SideNav } from "@/components/ui/dashboard/SideNav";

export default function AdminDashboardSettings() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <SideNav role="admin" />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">
              Admin Dashboard Settings
            </h1>
            <p>Configure dashboard settings here.</p>
          </div>
        </main>
      </div>
    </div>
  );
}
