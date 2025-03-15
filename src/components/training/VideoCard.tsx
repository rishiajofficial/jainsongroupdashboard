
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Video, BookOpen, CheckCircle, XCircle, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    description: string | null;
    video_url: string;
    thumbnail_url: string | null;
    has_quiz: boolean | null;
    created_at: string;
    created_by: string;
    category: string;
    progress?: {
      watched_percentage: number;
      completed: boolean;
      quiz_completed: boolean;
      quiz_score: number | null;
    };
  };
}

export const VideoCard = ({ video }: VideoCardProps) => {
  const navigate = useNavigate();
  
  const handleWatchVideo = () => {
    navigate(`/training/video/${video.id}`);
  };

  const handleTakeQuiz = () => {
    navigate(`/training/video/${video.id}?quiz=true`);
  };

  return (
    <Card key={video.id} className="flex flex-col h-full">
      <div className="relative">
        <div 
          className="h-48 bg-muted rounded-t-lg overflow-hidden"
          style={video.thumbnail_url ? {
            backgroundImage: `url(${video.thumbnail_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : {}}
        >
          {/* Default thumbnail if no thumbnail URL provided */}
          {!video.thumbnail_url && 
            <div className="w-full h-full flex items-center justify-center">
              <Video className="h-16 w-16 text-muted-foreground" />
            </div>
          }
        </div>
        <Button 
          variant="secondary" 
          size="icon" 
          className="absolute right-3 bottom-3 rounded-full" 
          onClick={handleWatchVideo}
        >
          <Play className="h-5 w-5" />
        </Button>
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{video.title}</CardTitle>
          <Badge variant="outline">{video.category || "General"}</Badge>
        </div>
        <CardDescription>
          {new Date(video.created_at).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {video.description || "No description provided"}
        </p>
        {/* Show progress bar */}
        <div className="space-y-2 mt-4">
          <div className="flex justify-between text-xs">
            <span>Progress</span>
            <span>{video.progress?.watched_percentage || 0}%</span>
          </div>
          <Progress value={video.progress?.watched_percentage || 0} />
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between items-center">
        <div className="flex gap-2 items-center text-sm">
          {video.progress?.completed ? (
            <Badge variant="secondary" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Completed
            </Badge>
          ) : (
            <Badge variant="outline" className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" /> In Progress
            </Badge>
          )}
        </div>
        {video.has_quiz && (
          <div>
            {video.progress?.quiz_completed ? (
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Quiz: {video.progress.quiz_score || 0}%
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1">
                <XCircle className="h-3 w-3" /> Quiz: Not Taken
              </Badge>
            )}
          </div>
        )}
      </CardFooter>
      <div className="px-6 pb-4 flex flex-col gap-2">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleWatchVideo}
        >
          {video.progress?.completed ? "Review Video" : "Watch Video"}
        </Button>
        
        {/* Add Go to Quiz button if the video has a quiz */}
        {video.has_quiz && video.progress?.watched_percentage >= 50 && !video.progress?.quiz_completed && (
          <Button
            className="w-full"
            onClick={handleTakeQuiz}
          >
            <GraduationCap className="mr-2 h-4 w-4" /> Go to Quiz
          </Button>
        )}
      </div>
    </Card>
  );
};
