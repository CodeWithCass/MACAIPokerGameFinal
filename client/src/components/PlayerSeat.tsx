import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PlayingCard, type Card } from "./PlayingCard";
import { Badge } from "@/components/ui/badge";
import { ChipIcon } from "./ChipIcon";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

export interface Player {
  id: string;
  name: string;
  chips: number;
  cards?: Card[];
  isActive?: boolean;
  isFolded?: boolean;
  currentBet?: number;
  isDealer?: boolean;
}

interface PlayerSeatProps {
  player: Player;
  showCards?: boolean;
  className?: string;
}

export function PlayerSeat({ player, showCards = false, className }: PlayerSeatProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
        player.isActive 
          ? "border-primary bg-primary/5" 
          : player.isFolded 
          ? "border-muted opacity-50" 
          : "border-card-border bg-card/50",
        className
      )}
      data-testid={`player-seat-${player.id}`}
    >
      <div className="relative">
        <Avatar className="w-16 h-16 border-2 border-card-border">
          <AvatarFallback className="bg-muted">
            <User className="w-8 h-8" />
          </AvatarFallback>
        </Avatar>
        {player.isDealer && (
          <Badge variant="secondary" className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs px-2">
            D
          </Badge>
        )}
      </div>
      
      <div className="text-center">
        <p className="font-semibold text-sm" data-testid={`player-name-${player.id}`}>
          {player.name}
        </p>
        <div className="flex items-center gap-1 justify-center">
          <ChipIcon value={player.chips} className="w-4 h-4" />
          <span className="font-mono text-sm font-bold text-amber-700 dark:text-amber-400" data-testid={`player-chips-${player.id}`}>
            ${player.chips.toLocaleString()}
          </span>
        </div>
      </div>

      {player.cards && player.cards.length > 0 && (
        <div className="flex gap-1">
          {player.cards.map((card, i) => (
            <PlayingCard
              key={i}
              card={showCards ? card : undefined}
              faceDown={!showCards}
              className="w-12 h-18"
            />
          ))}
        </div>
      )}

      {player.currentBet && player.currentBet > 0 && (
        <Badge variant="default" className="font-mono" data-testid={`player-bet-${player.id}`}>
          Bet: ${player.currentBet}
        </Badge>
      )}

      {player.isFolded && (
        <Badge variant="secondary" className="text-xs">
          Folded
        </Badge>
      )}
    </div>
  );
}
