import { ChipIcon } from "./ChipIcon";
import { cn } from "@/lib/utils";

interface PotDisplayProps {
  amount: number;
  className?: string;
}

export function PotDisplay({ amount, className }: PotDisplayProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 bg-card/90 backdrop-blur-sm border-2 border-amber-600/30 rounded-2xl p-4 shadow-2xl",
        className
      )}
      data-testid="pot-display"
    >
      <div className="flex items-center gap-2">
        <ChipIcon value={amount} className="w-6 h-6" />
        <span className="text-xs uppercase tracking-wide font-semibold text-amber-700 dark:text-amber-400">
          Pot
        </span>
      </div>
      <span className="text-3xl font-mono font-black text-amber-700 dark:text-amber-400" data-testid="pot-amount">
        ${amount.toLocaleString()}
      </span>
    </div>
  );
}
