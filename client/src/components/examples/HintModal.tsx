import { HintModal } from '../HintModal';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function HintModalExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)}>Show Hint Modal</Button>
      <HintModal
        open={open}
        onClose={() => setOpen(false)}
        hint="Well sugar, I'd fold faster than a cheap lawn chair with those cards. Your hand's weaker than my morning coffee, darling."
      />
    </div>
  );
}
