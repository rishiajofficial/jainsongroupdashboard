import { useState } from "react";
import { Header } from "@/components/ui/Header";
import { SideNav } from "@/components/ui/dashboard/SideNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Image } from "lucide-react";
import { TrainingVideoForm } from "@/components/training/TrainingVideoForm";
import { VideoCardList } from "@/components/training/VideoCardList";
import { QuizManagement } from "@/components/training/QuizManagement";
import { useTrainingManager } from "@/hooks/useTrainingManager";
import { QuizForm } from "@/components/training/quiz/QuizForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export default function TrainingManage() {
  const { role, videos, loading, refreshVideos } = useTrainingManager();
  const [activeTab, setActiveTab] = useState<string>("videos");
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [showQuizForm, setShowQuizForm] = useState<boolean>(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [existingQuestions, setExistingQuestions] = useState<any[]>([]);
  const [generatingThumbnails, setGeneratingThumbnails] = useState<boolean>(false);
  const { toast } = useToast();

  const handleFormComplete = async () => {
    await refreshVideos();
    setShowAddForm(false);
  };

  const handleEditQuiz = async (videoId: string) => {
    setSelectedVideoId(videoId);
    
    try {
      const { data, error } = await supabase
        .from('training_quiz_questions')
        .select(`
          id,
          question,
          training_quiz_options (
            id,
            option_text,
            is_correct
          )
        `)
        .eq('video_id', videoId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      if (data && data.length > 0) {
        const formattedQuestions = data.map(q => ({
          question: q.question,
          options: q.training_quiz_options.map(o => ({
            option_text: o.option_text,
            is_correct: o.is_correct
          }))
        }));
        
        setExistingQuestions(formattedQuestions);
      } else {
        setExistingQuestions([]);
      }
      
      setShowQuizForm(true);
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      toast({
        description: "Could not load existing quiz questions",
        variant: "destructive",
      });
    }
  };

  const handleQuizFormComplete = async () => {
    await refreshVideos();
    setShowQuizForm(false);
    setSelectedVideoId(null);
    setExistingQuestions([]);
  };

  const generateThumbnails = async () => {
    setGeneratingThumbnails(true);
    
    try {
      const videosWithoutThumbnails = videos.filter(video => !video.thumbnail_url);
      
      if (videosWithoutThumbnails.length === 0) {
        toast({
          description: "All videos already have thumbnails.",
        });
        setGeneratingThumbnails(false);
        return;
      }
      
      toast({
        description: `Generating thumbnails for ${videosWithoutThumbnails.length} videos...`,
      });
      
      for (const video of videosWithoutThumbnails) {
        const videoUrl = new URL(video.video_url);
        const thumbnailUrl = `${videoUrl.origin}${videoUrl.pathname}/thumbnail`;
        
        const { error } = await supabase
          .from('training_videos')
          .update({ thumbnail_url: thumbnailUrl })
          .eq('id', video.id);
          
        if (error) {
          console.error(`Error updating thumbnail for video ${video.id}:`, error);
        }
      }
      
      await refreshVideos();
      
      toast({
        description: `Successfully generated thumbnails for ${videosWithoutThumbnails.length} videos.`,
      });
    } catch (error) {
      console.error('Error generating thumbnails:', error);
      toast({
        description: "Failed to generate thumbnails",
        variant: "destructive",
      });
    } finally {
      setGeneratingThumbnails(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <SideNav role={role as any} />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold tracking-tight">Manage Training</h1>
              {!showAddForm && !showQuizForm && activeTab === "videos" && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={generateThumbnails} 
                    disabled={generatingThumbnails || loading || videos.length === 0}
                    className="mr-2"
                  >
                    <Image className="h-4 w-4 mr-2" />
                    Generate Thumbnails
                  </Button>
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Video
                  </Button>
                </div>
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
            ) : showQuizForm && selectedVideoId ? (
              <div className="mb-6">
                <QuizForm 
                  videoId={selectedVideoId}
                  existingQuestions={existingQuestions}
                  onComplete={handleQuizFormComplete}
                  onCancel={() => {
                    setShowQuizForm(false);
                    setSelectedVideoId(null);
                    setExistingQuestions([]);
                  }}
                />
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="videos">Training Videos</TabsTrigger>
                  <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="videos" className="space-y-6">
                  <VideoCardList 
                    videos={videos} 
                    loading={loading}
                    onRefresh={refreshVideos}
                    onEditQuiz={handleEditQuiz}
                  />
                </TabsContent>
                
                <TabsContent value="quizzes" className="space-y-6">
                  <QuizManagement onEditQuiz={handleEditQuiz} />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
