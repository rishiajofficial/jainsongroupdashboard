
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { Dashboard } from "@/components/ui/Dashboard";

const DashboardPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Dashboard />
      </main>
      <Footer />
    </div>
  );
}

export default DashboardPage;
