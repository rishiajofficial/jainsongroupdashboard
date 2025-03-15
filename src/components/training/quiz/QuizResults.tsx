
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { QuizQuestion } from "./types";

interface QuizResultsProps {
  score: number;
  isPassed: boolean;
  passingScore: number;
  questions: QuizQuestion[];
  answers: Record<string, string>;
}

export function QuizResults({ 
  score, 
  isPassed, 
  passingScore, 
  questions, 
  answers 
}: QuizResultsProps) {
  return (
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
      
      <Button 
        className="w-full" 
        onClick={() => window.location.href = '/training'}
      >
        Return to Training Videos
      </Button>
    </div>
  );
}
