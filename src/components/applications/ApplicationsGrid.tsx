
import { Application } from "@/hooks/useApplicationsData";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface ApplicationsGridProps {
  applications: Application[];
  viewApplicationDetails: (application: Application) => void;
  formatDate: (dateString: string) => string;
  getStatusBadge: (status: string) => JSX.Element;
}

export function ApplicationsGrid({
  applications,
  viewApplicationDetails,
  formatDate,
  getStatusBadge
}: ApplicationsGridProps) {
  return (
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
  );
}
