
import { Application } from "@/hooks/useApplicationsData";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ApplicationsListProps {
  applications: Application[];
  viewApplicationDetails: (application: Application) => void;
  downloadResume: (resumeUrl: string | null) => void;
  updateApplicationStatus: (applicationId: string, status: string) => void;
  formatDate: (dateString: string) => string;
  getStatusBadge: (status: string) => JSX.Element;
}

export function ApplicationsList({
  applications,
  viewApplicationDetails,
  downloadResume,
  updateApplicationStatus,
  formatDate,
  getStatusBadge
}: ApplicationsListProps) {
  return (
    <div className="space-y-4">
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
    </div>
  );
}
