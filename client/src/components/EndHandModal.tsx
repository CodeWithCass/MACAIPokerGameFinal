import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayingCard, type Card } from "./PlayingCard";
import { Trophy, TrendingUp, TrendingDown } from "lucide-react";

export interface HandResult {
  winnerName: string;
  handName: string;
  winningCards: Card[];
  potAmount: number;
  chipChange: number;
}

interface EndHandModalProps {
  open: boolean;
  onPlayAgain: () => void;
  onExit: () => void;
  result: HandResult;
}

export function EndHandModal({ open, onPlayAgain, onExit, result }: EndHandModalProps) {
  const isPlayerWin = result.chipChange > 0;

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-2xl" data-testid="end-hand-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Trophy className="w-6 h-6 text-primary" />
            Hand Complete!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="text-center space-y-2">
            <p className="text-3xl font-display" data-testid="winner-name">
              {result.winnerName} wins!
            </p>
            <Badge variant="secondary" className="text-lg px-4 py-1">
              {result.handName}
            </Badge>
          </div>

          <div className="flex justify-center gap-2">
            {result.winningCards.map((card, i) => (
              <PlayingCard key={i} card={card} className="w-16 h-24" />
            ))}
          </div>

          <div className="bg-muted/50 rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pot Won:</span>
              <span className="text-2xl font-mono font-bold text-amber-700 dark:text-amber-400" data-testid="pot-won">
                ${result.potAmount.toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Your Change:</span>
              <div className="flex items-center gap-2">
                {isPlayerWin ? (
                  <>
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-2xl font-mono font-bold text-green-600" data-testid="chip-change">
                      +${Math.abs(result.chipChange).toLocaleString()}
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-5 h-5 text-destructive" />
                    <span className="text-2xl font-mono font-bold text-destructive" data-testid="chip-change">
                      -${Math.abs(result.chipChange).toLocaleString()}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <Button
            variant="default"
            size="lg"
            onClick={onPlayAgain}
            className="flex-1"
            data-testid="button-play-again"
          >
            Play Again
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={onExit}
            className="flex-1"
            data-testid="button-exit"
          >
            Exit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
