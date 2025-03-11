
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Search, UserPlus, Brain, Calendar } from "lucide-react";

const AssignAssessment = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    checkUserRole();
    Promise.all([fetchTemplates(), fetchCandidates()]).finally(() => setIsLoading(false));
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to access this page");
        navigate("/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Failed to verify user permissions");
        navigate("/dashboard");
        return;
      }

      if (profile.role !== "manager" && profile.role !== "admin") {
        toast.error("You don't have permission to access this page");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error checking user role:", error);
      toast.error("An error occurred while verifying your permissions");
      navigate("/dashboard");
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("assessment_templates")
        .select("id, title, description, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching templates:", error);
        toast.error("Failed to load assessment templates");
        return;
      }

      setTemplates(data || []);
    } catch (error) {
      console.error("Error loading templates:", error);
      toast.error("An error occurred while loading assessment templates");
    }
  };

  const fetchCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, role")
        .eq("role", "candidate")
        .order("full_name");

      if (error) {
        console.error("Error fetching candidates:", error);
        toast.error("Failed to load candidates");
        return;
      }

      setCandidates(data || []);
    } catch (error) {
      console.error("Error loading candidates:", error);
      toast.error("An error occurred while loading candidates");
    }
  };

  const handleAssignAssessments = async () => {
    if (!selectedTemplateId) {
      toast.error("Please select an assessment template");
      return;
    }

    if (selectedCandidates.length === 0) {
      toast.error("Please select at least one candidate");
      return;
    }

    try {
      setIsSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in");
        navigate("/login");
        return;
      }

      const assessments = selectedCandidates.map(candidateId => ({
        template_id: selectedTemplateId,
        candidate_id: candidateId,
        created_by: session.user.id,
        status: "pending"
      }));

      const { data, error } = await supabase
        .from("assessments")
        .insert(assessments)
        .select();

      if (error) {
        console.error("Error assigning assessments:", error);
        toast.error("Failed to assign assessments");
        return;
      }

      toast.success(`Successfully assigned assessments to ${selectedCandidates.length} candidates`);
      setSelectedTemplateId("");
      setSelectedCandidates([]);
    } catch (error) {
      console.error("Error assigning assessments:", error);
      toast.error("An error occurred while assigning assessments");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCandidateSelection = (candidateId: string) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const selectAllCandidates = () => {
    if (selectedCandidates.length === filteredCandidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(filteredCandidates.map(c => c.id));
    }
  };

  const filteredCandidates = candidates.filter(candidate => 
    candidate.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold tracking-tight">
                Assign Assessment
              </h1>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full max-w-md" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-[500px] w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Assessment Template
                  </CardTitle>
                  <CardDescription>
                    Select the assessment template to assign to candidates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {templates.length === 0 ? (
                    <div className="text-center p-4 border rounded-md bg-muted/20">
                      <p className="text-muted-foreground">No assessment templates available</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => navigate("/assessments/templates/new")}
                      >
                        Create Template
                      </Button>
                    </div>
                  ) : (
                    <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  
                  {selectedTemplateId && (
                    <div className="mt-4 p-3 border rounded-md bg-muted/20">
                      <h3 className="font-medium">
                        {templates.find(t => t.id === selectedTemplateId)?.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {templates.find(t => t.id === selectedTemplateId)?.description || "No description"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Select Candidates
                  </CardTitle>
                  <CardDescription>
                    Choose the candidates to assign this assessment to
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search candidates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  
                  {candidates.length === 0 ? (
                    <div className="text-center p-4 border rounded-md bg-muted/20">
                      <p className="text-muted-foreground">No candidates available</p>
                    </div>
                  ) : (
                    <div className="border rounded-md overflow-hidden">
                      <div className="flex items-center p-3 bg-muted/30 border-b">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="select-all" 
                            checked={
                              filteredCandidates.length > 0 && 
                              selectedCandidates.length === filteredCandidates.length
                            }
                            onCheckedChange={selectAllCandidates}
                          />
                          <label 
                            htmlFor="select-all" 
                            className="text-sm font-medium cursor-pointer"
                          >
                            Select All
                          </label>
                        </div>
                        <div className="ml-auto text-sm text-muted-foreground">
                          {selectedCandidates.length} selected
                        </div>
                      </div>
                      
                      <div className="max-h-[300px] overflow-y-auto">
                        {filteredCandidates.length === 0 ? (
                          <div className="p-4 text-center text-muted-foreground">
                            No candidates match your search
                          </div>
                        ) : (
                          filteredCandidates.map((candidate) => (
                            <div 
                              key={candidate.id} 
                              className="flex items-center p-3 hover:bg-muted/20 border-b last:border-b-0"
                            >
                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`candidate-${candidate.id}`} 
                                  checked={selectedCandidates.includes(candidate.id)}
                                  onCheckedChange={() => toggleCandidateSelection(candidate.id)}
                                />
                                <label 
                                  htmlFor={`candidate-${candidate.id}`} 
                                  className="cursor-pointer"
                                >
                                  <div>{candidate.full_name}</div>
                                  <div className="text-sm text-muted-foreground">{candidate.email}</div>
                                </label>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Assignment Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-md bg-muted/10">
                        <div className="text-sm text-muted-foreground">Template</div>
                        <div className="font-medium mt-1">
                          {selectedTemplateId 
                            ? templates.find(t => t.id === selectedTemplateId)?.title 
                            : "No template selected"}
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-md bg-muted/10">
                        <div className="text-sm text-muted-foreground">Candidates</div>
                        <div className="font-medium mt-1">
                          {selectedCandidates.length} selected
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button 
                      onClick={handleAssignAssessments}
                      disabled={isSaving || !selectedTemplateId || selectedCandidates.length === 0}
                      className="px-8"
                    >
                      {isSaving ? "Assigning..." : "Assign Assessment"}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AssignAssessment;
