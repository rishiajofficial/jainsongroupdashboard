import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';

interface JobApplication {
  id: string;
  created_at: string;
  job_id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  resume_url: string | null;
  cover_letter: string | null;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
}

interface Job {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  company: string;
  location: string;
  salary: string | null;
  requirements: string | null;
}

export default function JobApplicationPage() {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplication = async () => {
      if (!id) return;

      try {
        setIsLoading(true);

        // Fetch application data
        const { data: applicationData, error: applicationError } = await supabase
          .from('job_applications')
          .select('*')
          .eq('id', id)
          .single();

        if (applicationError) throw applicationError;

        if (applicationData) {
          setApplication(applicationData);
          setName(applicationData.name);
          setEmail(applicationData.email);
          setPhone(applicationData.phone);
          setCoverLetter(applicationData.cover_letter || '');

          // Fetch job data
          const { data: jobData, error: jobError } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', applicationData.job_id)
            .single();

          if (jobError) throw jobError;

          if (jobData) {
            setJob(jobData);
          }
        }
      } catch (error) {
        console.error("Error fetching application:", error);
        toast({
          title: "Error",
          description: "Failed to load application details.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [id, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('job_applications')
        .update({
          name: name,
          email: email,
          phone: phone,
          cover_letter: coverLetter,
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Application updated successfully!",
      });
      navigate('/applications');
    } catch (error) {
      console.error("Error updating application:", error);
      toast({
        title: "Error",
        description: "Failed to update application.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading Application...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please wait while we fetch the application details.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!application || !job) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Application Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The requested application could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            Job Application for {job.title}
          </CardTitle>
          <CardDescription>
            Submitted on {format(new Date(application.created_at), 'MMMM d, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="coverLetter">Cover Letter</Label>
              <Textarea
                id="coverLetter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={5}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Application"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
