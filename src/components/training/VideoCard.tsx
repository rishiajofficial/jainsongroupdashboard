
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, GraduationCap, Check, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { TrainingVideo } from "@/hooks/useTrainingVideos";

interface VideoCardProps {
  video: TrainingVideo;
}

export function VideoCard({ video }: VideoCardProps) {
  const navigate = useNavigate();
  
  const handleWatchVideo = () => {
    navigate(`/training/video/${video.id}`);
  };
  
  const handleTakeQuiz = () => {
    navigate(`/training/video/${video.id}?quiz=true`);
  };
  
  const progress = video.progress?.watched_percentage || 0;
  const isCompleted = video.progress?.completed || false;
  const isQuizCompleted = video.progress?.quiz_completed || false;
  const hasQuiz = video.has_quiz;
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="line-clamp-2">{video.title}</CardTitle>
          <Badge variant="outline">{video.category || "Uncategorized"}</Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {video.description || "No description available"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div 
          className="relative rounded-md h-32 mb-4 bg-cover bg-center flex items-center justify-center" 
          style={{ 
            backgroundImage: video.thumbnail_url 
              ? `url(${video.thumbnail_url})` 
              : undefined,
            backgroundColor: video.thumbnail_url ? undefined : 'hsl(var(--muted))'
          }}
        >
          {isCompleted ? (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Check className="h-12 w-12 text-green-500" />
              <span className="sr-only">Completed</span>
            </div>
          ) : (
            <Button 
              size="icon" 
              className="rounded-full" 
              variant="secondary"
              onClick={handleWatchVideo}
            >
              <PlayCircle className="h-8 w-8" />
              <span className="sr-only">Play</span>
            </Button>
          )}
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4">
        <div className="w-full flex flex-col gap-2">
          <Button onClick={handleWatchVideo}>
            <PlayCircle className="h-4 w-4 mr-2" />
            {progress > 0 && !isCompleted ? "Continue" : "Watch Video"}
          </Button>
          
          {hasQuiz && (
            <Button 
              variant={isQuizCompleted ? "outline" : "secondary"}
              onClick={handleTakeQuiz}
              disabled={progress < 50 && !isQuizCompleted}
            >
              {isQuizCompleted ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Quiz Completed
                </>
              ) : progress < 50 ? (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Watch More to Unlock Quiz
                </>
              ) : (
                <>
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Take Quiz
                </>
              )}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
