
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { JobApplicationForm } from "@/components/JobApplicationForm";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

interface Job {
  id: string;
  title: string;
  description: string;
}

const JobApplicationPage = () => {
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!jobId) {
      navigate("/jobs");
      return;
    }

    checkAuthStatus();
    fetchJobDetails();
  }, [jobId, navigate]);

  const checkAuthStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("You must be logged in to apply for jobs");
      navigate("/login");
    }
  };

  const fetchJobDetails = async () => {
    if (!jobId) return;
    
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("id, title, description")
        .eq("id", jobId)
        .single();

      if (error) {
        console.error("Error fetching job details:", error);
        toast.error("Failed to load job details");
        navigate("/jobs");
        return;
      }

      if (!data) {
        toast.error("Job not found");
        navigate("/jobs");
        return;
      }

      setJob(data);
    } catch (error) {
      console.error("Error fetching job details:", error);
      toast.error("An error occurred while loading job details");
      navigate("/jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/jobs");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="space-y-6 animate-fade-up">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4 max-w-md" />
              <Skeleton className="h-8 w-1/2 max-w-sm" />
              <Skeleton className="h-[600px] w-full max-w-4xl mx-auto" />
            </div>
          ) : !job ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold">Job Not Found</h2>
              <p className="text-muted-foreground mt-2">
                The job listing you're looking for doesn't exist or has been removed.
              </p>
              <Button 
                onClick={handleBack} 
                className="mt-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Jobs
              </Button>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <JobApplicationForm 
                jobId={job.id} 
                jobTitle={job.title} 
                onBack={handleBack} 
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default JobApplicationPage;
