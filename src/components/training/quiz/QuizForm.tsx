
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QuizFormProps {
  videoId: string;
  onComplete: () => void;
  onCancel: () => void;
}

interface QuizQuestion {
  question: string;
  options: {
    option_text: string;
    is_correct: boolean;
  }[];
}

export function QuizForm({ videoId, onComplete, onCancel }: QuizFormProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    { question: "", options: [{ option_text: "", is_correct: false }] }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const form = useForm();

  const handleAddQuestion = () => {
    setQuestions([...questions, { 
      question: "", 
      options: [{ option_text: "", is_correct: false }] 
    }]);
  };

  const handleRemoveQuestion = (questionIndex: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, index) => index !== questionIndex));
    }
  };

  const handleAddOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push({ 
      option_text: "", 
      is_correct: false 
    });
    setQuestions(updatedQuestions);
  };

  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    if (questions[questionIndex].options.length > 1) {
      const updatedQuestions = [...questions];
      updatedQuestions[questionIndex].options = 
        updatedQuestions[questionIndex].options.filter((_, index) => index !== optionIndex);
      setQuestions(updatedQuestions);
    }
  };

  const handleQuestionChange = (questionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].question = value;
    setQuestions(updatedQuestions);
  };

  const handleOptionTextChange = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex].option_text = value;
    setQuestions(updatedQuestions);
  };

  const handleOptionCorrectChange = (questionIndex: number, optionIndex: number, checked: boolean) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex].is_correct = checked;
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    let isValid = true;
    questions.forEach((question, qIndex) => {
      if (!question.question.trim()) {
        toast({
          description: `Question ${qIndex + 1} cannot be empty`,
          variant: "destructive"
        });
        isValid = false;
      }
      
      let hasCorrectOption = false;
      question.options.forEach((option, oIndex) => {
        if (!option.option_text.trim()) {
          toast({
            description: `Option ${oIndex + 1} in question ${qIndex + 1} cannot be empty`,
            variant: "destructive"
          });
          isValid = false;
        }
        
        if (option.is_correct) {
          hasCorrectOption = true;
        }
      });
      
      if (!hasCorrectOption) {
        toast({
          description: `Question ${qIndex + 1} must have at least one correct answer`,
          variant: "destructive"
        });
        isValid = false;
      }
    });
    
    if (!isValid) return;
    
    try {
      setIsSubmitting(true);
      
      // Save questions and options
      for (const question of questions) {
        const { data: questionData, error: questionError } = await supabase
          .from('training_quiz_questions')
          .insert({
            video_id: videoId,
            question: question.question
          })
          .select()
          .single();
          
        if (questionError) throw questionError;
        
        const questionId = questionData.id;
        
        // Save options for this question
        const optionsToInsert = question.options.map((option, index) => ({
          question_id: questionId,
          option_text: option.option_text,
          is_correct: option.is_correct,
          order_number: index + 1
        }));
        
        const { error: optionsError } = await supabase
          .from('training_quiz_options')
          .insert(optionsToInsert);
          
        if (optionsError) throw optionsError;
      }
      
      toast({
        description: "Quiz questions saved successfully",
      });
      
      onComplete();
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast({
        description: "Failed to save quiz questions",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Quiz</CardTitle>
        <CardDescription>
          Add questions and options for the training video quiz
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((question, questionIndex) => (
            <div key={questionIndex} className="p-4 border rounded-md space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Question {questionIndex + 1}</h3>
                {questions.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveQuestion(questionIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                <FormLabel>Question Text</FormLabel>
                <Input
                  value={question.question}
                  onChange={(e) => handleQuestionChange(questionIndex, e.target.value)}
                  placeholder="Enter the question"
                />
              </div>
              
              <div className="space-y-4">
                <FormLabel>Options</FormLabel>
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center space-x-3">
                    <Checkbox
                      id={`q${questionIndex}-o${optionIndex}-correct`}
                      checked={option.is_correct}
                      onCheckedChange={(checked) => 
                        handleOptionCorrectChange(questionIndex, optionIndex, checked as boolean)
                      }
                    />
                    <Input
                      className="flex-grow"
                      value={option.option_text}
                      onChange={(e) => 
                        handleOptionTextChange(questionIndex, optionIndex, e.target.value)
                      }
                      placeholder={`Option ${optionIndex + 1}`}
                    />
                    {question.options.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveOption(questionIndex, optionIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddOption(questionIndex)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={handleAddQuestion}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Quiz"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
