
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Video, FileQuestion, ToggleLeft, ToggleRight, Pencil } from "lucide-react";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VideoCardListProps {
  videos: any[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  onEditQuiz: (videoId: string) => void;
}

const TRAINING_CATEGORIES = [
  "Sales Techniques",
  "Product Knowledge",
  "Customer Service",
  "Compliance",
  "Leadership",
  "Technical Skills",
  "Onboarding",
  "General"
];

export const VideoCardList = ({ videos, loading, onRefresh, onEditQuiz }: VideoCardListProps) => {
  const { toast } = useToast();
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");

  const handleDeleteVideo = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
      return;
    }
    
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

  const handleEditVideo = (video: any) => {
    setSelectedVideo(video);
    setEditTitle(video.title);
    setEditDescription(video.description || "");
    setEditCategory(video.category || "General");
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedVideo) return;
    
    try {
      const { error } = await supabase
        .from('training_videos')
        .update({
          title: editTitle,
          description: editDescription,
          category: editCategory
        })
        .eq('id', selectedVideo.id);
        
      if (error) throw error;
      
      toast({
        description: "Video details updated successfully",
      });
      
      setIsEditing(false);
      onRefresh();
    } catch (error) {
      console.error('Error updating video details:', error);
      toast({
        description: "Failed to update video details",
        variant: "destructive",
      });
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
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Quiz</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.map((video, index) => (
              <TableRow key={video.id}>
                <TableCell className="font-medium">{index + 1}</TableCell>
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
                      onClick={() => handleEditVideo(video)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit Details
                    </Button>
                    
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

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Video Details</DialogTitle>
            <DialogDescription>
              Update the information for this training video
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter video title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {TRAINING_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Enter video description"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Helper component for labeling fields
function Label({ htmlFor, children }: { htmlFor: string, children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      {children}
    </label>
  );
}
