
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { SideNav } from "@/components/ui/dashboard/SideNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, PlayCircle, PauseCircle, ChevronRight, XCircle, GraduationCap, AlertCircle } from "lucide-react";
import { Quiz } from "@/components/training/Quiz";
import { Badge } from "@/components/ui/badge";

export default function TrainingVideo() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const shouldShowQuiz = queryParams.get('quiz') === 'true';
  
  const [role, setRole] = useState('salesperson');
  const [isLoading, setIsLoading] = useState(true);
  const [videoData, setVideoData] = useState<any>(null);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showQuiz, setShowQuiz] = useState(shouldShowQuiz);
  const [quizData, setQuizData] = useState<any[]>([]);
  const [lastProgressUpdate, setLastProgressUpdate] = useState(0);
  const [progressUpdateCount, setProgressUpdateCount] = useState(0);
  const [quizUnlocked, setQuizUnlocked] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      
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
        
        // Fetch video data
        const { data: video, error: videoError } = await supabase
          .from('training_videos')
          .select('*')
          .eq('id', id)
          .single();
          
        if (videoError) throw videoError;
        
        // Fetch user progress
        const { data: progress, error: progressError } = await supabase
          .from('training_progress')
          .select('*')
          .eq('user_id', sessionData.session.user.id)
          .eq('video_id', id)
          .single();
          
        if (!progressError && !progress) {
          // Create progress entry if it doesn't exist
          const { data: newProgress, error: createError } = await supabase
            .from('training_progress')
            .insert({
              user_id: sessionData.session.user.id,
              video_id: id,
              watched_percentage: 0,
              completed: false,
              quiz_completed: false,
              quiz_score: 0,
              last_position: 0
            })
            .select()
            .single();
            
          if (createError) throw createError;
          setUserProgress(newProgress);
        } else {
          setUserProgress(progress);
          // Check if quiz should be unlocked
          if (progress && progress.watched_percentage >= 50) {
            setQuizUnlocked(true);
          }
        }
        
        // Fetch quiz questions
        const { data: quiz, error: quizError } = await supabase
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
          .eq('video_id', id)
          .order('created_at', { ascending: true });
          
        if (quizError) throw quizError;
        
        console.log("Quiz data:", quiz);
        setVideoData(video);
        setQuizData(quiz || []);
        
        // Show quiz if the URL has the quiz parameter
        if (shouldShowQuiz) {
          // Check if quiz is unlocked
          if (progress && progress.watched_percentage >= 50) {
            setShowQuiz(true);
            setQuizUnlocked(true);
          } else {
            // Redirect back if trying to access quiz directly when not unlocked
            toast({
              title: "Quiz Locked",
              description: "You need to watch at least 50% of the video to unlock the quiz.",
              variant: "destructive",
            });
            navigate(`/training/video/${id}`);
          }
        } else if (progress && progress.watched_percentage >= 50 && 
            !progress.quiz_completed && quiz && quiz.length > 0) {
          setQuizUnlocked(true);
          if (queryParams.get('autoShowQuiz') === 'true') {
            setShowQuiz(true);
          }
        }
      } catch (error) {
        console.error('Error fetching training video:', error);
        toast({
          description: "Failed to load the training video",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();

    // Cleanup function to save progress on component unmount
    return () => {
      saveProgress();
    };
  }, [id, shouldShowQuiz]);
  
  const saveProgress = async () => {
    if (!videoRef.current || !userProgress || !videoData) return;
    
    const currentTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    if (!duration) return;
    
    const percentage = Math.floor((currentTime / duration) * 100);
    
    try {
      console.log(`Saving final progress: ${percentage}%`);
      
      const { data, error } = await supabase
        .from('training_progress')
        .update({
          watched_percentage: percentage,
          last_position: currentTime,
          last_updated_at: new Date().toISOString()
        })
        .eq('id', userProgress.id)
        .select()
        .single();
        
      if (error) {
        console.error('Error saving final progress:', error);
      }
    } catch (err) {
      console.error('Error in cleanup function:', err);
    }
  };
  
  const handleTimeUpdate = async () => {
    if (!videoRef.current || !userProgress || !videoData) return;
    
    const currentTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    if (!duration) return;
    
    const percentage = Math.floor((currentTime / duration) * 100);
    
    setCurrentTime(currentTime);
    setDuration(duration);
    
    // Force a UI update to ensure progress bar moves
    setProgressUpdateCount(prev => prev + 1);
    
    // Update progress every 3 seconds or when percentage changes significantly
    const now = Date.now();
    if (
      Math.abs(percentage - (userProgress.watched_percentage || 0)) >= 5 || 
      now - lastProgressUpdate > 3000
    ) {
      console.log(`Updating progress: ${percentage}%, Time: ${currentTime}/${duration}`);
      setLastProgressUpdate(now);
      
      try {
        const { data, error } = await supabase
          .from('training_progress')
          .update({
            watched_percentage: percentage,
            last_position: currentTime,
            last_updated_at: new Date().toISOString()
          })
          .eq('id', userProgress.id)
          .select()
          .single();
          
        if (!error && data) {
          setUserProgress(data);
          
          // Check if quiz should be unlocked (at 50% progress)
          if (percentage >= 50 && !quizUnlocked) {
            console.log("Unlocking quiz at 50% progress");
            setQuizUnlocked(true);
            
            // Show a toast notification
            toast({
              title: "Quiz Available",
              description: "You can now take the quiz for this training video!",
            });
          }
          
          // Mark video as watched if progress is 95% or more
          if (percentage >= 95 && !videoWatched) {
            setVideoWatched(true);
          }
        } else if (error) {
          console.error('Error updating progress:', error);
        }
        
        // Show quiz automatically when video is complete
        if (percentage >= 95 && !userProgress.quiz_completed && quizData.length > 0) {
          if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
          
          // Show a toast notification
          toast({
            title: "Video Completed",
            description: "Let's take the quiz now to complete your training!",
          });
          
          // Set a short timeout to let the user register the completion first
          setTimeout(() => {
            setShowQuiz(true);
          }, 1000);
        }
      } catch (err) {
        console.error('Error updating progress:', err);
      }
    }
  };
  
  const handleVideoEnded = () => {
    // Mark as completed if there's no quiz
    if (quizData.length === 0) {
      markAsCompleted();
    } else if (!userProgress.quiz_completed) {
      setShowQuiz(true);
    }
  };
  
  const markAsCompleted = async () => {
    if (!userProgress) return;
    
    try {
      const { data, error } = await supabase
        .from('training_progress')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          watched_percentage: 100
        })
        .eq('id', userProgress.id)
        .select()
        .single();
        
      if (error) throw error;
      
      setUserProgress(data);
      
      toast({
        description: "Congratulations! You've completed this training module.",
      });
    } catch (error) {
      console.error('Error marking as completed:', error);
    }
  };
  
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const handleTakeQuiz = () => {
    if (!quizUnlocked) {
      toast({
        title: "Quiz Locked",
        description: "You need to watch at least 50% of the video to unlock the quiz.",
        variant: "destructive",
      });
      return;
    }
    
    setShowQuiz(true);
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };
  
  const handleQuitTraining = () => {
    saveProgress();
    navigate('/training');
  };
  
  const handleQuizComplete = async (score: number, passed: boolean) => {
    if (!userProgress) return;
    
    try {
      const { data, error } = await supabase
        .from('training_progress')
        .update({
          quiz_completed: true,
          quiz_score: score,
          completed: passed,
          completed_at: passed ? new Date().toISOString() : null
        })
        .eq('id', userProgress.id)
        .select()
        .single();
        
      if (error) throw error;
      
      // Also save to training_quiz_results for reporting
      if (id) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          await supabase
            .from('training_quiz_results')
            .insert({
              user_id: sessionData.session.user.id,
              video_id: id,
              total_questions: quizData.length,
              score: score
            });
        }
      }
      
      setUserProgress(data);
      setShowQuiz(false);
      
      toast({
        description: passed 
          ? "Congratulations! You've successfully completed this training module." 
          : "You didn't pass the quiz. You can review the content and try again.",
        variant: passed ? "default" : "destructive",
      });
      
      if (passed) {
        setTimeout(() => {
          navigate('/training');
        }, 2000);
      }
    } catch (error) {
      console.error('Error updating quiz results:', error);
      toast({
        description: "Failed to save quiz results",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <SideNav role={role as any} />
        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mr-2"
                  onClick={() => navigate('/training')}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">
                  {isLoading ? 'Loading...' : videoData?.title}
                </h1>
              </div>
              {videoData?.category && (
                <Badge variant="outline">{videoData.category}</Badge>
              )}
            </div>
            
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-[450px] bg-muted rounded-lg"></div>
                <div className="h-6 bg-muted rounded w-3/4 mt-4"></div>
                <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
              </div>
            ) : showQuiz ? (
              <Quiz 
                questions={quizData} 
                onComplete={handleQuizComplete} 
                passingScore={60}
              />
            ) : (
              <>
                <div className="relative rounded-lg overflow-hidden bg-black">
                  {videoData?.video_url ? (
                    <video
                      ref={videoRef}
                      src={videoData.video_url}
                      className="w-full max-h-[450px]"
                      controls
                      onTimeUpdate={handleTimeUpdate}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onEnded={handleVideoEnded}
                      onLoadedMetadata={() => {
                        if (videoRef.current) {
                          if (userProgress?.last_position) {
                            videoRef.current.currentTime = userProgress.last_position;
                          }
                          setDuration(videoRef.current.duration);
                        }
                      }}
                      key={`video-player-${progressUpdateCount}`}
                      autoPlay={false}
                    />
                  ) : (
                    <div className="w-full h-80 flex items-center justify-center bg-muted">
                      <p>Video not available</p>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute bottom-4 right-4 rounded-full bg-background/80 hover:bg-background"
                    onClick={handlePlayPause}
                  >
                    {isPlaying ? (
                      <PauseCircle className="h-6 w-6" />
                    ) : (
                      <PlayCircle className="h-6 w-6" />
                    )}
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{userProgress?.watched_percentage || 0}%</span>
                  </div>
                  <Progress value={userProgress?.watched_percentage || 0} />
                  {quizData.length > 0 && !quizUnlocked && (
                    <p className="text-xs text-muted-foreground">
                      <AlertCircle className="h-3 w-3 inline-block mr-1" />
                      You need to watch at least 50% of the video to unlock the quiz
                    </p>
                  )}
                </div>
                
                <div className="flex space-x-2 mt-4 justify-center">
                  {quizData.length > 0 && quizUnlocked && !userProgress?.quiz_completed && (
                    <Button onClick={handleTakeQuiz} className="gap-2">
                      <GraduationCap className="h-4 w-4" /> Start Quiz
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleQuitTraining}>
                    <XCircle className="mr-1 h-4 w-4" /> Quit Training
                  </Button>
                </div>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>{videoData?.title}</CardTitle>
                      <CardDescription>
                        {userProgress?.completed ? (
                          <span className="text-green-500">You've completed this training!</span>
                        ) : quizData.length > 0 ? (
                          <span>
                            {quizUnlocked 
                              ? "You've watched enough to take the quiz" 
                              : "Watch 50% of the video to unlock the quiz"}
                          </span>
                        ) : (
                          <span>Watch the entire video to complete this training</span>
                        )}
                      </CardDescription>
                    </div>
                    {quizData.length > 0 && quizUnlocked && !userProgress?.quiz_completed && (
                      <Button onClick={handleTakeQuiz} size="sm" className="gap-2">
                        <GraduationCap className="h-4 w-4" /> Go to Quiz
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p>{videoData?.description}</p>
                    </div>
                  </CardContent>
                  {quizData.length > 0 && quizUnlocked && !userProgress?.quiz_completed && (
                    <CardFooter>
                      <Button onClick={handleTakeQuiz} className="w-full">
                        Take Quiz Now
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
