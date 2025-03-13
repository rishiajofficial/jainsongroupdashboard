
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Briefcase, Shield, Settings2, UserCog } from "lucide-react";
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
            Manage system settings and users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={() => navigate("/admin/approvals")} 
              className="w-full justify-start"
              variant="outline"
            >
              <Shield className="mr-2 h-4 w-4" />
              View Manager Approval Requests
            </Button>
            
            <Button 
              onClick={() => navigate("/admin/users")} 
              className="w-full justify-start"
              variant="outline"
            >
              <UserCog className="mr-2 h-4 w-4" />
              User Management
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings2 className="mr-2 h-5 w-5" />
            System Configuration
          </CardTitle>
          <CardDescription>
            Configure system-wide settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={() => navigate("/admin/page-access")} 
              className="w-full justify-start"
            >
              <Shield className="mr-2 h-4 w-4" />
              Page Access Control
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
            variant="outline"
          >
            View All Jobs
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
