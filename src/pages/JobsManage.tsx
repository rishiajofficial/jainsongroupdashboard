
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PlusCircle, Edit, Trash2, Clock, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  location: string | null;
  salary_range: string | null;
  created_at: string;
  applicationCount?: number;
}

const JobsManage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isManager, setIsManager] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [location, setLocation] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to manage jobs");
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to verify your access");
        navigate("/dashboard");
        return;
      }

      const isManagerOrAdmin = data.role === 'manager' || data.role === 'admin';
      
      if (!isManagerOrAdmin) {
        toast.error("You don't have permission to access this page");
        navigate("/dashboard");
        return;
      }

      setIsManager(true);
      fetchJobs();
    } catch (error) {
      console.error("Error checking user role:", error);
      toast.error("An error occurred");
      navigate("/dashboard");
    }
  };

  const fetchJobs = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      // Get user role to determine which jobs to show
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (userError) {
        console.error("Error fetching user data:", userError);
        return;
      }

      const isAdmin = userData.role === 'admin';
      
      // Fetch jobs - admins see all, managers see their own
      let query = supabase
        .from("jobs")
        .select("*");
        
      if (!isAdmin) {
        query = query.eq('created_by', session.user.id);
      }

      const { data: jobsData, error: jobsError } = await query.order('created_at', { ascending: false });

      if (jobsError) {
        console.error("Error fetching jobs:", jobsError);
        toast.error("Failed to load job listings");
        return;
      }

      // Get application counts for each job
      const jobsWithAppCounts = await Promise.all(
        (jobsData || []).map(async (job) => {
          const { count, error: countError } = await supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .eq('job_id', job.id);

          if (countError) {
            console.error(`Error getting application count for job ${job.id}:`, countError);
            return { ...job, applicationCount: 0 };
          }

          return { ...job, applicationCount: count || 0 };
        })
      );

      setJobs(jobsWithAppCounts);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("An error occurred while loading jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingJob(null);
    setTitle("");
    setDescription("");
    setRequirements("");
    setLocation("");
    setSalaryRange("");
    setDialogOpen(true);
  };

  const openEditDialog = (job: Job) => {
    setEditingJob(job);
    setTitle(job.title);
    setDescription(job.description);
    setRequirements(job.requirements || "");
    setLocation(job.location || "");
    setSalaryRange(job.salary_range || "");
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Your session has expired. Please log in again.");
        navigate("/login");
        return;
      }

      const jobData = {
        title,
        description,
        requirements,
        location,
        salary_range: salaryRange,
        created_by: session.user.id
      };

      let result;
      
      if (editingJob) {
        // Update existing job
        result = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', editingJob.id);
      } else {
        // Create new job
        result = await supabase
          .from('jobs')
          .insert(jobData);
      }

      if (result.error) {
        console.error("Error saving job:", result.error);
        toast.error("Failed to save job listing");
        return;
      }

      toast.success(editingJob ? "Job updated successfully" : "Job created successfully");
      setDialogOpen(false);
      fetchJobs();
    } catch (error) {
      console.error("Error saving job:", error);
      toast.error("An error occurred while saving the job");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job listing? This action cannot be undone.")) {
      return;
    }

    try {
      // Check for existing applications
      const { count, error: countError } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('job_id', jobId);

      if (countError) {
        console.error("Error checking applications:", countError);
        toast.error("Failed to check if this job has applications");
        return;
      }

      if (count && count > 0) {
        toast.error(`This job has ${count} applications. Delete them first before removing the job listing.`);
        return;
      }

      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) {
        console.error("Error deleting job:", error);
        toast.error("Failed to delete job listing");
        return;
      }

      toast.success("Job deleted successfully");
      setJobs(jobs.filter(job => job.id !== jobId));
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("An error occurred while deleting the job");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isManager && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Access Denied</h2>
              <p className="text-muted-foreground mt-2">
                You do not have permission to access this page.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="space-y-8 animate-fade-up">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Manage Jobs</h2>
              <p className="text-muted-foreground">
                Create and manage your job listings
              </p>
            </div>
            <Button onClick={openCreateDialog} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Create Job
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-7 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                  <CardFooter>
                    <div className="flex gap-2">
                      <Skeleton className="h-9 w-20" />
                      <Skeleton className="h-9 w-20" />
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Jobs Created</CardTitle>
                <CardDescription>
                  You haven't created any job listings yet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Create your first job listing to start receiving applications from candidates.
                </p>
                <Button onClick={openCreateDialog} className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Create Job
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card key={job.id}>
                  <CardHeader>
                    <CardTitle>{job.title}</CardTitle>
                    <CardDescription>
                      Created on {formatDate(job.created_at)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="line-clamp-2">{job.description}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {job.location && (
                        <Badge variant="outline">
                          Location: {job.location}
                        </Badge>
                      )}
                      {job.salary_range && (
                        <Badge variant="outline">
                          Salary: {job.salary_range}
                        </Badge>
                      )}
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Posted {formatDate(job.created_at)}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {job.applicationCount} {job.applicationCount === 1 ? 'Application' : 'Applications'}
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(job)}
                        className="gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteJob(job.id)}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                    
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => navigate(`/applications/review?jobId=${job.id}`)}
                      disabled={job.applicationCount === 0}
                    >
                      Review Applications ({job.applicationCount})
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create/Edit Job Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingJob ? 'Edit Job Listing' : 'Create New Job Listing'}</DialogTitle>
            <DialogDescription>
              {editingJob 
                ? 'Update the details of your job listing' 
                : 'Fill in the details to create a new job listing'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Describe the role, responsibilities, and qualifications"
                  rows={5}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements (Optional)</Label>
                <Textarea
                  id="requirements"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="List specific requirements or skills needed"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Location (Optional)</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Remote, New York, NY"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="salaryRange">Salary Range (Optional)</Label>
                  <Input
                    id="salaryRange"
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    placeholder="e.g., $80,000 - $100,000"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting 
                  ? 'Saving...' 
                  : editingJob ? 'Update Job' : 'Create Job'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobsManage;
