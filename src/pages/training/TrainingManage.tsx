import { useState } from "react";
import { Header } from "@/components/ui/Header";
import { SideNav } from "@/components/ui/dashboard/SideNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TrainingVideoForm } from "@/components/training/TrainingVideoForm";
import { VideoCardList } from "@/components/training/VideoCardList";
import { QuizManagement } from "@/components/training/QuizManagement";
import { useTrainingManager } from "@/hooks/useTrainingManager";

export default function TrainingManage() {
  const { role, videos, loading, refreshVideos } = useTrainingManager();
  const [activeTab, setActiveTab] = useState<string>("videos");
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const handleFormComplete = async () => {
    await refreshVideos();
    setShowAddForm(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <SideNav role={role as any} />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold tracking-tight">Manage Training</h1>
              {!showAddForm && (
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Video
                </Button>
              )}
            </div>
            
            {showAddForm ? (
              <div className="mb-6">
                <TrainingVideoForm onComplete={handleFormComplete} />
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="videos">Training Videos</TabsTrigger>
                  <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="videos" className="space-y-6">
                  <VideoCardList 
                    videos={videos} 
                    loading={loading}
                    onRefresh={refreshVideos}
                  />
                </TabsContent>
                
                <TabsContent value="quizzes" className="space-y-6">
                  <QuizManagement />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
