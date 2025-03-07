
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Briefcase } from "lucide-react";

export function AdminDashboard() {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Admin Dashboard
          </CardTitle>
          <CardDescription>
            Manage system settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={() => navigate("/applications/review")} 
              className="w-full sm:w-auto"
            >
              Review Applications
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Briefcase className="mr-2 h-5 w-5" />
            Job Listings
          </CardTitle>
          <CardDescription>
            View and manage all job listings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => navigate("/jobs")} 
            className="w-full sm:w-auto"
          >
            View All Jobs
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
