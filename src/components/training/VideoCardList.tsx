
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Video, FileQuestion } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VideoCardListProps {
  videos: any[];
  loading: boolean;
  onRefresh: () => Promise<void>;
}

export const VideoCardList = ({ videos, loading, onRefresh }: VideoCardListProps) => {
  const { toast } = useToast();

  const handleDeleteVideo = async (id: string) => {
    try {
      // First, delete associated quiz questions and options
      // Delete quiz options for the video
      const { data: quizQuestions } = await supabase
        .from('training_quiz_questions')
        .select('id')
        .eq('video_id', id);
      
      if (quizQuestions && quizQuestions.length > 0) {
        const questionIds = quizQuestions.map(q => q.id);
        
        // Delete quiz options linked to those questions
        const { error: quizOptionsError } = await supabase
          .from('training_quiz_options')
          .delete()
          .in('question_id', questionIds);
          
        if (quizOptionsError) throw quizOptionsError;
        
        // Delete quiz questions
        const { error: quizQuestionsError } = await supabase
          .from('training_quiz_questions')
          .delete()
          .eq('video_id', id);
          
        if (quizQuestionsError) throw quizQuestionsError;
      }
      
      // Delete progress records
      const { error: progressError } = await supabase
        .from('training_progress')
        .delete()
        .eq('video_id', id);
        
      if (progressError) throw progressError;
      
      // Finally, delete the video
      const { error: videoError } = await supabase
        .from('training_videos')
        .delete()
        .eq('id', id);
        
      if (videoError) throw videoError;
      
      // Update the UI
      toast({
        description: "Training video deleted successfully",
      });
      
      // Refresh the list
      onRefresh();
    } catch (error) {
      console.error('Error deleting training video:', error);
      toast({
        description: "Failed to delete training video",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
            </CardContent>
            <CardFooter>
              <div className="h-9 bg-muted rounded w-1/4"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <Card className="text-center p-4">
        <CardHeader>
          <CardTitle className="flex justify-center">
            <Video className="h-10 w-10 mb-2" />
          </CardTitle>
          <CardTitle>No Training Videos</CardTitle>
          <CardDescription>
            Add your first training video to get started
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map((video) => (
        <Card key={video.id} className="flex flex-col h-full">
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <CardTitle className="text-lg">{video.title}</CardTitle>
              <div className="flex flex-wrap space-x-2">
                <Badge variant="outline">{video.category || "Uncategorized"}</Badge>
                {video.has_quiz && (
                  <Badge variant="secondary" className="flex items-center">
                    <FileQuestion className="h-3 w-3 mr-1" />
                    Quiz
                  </Badge>
                )}
              </div>
            </div>
            <CardDescription>
              Added on {new Date(video.created_at).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow pb-2">
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {video.description || "No description provided"}
            </p>
            <div className="text-xs">
              <div className="font-medium">Video URL:</div>
              <div className="text-muted-foreground break-all truncate">{video.video_url}</div>
            </div>
          </CardContent>
          <CardFooter className="pt-2 flex justify-end space-x-2">
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => handleDeleteVideo(video.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
