import { useState, useEffect } from "react";
import { GameSetup } from "@/components/GameSetup";
import { PokerTable } from "@/components/PokerTable";
import { TurnIndicator } from "@/components/TurnIndicator";
import { AIActionDisplay } from "@/components/AIActionDisplay";
import { type Player } from "@/components/PlayerSeat";
import { type Card } from "@/components/PlayingCard";
import { pokerGameService } from "@/lib/pokerGame";
import { GameState, HandAction } from "@/lib/gameState";
import { useToast } from "@/hooks/use-toast";

const STARTING_CHIPS = 1500;

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastAIAction, setLastAIAction] = useState<HandAction | null>(null);
  const { toast } = useToast();
  
  const [gameStats] = useState({
    gamesPlayed: 5,
    wins: 3,
    losses: 2,
    currentStreak: 2
  });

  // Try to load existing game on component mount
  useEffect(() => {
    const loadExistingGame = async () => {
      try {
        const existingGame = await pokerGameService.loadGame();
        if (existingGame) {
          setGameState(existingGame);
          setGameStarted(true);
        }
      } catch (error) {
        console.error('Failed to load existing game:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingGame();
  }, []);

  // Subscribe to game state changes
  useEffect(() => {
    const unsubscribe = pokerGameService.onGameStateChange((newGameState) => {
      setGameState(newGameState);
      
      // Check if there's a new AI action to display
      if (newGameState.lastAction && 
          newGameState.lastAction.playerId !== 'player' && 
          (!lastAIAction || newGameState.lastAction.timestamp !== lastAIAction.timestamp)) {
        setLastAIAction(newGameState.lastAction);
      }
    });

    return unsubscribe;
  }, [lastAIAction]);

  const handleStartGame = async (count: number) => {
    try {
      setIsLoading(true);
      console.log('Starting game with', count, 'bots');
      const newGameState = await pokerGameService.initializeGame(count, STARTING_CHIPS);
      setGameState(newGameState);
      setGameStarted(true);
      toast({
        title: "Game Started!",
        description: `New poker game with ${count - 1} AI opponents.`,
      });
    } catch (error) {
      console.error('Failed to start game:', error);
      toast({
        title: "Error",
        description: "Failed to start new game. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFold = async () => {
    try {
      const updatedGame = await pokerGameService.playerFold();
      setGameState(updatedGame);
      toast({
        title: "Folded",
        description: "You folded your hand.",
      });
    } catch (error) {
      console.error('Failed to fold:', error);
      toast({
        title: "Error",
        description: "Failed to fold. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCheck = async () => {
    try {
      const updatedGame = await pokerGameService.playerCheck();
      setGameState(updatedGame);
      toast({
        title: "Checked",
        description: "You checked.",
      });
    } catch (error) {
      console.error('Failed to check:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to check.",
        variant: "destructive",
      });
    }
  };

  const handleCall = async () => {
    try {
      const updatedGame = await pokerGameService.playerCall();
      setGameState(updatedGame);
      const callAmount = pokerGameService.getCallAmount();
      toast({
        title: "Called",
        description: `You called $${callAmount}.`,
      });
    } catch (error) {
      console.error('Failed to call:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to call.",
        variant: "destructive",
      });
    }
  };

  const handleRaise = async (amount: number) => {
    try {
      const updatedGame = await pokerGameService.playerRaise(amount);
      setGameState(updatedGame);
      toast({
        title: "Raised",
        description: `You raised to $${amount}.`,
      });
    } catch (error) {
      console.error('Failed to raise:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to raise.",
        variant: "destructive",
      });
    }
  };

  const handlePlayerTimeout = async () => {
    try {
      const updatedGame = await pokerGameService.playerTimeout();
      setGameState(updatedGame);
      toast({
        title: "Time's Up!",
        description: "You took too long to make a decision.",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Failed to handle timeout:', error);
    }
  };

  const handleHint = () => {
    console.log('Player requested hint');
    toast({
      title: "Hint",
      description: "Consider your position and the strength of your hand before making a decision.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!gameStarted || !gameState) {
    return <GameSetup onStart={handleStartGame} />;
  }

  const currentPlayer = gameState.players.find(p => p.id === 'player');
  const activePlayer = gameState.players.find(p => p.isActive);
  const isPlayerTurn = activePlayer?.id === 'player';
  const dealerMessage = getDealerMessage(gameState);

  return (
    <>
      {/* Turn Indicator */}
      {activePlayer && (
        <TurnIndicator
          currentPlayer={activePlayer}
          isPlayerTurn={isPlayerTurn}
          timeLimit={20}
          onTimeUp={handlePlayerTimeout}
        />
      )}

      {/* AI Action Display */}
      {lastAIAction && lastAIAction.playerId !== 'player' && (
        <AIActionDisplay
          playerName={gameState.players.find(p => p.id === lastAIAction.playerId)?.name || 'AI Player'}
          action={lastAIAction}
          onComplete={() => setLastAIAction(null)}
        />
      )}

      <PokerTable
        players={gameState.players}
        communityCards={gameState.communityCards}
        pot={gameState.pot}
        currentPlayerId="player"
        dealerMessage={dealerMessage}
        gameStats={gameStats}
        onFold={handleFold}
        onCheck={handleCheck}
        onCall={handleCall}
        onRaise={handleRaise}
        onHint={handleHint}
      />
    </>
  );
}

function getDealerMessage(gameState: GameState): string {
  const messages = {
    preflop: "Let's see what those hole cards have to say, sugar!",
    flop: "Now we're cooking with gas! Three cards on the table.",
    turn: "Fourth street's here - time to separate the wheat from the chaff!",
    river: "Last card, darling! Make it count!",
    showdown: "Time to show your cards, honey!",
    ended: "Well played! Ready for another round?"
  };

  return messages[gameState.gamePhase] || "Place your bets, folks!";
}
