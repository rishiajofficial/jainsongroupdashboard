import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { SideNav } from "@/components/ui/dashboard/SideNav";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Play, Video, BookOpen, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TrainingVideo {
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
}

const CATEGORIES = [
  "All",
  "Sales Techniques",
  "Product Knowledge",
  "Customer Service",
  "Compliance",
  "Leadership",
  "Technical Skills",
  "Onboarding",
  "General"
];

export default function TrainingVideos() {
  const [role, setRole] = useState('salesperson');
  const [videos, setVideos] = useState<TrainingVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Get user session
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
          
        if (profileData) {
          setRole(profileData.role);
        }
        
        // Fetch videos
        const { data: videosData, error: videosError } = await supabase
          .from('training_videos')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (videosError) throw videosError;
        
        // Fetch progress for each video
        const { data: progressData, error: progressError } = await supabase
          .from('training_progress')
          .select('*')
          .eq('user_id', sessionData.session.user.id);
          
        if (progressError) throw progressError;
        
        // Combine video data with progress
        const videosWithProgress = videosData?.map(video => {
          const progress = progressData?.find(p => p.video_id === video.id);
          return {
            ...video,
            progress: progress ? {
              watched_percentage: progress.watched_percentage,
              completed: progress.completed,
              quiz_completed: progress.quiz_completed,
              quiz_score: progress.quiz_score
            } : {
              watched_percentage: 0,
              completed: false,
              quiz_completed: false,
              quiz_score: null
            }
          };
        });
        
        setVideos(videosWithProgress || []);
      } catch (error) {
        console.error('Error fetching training videos:', error);
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
  
  const filteredVideos = selectedCategory === "All" 
    ? videos 
    : videos.filter(video => video.category === selectedCategory);
  
  const handleWatchVideo = (videoId: string) => {
    navigate(`/training/video/${videoId}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <SideNav role={role as any} />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold tracking-tight">Training Videos</h1>
              {role === 'manager' && (
                <Button onClick={() => navigate('/training/manage')}>
                  Manage Training
                </Button>
              )}
            </div>
            
            <Tabs defaultValue="All" value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="mb-4 flex flex-wrap gap-2">
                {CATEGORIES.map(category => (
                  <TabsTrigger key={category} value={category}>
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value={selectedCategory}>
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <Card key={i} className="animate-pulse">
                        <div className="h-48 bg-muted rounded-t-lg"></div>
                        <CardHeader>
                          <div className="h-6 bg-muted rounded w-3/4"></div>
                          <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="h-4 bg-muted rounded w-full"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredVideos.length === 0 ? (
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
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVideos.map((video) => (
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
                            onClick={() => handleWatchVideo(video.id)}
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
                        <div className="px-6 pb-4">
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => handleWatchVideo(video.id)}
                          >
                            {video.progress?.completed ? "Review Video" : "Watch Video"}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
