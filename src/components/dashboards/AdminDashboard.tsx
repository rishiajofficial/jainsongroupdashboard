
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfileData {
  fullName: string;
  email: string;
}

export function AdminDashboard({ userData }: { userData: ProfileData | null }) {
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
              onClick={() => navigate("/admin/approvals")} 
              className="w-full sm:w-auto"
            >
              View Manager Approval Requests
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
