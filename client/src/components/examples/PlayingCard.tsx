import { PlayingCard } from '../PlayingCard';

export default function PlayingCardExample() {
  return (
    <div className="flex gap-4 p-8">
      <PlayingCard card={{ suit: 'hearts', rank: 'A' }} />
      <PlayingCard card={{ suit: 'spades', rank: 'K' }} />
      <PlayingCard card={{ suit: 'diamonds', rank: 'Q' }} />
      <PlayingCard card={{ suit: 'clubs', rank: 'J' }} />
      <PlayingCard faceDown />
    </div>
  );
}
