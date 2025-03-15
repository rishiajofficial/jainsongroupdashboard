import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, FileQuestion } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface VideoCardProps {
  video: any;
}

export const VideoCard = ({ video }: VideoCardProps) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  
  const handlePlayClick = () => {
    navigate(`/training/video/${video.id}`);
  };
  
  const handleGoToQuiz = () => {
    navigate(`/training/video/${video.id}?quiz=true`);
  };

  const getThumbnail = () => {
    if (video.thumbnail_url) return video.thumbnail_url;
    
    if (video.video_url?.includes('youtube.com') || video.video_url?.includes('youtu.be')) {
      let videoId = '';
      
      if (video.video_url.includes('youtube.com/watch?v=')) {
        videoId = video.video_url.split('v=')[1];
      } else if (video.video_url.includes('youtu.be/')) {
        videoId = video.video_url.split('youtu.be/')[1];
      }
      
      if (videoId) {
        const ampersandIndex = videoId.indexOf('&');
        if (ampersandIndex !== -1) {
          videoId = videoId.substring(0, ampersandIndex);
        }
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
    }
    
    return '/placeholder.svg';
  };

  const getProgressText = () => {
    const progress = video.progress;
    
    if (!progress) return 'Not started';
    
    if (progress.completed) {
      if (video.has_quiz && !progress.quiz_completed) {
        return 'Video completed, quiz pending';
      }
      return 'Completed';
    }
    
    if (progress.watched_percentage > 0) {
      return `${progress.watched_percentage}% watched`;
    }
    
    return 'Not started';
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div 
        className="relative h-48 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handlePlayClick}
      >
        <img 
          src={getThumbnail()} 
          alt={video.title} 
          className="w-full h-full object-cover"
        />
        
        {isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity">
            <Play className="h-12 w-12 text-white" />
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex flex-wrap gap-1 mb-1">
          <Badge variant="outline">{video.category || "Uncategorized"}</Badge>
          {video.has_quiz && (
            <Badge variant="secondary">Has Quiz</Badge>
          )}
        </div>
        <CardTitle className="text-lg line-clamp-1">{video.title}</CardTitle>
      </CardHeader>
      
      <CardContent className="pb-2 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {video.description || "No description provided"}
        </p>
        
        {video.progress && (
          <div className="mt-auto">
            <div className="flex justify-between items-center text-xs mb-1">
              <span>{getProgressText()}</span>
              <span>{video.progress.watched_percentage}%</span>
            </div>
            <Progress value={video.progress.watched_percentage} className="h-1.5" />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0 flex space-x-2">
        <Button 
          className="flex-1" 
          size="sm"
          onClick={handlePlayClick}
        >
          <Play className="h-4 w-4 mr-2" /> Watch
        </Button>
        
        {video.has_quiz && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleGoToQuiz}
          >
            <FileQuestion className="h-4 w-4 mr-2" /> Quiz
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
