
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { SideNav } from "@/components/ui/dashboard/SideNav";
import { Button } from "@/components/ui/button";
import { CategoryTabs } from "@/components/training/CategoryTabs";
import { useTrainingVideos } from "@/hooks/useTrainingVideos";

const CATEGORIES = [
  "All",
  "Sales Techniques",
  "Product Knowledge",
  "Customer Service",
  "Compliance",
  "Leadership",
  "Technical Skills",
  "Onboarding",
  "General"
];

export default function TrainingVideos() {
  const navigate = useNavigate();
  const { 
    role, 
    isLoading, 
    selectedCategory, 
    setSelectedCategory, 
    filteredVideos 
  } = useTrainingVideos();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <SideNav role={role as any} />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold tracking-tight">Training Videos</h1>
              {role === 'manager' && (
                <Button onClick={() => navigate('/training/manage')}>
                  Manage Training
                </Button>
              )}
            </div>
            
            <CategoryTabs 
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              filteredVideos={filteredVideos}
              isLoading={isLoading}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
