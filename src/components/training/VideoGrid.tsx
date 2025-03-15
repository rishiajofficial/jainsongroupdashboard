
import { Video } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { VideoCard } from "./VideoCard";

interface VideoGridProps {
  videos: any[];
  isLoading: boolean;
}

export const VideoGrid = ({ videos, isLoading }: VideoGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-muted rounded-t-lg"></div>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
            </CardHeader>
            <CardHeader>
              <div className="h-4 bg-muted rounded w-full"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <Card className="text-center p-6">
        <CardHeader>
          <CardTitle className="flex justify-center">
            <Video className="h-12 w-12 mb-2" />
          </CardTitle>
          <CardTitle>No Training Videos Found</CardTitle>
          <CardDescription>
            There are no training videos available in this category.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
};
