
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Video, FileQuestion, ToggleLeft, ToggleRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface VideoCardListProps {
  videos: any[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  onEditQuiz: (videoId: string) => void;
}

export const VideoCardList = ({ videos, loading, onRefresh, onEditQuiz }: VideoCardListProps) => {
  const { toast } = useToast();
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);

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

  const handleToggleQuiz = async (id: string, currentState: boolean) => {
    setToggleLoading(id);
    try {
      const { error } = await supabase
        .from('training_videos')
        .update({ has_quiz: !currentState })
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        description: currentState 
          ? "Quiz disabled for this video" 
          : "Quiz enabled for this video",
      });
      
      onRefresh();
    } catch (error) {
      console.error('Error toggling quiz status:', error);
      toast({
        description: "Failed to update quiz status",
        variant: "destructive",
      });
    } finally {
      setToggleLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-16 bg-muted rounded animate-pulse"></div>
        <div className="h-16 bg-muted rounded animate-pulse"></div>
        <div className="h-16 bg-muted rounded animate-pulse"></div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <Video className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
        <h3 className="text-lg font-medium">No Training Videos</h3>
        <p className="text-sm text-muted-foreground">
          Add your first training video to get started
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Quiz</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {videos.map((video) => (
            <TableRow key={video.id}>
              <TableCell className="font-medium">{video.title}</TableCell>
              <TableCell>
                <Badge variant="outline">{video.category || "Uncategorized"}</Badge>
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {video.description || "No description provided"}
              </TableCell>
              <TableCell>
                {video.has_quiz ? (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <FileQuestion className="h-3 w-3" />
                    Has Quiz
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">No Quiz</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleToggleQuiz(video.id, !!video.has_quiz)}
                    disabled={toggleLoading === video.id}
                  >
                    {video.has_quiz ? (
                      <ToggleLeft className="h-4 w-4 mr-2" />
                    ) : (
                      <ToggleRight className="h-4 w-4 mr-2" />
                    )}
                    {video.has_quiz ? "Disable Quiz" : "Enable Quiz"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditQuiz(video.id)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {video.has_quiz ? "Edit Quiz" : "Add Quiz"}
                  </Button>
                  
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteVideo(video.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
