
import { GraduationCap, XCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoControlsProps {
  onTakeQuiz: () => void;
  onQuitTraining: () => void;
  quizUnlocked: boolean;
  hasQuiz: boolean;
  quizCompleted: boolean;
}

export function VideoControls({
  onTakeQuiz,
  onQuitTraining,
  quizUnlocked,
  hasQuiz,
  quizCompleted
}: VideoControlsProps) {
  return (
    <div className="flex space-x-2 mt-4 justify-center">
      {hasQuiz && (
        quizCompleted ? (
          <Button variant="outline" className="gap-2 bg-green-50 text-green-600 border-green-200" disabled>
            <Check className="h-4 w-4" /> Quiz Completed
          </Button>
        ) : quizUnlocked ? (
          <Button onClick={onTakeQuiz} className="gap-2">
            <GraduationCap className="h-4 w-4" /> Start Quiz
          </Button>
        ) : null
      )}
      <Button variant="outline" onClick={onQuitTraining}>
        <XCircle className="mr-1 h-4 w-4" /> Quit Training
      </Button>
    </div>
  );
}
