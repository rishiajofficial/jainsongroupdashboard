import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QuizFormProps {
  videoId: string;
  existingQuestions?: {
    question: string;
    quiz_number?: number;
    options: {
      option_text: string;
      is_correct: boolean;
    }[];
  }[];
  onComplete: () => void;
  onCancel: () => void;
}

interface QuizQuestion {
  question: string;
  quiz_number?: number;
  options: {
    option_text: string;
    is_correct: boolean;
  }[];
}

export function QuizForm({ videoId, existingQuestions = [], onComplete, onCancel }: QuizFormProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    { question: "", quiz_number: undefined, options: [{ option_text: "", is_correct: false }] }
  ]);
  const [quizNumber, setQuizNumber] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Load existing questions if provided
  useEffect(() => {
    if (existingQuestions && existingQuestions.length > 0) {
      setQuestions(existingQuestions);
      // Use the quiz_number from the first question if available
      if (existingQuestions[0]?.quiz_number) {
        setQuizNumber(existingQuestions[0].quiz_number);
      }
    }
  }, [existingQuestions]);

  const handleAddQuestion = () => {
    setQuestions([...questions, { 
      question: "", 
      quiz_number: undefined, 
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
      
      // If we have existing questions, delete them first
      if (existingQuestions && existingQuestions.length > 0) {
        // Get all question IDs for this video
        const { data: existingQuestionsData, error: questionsError } = await supabase
          .from('training_quiz_questions')
          .select('id')
          .eq('video_id', videoId);
          
        if (questionsError) throw questionsError;
        
        if (existingQuestionsData && existingQuestionsData.length > 0) {
          const questionIds = existingQuestionsData.map(q => q.id);
          
          // Delete all options for these questions
          const { error: optionsDeleteError } = await supabase
            .from('training_quiz_options')
            .delete()
            .in('question_id', questionIds);
            
          if (optionsDeleteError) throw optionsDeleteError;
          
          // Delete all questions
          const { error: questionsDeleteError } = await supabase
            .from('training_quiz_questions')
            .delete()
            .eq('video_id', videoId);
            
          if (questionsDeleteError) throw questionsDeleteError;
        }
      }
      
      // Save questions and options
      for (const question of questions) {
        const { data: questionData, error: questionError } = await supabase
          .from('training_quiz_questions')
          .insert({
            video_id: videoId,
            question: question.question,
            quiz_number: quizNumber
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
      
      // Update the has_quiz flag on the video
      const { error: updateError } = await supabase
        .from('training_videos')
        .update({ has_quiz: true })
        .eq('id', videoId);
        
      if (updateError) throw updateError;
      
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
        <CardTitle>{existingQuestions && existingQuestions.length > 0 ? "Edit Quiz" : "Create Quiz"}</CardTitle>
        <CardDescription>
          {existingQuestions && existingQuestions.length > 0 
            ? "Modify questions and options for the training video quiz" 
            : "Add questions and options for the training video quiz"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="quizNumber" className="text-sm font-medium leading-none">
              Quiz Number (Optional)
            </label>
            <Input
              id="quizNumber"
              type="number"
              value={quizNumber !== undefined ? quizNumber : ''}
              onChange={(e) => {
                const value = e.target.value !== '' ? parseInt(e.target.value) : undefined;
                setQuizNumber(value);
              }}
              className="max-w-xs"
              placeholder="Enter quiz number for sorting"
            />
            <p className="text-xs text-muted-foreground">
              The quiz number is used for ordering quizzes in the learning path
            </p>
          </div>
          
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
                <div className="font-medium text-sm">Question Text</div>
                <Input
                  value={question.question}
                  onChange={(e) => handleQuestionChange(questionIndex, e.target.value)}
                  placeholder="Enter the question"
                />
              </div>
              
              <div className="space-y-4">
                <div className="font-medium text-sm">Options</div>
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
