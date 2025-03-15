
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QuizQuestion } from "./quiz/QuizQuestion";
import { QuizResults } from "./quiz/QuizResults";
import { QuizProps } from "./quiz/types";

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
            
            <QuizQuestion
              question={currentQuestion}
              selectedOptionId={selectedOptionId}
              onAnswerSelect={handleAnswer}
              showResults={false}
            />
          </>
        ) : (
          <QuizResults
            score={score}
            isPassed={isPassed}
            passingScore={passingScore}
            questions={questions}
            answers={answers}
          />
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
        ) : null}
      </CardFooter>
    </Card>
  );
}
