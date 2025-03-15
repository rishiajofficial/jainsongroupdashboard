
import { QuizQuestion as QuestionType } from "./types";

export interface QuizQuestionProps {
  question: QuestionType;
  selectedOptionId: string | undefined;
  onAnswerSelect: (optionId: string) => void;
  showResults?: boolean;
  disabled?: boolean;
}

export function QuizQuestion({ 
  question, 
  selectedOptionId, 
  onAnswerSelect, 
  showResults = false,
  disabled = false
}: QuizQuestionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{question.question}</h3>
      
      <div className="space-y-2">
        {question.training_quiz_options.map((option) => {
          const isSelected = option.id === selectedOptionId;
          const isCorrect = option.is_correct;
          
          let bgClass = "";
          if (showResults) {
            bgClass = isCorrect 
              ? "bg-green-100 border-green-500" 
              : isSelected && !isCorrect 
                ? "bg-red-100 border-red-500" 
                : "";
          } else {
            bgClass = isSelected ? "bg-blue-100 border-blue-500" : "";
          }
          
          return (
            <div
              key={option.id}
              className={`p-3 border rounded-md cursor-pointer ${bgClass} ${disabled ? 'opacity-70 cursor-not-allowed' : 'hover:bg-muted'}`}
              onClick={() => {
                if (!disabled) {
                  onAnswerSelect(option.id);
                }
              }}
            >
              <div className="flex items-center">
                <div className={`w-5 h-5 flex items-center justify-center border rounded-full mr-2 ${isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-gray-300'}`}>
                  {isSelected && <span className="text-xs">✓</span>}
                </div>
                <span>{option.option_text}</span>
              </div>
              
              {showResults && (
                <div className="mt-1 text-sm">
                  {isCorrect && <span className="text-green-600">Correct answer</span>}
                  {isSelected && !isCorrect && <span className="text-red-600">Incorrect answer</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
