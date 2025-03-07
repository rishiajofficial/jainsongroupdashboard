
import { Application } from "@/hooks/useApplicationsData";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle, XCircle } from "lucide-react";

interface ApplicationDetailsDialogProps {
  selectedApplication: Application | null;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  downloadResume: (resumeUrl: string | null) => void;
  updateApplicationStatus: (applicationId: string, status: string) => void;
  formatDate: (dateString: string) => string;
  getStatusBadge: (status: string) => JSX.Element;
}

export function ApplicationDetailsDialog({
  selectedApplication,
  dialogOpen,
  setDialogOpen,
  downloadResume,
  updateApplicationStatus,
  formatDate,
  getStatusBadge
}: ApplicationDetailsDialogProps) {
  if (!selectedApplication) return null;
  
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Application Details</DialogTitle>
          <DialogDescription>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span>
                Applied on {formatDate(selectedApplication.created_at)}
              </span>
              <span>
                Status: {getStatusBadge(selectedApplication.status)}
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>
        
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
      </DialogContent>
    </Dialog>
  );
}
