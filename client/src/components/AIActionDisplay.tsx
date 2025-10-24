import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Bot, TrendingUp, Check, X, DollarSign } from "lucide-react";
import { HandAction } from "@/lib/gameState";

interface AIActionDisplayProps {
  playerName: string;
  action: HandAction;
  onComplete?: () => void;
  className?: string;
}

export function AIActionDisplay({
  playerName,
  action,
  onComplete,
  className
}: AIActionDisplayProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        onComplete();
      }
    }, 3000); // Show for 3 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) {
    return null;
  }

  const getActionIcon = () => {
    switch (action.action) {
      case 'fold':
        return <X className="w-5 h-5 text-destructive" />;
      case 'check':
        return <Check className="w-5 h-5 text-success" />;
      case 'call':
        return <DollarSign className="w-5 h-5 text-blue-500" />;
      case 'raise':
        return <TrendingUp className="w-5 h-5 text-amber-500" />;
      case 'all-in':
        return <TrendingUp className="w-5 h-5 text-red-500" />;
      default:
        return <Bot className="w-5 h-5" />;
    }
  };

  const getActionText = () => {
    switch (action.action) {
      case 'fold':
        return "folded";
      case 'check':
        return "checked";
      case 'call':
        return `called $${action.amount}`;
      case 'raise':
        return `raised to $${action.amount}`;
      case 'all-in':
        return "went all-in!";
      default:
        return action.action;
    }
  };

  const getActionColor = () => {
    switch (action.action) {
      case 'fold':
        return "border-destructive bg-destructive/10";
      case 'check':
        return "border-green-500 bg-green-500/10";
      case 'call':
        return "border-blue-500 bg-blue-500/10";
      case 'raise':
        return "border-amber-500 bg-amber-500/10";
      case 'all-in':
        return "border-red-500 bg-red-500/10";
      default:
        return "border-card-border bg-card/50";
    }
  };

  return (
    <div
      className={cn(
        "fixed top-20 right-4 z-40",
        "p-4 rounded-lg border-2 min-w-60",
        "shadow-lg transition-all duration-300",
        "animate-in slide-in-from-right-4 fade-in-0",
        getActionColor(),
        className
      )}
      data-testid="ai-action-display"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" />
          <span className="font-semibold">{playerName}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {getActionIcon()}
          <span className="font-medium capitalize">
            {getActionText()}
          </span>
        </div>
      </div>
      
      {action.amount && action.amount > 0 && (
        <div className="mt-2 text-sm text-muted-foreground">
          Amount: ${action.amount}
        </div>
      )}
    </div>
  );
}