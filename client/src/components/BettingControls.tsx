import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ChipIcon } from "./ChipIcon";
import { cn } from "@/lib/utils";
import { X, Check, TrendingUp, Lightbulb } from "lucide-react";
import { useState } from "react";

interface BettingControlsProps {
  currentBet: number;
  minRaise: number;
  maxRaise: number;
  playerChips: number;
  canCheck: boolean;
  onFold: () => void;
  onCheck: () => void;
  onCall: () => void;
  onRaise: (amount: number) => void;
  onHint: () => void;
  className?: string;
}

export function BettingControls({
  currentBet,
  minRaise,
  maxRaise,
  playerChips,
  canCheck,
  onFold,
  onCheck,
  onCall,
  onRaise,
  onHint,
  className
}: BettingControlsProps) {
  const [raiseAmount, setRaiseAmount] = useState(minRaise);

  return (
    <div
      className={cn(
        "bg-card/95 backdrop-blur-sm border-t border-card-border p-6",
        className
      )}
      data-testid="betting-controls"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex gap-3">
            <Button
              variant="destructive"
              size="lg"
              onClick={onFold}
              className="px-8"
              data-testid="button-fold"
            >
              <X className="w-4 h-4 mr-2" />
              Fold
            </Button>
            
            {canCheck ? (
              <Button
                variant="secondary"
                size="lg"
                onClick={onCheck}
                className="px-8"
                data-testid="button-check"
              >
                <Check className="w-4 h-4 mr-2" />
                Check
              </Button>
            ) : (
              <Button
                variant="default"
                size="lg"
                onClick={onCall}
                className="px-8"
                data-testid="button-call"
              >
                <ChipIcon value={currentBet} className="w-4 h-4 mr-2" />
                Call ${currentBet}
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="lg"
            onClick={onHint}
            className="px-6"
            data-testid="button-hint"
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            Get Hint
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-muted-foreground">
              Raise Amount
            </label>
            <div className="flex items-center gap-2">
              <ChipIcon value={raiseAmount} className="w-5 h-5" />
              <span className="font-mono font-bold text-lg text-amber-700 dark:text-amber-400" data-testid="raise-amount">
                ${raiseAmount}
              </span>
            </div>
          </div>
          
          <Slider
            value={[raiseAmount]}
            onValueChange={(value) => setRaiseAmount(value[0])}
            min={minRaise}
            max={Math.min(maxRaise, playerChips)}
            step={10}
            className="w-full"
            data-testid="slider-raise"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Min: ${minRaise}</span>
            <span>Max: ${Math.min(maxRaise, playerChips)}</span>
          </div>

          <Button
            variant="default"
            size="lg"
            onClick={() => onRaise(raiseAmount)}
            className="w-full"
            disabled={raiseAmount > playerChips}
            data-testid="button-raise"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Raise ${raiseAmount}
          </Button>
        </div>
      </div>
    </div>
  );
}
