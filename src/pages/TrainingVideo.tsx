
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { SideNav } from "@/components/ui/dashboard/SideNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Quiz } from "@/components/training/Quiz";
import { VideoPlayer } from "@/components/training/VideoPlayer";
import { VideoProgress } from "@/components/training/VideoProgress";
import { VideoControls } from "@/components/training/VideoControls";
import { VideoDescription } from "@/components/training/VideoDescription";
import { useTrainingVideoState } from "@/hooks/useTrainingVideoState";

export default function TrainingVideo() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const shouldShowQuiz = queryParams.get('quiz') === 'true';
  const navigate = useNavigate();
  
  const {
    role,
    isLoading,
    videoData,
    userProgress,
    showQuiz,
    quizData,
    quizUnlocked,
    watchedPercentage,
    progressUpdateCount,
    handleTimeUpdate,
    handleVideoEnded,
    handleTakeQuiz,
    handleQuitTraining,
    handleQuizComplete
  } = useTrainingVideoState(id || '', shouldShowQuiz);

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
                <VideoPlayer 
                  videoUrl={videoData?.video_url} 
                  onTimeUpdate={(currentTime, duration) => handleTimeUpdate(currentTime, duration)}
                  onVideoEnded={handleVideoEnded}
                  lastPosition={userProgress?.last_position}
                  onPlay={() => console.log("Video playing")}
                  onPause={() => console.log("Video paused")}
                />
                
                <VideoProgress 
                  watchedPercentage={watchedPercentage}
                  progressUpdateCount={progressUpdateCount}
                  quizUnlocked={quizUnlocked}
                  hasQuiz={quizData.length > 0}
                />
                
                <VideoControls 
                  onTakeQuiz={handleTakeQuiz}
                  onQuitTraining={handleQuitTraining}
                  quizUnlocked={quizUnlocked}
                  hasQuiz={quizData.length > 0}
                  quizCompleted={userProgress?.quiz_completed}
                />
                
                <VideoDescription 
                  title={videoData?.title || ''}
                  description={videoData?.description || ''}
                  userCompleted={userProgress?.completed}
                  hasQuiz={quizData.length > 0}
                  quizUnlocked={quizUnlocked}
                  quizCompleted={userProgress?.quiz_completed}
                  onTakeQuiz={handleTakeQuiz}
                />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
