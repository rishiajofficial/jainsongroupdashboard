
import { useState, useEffect } from "react";
import { FileQuestion, Edit, ArrowLeft, Video } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QuizManagementProps {
  onEditQuiz: (videoId: string) => void;
}

export const QuizManagement = ({ onEditQuiz }: QuizManagementProps) => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const { toast } = useToast();

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

  const handleAddOrEditQuiz = (videoId: string) => {
    onEditQuiz(videoId);
  };

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
            <p className="text-sm text-muted-foreground">Select a video to add or edit a quiz:</p>
            <div className="grid gap-4 md:grid-cols-2">
              {videos.map(video => (
                <div key={video.id} className="flex flex-col p-4 border rounded-md shadow-sm h-full">
                  <div className="flex-1">
                    <h3 className="font-medium text-lg mb-1">{video.title}</h3>
                    <div className="flex items-center mb-3 space-x-2">
                      <Badge variant="outline">{video.category || "Uncategorized"}</Badge>
                      {video.has_quiz && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <FileQuestion className="h-3 w-3" />
                          Has Quiz
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {video.description || "No description available"}
                    </p>
                  </div>
                  <div className="mt-auto flex justify-end">
                    <Button 
                      variant={video.has_quiz ? "outline" : "default"}
                      size="sm"
                      className="w-full"
                      onClick={() => handleAddOrEditQuiz(video.id)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {video.has_quiz ? "Edit Quiz" : "Add Quiz"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
