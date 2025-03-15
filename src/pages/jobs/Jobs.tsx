import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { SideNav } from "@/components/ui/dashboard/SideNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MoreVertical, Edit, Trash2, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function Jobs() {
  const [role, setRole] = useState<string>('salesperson');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);

      // Get user session
      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData.session) {
        // Get user role
        const { data: userData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', sessionData.session.user.id)
          .single();

        if (userData) {
          setRole(userData.role);
        }
      }

      // Fetch jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;

      setJobs(jobsData || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        description: "Failed to load jobs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(search.toLowerCase()) ||
    job.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteJob = async (id: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        description: "Job deleted successfully",
      });

      // Refresh the list
      fetchData();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        description: "Failed to delete job",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <SideNav role={role as any} />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold tracking-tight">Job Postings</h1>
              {role === 'manager' && (
                <Button onClick={() => navigate('/jobs/manage')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Manage Jobs
                </Button>
              )}
            </div>

            <div className="mb-4">
              <Input
                type="search"
                placeholder="Search jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableCaption>A list of your job postings.</TableCaption>
                <TableHead>
                  <TableRow>
                    <TableHead className="w-[200px]">Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center p-4">
                        Loading jobs...
                      </TableCell>
                    </TableRow>
                  ) : filteredJobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center p-4">
                        No jobs found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell>{job.description}</TableCell>
                        <TableCell>{new Date(job.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => navigate(`/jobs/manage?id=${job.id}`)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" className="w-full justify-start">
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the job.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteJob(job.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4}>
                      {filteredJobs.length} job(s) listed.
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
