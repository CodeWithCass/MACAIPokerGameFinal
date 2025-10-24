import { PlayingCard, type Card } from "./PlayingCard";
import { cn } from "@/lib/utils";

interface CommunityCardsProps {
  cards: (Card | null)[];
  className?: string;
}

export function CommunityCards({ cards, className }: CommunityCardsProps) {
  return (
    <div
      className={cn("flex gap-3 items-center justify-center", className)}
      data-testid="community-cards"
    >
      {cards.map((card, index) => (
        <div
          key={index}
          className="transition-all duration-500"
          style={{
            animation: card ? `fadeIn 0.5s ease-out ${index * 0.1}s both` : undefined
          }}
        >
          <PlayingCard
            card={card || undefined}
            faceDown={!card}
            className="w-20 h-28"
          />
        </div>
      ))}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px) rotateY(180deg);
          }
          to {
            opacity: 1;
            transform: translateY(0) rotateY(0deg);
          }
        }
      `}</style>
    </div>
  );
}
