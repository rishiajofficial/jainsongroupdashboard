
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { SideNav } from "@/components/ui/dashboard/SideNav";
import { Button } from "@/components/ui/button";
import { CategoryTabs } from "@/components/training/CategoryTabs";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, BookOpen, Trophy } from "lucide-react";
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
    filteredVideos,
    trainingStats 
  } = useTrainingVideos();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <SideNav role={role as any} />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold tracking-tight">Training Videos</h1>
              {role === 'manager' && (
                <Button onClick={() => navigate('/training/manage')}>
                  Manage Training
                </Button>
              )}
            </div>
            
            {/* Training Progress Stats */}
            <div className="bg-card rounded-lg border p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold flex items-center">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Your Training Progress
                </h2>
                <div className="text-sm text-muted-foreground">
                  {trainingStats.completedVideos} of {trainingStats.totalVideos} completed
                </div>
              </div>
              
              <div className="space-y-1">
                <Progress 
                  value={trainingStats.overallProgress} 
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{trainingStats.overallProgress}% complete</span>
                  
                  <div className="flex gap-4">
                    <span className="flex items-center">
                      <BookOpen className="h-3 w-3 mr-1" />
                      {trainingStats.totalVideos} Videos
                    </span>
                    <span className="flex items-center">
                      <Trophy className="h-3 w-3 mr-1" />
                      {trainingStats.completedVideos} Completed
                    </span>
                  </div>
                </div>
              </div>
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
