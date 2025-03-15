
import { RadioGroup } from "@/components/ui/radio-group";
import { QuizOption } from "./QuizOption";
import { QuizQuestion as QuizQuestionType } from "./types";

interface QuizQuestionProps {
  question: QuizQuestionType;
  selectedOptionId?: string;
  onAnswerSelect: (optionId: string) => void;
  showResults: boolean;
}

export function QuizQuestion({ 
  question, 
  selectedOptionId, 
  onAnswerSelect, 
  showResults 
}: QuizQuestionProps) {
  if (showResults) {
    return (
      <div className="border rounded-md p-4">
        <p className="font-medium mb-2">
          {question.question}
        </p>
        <div className="space-y-2">
          {question.training_quiz_options.map(option => {
            const isSelected = selectedOptionId === option.id;
            
            return (
              <QuizOption
                key={option.id}
                option={option}
                questionId={question.id}
                isSelected={isSelected}
                showResults={showResults}
                isCorrect={option.is_correct}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="text-lg font-medium mb-4">
        {question.question}
      </div>
      
      <RadioGroup 
        value={selectedOptionId} 
        onValueChange={onAnswerSelect}
        className="space-y-3"
      >
        {question.training_quiz_options.map(option => (
          <QuizOption
            key={option.id}
            option={option}
            questionId={question.id}
            isSelected={selectedOptionId === option.id}
            showResults={false}
          />
        ))}
      </RadioGroup>
    </>
  );
}
