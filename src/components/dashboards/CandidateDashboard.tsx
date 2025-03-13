
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, ClipboardList, Map } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePageAccess } from "@/contexts/PageAccessContext";

interface ProfileData {
  fullName: string;
  email: string;
}

export function CandidateDashboard({ userData }: { userData: ProfileData | null }) {
  const navigate = useNavigate();
  const { accessRules, isLoading } = usePageAccess();

  // Check if a page is accessible (enabled)
  const isPageAccessible = (path: string) => {
    if (isLoading) return true; // Show all during loading
    const rule = accessRules.find(r => r.page_path === path);
    return rule && rule.is_enabled;
  };

  return (
    <div className="space-y-6">
      {isPageAccessible("/jobs") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="mr-2 h-5 w-5" />
              Job Opportunities
            </CardTitle>
            <CardDescription>
              Browse available job listings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate("/jobs")} 
              className="w-full sm:w-auto"
            >
              Browse Available Jobs
            </Button>
          </CardContent>
        </Card>
      )}
      
      {isPageAccessible("/applications") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardList className="mr-2 h-5 w-5" />
              My Applications
            </CardTitle>
            <CardDescription>
              Track your job applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate("/applications")} 
              className="w-full sm:w-auto"
            >
              View My Applications
            </Button>
          </CardContent>
        </Card>
      )}
      
      {isPageAccessible("/assessments/candidate") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardList className="mr-2 h-5 w-5" />
              My Assessments
            </CardTitle>
            <CardDescription>
              Take and view your assigned assessments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate("/assessments/candidate")} 
              className="w-full sm:w-auto"
            >
              View My Assessments
            </Button>
          </CardContent>
        </Card>
      )}
      
      {isPageAccessible("/salesperson-tracker") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Map className="mr-2 h-5 w-5" />
              Shop Visit Tracking
            </CardTitle>
            <CardDescription>
              Record your shop visits and sales pitches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate("/salesperson-tracker")} 
              className="w-full sm:w-auto"
            >
              Track Shop Visits
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
