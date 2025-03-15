
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface TrainingVideo {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  has_quiz: boolean | null;
  created_at: string;
  created_by: string;
  category: string;
  order_number?: number;
  progress?: {
    watched_percentage: number;
    completed: boolean;
    quiz_completed: boolean;
    quiz_score: number | null;
  };
}

export const useTrainingVideos = () => {
  const [role, setRole] = useState('salesperson');
  const [videos, setVideos] = useState<TrainingVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchData = async () => {
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
      
      // Fetch videos - now using order_number with fixed nullsFirst property
      const { data: videosData, error: videosError } = await supabase
        .from('training_videos')
        .select('*')
        .order('order_number', { ascending: true, nullsFirst: false })
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
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredVideos = selectedCategory === "All" 
    ? videos 
    : videos.filter(video => video.category === selectedCategory);

  return {
    role,
    videos,
    isLoading,
    selectedCategory,
    setSelectedCategory,
    filteredVideos
  };
};
