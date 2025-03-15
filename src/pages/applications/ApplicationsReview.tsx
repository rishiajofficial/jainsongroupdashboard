import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { SideNav } from "@/components/ui/dashboard/SideNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function ApplicationsReview() {
  const { id } = useParams<{ id: string }>();
  const [role, setRole] = useState('salesperson');
  const [application, setApplication] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchApplication() {
      if (!id) return;

      try {
        setIsLoading(true);

        // Get user session
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          toast({
            description: "Please log in to access applications",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }

        // Get user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', sessionData.session.user.id)
          .single();

        if (profileData) {
          setRole(profileData.role);
        }

        // Fetch application data
        const { data: applicationData, error: applicationError } = await supabase
          .from('job_applications')
          .select('*')
          .eq('id', id)
          .single();

        if (applicationError) throw applicationError;

        setApplication(applicationData);
      } catch (error) {
        console.error('Error fetching application:', error);
        toast({
          description: "Failed to load the application",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchApplication();
  }, [id, navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex">
          <SideNav role={role as any} />
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Loading Application...</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Please wait while we load the application details.</p>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex">
          <SideNav role={role as any} />
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Application Not Found</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>The requested application could not be found.</p>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <SideNav role={role as any} />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Application Review</h1>
              <Badge>{application.status}</Badge>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>{application.candidate_name}</CardTitle>
                <CardDescription>
                  Applied for {application.job_title} on {new Date(application.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Email:</p>
                    <p>{application.candidate_email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Phone:</p>
                    <p>{application.candidate_phone}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Cover Letter:</p>
                  <p>{application.cover_letter}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Resume URL:</p>
                  <a href={application.resume_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    View Resume
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
