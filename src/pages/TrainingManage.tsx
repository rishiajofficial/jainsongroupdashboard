
import { useState, useEffect } from "react";
import { Header } from "@/components/ui/Header";
import { SideNav } from "@/components/ui/dashboard/SideNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Edit, Trash2, Plus, Video } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { TrainingVideoForm } from "@/components/training/TrainingVideoForm";
import { Badge } from "@/components/ui/badge";

export default function TrainingManage() {
  const [role, setRole] = useState<string>('manager');
  const [activeTab, setActiveTab] = useState<string>("videos");
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Get user session
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData.session) {
          // Get user role
          const { data: userData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', sessionData.session.user.id)
            .single();
            
          if (userData) {
            setRole(userData.role);
          }
        }
        
        // Fetch training videos
        const { data: videosData, error: videosError } = await supabase
          .from('training_videos')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (videosError) throw videosError;
        
        setVideos(videosData || []);
      } catch (error) {
        console.error('Error fetching training data:', error);
        toast({
          description: "Failed to load training data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  const handleDeleteVideo = async (id: string) => {
    try {
      // First, delete associated quiz questions and options
      const { error: quizOptionsError } = await supabase
        .from('training_quiz_options')
        .delete()
        .in('question_id', function(builder) {
          builder
            .select('id')
            .from('training_quiz_questions')
            .eq('video_id', id);
        });
        
      if (quizOptionsError) throw quizOptionsError;
      
      // Delete quiz questions
      const { error: quizQuestionsError } = await supabase
        .from('training_quiz_questions')
        .delete()
        .eq('video_id', id);
        
      if (quizQuestionsError) throw quizQuestionsError;
      
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
      setVideos(videos.filter(video => video.id !== id));
      
      toast({
        description: "Training video deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting training video:', error);
      toast({
        description: "Failed to delete training video",
        variant: "destructive",
      });
    }
  };
  
  const refreshVideos = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('training_videos')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setVideos(data || []);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error refreshing videos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <SideNav role={role as any} />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold tracking-tight">Manage Training</h1>
              {!showAddForm && (
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Video
                </Button>
              )}
            </div>
            
            {showAddForm ? (
              <div className="mb-6">
                <TrainingVideoForm />
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="videos">Training Videos</TabsTrigger>
                  <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="videos" className="space-y-6">
                  {loading ? (
                    <div className="grid grid-cols-1 gap-6">
                      {[1, 2, 3].map(i => (
                        <Card key={i} className="animate-pulse">
                          <CardHeader>
                            <div className="h-6 bg-muted rounded w-3/4"></div>
                          </CardHeader>
                          <CardContent>
                            <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                            <div className="h-4 bg-muted rounded w-full"></div>
                          </CardContent>
                          <CardFooter>
                            <div className="h-9 bg-muted rounded w-1/4"></div>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : videos.length === 0 ? (
                    <Card className="text-center p-6">
                      <CardHeader>
                        <CardTitle className="flex justify-center">
                          <Video className="h-10 w-10 mb-2" />
                        </CardTitle>
                        <CardTitle>No Training Videos</CardTitle>
                        <CardDescription>
                          Add your first training video to get started
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="flex justify-center">
                        <Button onClick={() => setShowAddForm(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Video
                        </Button>
                      </CardFooter>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {videos.map((video) => (
                        <Card key={video.id}>
                          <CardHeader>
                            <div className="flex justify-between">
                              <CardTitle>{video.title}</CardTitle>
                              <div className="flex space-x-2">
                                <Badge variant="outline">{video.category || "Uncategorized"}</Badge>
                                {video.has_quiz && (
                                  <Badge variant="secondary">Has Quiz</Badge>
                                )}
                              </div>
                            </div>
                            <CardDescription>
                              Added on {new Date(video.created_at).toLocaleDateString()}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                              {video.description || "No description provided"}
                            </p>
                            <div className="text-sm">
                              <div className="font-medium">Video URL:</div>
                              <div className="text-muted-foreground break-all">{video.video_url}</div>
                            </div>
                            {video.thumbnail_url && (
                              <div className="text-sm mt-2">
                                <div className="font-medium">Thumbnail:</div>
                                <div className="text-muted-foreground break-all">{video.thumbnail_url}</div>
                              </div>
                            )}
                          </CardContent>
                          <CardFooter className="flex justify-end space-x-2">
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteVideo(video.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="quizzes" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Quiz Management</CardTitle>
                      <CardDescription>
                        Create and manage quizzes for training videos
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Quiz management features coming soon.</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
