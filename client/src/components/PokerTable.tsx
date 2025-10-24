import { PlayerSeat, type Player } from "./PlayerSeat";
import { CommunityCards } from "./CommunityCards";
import { PotDisplay } from "./PotDisplay";
import { DealerCommentary } from "./DealerCommentary";
import { BettingControls } from "./BettingControls";
import { GameStats } from "./GameStats";
import { HintModal } from "./HintModal";
import { EndHandModal, type HandResult } from "./EndHandModal";
import { type Card } from "./PlayingCard";
import { cn } from "@/lib/utils";
import pokerTableBg from "@assets/Table_1761308561661.jpg";
import { useState } from "react";
import { pokerGameService } from "@/lib/pokerGame";

interface PokerTableProps {
  players: Player[];
  communityCards: (Card | null)[];
  pot: number;
  currentPlayerId: string;
  dealerMessage: string;
  gameStats: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    currentStreak: number;
  };
  onFold: () => void;
  onCheck: () => void;
  onCall: () => void;
  onRaise: (amount: number) => void;
  onHint: () => void;
  className?: string;
}

export function PokerTable({
  players,
  communityCards,
  pot,
  currentPlayerId,
  dealerMessage,
  gameStats,
  onFold,
  onCheck,
  onCall,
  onRaise,
  onHint,
  className
}: PokerTableProps) {
  const [showHint, setShowHint] = useState(false);
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const otherPlayers = players.filter(p => p.id !== currentPlayerId);

  // TODO: Remove mock functionality
  const mockHint = "Well sugar, I'd fold faster than a cheap lawn chair with those cards. Your hand's weaker than my morning coffee, darling.";

  const handleHint = () => {
    setShowHint(true);
    onHint();
  };

  return (
    <div className={cn("min-h-screen flex flex-col", className)} data-testid="poker-table">
      {/* Top Stats Bar */}
      <div className="bg-card/95 backdrop-blur-sm border-b border-card-border p-4">
        <div className="max-w-7xl mx-auto">
          <GameStats {...gameStats} />
        </div>
      </div>

      {/* Main Game Area */}
      <div 
        className="flex-1 relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${pokerTableBg})` }}
      >
        {/* Subtle overlay for better contrast */}
        <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px]" />

        <div className="relative h-full flex flex-col items-center justify-center p-8 gap-8">
          {/* Dealer Commentary */}
          <DealerCommentary message={dealerMessage} className="max-w-2xl" />

          {/* Opponent Players */}
          <div className="flex gap-4 justify-center flex-wrap">
            {otherPlayers.map((player) => (
              <PlayerSeat key={player.id} player={player} showCards={false} />
            ))}
          </div>

          {/* Community Cards and Pot */}
          <div className="flex flex-col items-center gap-6">
            <CommunityCards cards={communityCards} />
            <PotDisplay amount={pot} />
          </div>

          {/* Current Player */}
          {currentPlayer && (
            <PlayerSeat player={currentPlayer} showCards className="scale-110" />
          )}
        </div>
      </div>

      {/* Betting Controls */}
      {currentPlayer && !currentPlayer.isFolded && currentPlayer.isActive && (
        <BettingControls
          currentBet={pokerGameService.getCallAmount()}
          minRaise={pokerGameService.getMinRaise()}
          maxRaise={pokerGameService.getMaxRaise()}
          playerChips={currentPlayer.chips}
          canCheck={pokerGameService.canCheck()}
          onFold={onFold}
          onCheck={onCheck}
          onCall={onCall}
          onRaise={onRaise}
          onHint={handleHint}
        />
      )}

      {/* Hint Modal */}
      <HintModal
        open={showHint}
        onClose={() => setShowHint(false)}
        hint={mockHint}
      />
    </div>
  );
}
