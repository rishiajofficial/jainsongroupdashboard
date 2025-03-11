import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus, Trash2, GripVertical, FileText, Video, CheckCircle } from "lucide-react";

interface Option {
  id?: string;
  option_text: string;
  is_correct: boolean;
  order_number: number;
}

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  order_number: number;
  evaluation_criteria?: any;
  options: Option[];
}

interface Template {
  id: string;
  title: string;
  description: string;
}

const EditAssessmentTemplate = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [template, setTemplate] = useState<Template>({
    id: "",
    title: "",
    description: ""
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState<Question>({
    id: "",
    question_text: "",
    question_type: "multiple_choice", // Default type
    order_number: 0,
    options: [
      { option_text: "", is_correct: false, order_number: 0 },
      { option_text: "", is_correct: false, order_number: 1 },
      { option_text: "", is_correct: false, order_number: 2 },
      { option_text: "", is_correct: false, order_number: 3 }
    ]
  });
  
  const { templateId } = useParams();
  const navigate = useNavigate();
  const isEditing = templateId !== "new" && templateId !== undefined;

  useEffect(() => {
    checkUserRole();
    if (isEditing) {
      fetchTemplateDetails();
    } else {
      // For new template, initialize with 3 empty questions
      setQuestions([
        {
          id: `new-${Date.now()}-1`,
          question_text: "What is your approach to prospecting new clients?",
          question_type: "text",
          order_number: 0,
          options: []
        },
        {
          id: `new-${Date.now()}-2`,
          question_text: "How do you typically handle objections about pricing?",
          question_type: "text",
          order_number: 1,
          options: []
        },
        {
          id: `new-${Date.now()}-3`,
          question_text: "Record a 60-second sales pitch for our product.",
          question_type: "video",
          order_number: 2,
          options: []
        }
      ]);
    }
  }, [templateId]);

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

  const fetchTemplateDetails = async () => {
    try {
      setIsLoading(true);
      
      // Fetch template details
      const { data: templateData, error: templateError } = await supabase
        .from("assessment_templates")
        .select("*")
        .eq("id", templateId)
        .single();

      if (templateError) {
        console.error("Error fetching template:", templateError);
        toast.error("Failed to load assessment template");
        navigate("/assessments/templates");
        return;
      }

      setTemplate(templateData);

      // Fetch template questions
      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select(`
          id,
          question_text,
          question_type,
          order_number,
          evaluation_criteria
        `)
        .eq("assessment_template_id", templateId)
        .order("order_number");

      if (questionsError) {
        console.error("Error fetching questions:", questionsError);
        toast.error("Failed to load template questions");
        return;
      }

      // Initialize questions with empty options arrays
      const questionsWithOptions = questionsData.map(q => ({
        ...q,
        options: []
      }));

      // Fetch answer options for multiple choice questions
      const multipleChoiceQuestions = questionsWithOptions.filter(q => q.question_type === "multiple_choice");
      
      if (multipleChoiceQuestions.length > 0) {
        for (const mcQuestion of multipleChoiceQuestions) {
          const { data: optionsData, error: optionsError } = await supabase
            .from("answer_options")
            .select("*")
            .eq("question_id", mcQuestion.id)
            .order("order_number");

          if (optionsError) {
            console.error(`Error fetching options for question ${mcQuestion.id}:`, optionsError);
            continue;
          }

          const questionIndex = questionsWithOptions.findIndex(q => q.id === mcQuestion.id);
          if (questionIndex !== -1) {
            questionsWithOptions[questionIndex].options = optionsData;
          }
        }
      }

      setQuestions(questionsWithOptions);
    } catch (error) {
      console.error("Error loading template details:", error);
      toast.error("An error occurred while loading template details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!template.title) {
      toast.error("Template title is required");
      return;
    }

    if (questions.some(q => !q.question_text)) {
      toast.error("All questions must have text");
      return;
    }

    if (questions.some(q => q.question_type === "multiple_choice" && 
                            (!q.options || q.options.some(o => !o.option_text)))) {
      toast.error("All multiple choice questions must have text for each option");
      return;
    }

    try {
      setIsSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to save templates");
        navigate("/login");
        return;
      }

      let templateId = template.id;

      // Create or update template
      if (isEditing) {
        const { error } = await supabase
          .from("assessment_templates")
          .update({
            title: template.title,
            description: template.description,
            updated_at: new Date().toISOString()
          })
          .eq("id", template.id);

        if (error) {
          console.error("Error updating template:", error);
          toast.error("Failed to update assessment template");
          return;
        }
      } else {
        const { data, error } = await supabase
          .from("assessment_templates")
          .insert({
            title: template.title,
            description: template.description,
            created_by: session.user.id
          })
          .select();

        if (error) {
          console.error("Error creating template:", error);
          toast.error("Failed to create assessment template");
          return;
        }

        templateId = data[0].id;
        setTemplate(prev => ({ ...prev, id: templateId }));
      }

      // Process questions
      for (const question of questions) {
        const questionData = {
          assessment_template_id: templateId,
          question_text: question.question_text,
          question_type: question.question_type,
          order_number: question.order_number,
          evaluation_criteria: question.evaluation_criteria || null
        };

        let questionId = question.id;
        if (question.id && !question.id.startsWith('new-')) {
          // Update existing question
          const { error } = await supabase
            .from("questions")
            .update(questionData)
            .eq("id", question.id);

          if (error) {
            console.error(`Error updating question ${question.id}:`, error);
            continue;
          }
        } else {
          // Create new question
          const { data, error } = await supabase
            .from("questions")
            .insert(questionData)
            .select();

          if (error) {
            console.error("Error creating question:", error);
            continue;
          }

          questionId = data[0].id;
        }

        // Handle options for multiple choice questions
        if (question.question_type === "multiple_choice" && question.options) {
          // If updating an existing question, delete old options first
          if (question.id && !question.id.startsWith('new-')) {
            await supabase
              .from("answer_options")
              .delete()
              .eq("question_id", question.id);
          }

          // Insert new options
          const optionsToInsert = question.options.map((option, index) => ({
            question_id: questionId,
            option_text: option.option_text,
            is_correct: option.is_correct,
            order_number: index
          }));

          if (optionsToInsert.length > 0) {
            const { error: optionsError } = await supabase
              .from("answer_options")
              .insert(optionsToInsert);

            if (optionsError) {
              console.error(`Error inserting options for question ${questionId}:`, optionsError);
            }
          }
        }
      }

      toast.success(`Assessment template ${isEditing ? 'updated' : 'created'} successfully`);
      navigate("/assessments/templates");
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error(`An error occurred while ${isEditing ? 'updating' : 'creating'} the template`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestion.question_text) {
      toast.error("Question text is required");
      return;
    }

    if (newQuestion.question_type === "multiple_choice" && 
        newQuestion.options.some(o => !o.option_text)) {
      toast.error("All options must have text");
      return;
    }

    const nextOrder = questions.length;
    setQuestions([
      ...questions, 
      {
        ...newQuestion,
        id: `new-${Date.now()}`,
        order_number: nextOrder
      }
    ]);

    // Reset new question form
    setNewQuestion({
      id: "",
      question_text: "",
      question_type: "multiple_choice",
      order_number: 0,
      options: [
        { option_text: "", is_correct: false, order_number: 0 },
        { option_text: "", is_correct: false, order_number: 1 },
        { option_text: "", is_correct: false, order_number: 2 },
        { option_text: "", is_correct: false, order_number: 3 }
      ]
    });
  };

  const handleDeleteQuestion = (index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    
    // Update order numbers
    updatedQuestions.forEach((q, i) => {
      q.order_number = i;
    });
    
    setQuestions(updatedQuestions);
  };

  const handleUpdateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    
    // If changing question type from multiple_choice, clear options
    if (field === "question_type" && value !== "multiple_choice") {
      updatedQuestions[index].options = [];
    }
    
    // If changing to multiple_choice and no options exist, add empty ones
    if (field === "question_type" && value === "multiple_choice" && 
        (!updatedQuestions[index].options || updatedQuestions[index].options.length === 0)) {
      updatedQuestions[index].options = [
        { option_text: "", is_correct: false, order_number: 0 },
        { option_text: "", is_correct: false, order_number: 1 },
        { option_text: "", is_correct: false, order_number: 2 },
        { option_text: "", is_correct: false, order_number: 3 }
      ];
    }
    
    setQuestions(updatedQuestions);
  };

  const handleUpdateOption = (questionIndex: number, optionIndex: number, field: string, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex][field] = value;
    
    // If marking this option as correct, unmark others
    if (field === "is_correct" && value === true) {
      updatedQuestions[questionIndex].options.forEach((opt, idx) => {
        if (idx !== optionIndex) {
          opt.is_correct = false;
        }
      });
    }
    
    setQuestions(updatedQuestions);
  };

  const handleNewQuestionOptionUpdate = (optionIndex: number, field: string, value: any) => {
    const updatedNewQuestion = { ...newQuestion };
    updatedNewQuestion.options[optionIndex][field] = value;
    
    // If marking this option as correct, unmark others
    if (field === "is_correct" && value === true) {
      updatedNewQuestion.options.forEach((opt, idx) => {
        if (idx !== optionIndex) {
          opt.is_correct = false;
        }
      });
    }
    
    setNewQuestion(updatedNewQuestion);
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "multiple_choice":
        return <CheckCircle className="h-4 w-4" />;
      case "text":
        return <FileText className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

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
                onClick={() => navigate("/assessments/templates")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold tracking-tight">
                {isEditing ? "Edit Assessment Template" : "Create Assessment Template"}
              </h1>
            </div>
            <Button 
              onClick={handleSaveTemplate}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Template"}
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full max-w-md" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-[500px] w-full" />
            </div>
          ) : (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Template Details</CardTitle>
                  <CardDescription>Basic information about your assessment template</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Template Title</Label>
                    <Input
                      id="title"
                      value={template.title}
                      onChange={(e) => setTemplate({ ...template, title: e.target.value })}
                      placeholder="e.g., Sales Skills Assessment"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={template.description}
                      onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                      placeholder="Describe the purpose and content of this assessment"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Assessment Questions</h2>
                  <div className="text-sm text-muted-foreground">
                    {questions.length} questions
                  </div>
                </div>

                {questions.length === 0 ? (
                  <Card className="text-center py-10">
                    <p className="text-muted-foreground">No questions added yet</p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <Card key={question.id || index} className="relative">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              {getQuestionTypeIcon(question.question_type)}
                              <div className="text-sm font-medium">Question {index + 1}</div>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteQuestion(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-0">
                          <div className="space-y-2">
                            <Label>Question Type</Label>
                            <Select 
                              value={question.question_type}
                              onValueChange={(value) => handleUpdateQuestion(index, "question_type", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select question type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                <SelectItem value="text">Text Response</SelectItem>
                                <SelectItem value="video">Video Response</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Question Text</Label>
                            <Textarea
                              value={question.question_text}
                              onChange={(e) => handleUpdateQuestion(index, "question_text", e.target.value)}
                              placeholder="Enter your question here"
                              rows={2}
                            />
                          </div>

                          {question.question_type === "multiple_choice" && (
                            <div className="space-y-4">
                              <Label>Answer Options</Label>
                              <div className="space-y-2">
                                {question.options.map((option, optionIndex) => (
                                  <div 
                                    key={optionIndex} 
                                    className="flex items-center gap-2 p-2 rounded border bg-background"
                                  >
                                    <Label 
                                      htmlFor={`q${index}-opt${optionIndex}-correct`}
                                      className="flex items-center gap-2 cursor-pointer"
                                    >
                                      <input
                                        type="radio"
                                        id={`q${index}-opt${optionIndex}-correct`}
                                        name={`q${index}-correct`}
                                        checked={option.is_correct}
                                        onChange={() => handleUpdateOption(index, optionIndex, "is_correct", true)}
                                      />
                                      <span className="text-sm">Correct</span>
                                    </Label>
                                    <Input
                                      value={option.option_text}
                                      onChange={(e) => handleUpdateOption(index, optionIndex, "option_text", e.target.value)}
                                      placeholder={`Option ${optionIndex + 1}`}
                                      className="flex-1"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Add New Question</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Question Type</Label>
                      <Select 
                        value={newQuestion.question_type}
                        onValueChange={(value) => setNewQuestion({...newQuestion, question_type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select question type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                          <SelectItem value="text">Text Response</SelectItem>
                          <SelectItem value="video">Video Response</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Question Text</Label>
                      <Textarea
                        value={newQuestion.question_text}
                        onChange={(e) => setNewQuestion({...newQuestion, question_text: e.target.value})}
                        placeholder="Enter your question here"
                        rows={2}
                      />
                    </div>

                    {newQuestion.question_type === "multiple_choice" && (
                      <div className="space-y-4">
                        <Label>Answer Options</Label>
                        <div className="space-y-2">
                          {newQuestion.options.map((option, optionIndex) => (
                            <div 
                              key={optionIndex} 
                              className="flex items-center gap-2 p-2 rounded border bg-background"
                            >
                              <Label 
                                htmlFor={`new-opt${optionIndex}-correct`}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <input
                                  type="radio"
                                  id={`new-opt${optionIndex}-correct`}
                                  name="new-correct"
                                  checked={option.is_correct}
                                  onChange={() => handleNewQuestionOptionUpdate(optionIndex, "is_correct", true)}
                                />
                                <span className="text-sm">Correct</span>
                              </Label>
                              <Input
                                value={option.option_text}
                                onChange={(e) => handleNewQuestionOptionUpdate(optionIndex, "option_text", e.target.value)}
                                placeholder={`Option ${optionIndex + 1}`}
                                className="flex-1"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleAddQuestion} className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Question
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

export default EditAssessmentTemplate;
