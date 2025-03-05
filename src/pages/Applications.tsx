
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download, Eye, Clock, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Application {
  id: string;
  created_at: string;
  status: string;
  cover_letter: string | null;
  resume_url: string | null;
  job: {
    id: string;
    title: string;
  };
}

const Applications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to view applications");
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
        return;
      }

      setUserRole(profile?.role || 'candidate');
      fetchApplications(session.user.id, profile?.role);
    } catch (error) {
      console.error("Error checking auth status:", error);
      toast.error("An error occurred");
      navigate("/dashboard");
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
          job:jobs(id, title)
        `);

      // Filter based on user role
      if (role === 'candidate') {
        // Candidates see their own applications
        query = query.eq('candidate_id', userId);
      } else if (role === 'manager') {
        // Managers see applications for jobs they created
        query = query.eq('jobs.created_by', userId);
      }
      // Admins see all applications (no additional filter)

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
          <Badge variant="success" className="flex items-center gap-1 bg-green-500">
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="space-y-8 animate-fade-up">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Applications</h2>
            <p className="text-muted-foreground">
              {userRole === 'candidate' 
                ? 'Track your job applications' 
                : 'Review candidate applications'}
            </p>
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
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
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
                  {userRole === 'candidate' 
                    ? "You haven't applied for any jobs yet" 
                    : "There are no applications to review"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userRole === 'candidate' && (
                  <Button 
                    onClick={() => navigate("/jobs")} 
                    className="mt-2"
                  >
                    Browse Jobs
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <CardTitle>{application.job.title}</CardTitle>
                    <CardDescription>
                      Applied on {formatDate(application.created_at)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Status</div>
                        {getStatusBadge(application.status)}
                      </div>
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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                <span>
                  Applied on {formatDate(selectedApplication.created_at)} · Status: {selectedApplication.status}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Job</h3>
                <p>{selectedApplication.job.title}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Cover Letter & Details</h3>
                <div className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm mt-2">
                  {selectedApplication.cover_letter || "No cover letter provided"}
                </div>
              </div>
              
              {selectedApplication.resume_url && (
                <div className="flex justify-end">
                  <Button
                    onClick={() => downloadResume(selectedApplication.resume_url)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Resume
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Applications;
