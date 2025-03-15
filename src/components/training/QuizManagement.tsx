
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileQuestion } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { QuizForm } from "./quiz/QuizForm";

export const QuizManagement = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('training_videos')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setVideos(data || []);
      } catch (error) {
        console.error('Error fetching videos:', error);
        toast({
          description: "Could not load training videos",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleAddQuiz = (videoId: string) => {
    setSelectedVideo(videoId);
    setShowQuizForm(true);
  };

  const handleQuizFormComplete = () => {
    setShowQuizForm(false);
    setSelectedVideo(null);
    toast({
      description: "Quiz created successfully",
    });
  };

  if (showQuizForm && selectedVideo) {
    return (
      <div className="space-y-4">
        <QuizForm 
          videoId={selectedVideo} 
          onComplete={handleQuizFormComplete} 
          onCancel={() => setShowQuizForm(false)}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-7 bg-muted rounded animate-pulse w-1/3"></div>
          <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz Management</CardTitle>
        <CardDescription>
          Create and manage quizzes for training videos
        </CardDescription>
      </CardHeader>
      <CardContent>
        {videos.length === 0 ? (
          <div className="text-center py-10">
            <FileQuestion className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No training videos available.</p>
            <p className="text-sm text-muted-foreground mt-1">Upload training videos first to create quizzes.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Select a video to add a quiz:</p>
            {videos.map(video => (
              <div key={video.id} className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <h3 className="font-medium">{video.title}</h3>
                  <div className="flex items-center mt-1 space-x-2">
                    <Badge variant="outline">{video.category || "Uncategorized"}</Badge>
                    {video.has_quiz && (
                      <Badge variant="secondary">Has Quiz</Badge>
                    )}
                  </div>
                </div>
                <Button 
                  variant={video.has_quiz ? "outline" : "default"}
                  size="sm"
                  onClick={() => handleAddQuiz(video.id)}
                >
                  <FileQuestion className="h-4 w-4 mr-2" />
                  {video.has_quiz ? "Edit Quiz" : "Add Quiz"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
