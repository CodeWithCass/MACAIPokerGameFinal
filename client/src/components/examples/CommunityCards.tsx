import { CommunityCards } from '../CommunityCards';

export default function CommunityCardsExample() {
  const cards = [
    { suit: 'hearts' as const, rank: 'A' as const },
    { suit: 'diamonds' as const, rank: 'K' as const },
    { suit: 'clubs' as const, rank: 'Q' as const },
    null,
    null
  ];

  return <CommunityCards cards={cards} />;
}
