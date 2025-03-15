
import { RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle, XCircle } from "lucide-react";
import { QuizOption as QuizOptionType } from "./types";

interface QuizOptionProps {
  option: QuizOptionType;
  questionId: string;
  isSelected: boolean;
  showResults: boolean;
  isCorrect?: boolean | null;
}

export function QuizOption({ 
  option, 
  questionId, 
  isSelected, 
  showResults, 
  isCorrect 
}: QuizOptionProps) {
  if (!showResults) {
    return (
      <div className="flex items-center space-x-2 rounded-md border p-3">
        <RadioGroupItem value={option.id} id={option.id} />
        <label 
          htmlFor={option.id} 
          className="flex-1 cursor-pointer font-medium"
        >
          {option.option_text}
        </label>
      </div>
    );
  }

  // Results view
  return (
    <div 
      className={`flex items-center p-2 rounded ${
        isSelected && option.is_correct
          ? 'bg-green-100 dark:bg-green-900/20'
          : isSelected && !option.is_correct
          ? 'bg-red-100 dark:bg-red-900/20'
          : !isSelected && option.is_correct
          ? 'bg-blue-100 dark:bg-blue-900/20'
          : ''
      }`}
    >
      {isSelected && option.is_correct && (
        <CheckCircle className="h-4 w-4 text-green-500 mr-2 shrink-0" />
      )}
      {isSelected && !option.is_correct && (
        <XCircle className="h-4 w-4 text-red-500 mr-2 shrink-0" />
      )}
      {!isSelected && option.is_correct && (
        <CheckCircle className="h-4 w-4 text-blue-500 mr-2 shrink-0" />
      )}
      {!isSelected && !option.is_correct && (
        <div className="w-4 h-4 mr-2" />
      )}
      <span>{option.option_text}</span>
    </div>
  );
}
