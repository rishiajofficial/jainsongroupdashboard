
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, ClipboardList } from "lucide-react";

export function CandidateDashboard() {
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
    </div>
  );
}
