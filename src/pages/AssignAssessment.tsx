
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
  Search, 
  ArrowLeft, 
  Loader2, 
  Plus,
  Send,
  CheckCircle,
  XCircle,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AssignAssessment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [template, setTemplate] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [existingAssignments, setExistingAssignments] = useState({});

  // Fetch template and candidates
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch template details
        const { data: templateData, error: templateError } = await supabase
          .from('assessment_templates')
          .select('*')
          .eq('id', id)
          .single();

        if (templateError) throw templateError;
        setTemplate(templateData);

        // Fetch candidates (users with role 'candidate')
        const { data: candidatesData, error: candidatesError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'candidate');

        if (candidatesError) throw candidatesError;
        setCandidates(candidatesData || []);

        // Fetch existing assessment assignments for this template
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('assessments')
          .select('candidate_id, status')
          .eq('template_id', id);

        if (assignmentsError) throw assignmentsError;
        
        // Create a map of candidate_id to assignment status
        const assignmentsMap = {};
        assignmentsData?.forEach(assignment => {
          assignmentsMap[assignment.candidate_id] = assignment.status;
        });
        setExistingAssignments(assignmentsMap);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Filter candidates based on search query
  const filteredCandidates = candidates.filter(candidate => 
    (candidate.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     candidate.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     candidate.company?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Toggle candidate selection
  const toggleCandidate = (candidateId) => {
    setSelectedCandidates(prev => ({
      ...prev,
      [candidateId]: !prev[candidateId]
    }));
  };

  // Select all visible candidates
  const selectAllVisible = () => {
    const newSelected = { ...selectedCandidates };
    filteredCandidates.forEach(candidate => {
      // Don't select candidates who already have an assessment
      if (!existingAssignments[candidate.id]) {
        newSelected[candidate.id] = true;
      }
    });
    setSelectedCandidates(newSelected);
  };

  // Deselect all candidates
  const deselectAll = () => {
    setSelectedCandidates({});
  };

  // Get assignment status label and color
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { label: 'Pending', color: 'text-yellow-500' };
      case 'in_progress':
        return { label: 'In Progress', color: 'text-blue-500' };
      case 'completed':
        return { label: 'Completed', color: 'text-green-500' };
      case 'evaluated':
        return { label: 'Evaluated', color: 'text-purple-500' };
      default:
        return { label: status, color: 'text-gray-500' };
    }
  };

  // Assign assessment to selected candidates
  const assignAssessment = async () => {
    const selectedIds = Object.keys(selectedCandidates).filter(id => selectedCandidates[id]);
    
    if (selectedIds.length === 0) {
      toast.error("No candidates selected");
      return;
    }

    setIsAssigning(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("You must be logged in to assign assessments");
      }

      // Prepare assessment records for each selected candidate
      const assessments = selectedIds.map(candidateId => ({
        template_id: id,
        candidate_id: candidateId,
        status: 'pending',
        created_by: session.session.user.id
      }));

      // Insert assessments
      const { error } = await supabase
        .from('assessments')
        .insert(assessments);

      if (error) throw error;

      // Refresh assignments
      const { data: updatedAssignments, error: fetchError } = await supabase
        .from('assessments')
        .select('candidate_id, status')
        .eq('template_id', id);

      if (fetchError) throw fetchError;
        
      const updatedAssignmentsMap = {};
      updatedAssignments?.forEach(assignment => {
        updatedAssignmentsMap[assignment.candidate_id] = assignment.status;
      });
      setExistingAssignments(updatedAssignmentsMap);

      // Clear selections
      setSelectedCandidates({});
      
      toast.success(`Assessment assigned to ${selectedIds.length} candidate(s)`);
    } catch (error) {
      console.error('Error assigning assessment:', error);
      toast.error('Failed to assign assessment');
    } finally {
      setIsAssigning(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Assessment template not found</h1>
          <Button onClick={() => navigate('/assessment-templates')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Templates
          </Button>
        </main>
      </div>
    );
  }

  const selectedCount = Object.values(selectedCandidates).filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="mb-6 flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/assessment-templates')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Assign Assessment</h1>
            <p className="text-muted-foreground">{template.title}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Template Info */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Assessment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Title</h3>
                <p>{template.title}</p>
              </div>
              {template.description && (
                <div>
                  <h3 className="font-medium">Description</h3>
                  <p className="text-sm">{template.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Right Column - Candidate Selection */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Select Candidates</CardTitle>
              <CardDescription>
                Assign this assessment to one or more candidates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search candidates..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={selectAllVisible}
                    className="whitespace-nowrap"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" /> Select All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={deselectAll}
                    className="whitespace-nowrap"
                  >
                    <XCircle className="h-4 w-4 mr-2" /> Clear
                  </Button>
                </div>
              </div>
              
              {filteredCandidates.length > 0 ? (
                <div className="border rounded-md divide-y">
                  {filteredCandidates.map((candidate) => {
                    const existingStatus = existingAssignments[candidate.id];
                    const { label: statusLabel, color: statusColor } = 
                      existingStatus ? getStatusInfo(existingStatus) : { label: '', color: '' };
                    
                    return (
                      <div 
                        key={candidate.id} 
                        className={`flex items-center justify-between p-3 ${
                          existingStatus ? 'bg-gray-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {!existingStatus && (
                            <Checkbox
                              checked={!!selectedCandidates[candidate.id]}
                              onCheckedChange={() => toggleCandidate(candidate.id)}
                              id={`candidate-${candidate.id}`}
                            />
                          )}
                          <div className="flex flex-col">
                            <Label
                              htmlFor={`candidate-${candidate.id}`}
                              className="font-medium cursor-pointer"
                            >
                              {candidate.full_name || "Unnamed"}
                            </Label>
                            <span className="text-sm text-muted-foreground">
                              {candidate.email}
                            </span>
                            {candidate.company && (
                              <span className="text-xs text-muted-foreground">
                                {candidate.company}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {existingStatus && (
                          <span className={`text-sm font-medium ${statusColor}`}>
                            {statusLabel}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-md">
                  <p className="text-muted-foreground">No candidates found</p>
                  {searchQuery && (
                    <Button 
                      variant="link" 
                      onClick={() => setSearchQuery("")}
                      className="mt-2"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" /> Clear search
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div>
                {selectedCount > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {selectedCount} candidate(s) selected
                  </p>
                )}
              </div>
              <Button 
                onClick={assignAssessment}
                disabled={selectedCount === 0 || isAssigning}
              >
                {isAssigning ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Assign Assessment
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AssignAssessment;
