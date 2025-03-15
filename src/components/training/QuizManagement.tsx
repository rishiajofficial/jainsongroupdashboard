import { useState, useEffect } from "react";
import { FileQuestion, Edit, ArrowLeft, Video, Pencil, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

interface QuizManagementProps {
  onEditQuiz: (videoId: string) => void;
}

export const QuizManagement = ({ onEditQuiz }: QuizManagementProps) => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('training_videos')
          .select('*, training_quiz_questions(count)')
          .order('order_number', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Format data to include question count
        const videosWithQuestionCount = data?.map(video => ({
          ...video,
          question_count: video.training_quiz_questions?.[0]?.count || 0
        })) || [];
        
        setVideos(videosWithQuestionCount);
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
          <CardTitle>Quiz Management</CardTitle>
          <CardDescription>
            Create and manage quizzes for training videos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-7 bg-muted rounded animate-pulse w-full mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No.</TableHead>
                  <TableHead>Video Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quiz Status</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell className="font-medium">
                      {video.order_number || '-'}
                    </TableCell>
                    <TableCell>{video.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{video.category || "Uncategorized"}</Badge>
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
                    <TableCell>{video.question_count}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant={video.has_quiz ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleAddOrEditQuiz(video.id)}
                      >
                        {video.has_quiz ? (
                          <>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Quiz
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4 mr-2" />
                            Add Quiz
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
