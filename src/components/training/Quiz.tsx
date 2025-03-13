
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle } from "lucide-react";

interface QuizOption {
  id: string;
  option_text: string;
  is_correct: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  training_quiz_options: QuizOption[];
}

interface QuizProps {
  questions: QuizQuestion[];
  onComplete: (score: number, passed: boolean) => void;
  passingScore?: number;
}

export function Quiz({ questions, onComplete, passingScore = 70 }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizComplete, setQuizComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];
  
  const handleAnswer = (optionId: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: optionId
    });
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateScore();
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const calculateScore = () => {
    let correctAnswers = 0;
    
    questions.forEach(question => {
      const selectedOptionId = answers[question.id];
      const selectedOption = question.training_quiz_options.find(option => option.id === selectedOptionId);
      
      if (selectedOption && selectedOption.is_correct) {
        correctAnswers++;
      }
    });
    
    const finalScore = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = finalScore >= passingScore;
    
    setScore(finalScore);
    setQuizComplete(true);
    setShowResults(true);
    onComplete(finalScore, passed);
  };
  
  const isOptionCorrect = (questionId: string, optionId: string) => {
    if (!showResults) return null;
    
    const question = questions.find(q => q.id === questionId);
    const option = question?.training_quiz_options.find(o => o.id === optionId);
    
    return option?.is_correct;
  };
  
  if (!currentQuestion) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No questions available</CardTitle>
        </CardHeader>
      </Card>
    );
  }
  
  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const selectedOptionId = answers[currentQuestion.id];
  const isPassed = score >= passingScore;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {showResults ? "Quiz Results" : "Training Quiz"}
        </CardTitle>
        <CardDescription>
          {showResults 
            ? `You scored ${score}% (${isPassed ? 'Passed' : 'Failed'})`
            : `Question ${currentQuestionIndex + 1} of ${totalQuestions}`
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!showResults ? (
          <>
            <div className="mb-4">
              <Progress value={progressPercentage} />
            </div>
            
            <div className="text-lg font-medium mb-4">
              {currentQuestion.question}
            </div>
            
            <RadioGroup 
              value={selectedOptionId} 
              onValueChange={handleAnswer}
              className="space-y-3"
            >
              {currentQuestion.training_quiz_options.map(option => (
                <div key={option.id} className="flex items-center space-x-2 rounded-md border p-3">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <label 
                    htmlFor={option.id} 
                    className="flex-1 cursor-pointer font-medium"
                  >
                    {option.option_text}
                  </label>
                </div>
              ))}
            </RadioGroup>
          </>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
                {isPassed ? (
                  <CheckCircle className="h-10 w-10 text-green-500" />
                ) : (
                  <XCircle className="h-10 w-10 text-red-500" />
                )}
              </div>
              <h3 className="text-xl font-semibold">
                {isPassed ? "Congratulations!" : "Try Again"}
              </h3>
              <p className="text-muted-foreground">
                {isPassed 
                  ? "You've successfully completed this training module." 
                  : `You need at least ${passingScore}% to pass this quiz.`
                }
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Question Review:</h4>
              {questions.map((question, index) => (
                <div key={question.id} className="border rounded-md p-4">
                  <p className="font-medium mb-2">
                    {index + 1}. {question.question}
                  </p>
                  <div className="space-y-2">
                    {question.training_quiz_options.map(option => {
                      const isSelected = answers[question.id] === option.id;
                      const isCorrect = option.is_correct;
                      
                      return (
                        <div 
                          key={option.id} 
                          className={`flex items-center p-2 rounded ${
                            isSelected && isCorrect
                              ? 'bg-green-100 dark:bg-green-900/20'
                              : isSelected && !isCorrect
                              ? 'bg-red-100 dark:bg-red-900/20'
                              : !isSelected && isCorrect
                              ? 'bg-blue-100 dark:bg-blue-900/20'
                              : ''
                          }`}
                        >
                          {isSelected && isCorrect && (
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 shrink-0" />
                          )}
                          {isSelected && !isCorrect && (
                            <XCircle className="h-4 w-4 text-red-500 mr-2 shrink-0" />
                          )}
                          {!isSelected && isCorrect && (
                            <CheckCircle className="h-4 w-4 text-blue-500 mr-2 shrink-0" />
                          )}
                          {!isSelected && !isCorrect && (
                            <div className="w-4 h-4 mr-2" />
                          )}
                          <span>{option.option_text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {!showResults ? (
          <>
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            <Button 
              onClick={handleNext}
              disabled={!selectedOptionId}
            >
              {currentQuestionIndex < totalQuestions - 1 ? 'Next' : 'Submit'}
            </Button>
          </>
        ) : (
          <Button 
            className="w-full" 
            onClick={() => window.location.href = '/training'}
          >
            Return to Training Videos
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
