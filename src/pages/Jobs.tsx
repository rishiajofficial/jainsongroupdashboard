
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Briefcase, MapPin, DollarSign, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  location: string | null;
  salary_range: string | null;
  created_at: string;
}

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
    fetchJobs();
  }, []);

  const checkAuthStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching jobs:", error);
        toast.error("Failed to load job listings");
        return;
      }

      setJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("An error occurred while loading jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleApply = (jobId: string) => {
    if (!isAuthenticated) {
      toast.error("Please log in to apply for jobs");
      navigate("/login");
      return;
    }
    navigate(`/jobs/${jobId}/apply`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="space-y-8 animate-fade-up">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Job Listings</h2>
            <p className="text-muted-foreground">
              Explore available job opportunities
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader>
                    <Skeleton className="h-7 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-28" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-24" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Jobs Found</CardTitle>
                <CardDescription>
                  There are currently no job listings available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Check back later for new opportunities or contact us for more information.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card key={job.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-2xl">{job.title}</CardTitle>
                    <CardDescription>
                      Posted on {formatDate(job.created_at)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="whitespace-pre-wrap">{job.description}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {job.location && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </Badge>
                      )}
                      {job.salary_range && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {job.salary_range}
                        </Badge>
                      )}
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Posted {formatDate(job.created_at)}
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={() => handleApply(job.id)}
                      className="gap-2"
                    >
                      <Briefcase className="h-4 w-4" />
                      Apply Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Jobs;
