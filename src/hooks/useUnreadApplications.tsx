
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUnreadApplications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnreadApplications = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setUnreadCount(0);
          return;
        }

        // Get unread applications (applications with 'pending' status)
        const { data, error } = await supabase
          .from('applications')
          .select('id, status')
          .eq('status', 'pending')
          .count();

        if (error) {
          console.error("Error fetching unread applications:", error);
          return;
        }

        setUnreadCount(data?.count || 0);
      } catch (error) {
        console.error("Error in unread applications hook:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnreadApplications();

    // Setup subscription for real-time updates
    const channel = supabase
      .channel('public:applications')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'applications' 
        }, 
        () => {
          fetchUnreadApplications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { unreadCount, loading };
}
