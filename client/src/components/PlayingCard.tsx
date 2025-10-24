import { cn } from "@/lib/utils";
import cardBack from "@assets/CardBack_1761308561660.png";

export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
}

interface PlayingCardProps {
  card?: Card;
  faceDown?: boolean;
  className?: string;
}

const suitSymbols = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
};

const suitColors = {
  hearts: 'text-red-600',
  diamonds: 'text-red-600',
  clubs: 'text-foreground',
  spades: 'text-foreground'
};

export function PlayingCard({ card, faceDown = false, className }: PlayingCardProps) {
  return (
    <div
      className={cn(
        "relative w-16 h-24 rounded-lg border-2 flex items-center justify-center transition-all duration-300 overflow-hidden",
        faceDown 
          ? "border-amber-700/50 shadow-xl" 
          : "bg-card border-card-border shadow-lg",
        className
      )}
      data-testid={faceDown ? "card-facedown" : `card-${card?.rank}-${card?.suit}`}
    >
      {faceDown ? (
        <img 
          src={cardBack} 
          alt="Card back" 
          className="w-full h-full object-cover"
        />
      ) : card ? (
        <div className="flex flex-col items-center justify-between h-full py-2 bg-white">
          <span className={cn("text-xl font-bold", suitColors[card.suit])}>
            {card.rank}
          </span>
          <span className={cn("text-3xl", suitColors[card.suit])}>
            {suitSymbols[card.suit]}
          </span>
          <span className={cn("text-xl font-bold", suitColors[card.suit])}>
            {card.rank}
          </span>
        </div>
      ) : null}
    </div>
  );
}
