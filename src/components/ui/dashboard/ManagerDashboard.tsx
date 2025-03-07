
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, ClipboardList } from "lucide-react";
import { useUnreadApplications } from "@/hooks/useUnreadApplications";

export function ManagerDashboard() {
  const navigate = useNavigate();
  const { unreadCount } = useUnreadApplications();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Briefcase className="mr-2 h-5 w-5" />
            Manage Job Listings
          </CardTitle>
          <CardDescription>
            Create and manage job postings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => navigate("/jobs/create")} 
            className="w-full sm:w-auto"
          >
            Create New Job Listing
          </Button>
          <Button 
            onClick={() => navigate("/jobs/manage")} 
            variant="outline" 
            className="w-full sm:w-auto"
          >
            Manage My Job Listings
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClipboardList className="mr-2 h-5 w-5" />
            Applications
          </CardTitle>
          <CardDescription>
            Review candidate applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => navigate("/applications/review")} 
            className="w-full sm:w-auto"
          >
            Review Applications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">{unreadCount}</Badge>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
