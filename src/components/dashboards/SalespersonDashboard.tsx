
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, ClipboardCheck, Map, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserRole } from "@/pages/DashboardPage";

interface ProfileData {
  fullName: string;
  email: string;
  role?: UserRole;
}

export function SalespersonDashboard({ userData }: { userData: ProfileData | null }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
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
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClipboardCheck className="mr-2 h-5 w-5" />
            My Stats
          </CardTitle>
          <CardDescription>
            View your sales performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => navigate("/salesperson-stats")} 
            variant="outline" 
            className="w-full sm:w-auto"
          >
            View My Statistics
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GraduationCap className="mr-2 h-5 w-5" />
            Training Videos
          </CardTitle>
          <CardDescription>
            Access training materials and complete quizzes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => navigate("/training")} 
            className="w-full sm:w-auto"
          >
            View Training Videos
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
