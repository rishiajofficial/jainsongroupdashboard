
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, FileEdit, Trash2, ClipboardList } from "lucide-react";

const AssessmentTemplates = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    checkUserRole();
    fetchTemplates();
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
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return;
      }

      let query = supabase
        .from("assessment_templates")
        .select(`
          id,
          title,
          description,
          created_at,
          updated_at,
          questions:questions(count)
        `)
        .eq("created_by", session.user.id);
      
      const { data, error } = await query;

      if (error) {
        console.error("Error fetching templates:", error);
        toast.error("Failed to load assessment templates");
        return;
      }

      setTemplates(data || []);
    } catch (error) {
      console.error("Error loading templates:", error);
      toast.error("An error occurred while loading assessment templates");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    navigate("/assessments/templates/new");
  };

  const handleEditTemplate = (templateId: string) => {
    navigate(`/assessments/templates/${templateId}`);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      // First delete all questions associated with this template
      const { error: questionsError } = await supabase
        .from("questions")
        .delete()
        .eq("assessment_template_id", templateId);

      if (questionsError) {
        console.error("Error deleting template questions:", questionsError);
        toast.error("Failed to delete template questions");
        return;
      }

      // Then delete the template itself
      const { error } = await supabase
        .from("assessment_templates")
        .delete()
        .eq("id", templateId);

      if (error) {
        console.error("Error deleting template:", error);
        toast.error("Failed to delete assessment template");
        return;
      }

      toast.success("Assessment template deleted successfully");
      fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("An error occurred while deleting the assessment template");
    }
  };

  const filteredTemplates = templates.filter(template => 
    template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (template.description && template.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Assessment Templates</h1>
              <p className="text-muted-foreground">
                Create and manage sales skill assessment templates for your candidates
              </p>
            </div>
            <Button onClick={handleCreateTemplate}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                  <CardFooter className="p-6 pt-0">
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="overflow-hidden">
                  <CardHeader className="p-6">
                    <CardTitle>{template.title}</CardTitle>
                    <CardDescription>
                      {template.questions.count} questions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {template.description || "No description provided"}
                    </p>
                    <div className="mt-4 text-xs text-muted-foreground">
                      Last updated: {new Date(template.updated_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 pt-0 flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditTemplate(template.id)}
                    >
                      <FileEdit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No templates found</h3>
              <p className="text-muted-foreground mt-2 mb-6">
                {searchQuery 
                  ? "No templates match your search. Try a different term." 
                  : "You haven't created any assessment templates yet."}
              </p>
              <Button onClick={handleCreateTemplate}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AssessmentTemplates;
