
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useTrainingManager = () => {
  const [role, setRole] = useState<string>('manager');
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const fetchData = async () => {
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
      
      // Fetch training videos - now using order_number for sorting
      const { data: videosData, error: videosError } = await supabase
        .from('training_videos')
        .select('*')
        .order('order_number', { ascending: true, nullsLast: true })
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
  };
  
  useEffect(() => {
    fetchData();
  }, []);

  return {
    role,
    videos,
    loading,
    refreshVideos: fetchData
  };
};
