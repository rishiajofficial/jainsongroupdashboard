
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, ClipboardList, Map } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfileData {
  fullName: string;
  email: string;
}

export function ManagerDashboard({ userData }: { userData: ProfileData | null }) {
  const navigate = useNavigate();

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
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClipboardList className="mr-2 h-5 w-5" />
            Assessments
          </CardTitle>
          <CardDescription>
            Create and assign assessments to candidates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => navigate("/assessments/templates")} 
            className="w-full sm:w-auto"
          >
            Manage Assessment Templates
          </Button>
          <Button 
            onClick={() => navigate("/assessments/assign")} 
            variant="outline"
            className="w-full sm:w-auto"
          >
            Assign Assessments
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Map className="mr-2 h-5 w-5" />
            Sales Tracking
          </CardTitle>
          <CardDescription>
            Monitor salesperson activities in the field
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => navigate("/salesperson-dashboard")} 
            className="w-full sm:w-auto"
          >
            View Sales Tracking Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
