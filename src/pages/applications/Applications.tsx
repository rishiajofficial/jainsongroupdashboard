
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from "@/components/ui/Header";
import { SideNav } from "@/components/ui/dashboard/SideNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Applications = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('salesperson');
  const { toast } = useToast();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        
        // Get user session
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session) {
          toast({
            description: "Please log in to view applications",
            variant: "destructive",
          });
          return;
        }
        
        // Get user role
        const { data: userData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', sessionData.session.user.id)
          .single();
          
        if (userData) {
          setRole(userData.role);
        }
        
        // Get applications (this is simplified since it depends on your actual DB schema)
        const { data: applicationsData, error } = await supabase
          .from('applications')
          .select('*')
          .eq('user_id', sessionData.session.user.id);
          
        if (error) throw error;
        
        setApplications(applicationsData || []);
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast({
          description: "Failed to load applications",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, [toast]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <SideNav role={role as any} />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
            
            {loading ? (
              <div className="text-center py-10">
                <p>Loading applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Applications Found</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">You haven't applied to any jobs yet.</p>
                  <Button asChild>
                    <Link to="/jobs">Browse Jobs</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {applications.map((application) => (
                  <Card key={application.id}>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>{application.job_title || 'Job Application'}</span>
                        <Badge>{application.status}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-2">Applied on: {new Date(application.created_at).toLocaleDateString()}</p>
                      <Button asChild variant="outline">
                        <Link to={`/applications/review/${application.id}`}>View Details</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Applications;
