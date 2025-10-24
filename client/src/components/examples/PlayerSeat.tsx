import { PlayerSeat } from '../PlayerSeat';

export default function PlayerSeatExample() {
  const player = {
    id: '1',
    name: 'Player 1',
    chips: 1500,
    cards: [
      { suit: 'hearts' as const, rank: 'A' as const },
      { suit: 'spades' as const, rank: 'K' as const }
    ],
    isActive: true,
    currentBet: 50,
    isDealer: true
  };

  return (
    <div className="flex gap-4 p-8">
      <PlayerSeat player={player} showCards />
      <PlayerSeat player={{...player, id: '2', isActive: false}} />
    </div>
  );
}
