
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, ClipboardCheck, Map } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfileData {
  fullName: string;
  email: string;
}

export function CandidateDashboard({ userData }: { userData: ProfileData | null }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
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
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClipboardCheck className="mr-2 h-5 w-5" />
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
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClipboardCheck className="mr-2 h-5 w-5" />
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
    </div>
  );
}
