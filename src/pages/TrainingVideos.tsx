
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { SideNav } from "@/components/ui/dashboard/SideNav";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, CheckCircle, Video, Play, Clock, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TrainingVideos() {
  const [role, setRole] = useState('salesperson');
  const [isLoading, setIsLoading] = useState(true);
  const [trainingVideos, setTrainingVideos] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, any>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const { toast } = useToast();
  const navigate = useNavigate();
  const videoRefs = useRef<Record<string, HTMLVideoElement>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Get current user session
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          toast({
            description: "Please log in to access training videos",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }
        
        // Get user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', sessionData.session.user.id)
          .single();
          
        if (!profileData) {
          toast({
            description: "User profile not found",
            variant: "destructive",
          });
          return;
        }
        
        setRole(profileData.role);
        
        // Fetch training videos
        const { data: videos, error: videosError } = await supabase
          .from('training_videos')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (videosError) throw videosError;
        
        // Fetch user's progress
        const { data: progress, error: progressError } = await supabase
          .from('training_progress')
          .select('*')
          .eq('user_id', sessionData.session.user.id);
          
        if (progressError) throw progressError;
        
        // Format user progress data
        const progressMap: Record<string, any> = {};
        if (progress) {
          progress.forEach(item => {
            progressMap[item.video_id] = item;
          });
        }
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(videos?.map(video => video.category || 'Uncategorized'))
        );
        
        setTrainingVideos(videos || []);
        setUserProgress(progressMap);
        setCategories(uniqueCategories as string[]);
      } catch (error) {
        console.error('Error fetching training data:', error);
        toast({
          description: "Failed to load training videos",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  const getProgressBadge = (videoId: string) => {
    const progress = userProgress[videoId];
    
    if (!progress) {
      return <Badge variant="outline">Not Started</Badge>;
    }
    
    if (progress.completed) {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" /> Completed
        </Badge>
      );
    }
    
    if (progress.quiz_completed) {
      return (
        <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" /> Quiz Completed
        </Badge>
      );
    }
    
    return <Badge variant="secondary">In Progress</Badge>;
  };
  
  const getProgressPercentage = (videoId: string) => {
    const progress = userProgress[videoId];
    if (!progress) return 0;
    return progress.watched_percentage || 0;
  };

  const handleVideoLoad = (videoId: string) => {
    const videoRef = videoRefs.current[videoId];
    if (videoRef) {
      // Create canvas for thumbnail
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 180;
      const ctx = canvas.getContext('2d');
      
      // Set the current time to 1 second (to get a frame)
      videoRef.currentTime = 1;
      
      // When time updates, capture the frame
      videoRef.addEventListener('timeupdate', function onTimeUpdate() {
        if (ctx) {
          try {
            ctx.drawImage(videoRef, 0, 0, canvas.width, canvas.height);
            const thumbnailUrl = canvas.toDataURL('image/jpeg');
            
            // Update the video element's poster
            videoRef.poster = thumbnailUrl;
            
            // Store thumbnail in local storage to avoid CORS issues
            localStorage.setItem(`thumbnail_${videoId}`, thumbnailUrl);
          } catch (e) {
            console.error('Error generating thumbnail:', e);
          }
          
          // Remove listener after first capture
          videoRef.removeEventListener('timeupdate', onTimeUpdate);
        }
      }, { once: true });
    }
  };

  const getQuizStatus = (video: any) => {
    if (!video.has_quiz) return null;
    
    const progress = userProgress[video.id];
    if (!progress) return null;
    
    if (progress.quiz_completed) {
      return (
        <div className="text-xs text-green-500 mt-1 flex items-center">
          <CheckCircle className="h-3 w-3 mr-1" />
          Quiz completed with score: {progress.quiz_score}%
        </div>
      );
    }
    
    if (progress.watched_percentage >= 90) {
      return (
        <div className="text-xs text-blue-500 mt-1">
          Quiz available after watching
        </div>
      );
    }
    
    return (
      <div className="text-xs text-muted-foreground mt-1">
        Complete the video to unlock quiz
      </div>
    );
  };

  const filteredVideos = activeCategory === "all" 
    ? trainingVideos 
    : trainingVideos.filter(video => (video.category || "Uncategorized") === activeCategory);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <SideNav role={role as any} />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Training Videos</h1>
              <p className="text-muted-foreground">
                Watch training videos and complete quizzes to enhance your skills
              </p>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-40 bg-muted rounded-t-lg"></div>
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                    </CardHeader>
                    <CardFooter>
                      <div className="h-9 bg-muted rounded w-full"></div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
                    <div className="flex items-center justify-between">
                      <TabsList className="mb-2">
                        <TabsTrigger value="all">All Categories</TabsTrigger>
                        {categories.map(category => (
                          <TabsTrigger key={category} value={category}>
                            {category}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>
                    
                    <TabsContent value="all" className="mt-0">
                      {trainingVideos.length === 0 ? (
                        <Card className="p-8 text-center">
                          <CardHeader>
                            <CardTitle className="flex justify-center">
                              <GraduationCap className="h-10 w-10 mb-2" />
                            </CardTitle>
                            <CardTitle>No Training Videos Available</CardTitle>
                            <CardDescription>
                              Check back later for new training content
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {trainingVideos.map(video => (
                            <VideoCard
                              key={video.id}
                              video={video}
                              progress={userProgress[video.id]}
                              navigate={navigate}
                              getProgressBadge={getProgressBadge}
                              getProgressPercentage={getProgressPercentage}
                              getQuizStatus={getQuizStatus}
                              handleVideoLoad={handleVideoLoad}
                              videoRefs={videoRefs}
                            />
                          ))}
                        </div>
                      )}
                    </TabsContent>
                    
                    {categories.map(category => (
                      <TabsContent key={category} value={category} className="mt-0">
                        {filteredVideos.length === 0 ? (
                          <Card className="p-8 text-center">
                            <CardHeader>
                              <CardTitle className="flex justify-center">
                                <GraduationCap className="h-10 w-10 mb-2" />
                              </CardTitle>
                              <CardTitle>No Videos in this Category</CardTitle>
                              <CardDescription>
                                Check other categories or come back later
                              </CardDescription>
                            </CardHeader>
                          </Card>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredVideos.map(video => (
                              <VideoCard
                                key={video.id}
                                video={video}
                                progress={userProgress[video.id]}
                                navigate={navigate}
                                getProgressBadge={getProgressBadge}
                                getProgressPercentage={getProgressPercentage}
                                getQuizStatus={getQuizStatus}
                                handleVideoLoad={handleVideoLoad}
                                videoRefs={videoRefs}
                              />
                            ))}
                          </div>
                        )}
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// Extracted video card component for cleaner code
function VideoCard({ 
  video, 
  progress, 
  navigate, 
  getProgressBadge, 
  getProgressPercentage, 
  getQuizStatus,
  handleVideoLoad,
  videoRefs
}: any) {
  const storedThumbnail = localStorage.getItem(`thumbnail_${video.id}`);
  
  return (
    <Card key={video.id} className="overflow-hidden">
      <div className="relative h-40 bg-muted flex items-center justify-center">
        {video.thumbnail_url ? (
          <img 
            src={video.thumbnail_url} 
            alt={video.title} 
            className="w-full h-full object-cover"
          />
        ) : storedThumbnail ? (
          <img 
            src={storedThumbnail} 
            alt={video.title} 
            className="w-full h-full object-cover"
          />
        ) : video.video_url ? (
          <>
            <video 
              ref={el => {
                if (el) videoRefs.current[video.id] = el;
              }}
              src={video.video_url}
              className="w-full h-full object-cover opacity-0 absolute"
              onLoadedData={() => handleVideoLoad(video.id)}
              muted
              preload="metadata"
              controls={false}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Video className="h-12 w-12 text-white/70" />
            </div>
          </>
        ) : (
          <Video className="h-12 w-12 text-muted-foreground" />
        )}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <Button 
            variant="secondary"
            size="sm"
            className="rounded-full" 
            onClick={() => navigate(`/training/video/${video.id}`)}
          >
            <Play className="h-4 w-4 mr-1" /> Watch Now
          </Button>
        </div>
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{video.title}</CardTitle>
            {video.category && (
              <Badge variant="outline" className="mt-1">
                {video.category}
              </Badge>
            )}
          </div>
          {getProgressBadge(video.id)}
        </div>
        <CardDescription>
          {video.description?.substring(0, 100)}{video.description?.length > 100 ? '...' : ''}
          {video.has_quiz && (
            <div className="mt-1 text-xs inline-flex items-center text-primary">
              <CheckCircle className="h-3 w-3 mr-1" />
              Includes quiz assessment
            </div>
          )}
          {getQuizStatus(video)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{getProgressPercentage(video.id)}%</span>
          </div>
          <Progress value={getProgressPercentage(video.id)} />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={() => navigate(`/training/video/${video.id}`)}
        >
          {getProgressPercentage(video.id) > 0 ? 'Continue Training' : 'Start Training'}
        </Button>
      </CardFooter>
    </Card>
  );
}
