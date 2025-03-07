
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Play, 
  Clock, 
  CheckCircle, 
  BarChart,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CandidateAssessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const navigate = useNavigate();

  // Fetch candidate's assessments
  useEffect(() => {
    const fetchAssessments = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("You must be logged in to view your assessments");
          navigate("/login");
          return;
        }

        // Fetch assessments along with template details
        const { data, error } = await supabase
          .from('assessments')
          .select(`
            *,
            template:template_id(id, title, description)
          `)
          .eq('candidate_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAssessments(data || []);
      } catch (error) {
        console.error('Error fetching assessments:', error);
        toast.error('Failed to load your assessments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessments();
  }, [navigate]);

  // Filter assessments by status based on active tab
  const filteredAssessments = assessments.filter(assessment => {
    if (activeTab === "pending") {
      return assessment.status === "pending";
    } else if (activeTab === "in_progress") {
      return assessment.status === "in_progress";
    } else if (activeTab === "completed") {
      return assessment.status === "completed" || assessment.status === "evaluated";
    }
    return true;
  });

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Start assessment
  const startAssessment = async (assessmentId) => {
    try {
      // Update assessment status to in_progress
      const { error } = await supabase
        .from('assessments')
        .update({
          status: 'in_progress',
          start_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', assessmentId);

      if (error) throw error;
      
      // Redirect to take assessment page
      navigate(`/assessment/${assessmentId}/take`);
    } catch (error) {
      console.error('Error starting assessment:', error);
      toast.error('Failed to start assessment');
    }
  };

  // Continue assessment
  const continueAssessment = (assessmentId) => {
    navigate(`/assessment/${assessmentId}/take`);
  };

  // View assessment results
  const viewResults = (assessmentId) => {
    navigate(`/assessment/${assessmentId}/results`);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="text-blue-500 border-blue-500">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-green-500 border-green-500">Completed</Badge>;
      case 'evaluated':
        return <Badge variant="outline" className="text-purple-500 border-purple-500">Evaluated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get action button based on assessment status
  const getActionButton = (assessment) => {
    switch (assessment.status) {
      case 'pending':
        return (
          <Button size="sm" onClick={() => startAssessment(assessment.id)}>
            <Play className="h-4 w-4 mr-2" /> Start
          </Button>
        );
      case 'in_progress':
        return (
          <Button size="sm" onClick={() => continueAssessment(assessment.id)}>
            <Clock className="h-4 w-4 mr-2" /> Continue
          </Button>
        );
      case 'completed':
      case 'evaluated':
        return (
          <Button size="sm" onClick={() => viewResults(assessment.id)}>
            <BarChart className="h-4 w-4 mr-2" /> View Results
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Assessments</h1>
          <p className="text-muted-foreground">View and take your assigned sales assessments</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <TabsContent value={activeTab} className="mt-6">
              {filteredAssessments.length > 0 ? (
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Assessment Title</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Assigned</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAssessments.map((assessment) => (
                          <TableRow key={assessment.id}>
                            <TableCell className="font-medium">
                              <div>
                                {assessment.template?.title || "Unnamed Assessment"}
                              </div>
                              {assessment.template?.description && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {assessment.template.description}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>{getStatusBadge(assessment.status)}</TableCell>
                            <TableCell>{formatDate(assessment.created_at)}</TableCell>
                            <TableCell className="text-right">
                              {getActionButton(assessment)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {activeTab === "all" 
                        ? "No assessments available" 
                        : `No ${activeTab.replace('_', ' ')} assessments`}
                    </h3>
                    <p className="text-muted-foreground text-center">
                      {activeTab === "pending" 
                        ? "You don't have any pending assessments to take" 
                        : activeTab === "in_progress"
                        ? "You don't have any assessments in progress"
                        : activeTab === "completed"
                        ? "You haven't completed any assessments yet"
                        : "You don't have any assessments assigned to you yet"}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default CandidateAssessments;
