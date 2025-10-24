import { EndHandModal } from '../EndHandModal';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function EndHandModalExample() {
  const [open, setOpen] = useState(false);

  const result = {
    winnerName: 'You',
    handName: 'Royal Flush',
    winningCards: [
      { suit: 'hearts' as const, rank: 'A' as const },
      { suit: 'hearts' as const, rank: 'K' as const },
      { suit: 'hearts' as const, rank: 'Q' as const },
      { suit: 'hearts' as const, rank: 'J' as const },
      { suit: 'hearts' as const, rank: '10' as const }
    ],
    potAmount: 2500,
    chipChange: 1200
  };

  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)}>Show End Hand Modal</Button>
      <EndHandModal
        open={open}
        onPlayAgain={() => setOpen(false)}
        onExit={() => setOpen(false)}
        result={result}
      />
    </div>
  );
}
