
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApplicationsData, Application } from "@/hooks/useApplicationsData";
import { ApplicationsList } from "@/components/applications/ApplicationsList";
import { ApplicationsGrid } from "@/components/applications/ApplicationsGrid";
import { ApplicationDetailsDialog } from "@/components/applications/ApplicationDetailsDialog";
import { ApplicationsFilter } from "@/components/applications/ApplicationsFilter";
import { ApplicationsEmptyState, ApplicationsLoadingSkeleton } from "@/components/applications/ApplicationsEmptyState";
import { formatDate, getStatusBadge, downloadResume } from "@/components/applications/applicationUtils";

const ApplicationsReview = () => {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [appStatusFilter, setAppStatusFilter] = useState<string>("all");
  const [jobFilter, setJobFilter, ] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { 
    applications, 
    availableJobs, 
    isLoading, 
    hasAccess, 
    setApplications 
  } = useApplicationsData(jobFilter, appStatusFilter);

  useEffect(() => {
    // Check if there's a job ID in the URL
    const jobIdFromUrl = searchParams.get('jobId');
    if (jobIdFromUrl) {
      setJobFilter(jobIdFromUrl);
    }
  }, [searchParams]);

  const viewApplicationDetails = (application: Application) => {
    setSelectedApplication(application);
    setDialogOpen(true);
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

  const clearFilters = () => {
    setAppStatusFilter("all");
    setJobFilter(null);
  };

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
          <ApplicationsFilter 
            appStatusFilter={appStatusFilter}
            setAppStatusFilter={setAppStatusFilter}
            jobFilter={jobFilter}
            setJobFilter={setJobFilter}
            availableJobs={availableJobs}
          />

          {isLoading ? (
            <ApplicationsLoadingSkeleton />
          ) : applications.length === 0 ? (
            <ApplicationsEmptyState clearFilters={clearFilters} />
          ) : (
            <Tabs defaultValue="list" className="space-y-4">
              <TabsList>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="grid">Grid View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="list" className="space-y-4">
                <ApplicationsList 
                  applications={applications}
                  viewApplicationDetails={viewApplicationDetails}
                  downloadResume={downloadResume}
                  updateApplicationStatus={updateApplicationStatus}
                  formatDate={formatDate}
                  getStatusBadge={getStatusBadge}
                />
              </TabsContent>
              
              <TabsContent value="grid">
                <ApplicationsGrid 
                  applications={applications}
                  viewApplicationDetails={viewApplicationDetails}
                  formatDate={formatDate}
                  getStatusBadge={getStatusBadge}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>

      {/* Application Details Dialog */}
      <ApplicationDetailsDialog 
        selectedApplication={selectedApplication}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        downloadResume={downloadResume}
        updateApplicationStatus={updateApplicationStatus}
        formatDate={formatDate}
        getStatusBadge={getStatusBadge}
      />
    </div>
  );
};

export default ApplicationsReview;
