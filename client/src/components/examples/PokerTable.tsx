import { PokerTable } from '../PokerTable';

export default function PokerTableExample() {
  //todo: remove mock functionality
  const players = [
    {
      id: 'player',
      name: 'You',
      chips: 1450,
      cards: [
        { suit: 'hearts' as const, rank: 'A' as const },
        { suit: 'spades' as const, rank: 'K' as const }
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
        { suit: 'clubs' as const, rank: '2' as const },
        { suit: 'diamonds' as const, rank: '3' as const }
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
        { suit: 'hearts' as const, rank: '7' as const },
        { suit: 'clubs' as const, rank: '8' as const }
      ],
      isActive: false,
      currentBet: 50,
      isFolded: true
    }
  ];

  const communityCards = [
    { suit: 'hearts' as const, rank: 'Q' as const },
    { suit: 'diamonds' as const, rank: 'J' as const },
    { suit: 'clubs' as const, rank: '10' as const },
    null,
    null
  ];

  return (
    <PokerTable
      players={players}
      communityCards={communityCards}
      pot={200}
      currentPlayerId="player"
      dealerMessage="Ooh, someone's feeling lucky. Don't make me call your bluff!"
      gameStats={{
        gamesPlayed: 5,
        wins: 3,
        losses: 2,
        currentStreak: 2
      }}
      onFold={() => console.log('Fold')}
      onCheck={() => console.log('Check')}
      onCall={() => console.log('Call')}
      onRaise={(amount) => console.log('Raise', amount)}
      onHint={() => console.log('Hint requested')}
    />
  );
}
