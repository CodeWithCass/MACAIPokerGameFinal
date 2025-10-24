import { useState, useEffect } from "react";
import { GameSetup } from "@/components/GameSetup";
import { PokerTable } from "@/components/PokerTable";
import { initializeGame, type GameState } from "@/lib/game";
import { saveGameState, loadGameState } from "@/lib/db";

const STARTING_CHIPS = 1500;

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadGame() {
      const savedGame = await loadGameState();
      if (savedGame) {
        setGameState(savedGame);
      }
      setIsLoading(false);
    }
    loadGame();
  }, []);

  const [gameStats] = useState({
    gamesPlayed: 5,
    wins: 3,
    losses: 2,
    currentStreak: 2
  });

  const handleStartGame = async (botCount: number) => {
    const newGameState = initializeGame(botCount, STARTING_CHIPS);
    await saveGameState(newGameState);
    setGameState(newGameState);
  };

  const handleFold = () => {
    console.log('Player folded');
    //todo: implement game action
  };

  const handleCheck = () => {
    console.log('Player checked');
    //todo: implement game action
  };

  const handleCall = () => {
    console.log('Player called');
    //todo: implement game action
  };

  const handleRaise = (amount: number) => {
    console.log('Player raised', amount);
    //todo: implement game action
  };

  const handleHint = () => {
    console.log('Player requested hint');
    //todo: implement hint action
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!gameState) {
    return <GameSetup onStart={handleStartGame} />;
  }

  return (
    <PokerTable
      players={gameState.players}
      communityCards={gameState.communityCards}
      pot={gameState.pot}
      currentPlayerId={gameState.currentPlayerId}
      dealerMessage={gameState.dealerMessage}
      gameStats={gameStats}
      onFold={handleFold}
      onCheck={handleCheck}
      onCall={handleCall}
      onRaise={handleRaise}
      onHint={handleHint}
    />
  );
}
