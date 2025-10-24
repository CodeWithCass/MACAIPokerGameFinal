import { useState } from "react";
import { GameSetup } from "@/components/GameSetup";
import { PokerTable } from "@/components/PokerTable";
import { type Player } from "@/components/PlayerSeat";
import { type Card } from "@/components/PlayingCard";

//todo: remove mock functionality
const STARTING_CHIPS = 1500;

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [botCount, setBotCount] = useState(2);
  
  //todo: remove mock functionality - game state will come from backend
  const [players] = useState<Player[]>([
    {
      id: 'player',
      name: 'You',
      chips: 1450,
      cards: [
        { suit: 'hearts', rank: 'A' },
        { suit: 'spades', rank: 'K' }
      ],
      isActive: true,
      currentBet: 50,
      isDealer: false
    },
    {
      id: 'bot1',
      name: 'AI Bot 1',
      chips: 1500,
      cards: [
        { suit: 'clubs', rank: '2' },
        { suit: 'diamonds', rank: '3' }
      ],
      isActive: false,
      currentBet: 50,
      isDealer: true
    },
    {
      id: 'bot2',
      name: 'AI Bot 2',
      chips: 1550,
      cards: [
        { suit: 'hearts', rank: '7' },
        { suit: 'clubs', rank: '8' }
      ],
      isActive: false,
      currentBet: 50,
      isFolded: false
    }
  ]);

  const [communityCards] = useState<(Card | null)[]>([
    { suit: 'hearts', rank: 'Q' },
    { suit: 'diamonds', rank: 'J' },
    { suit: 'clubs', rank: '10' },
    null,
    null
  ]);

  const [pot] = useState(200);
  const [dealerMessage] = useState("Ooh, someone's feeling lucky. Don't make me call your bluff!");
  
  const [gameStats] = useState({
    gamesPlayed: 5,
    wins: 3,
    losses: 2,
    currentStreak: 2
  });

  const handleStartGame = (count: number) => {
    console.log('Starting game with', count, 'bots');
    setBotCount(count);
    setGameStarted(true);
    //todo: remove mock functionality - initialize game state from backend
  };

  const handleFold = () => {
    console.log('Player folded');
    //todo: remove mock functionality - send fold action to backend
  };

  const handleCheck = () => {
    console.log('Player checked');
    //todo: remove mock functionality - send check action to backend
  };

  const handleCall = () => {
    console.log('Player called');
    //todo: remove mock functionality - send call action to backend
  };

  const handleRaise = (amount: number) => {
    console.log('Player raised', amount);
    //todo: remove mock functionality - send raise action to backend
  };

  const handleHint = () => {
    console.log('Player requested hint');
    //todo: remove mock functionality - request hint from backend AI
  };

  if (!gameStarted) {
    return <GameSetup onStart={handleStartGame} />;
  }

  return (
    <PokerTable
      players={players}
      communityCards={communityCards}
      pot={pot}
      currentPlayerId="player"
      dealerMessage={dealerMessage}
      gameStats={gameStats}
      onFold={handleFold}
      onCheck={handleCheck}
      onCall={handleCall}
      onRaise={handleRaise}
      onHint={handleHint}
    />
  );
}
