
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
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  Plus, 
  Edit, 
  Trash2, 
  MoveUp, 
  MoveDown, 
  CheckCircle, 
  ArrowLeft, 
  HelpCircle, 
  Loader2,
  MessageSquare,
  Video,
  CheckSquare,
  Save
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const EditAssessmentTemplate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [template, setTemplate] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("template");
  
  const [addQuestionDialogOpen, setAddQuestionDialogOpen] = useState(false);
  const [editQuestionDialogOpen, setEditQuestionDialogOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [editIndex, setEditIndex] = useState(-1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newQuestion, setNewQuestion] = useState({
    question_text: "",
    question_type: "mcq",
    evaluation_criteria: {},
    options: [
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false }
    ]
  });

  // Fetch template and questions
  useEffect(() => {
    const fetchTemplateData = async () => {
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

        // Fetch questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*, answer_options(*)')
          .eq('assessment_template_id', id)
          .order('order_number', { ascending: true });

        if (questionsError) throw questionsError;
        setQuestions(questionsData || []);
      } catch (error) {
        console.error('Error fetching template data:', error);
        toast.error('Failed to load assessment template');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchTemplateData();
    }
  }, [id]);

  // Handle template updates
  const handleUpdateTemplate = async (e) => {
    e.preventDefault();
    if (!template.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('assessment_templates')
        .update({
          title: template.title,
          description: template.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      toast.success("Template updated successfully");
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Failed to update template');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle adding a new question
  const handleAddQuestion = async () => {
    if (!newQuestion.question_text.trim()) {
      toast.error("Question text is required");
      return;
    }

    if (newQuestion.question_type === "mcq") {
      // Ensure at least 2 options for MCQ
      const validOptions = newQuestion.options.filter(
        option => option.option_text.trim() !== ""
      );
      if (validOptions.length < 2) {
        toast.error("MCQ questions require at least 2 options");
        return;
      }

      // Ensure at least one correct answer for MCQ
      if (!newQuestion.options.some(option => option.is_correct)) {
        toast.error("At least one option must be marked as correct");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Insert new question
      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .insert([
          {
            assessment_template_id: id,
            question_text: newQuestion.question_text,
            question_type: newQuestion.question_type,
            evaluation_criteria: newQuestion.question_type !== "mcq" ? newQuestion.evaluation_criteria : null,
            order_number: questions.length + 1
          }
        ])
        .select();

      if (questionError) throw questionError;

      // If it's an MCQ, insert options
      if (newQuestion.question_type === "mcq") {
        const validOptions = newQuestion.options.filter(
          option => option.option_text.trim() !== ""
        );

        const optionsToInsert = validOptions.map((option, index) => ({
          question_id: questionData[0].id,
          option_text: option.option_text,
          is_correct: option.is_correct,
          order_number: index + 1
        }));

        const { error: optionsError } = await supabase
          .from('answer_options')
          .insert(optionsToInsert);

        if (optionsError) throw optionsError;
      }

      toast.success("Question added successfully");
      setAddQuestionDialogOpen(false);
      
      // Refresh questions
      const { data: updatedQuestions, error: fetchError } = await supabase
        .from('questions')
        .select('*, answer_options(*)')
        .eq('assessment_template_id', id)
        .order('order_number', { ascending: true });
        
      if (fetchError) throw fetchError;
      setQuestions(updatedQuestions || []);
      
      // Reset new question form
      setNewQuestion({
        question_text: "",
        question_type: "mcq",
        evaluation_criteria: {},
        options: [
          { option_text: "", is_correct: false },
          { option_text: "", is_correct: false }
        ]
      });
    } catch (error) {
      console.error('Error adding question:', error);
      toast.error('Failed to add question');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add option to MCQ
  const addOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: [
        ...newQuestion.options,
        { option_text: "", is_correct: false }
      ]
    });
  };

  // Remove option from MCQ
  const removeOption = (index) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions.splice(index, 1);
    setNewQuestion({
      ...newQuestion,
      options: updatedOptions
    });
  };

  // Update option
  const updateOption = (index, field, value) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: value
    };
    setNewQuestion({
      ...newQuestion,
      options: updatedOptions
    });
  };

  // Reorder question (move up/down)
  const reorderQuestion = async (questionId, currentOrder, direction) => {
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
    
    // Find the question to swap with
    const questionToSwap = questions.find(q => q.order_number === newOrder);
    if (!questionToSwap) return;
    
    try {
      // Update the current question's order
      await supabase
        .from('questions')
        .update({ order_number: newOrder })
        .eq('id', questionId);
        
      // Update the swapped question's order
      await supabase
        .from('questions')
        .update({ order_number: currentOrder })
        .eq('id', questionToSwap.id);
        
      // Refresh questions list
      const { data: updatedQuestions, error: fetchError } = await supabase
        .from('questions')
        .select('*, answer_options(*)')
        .eq('assessment_template_id', id)
        .order('order_number', { ascending: true });
        
      if (fetchError) throw fetchError;
      setQuestions(updatedQuestions || []);
      
    } catch (error) {
      console.error('Error reordering questions:', error);
      toast.error('Failed to reorder questions');
    }
  };

  // Delete question
  const deleteQuestion = async (questionId) => {
    try {
      // Delete the question (cascade will delete options)
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);
        
      if (error) throw error;
      
      // Update order numbers for remaining questions
      const remainingQuestions = questions.filter(q => q.id !== questionId);
      
      for (let i = 0; i < remainingQuestions.length; i++) {
        await supabase
          .from('questions')
          .update({ order_number: i + 1 })
          .eq('id', remainingQuestions[i].id);
      }
      
      // Refresh questions list
      const { data: updatedQuestions, error: fetchError } = await supabase
        .from('questions')
        .select('*, answer_options(*)')
        .eq('assessment_template_id', id)
        .order('order_number', { ascending: true });
        
      if (fetchError) throw fetchError;
      setQuestions(updatedQuestions || []);
      
      toast.success("Question deleted successfully");
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    }
  };

  // Get question type icon
  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'mcq':
        return <CheckSquare className="h-4 w-4" />;
      case 'scenario':
        return <MessageSquare className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  // Define question type options
  const questionTypes = [
    { value: "mcq", label: "Multiple Choice", icon: <CheckSquare className="h-4 w-4 mr-2" /> },
    { value: "scenario", label: "Scenario-based", icon: <MessageSquare className="h-4 w-4 mr-2" /> },
    { value: "video", label: "Video Response", icon: <Video className="h-4 w-4 mr-2" /> }
  ];
  
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
            <h1 className="text-3xl font-bold">Edit Assessment Template</h1>
            <p className="text-muted-foreground">{template.title}</p>
          </div>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="template">Template Details</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
          </TabsList>
          
          {/* Template Details Tab */}
          <TabsContent value="template" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Information</CardTitle>
                <CardDescription>
                  Update your assessment template details
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleUpdateTemplate}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={template.title || ""}
                      onChange={(e) => setTemplate({...template, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={template.description || ""}
                      onChange={(e) => setTemplate({...template, description: e.target.value})}
                      rows={4}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Assessment Questions</h2>
              <Button onClick={() => setAddQuestionDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Question
              </Button>
            </div>
            
            {questions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No questions yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Start adding questions to your assessment template
                  </p>
                  <Button onClick={() => setAddQuestionDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add First Question
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <Card key={question.id} className="relative">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="bg-primary/10 text-primary rounded-full h-6 w-6 flex items-center justify-center mr-1">
                          {index + 1}
                        </div>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          {getQuestionTypeIcon(question.question_type)}
                          {questionTypes.find(t => t.value === question.question_type)?.label}
                        </span>
                      </div>
                      <CardTitle className="text-lg">{question.question_text}</CardTitle>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {question.question_type === 'mcq' && (
                        <div className="space-y-2 mt-2">
                          {question.answer_options.sort((a, b) => a.order_number - b.order_number).map((option) => (
                            <div 
                              key={option.id}
                              className={`flex items-center p-2 border rounded-md ${
                                option.is_correct ? 'border-green-500 bg-green-50' : 'border-gray-200'
                              }`}
                            >
                              {option.is_correct && (
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                              )}
                              <span>{option.option_text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {question.question_type === 'scenario' && (
                        <div className="text-sm text-muted-foreground mt-2">
                          <p>Scenario-based question with text response</p>
                          {question.evaluation_criteria && (
                            <div className="mt-2">
                              <p className="font-medium">Evaluation criteria:</p>
                              <pre className="text-xs mt-1 p-2 bg-muted rounded">
                                {JSON.stringify(question.evaluation_criteria, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {question.question_type === 'video' && (
                        <div className="text-sm text-muted-foreground mt-2">
                          <p>Video response question</p>
                          {question.evaluation_criteria && (
                            <div className="mt-2">
                              <p className="font-medium">Evaluation criteria:</p>
                              <pre className="text-xs mt-1 p-2 bg-muted rounded">
                                {JSON.stringify(question.evaluation_criteria, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={index === 0}
                          onClick={() => reorderQuestion(question.id, question.order_number, 'up')}
                        >
                          <MoveUp className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={index === questions.length - 1}
                          onClick={() => reorderQuestion(question.id, question.order_number, 'down')}
                        >
                          <MoveDown className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setCurrentQuestion(question);
                            setEditIndex(index);
                            setEditQuestionDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-destructive"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this question?")) {
                              deleteQuestion(question.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Question Dialog */}
      <Dialog open={addQuestionDialogOpen} onOpenChange={setAddQuestionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Question</DialogTitle>
            <DialogDescription>
              Create a new question for your assessment template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="question_text">Question Text</Label>
              <Textarea
                id="question_text"
                placeholder="Enter your question here"
                value={newQuestion.question_text}
                onChange={(e) => setNewQuestion({...newQuestion, question_text: e.target.value})}
                rows={3}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="question_type">Question Type</Label>
              <Select
                value={newQuestion.question_type}
                onValueChange={(value) => {
                  setNewQuestion({
                    ...newQuestion,
                    question_type: value,
                    evaluation_criteria: value !== "mcq" ? {
                      clarity: "Evaluate the clarity of the response",
                      relevance: "Evaluate the relevance of the response",
                      persuasiveness: "Evaluate the persuasiveness of the response"
                    } : {}
                  });
                }}
              >
                <SelectTrigger id="question_type">
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent>
                  {questionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center">
                        {type.icon}
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {newQuestion.question_type === "mcq" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Answer Options</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={addOption}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Option
                  </Button>
                </div>
                
                {newQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-md">
                    <div className="pt-2">
                      <Switch
                        checked={option.is_correct}
                        onCheckedChange={(checked) => updateOption(index, 'is_correct', checked)}
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option.option_text}
                        onChange={(e) => updateOption(index, 'option_text', e.target.value)}
                        required
                      />
                      {option.is_correct && (
                        <p className="text-xs text-green-600 mt-1">Correct answer</p>
                      )}
                    </div>
                    {index > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="evaluation_criteria">Evaluation Criteria</Label>
                <Textarea
                  id="evaluation_criteria"
                  value={JSON.stringify(newQuestion.evaluation_criteria, null, 2)}
                  onChange={(e) => {
                    try {
                      const criteria = JSON.parse(e.target.value);
                      setNewQuestion({...newQuestion, evaluation_criteria: criteria});
                    } catch (error) {
                      // Don't update if JSON is invalid
                    }
                  }}
                  rows={5}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Define JSON criteria for AI to evaluate responses
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button" 
              variant="outline"
              onClick={() => setAddQuestionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleAddQuestion}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditAssessmentTemplate;
