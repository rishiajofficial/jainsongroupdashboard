
import { GraduationCap, XCircle } from "lucide-react";
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
      {hasQuiz && (quizUnlocked && !quizCompleted) && (
        <Button onClick={onTakeQuiz} className="gap-2">
          <GraduationCap className="h-4 w-4" /> Start Quiz
        </Button>
      )}
      <Button variant="outline" onClick={onQuitTraining}>
        <XCircle className="mr-1 h-4 w-4" /> Quit Training
      </Button>
    </div>
  );
}
