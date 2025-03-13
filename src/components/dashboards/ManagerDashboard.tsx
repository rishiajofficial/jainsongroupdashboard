
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, ClipboardList, Map, GraduationCap, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePageAccess } from "@/contexts/PageAccessContext";

interface ProfileData {
  fullName: string;
  email: string;
}

export function ManagerDashboard({ userData }: { userData: ProfileData | null }) {
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
      {isPageAccessible("/jobs/manage") && (
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
      )}
      
      {isPageAccessible("/applications/review") && (
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
      )}
      
      {(isPageAccessible("/assessments/templates") || isPageAccessible("/assessments/assign")) && (
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
            {isPageAccessible("/assessments/templates") && (
              <Button 
                onClick={() => navigate("/assessments/templates")} 
                className="w-full sm:w-auto"
              >
                Manage Assessment Templates
              </Button>
            )}
            {isPageAccessible("/assessments/assign") && (
              <Button 
                onClick={() => navigate("/assessments/assign")} 
                variant="outline"
                className="w-full sm:w-auto"
              >
                Assign Assessments
              </Button>
            )}
          </CardContent>
        </Card>
      )}
      
      {isPageAccessible("/salesperson-dashboard") && (
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
      )}
      
      {(isPageAccessible("/training/manage") || isPageAccessible("/training/performance")) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <GraduationCap className="mr-2 h-5 w-5" />
              Training Management
            </CardTitle>
            <CardDescription>
              Manage training videos and quizzes for employees
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPageAccessible("/training/manage") && (
              <Button 
                onClick={() => navigate("/training/manage")} 
                className="w-full sm:w-auto"
              >
                Manage Training Content
              </Button>
            )}
            {isPageAccessible("/training/performance") && (
              <Button 
                onClick={() => navigate("/training/performance")} 
                variant="outline"
                className="w-full sm:w-auto"
              >
                View Training Performance
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
