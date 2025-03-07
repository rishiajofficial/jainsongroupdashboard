
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Application {
  id: string;
  created_at: string;
  status: string;
  cover_letter: string | null;
  resume_url: string | null;
  candidate_id: string;
  job_id: string;
  job: {
    id: string;
    title: string;
  };
  candidate: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
}

export interface Job {
  id: string;
  title: string;
}

export function useApplicationsData(jobFilter: string | null, appStatusFilter: string) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to review applications");
        return false;
      }

      // Get user role from profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        toast.error("Error fetching your profile");
        return false;
      }

      const isManagerOrAdmin = profile?.role === 'manager' || profile?.role === 'admin';
      
      if (!isManagerOrAdmin) {
        toast.error("You don't have permission to access this page");
        return false;
      }

      setHasAccess(true);
      await fetchJobs(session.user.id, profile?.role);
      return true;
    } catch (error) {
      console.error("Error checking auth status:", error);
      toast.error("An error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchJobs = async (userId: string, role: string | null) => {
    try {
      let query = supabase
        .from("jobs")
        .select("id, title");

      // Admin sees all jobs, manager sees their own
      if (role !== 'admin') {
        query = query.eq('created_by', userId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching jobs:", error);
        return;
      }

      setAvailableJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Session expired. Please log in again.");
        return;
      }
      
      // Get user role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      if (!profile) {
        toast.error("Could not fetch user profile");
        return;
      }
      
      let query = supabase
        .from("applications")
        .select(`
          id,
          created_at,
          status,
          cover_letter,
          resume_url,
          candidate_id,
          job_id,
          job:jobs(id, title),
          candidate:profiles!candidate_id(full_name, email, avatar_url)
        `);

      // Apply filters
      if (profile.role !== 'admin') {
        // For managers, get applications to jobs they created
        query = query.eq('jobs.created_by', session.user.id);
      }
      
      if (jobFilter) {
        query = query.eq('job_id', jobFilter);
      }
      
      if (appStatusFilter !== 'all') {
        query = query.eq('status', appStatusFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching applications:", error);
        toast.error("Failed to load applications");
        return;
      }

      console.log("Applications fetched:", data);
      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("An error occurred while loading applications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasAccess) {
      fetchApplications();
    }
  }, [appStatusFilter, jobFilter, hasAccess]);

  return {
    applications,
    availableJobs,
    isLoading,
    hasAccess,
    setApplications,
    fetchApplications
  };
}
