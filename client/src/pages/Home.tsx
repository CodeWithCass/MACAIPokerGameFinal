import { useState, useEffect } from "react";
import { GameSetup } from "@/components/GameSetup";
import { PokerTable } from "@/components/PokerTable";
import { EndHandModal, type HandResult } from "@/components/EndHandModal";
import { usePokerGame } from "@/hooks/usePokerGame";
import { useToast } from "@/hooks/use-toast";
import type { Card } from "@/components/PlayingCard";
import { clearGameState } from "@/lib/db";

const STARTING_CHIPS = 1500;
const DEFAULT_BOT_COUNT = 3;

export default function Home() {
  const [hasStarted, setHasStarted] = useState(false);
  const [showGameSetup, setShowGameSetup] = useState(true);
  const [showEndHandModal, setShowEndHandModal] = useState(false);
  const [handResult, setHandResult] = useState<HandResult | null>(null);
  const [previousChips, setPreviousChips] = useState(STARTING_CHIPS);
  const { toast } = useToast();

  const {
    gameState,
    isLoading,
    error,
    isProcessing,
    fold,
    call,
    check,
    raise,
    startNewHand,
    startNewGame,
    clearError,
    getActionOptions,
    isPlayerTurn,
    getRoundInfo,
    isGameOver,
    getWinner,
    isHandComplete,
    getHumanPlayer,
    canPlayerCheck,
    getPlayerCallAmount,
    getPlayerMinRaise,
  } = usePokerGame(DEFAULT_BOT_COUNT, STARTING_CHIPS);

  // Track game stats (in session)
  const [gameStats, setGameStats] = useState({
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    currentStreak: 0,
  });

  // Check if game has started
  useEffect(() => {
    if (!isLoading) {
      if (
        gameState &&
        gameState.players &&
        gameState.players.length > 0 &&
        gameState.deck
      ) {
        setHasStarted(true);
        setShowGameSetup(false);
      } else {
        setHasStarted(false);
        setShowGameSetup(true);
      }
    }
  }, [gameState, isLoading]);

  // Show end hand modal when hand is complete
  useEffect(() => {
    if (isHandComplete() && gameState?.currentRound === "showdown") {
      const humanPlayer = getHumanPlayer();
      if (humanPlayer) {
        // Find winner from dealer message
        const winnerName =
          gameState.players.find((p) =>
            gameState.dealerMessage?.includes(p.name),
          )?.name || "Unknown";

        // Calculate chip change
        const chipChange = humanPlayer.chips - previousChips;
        setPreviousChips(humanPlayer.chips);

        // Create hand result
        const result: HandResult = {
          winnerName,
          handName: "Unknown Hand", // TODO: Get actual hand name from evaluation
          winningCards: (humanPlayer.cards as Card[]) || [],
          potAmount: gameState.pot,
          chipChange,
        };

        setHandResult(result);

        // Delay to show the showdown before modal
        setTimeout(() => {
          setShowEndHandModal(true);
        }, 2000);
      }
    }
  }, [
    gameState?.currentRound,
    isHandComplete,
    getHumanPlayer,
    gameState?.dealerMessage,
    gameState?.pot,
    gameState?.players,
    previousChips,
  ]);

  // Check for game over
  useEffect(() => {
    if (isGameOver()) {
      const winner = getWinner();
      if (winner === "You") {
        setGameStats((prev) => ({
          ...prev,
          wins: prev.wins + 1,
          currentStreak: prev.currentStreak + 1,
        }));
        toast({
          title: "Victory!",
          description: "You've won the game! All opponents are eliminated.",
          variant: "default",
        });
      } else {
        setGameStats((prev) => ({
          ...prev,
          losses: prev.losses + 1,
          currentStreak: 0,
        }));
        toast({
          title: "Game Over",
          description: "You've been eliminated. Better luck next time!",
          variant: "destructive",
        });
      }

      // Show game setup after delay
      setTimeout(() => {
        setShowGameSetup(true);
      }, 3000);
    }
  }, [isGameOver, getWinner, toast]);

  // Display errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      clearError();
    }
  }, [error, toast, clearError]);

  const handleStartGame = async (botCount: number) => {
    setShowGameSetup(false);
    // Clear any existing saved game first
    await clearGameState();
    await startNewGame(botCount, STARTING_CHIPS);
    setHasStarted(true);
    setPreviousChips(STARTING_CHIPS);
    setGameStats((prev) => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
    }));
  };

  const handleFold = async () => {
    if (!isPlayerTurn() || isProcessing) return;
    await fold();
  };

  const handleCheck = async () => {
    if (!isPlayerTurn() || isProcessing) return;
    await check();
  };

  const handleCall = async () => {
    if (!isPlayerTurn() || isProcessing) return;
    await call();
  };

  const handleRaise = async (amount: number) => {
    if (!isPlayerTurn() || isProcessing) return;
    await raise(amount);
  };

  const handleHint = () => {
    console.log("Player requested hint");
    // TODO: Implement AI hint system (Section 3.4)
    toast({
      title: "Hint",
      description: "AI hint system coming soon!",
      variant: "default",
    });
  };

  const handlePlayAgain = async () => {
    setShowEndHandModal(false);

    if (isGameOver()) {
      setShowGameSetup(true);
    } else {
      await startNewHand();
    }
  };

  const handleExit = async () => {
    // Clear the saved game so we show setup screen
    await clearGameState();
    setShowGameSetup(true);
    setHasStarted(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!hasStarted || showGameSetup) {
    return (
      <GameSetup
        onStart={handleStartGame}
        hasSavedGame={gameState !== null}
        onContinue={() => {
          setShowGameSetup(false);
          setHasStarted(true);
        }}
      />
    );
  }

  if (!gameState) {
    return <GameSetup onStart={handleStartGame} />;
  }

  const humanPlayer = getHumanPlayer();
  const actionOptions = getActionOptions();
  const roundInfo = getRoundInfo();

  // Determine if betting controls should be shown
  const showBettingControls =
    isPlayerTurn() &&
    !isProcessing &&
    humanPlayer &&
    !humanPlayer.isFolded &&
    gameState.currentRound !== "showdown";

  return (
    <>
      <PokerTable
        players={gameState.players as any}
        communityCards={gameState.communityCards as any}
        pot={gameState.pot}
        currentPlayerId={gameState.currentPlayerId}
        dealerMessage={gameState.dealerMessage}
        gameStats={gameStats}
        onFold={handleFold}
        onCheck={handleCheck}
        onCall={handleCall}
        onRaise={handleRaise}
        onHint={handleHint}
        className={isProcessing ? "pointer-events-none opacity-75" : ""}
        currentBet={getPlayerCallAmount()}
        minRaise={getPlayerMinRaise()}
        maxRaise={actionOptions.maxRaise}
        canCheck={canPlayerCheck()}
        isPlayerTurn={isPlayerTurn()}
      />

      {/* End Hand Modal */}
      {handResult && (
        <EndHandModal
          open={showEndHandModal}
          onPlayAgain={handlePlayAgain}
          onExit={handleExit}
          result={handResult}
        />
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-center text-muted-foreground">Processing...</p>
          </div>
        </div>
      )}
    </>
  );
}
