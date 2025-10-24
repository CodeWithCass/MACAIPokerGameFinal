import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Clock, User } from "lucide-react";
import { Player } from "./PlayerSeat";

interface TurnIndicatorProps {
  currentPlayer: Player;
  isPlayerTurn: boolean;
  timeLimit?: number; // in seconds
  onTimeUp?: () => void;
  className?: string;
}

export function TurnIndicator({
  currentPlayer,
  isPlayerTurn,
  timeLimit = 20,
  onTimeUp,
  className
}: TurnIndicatorProps) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (currentPlayer?.isActive) {
      setTimeLeft(timeLimit);
      setIsVisible(true);
      
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (isPlayerTurn && onTimeUp) {
              onTimeUp();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setIsVisible(false);
    }
  }, [currentPlayer?.isActive, timeLimit, isPlayerTurn, onTimeUp]);

  if (!isVisible || !currentPlayer?.isActive) {
    return null;
  }

  const progress = (timeLeft / timeLimit) * 100;
  const isUrgent = timeLeft <= 5;

  return (
    <div
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-50",
        "bg-card/95 backdrop-blur-sm border border-card-border rounded-lg p-4 min-w-80",
        "shadow-lg transition-all duration-300",
        isUrgent && "animate-pulse border-destructive bg-destructive/5",
        className
      )}
      data-testid="turn-indicator"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          <span className="font-semibold text-lg">
            {isPlayerTurn ? "Your Turn" : `${currentPlayer.name}'s Turn`}
          </span>
        </div>
        
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className={cn(
            "font-mono",
            isUrgent && "text-destructive font-bold"
          )}>
            {timeLeft}s
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Time remaining</span>
          <span>{timeLeft}s / {timeLimit}s</span>
        </div>
        
        <Progress 
          value={progress} 
          className="h-2"
          data-testid="turn-timer"
        />
        
        {isUrgent && (
          <p className="text-xs text-destructive font-medium text-center">
            ⚠️ Time running out!
          </p>
        )}
      </div>

      {isPlayerTurn && (
        <p className="text-xs text-center text-muted-foreground mt-2">
          Make your move before time runs out
        </p>
      )}
    </div>
  );
}