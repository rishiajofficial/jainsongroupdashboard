
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileQuestion, Edit, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { QuizForm } from "./quiz/QuizForm";

export const QuizManagement = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedVideoTitle, setSelectedVideoTitle] = useState<string>("");
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [existingQuestions, setExistingQuestions] = useState<any[]>([]);
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

  const fetchExistingQuestions = async (videoId: string) => {
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
      
      // Transform data for QuizForm
      const formattedQuestions = data.map(q => ({
        question: q.question,
        options: q.training_quiz_options.map(o => ({
          option_text: o.option_text,
          is_correct: o.is_correct
        }))
      }));
      
      setExistingQuestions(formattedQuestions);
      return formattedQuestions;
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      toast({
        description: "Could not load existing quiz questions",
        variant: "destructive",
      });
      return [];
    }
  };

  const handleAddOrEditQuiz = async (videoId: string, videoTitle: string) => {
    setSelectedVideo(videoId);
    setSelectedVideoTitle(videoTitle);
    
    // For existing quizzes, load the questions first
    const videoWithQuiz = videos.find(v => v.id === videoId && v.has_quiz);
    if (videoWithQuiz) {
      await fetchExistingQuestions(videoId);
    } else {
      setExistingQuestions([]);
    }
    
    setShowQuizForm(true);
  };

  const handleQuizFormComplete = () => {
    setShowQuizForm(false);
    setSelectedVideo(null);
    setSelectedVideoTitle("");
    setExistingQuestions([]);
    
    // Refresh the video list to update has_quiz status
    const fetchVideos = async () => {
      try {
        const { data, error } = await supabase
          .from('training_videos')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setVideos(data || []);
        
        toast({
          description: "Quiz saved successfully",
        });
      } catch (error) {
        console.error('Error refreshing videos:', error);
      }
    };
    
    fetchVideos();
  };

  if (showQuizForm && selectedVideo) {
    return (
      <div className="space-y-4">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setShowQuizForm(false);
              setSelectedVideo(null);
              setSelectedVideoTitle("");
              setExistingQuestions([]);
            }}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Videos
          </Button>
          <h2 className="text-xl font-semibold">
            {existingQuestions.length > 0 ? "Edit Quiz" : "Create Quiz"}: {selectedVideoTitle}
          </h2>
        </div>
        
        <QuizForm 
          videoId={selectedVideo} 
          existingQuestions={existingQuestions}
          onComplete={handleQuizFormComplete} 
          onCancel={() => {
            setShowQuizForm(false);
            setSelectedVideo(null);
            setSelectedVideoTitle("");
            setExistingQuestions([]);
          }}
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
            <p className="text-sm text-muted-foreground">Select a video to add or edit a quiz:</p>
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
                  onClick={() => handleAddOrEditQuiz(video.id, video.title)}
                >
                  <Edit className="h-4 w-4 mr-2" />
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
