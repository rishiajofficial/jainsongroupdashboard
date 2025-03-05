import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download, Eye, Clock, CheckCircle, XCircle, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Application {
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

const ApplicationsReview = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [appStatusFilter, setAppStatusFilter] = useState<string>("all");
  const [jobFilter, setJobFilter] = useState<string | null>(null);
  const [availableJobs, setAvailableJobs] = useState<{id: string, title: string}[]>([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
    
    // Check if there's a job ID in the URL
    const jobIdFromUrl = searchParams.get('jobId');
    if (jobIdFromUrl) {
      setJobFilter(jobIdFromUrl);
    }
  }, [searchParams]);

  const checkAuthStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to review applications");
        navigate("/login");
        return;
      }

      // Get user role from profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        navigate("/dashboard");
        return;
      }

      const isManagerOrAdmin = profile?.role === 'manager' || profile?.role === 'admin';
      
      if (!isManagerOrAdmin) {
        toast.error("You don't have permission to access this page");
        navigate("/dashboard");
        return;
      }

      setHasAccess(true);
      await fetchJobs(session.user.id, profile?.role);
      await fetchApplications(session.user.id, profile?.role);
    } catch (error) {
      console.error("Error checking auth status:", error);
      toast.error("An error occurred");
      navigate("/dashboard");
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

  const fetchApplications = async (userId: string, role: string | null) => {
    try {
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
      if (role !== 'admin') {
        query = query.eq('jobs.created_by', userId);
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

      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("An error occurred while loading applications");
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="secondary" className="flex items-center gap-1 bg-green-500 text-white">
            <CheckCircle className="h-3 w-3" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            {status}
          </Badge>
        );
    }
  };

  const viewApplicationDetails = (application: Application) => {
    setSelectedApplication(application);
    setDialogOpen(true);
  };

  const downloadResume = async (resumeUrl: string | null) => {
    if (!resumeUrl) {
      toast.error("No resume available for download");
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from('resumes')
        .download(resumeUrl);

      if (error) {
        console.error("Error downloading resume:", error);
        toast.error("Failed to download resume");
        return;
      }

      // Create a download link for the file
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = resumeUrl.split('/').pop() || 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading resume:", error);
      toast.error("Failed to download resume");
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', applicationId);

      if (error) {
        console.error("Error updating application status:", error);
        toast.error("Failed to update application status");
        return;
      }

      // Update local state
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status } : app
      ));
      
      if (selectedApplication && selectedApplication.id === applicationId) {
        setSelectedApplication({ ...selectedApplication, status });
      }

      toast.success(`Application ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error("Error updating application status:", error);
      toast.error("An error occurred while updating application status");
    }
  };

  const handleFilterChange = async () => {
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      await fetchApplications(session.user.id, profile?.role);
    } catch (error) {
      console.error("Error applying filters:", error);
      toast.error("Failed to apply filters");
    }
  };

  useEffect(() => {
    if (hasAccess) {
      handleFilterChange();
    }
  }, [appStatusFilter, jobFilter, hasAccess]);

  if (!hasAccess && !isLoading) {
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
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Review Applications</h2>
            <p className="text-muted-foreground">
              Review and manage candidate applications
            </p>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
              <CardDescription>
                Filter applications by status and job
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Status
                  </label>
                  <Select value={appStatusFilter} onValueChange={setAppStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Job
                  </label>
                  <Select 
                    value={jobFilter || ""} 
                    onValueChange={(value) => setJobFilter(value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by job" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Jobs</SelectItem>
                      {availableJobs.map(job => (
                        <SelectItem key={job.id} value={job.id}>
                          {job.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-7 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-9 w-20" />
                      <Skeleton className="h-9 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : applications.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Applications Found</CardTitle>
                <CardDescription>
                  There are no applications matching your current filters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">
                  Try changing your filters or check back later when new applications are submitted.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setAppStatusFilter("all");
                    setJobFilter(null);
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="list" className="space-y-4">
              <TabsList>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="grid">Grid View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="list" className="space-y-4">
                {applications.map((application) => (
                  <Card key={application.id}>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <span>{application.candidate.full_name || application.candidate.email || "Unknown Candidate"}</span>
                            {getStatusBadge(application.status)}
                          </CardTitle>
                          <CardDescription>
                            Applied for: {application.job.title} · {formatDate(application.created_at)}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {application.cover_letter 
                            ? application.cover_letter.substring(0, 150) + (application.cover_letter.length > 150 ? '...' : '') 
                            : "No cover letter provided"}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between flex-wrap gap-2">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewApplicationDetails(application)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                        {application.resume_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadResume(application.resume_url)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download Resume
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {application.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateApplicationStatus(application.id, 'rejected')}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600"
                              onClick={() => updateApplicationStatus(application.id, 'approved')}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </Button>
                          </>
                        )}
                        {application.status === 'rejected' && (
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => updateApplicationStatus(application.id, 'approved')}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve Instead
                          </Button>
                        )}
                        {application.status === 'approved' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateApplicationStatus(application.id, 'rejected')}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject Instead
                          </Button>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="grid">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {applications.map((application) => (
                    <Card key={application.id} className="flex flex-col h-full">
                      <CardHeader>
                        <CardTitle className="line-clamp-1">
                          {application.candidate.full_name || application.candidate.email || "Unknown Candidate"}
                        </CardTitle>
                        <CardDescription className="flex flex-col gap-1">
                          <span className="line-clamp-1">Applied for: {application.job.title}</span>
                          <span>{formatDate(application.created_at)}</span>
                          <div className="mt-1">{getStatusBadge(application.status)}</div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="text-sm text-muted-foreground line-clamp-4">
                          {application.cover_letter 
                            ? application.cover_letter.substring(0, 100) + (application.cover_letter.length > 100 ? '...' : '') 
                            : "No cover letter provided"}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2 flex justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewApplicationDetails(application)}
                          className="w-full"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>

      {/* Application Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              {selectedApplication && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span>
                    Applied on {formatDate(selectedApplication.created_at)}
                  </span>
                  <span>
                    Status: {getStatusBadge(selectedApplication.status)}
                  </span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Candidate</h3>
                <p className="font-semibold">{selectedApplication.candidate.full_name || "No name provided"}</p>
                <p className="text-muted-foreground">{selectedApplication.candidate.email}</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Job</h3>
                <p>{selectedApplication.job.title}</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Cover Letter & Details</h3>
                <div className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm mt-2">
                  {selectedApplication.cover_letter || "No cover letter provided"}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-between pt-2">
                <div>
                  {selectedApplication.resume_url && (
                    <Button
                      onClick={() => downloadResume(selectedApplication.resume_url)}
                      variant="outline"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Resume
                    </Button>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {selectedApplication.status === 'pending' && (
                    <>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          updateApplicationStatus(selectedApplication.id, 'rejected');
                        }}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                      <Button
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => {
                          updateApplicationStatus(selectedApplication.id, 'approved');
                        }}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                    </>
                  )}
                  {selectedApplication.status === 'rejected' && (
                    <Button
                      className="bg-green-500 hover:bg-green-600"
                      onClick={() => {
                        updateApplicationStatus(selectedApplication.id, 'approved');
                      }}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve Instead
                    </Button>
                  )}
                  {selectedApplication.status === 'approved' && (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        updateApplicationStatus(selectedApplication.id, 'rejected');
                      }}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject Instead
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplicationsReview;
