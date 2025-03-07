
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUnreadApplications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnreadApplications = async () => {
      try {
        setLoading(true);
        
        // Get current session
        const { data } = await supabase.auth.getSession();
        
        if (!data.session) {
          setUnreadCount(0);
          return;
        }

        // Get user role from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.session.user.id)
          .single();

        // Only count applications for managers
        if (profile?.role !== 'manager' && profile?.role !== 'admin') {
          setUnreadCount(0);
          return;
        }

        // For admin, get all pending applications
        // For manager, get pending applications for jobs they created
        let query = supabase
          .from('applications')
          .select('id, job_id, jobs!inner(created_by)')
          .eq('status', 'pending');

        if (profile.role === 'manager') {
          query = query.eq('jobs.created_by', data.session.user.id);
        }

        const { data: applications, error } = await query;

        if (error) {
          console.error("Error fetching unread applications:", error);
          return;
        }

        setUnreadCount(applications?.length || 0);
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
