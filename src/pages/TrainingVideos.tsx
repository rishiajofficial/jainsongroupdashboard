
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { SideNav } from "@/components/ui/dashboard/SideNav";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, CheckCircle, Video, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TrainingVideos() {
  const [role, setRole] = useState('salesperson');
  const [isLoading, setIsLoading] = useState(true);
  const [trainingVideos, setTrainingVideos] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, any>>({});
  const { toast } = useToast();
  const navigate = useNavigate();

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
        
        setTrainingVideos(videos || []);
        setUserProgress(progressMap);
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
    
    return <Badge variant="secondary">In Progress</Badge>;
  };
  
  const getProgressPercentage = (videoId: string) => {
    const progress = userProgress[videoId];
    if (!progress) return 0;
    return progress.quiz_completed ? 100 : (progress.watched_percentage || 0);
  };

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
            ) : trainingVideos.length === 0 ? (
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
                  <Card key={video.id} className="overflow-hidden">
                    <div className="relative h-40 bg-muted flex items-center justify-center">
                      {video.thumbnail_url ? (
                        <img 
                          src={video.thumbnail_url} 
                          alt={video.title} 
                          className="w-full h-full object-cover"
                        />
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
                        <CardTitle className="text-lg">{video.title}</CardTitle>
                        {getProgressBadge(video.id)}
                      </div>
                      <CardDescription>
                        {video.description?.substring(0, 100)}{video.description?.length > 100 ? '...' : ''}
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
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
