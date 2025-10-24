import chip5 from "@assets/Chip_5_1761308704581.png";
import chip10 from "@assets/Chip_10_1761308704582.png";
import chip25 from "@assets/Chip_25_1761308704582.png";
import chip50 from "@assets/Chip_50_1761308704582.png";
import chip100 from "@assets/Chip_100_1761308704583.png";
import { cn } from "@/lib/utils";

interface ChipIconProps {
  value: number;
  className?: string;
}

export function ChipIcon({ value, className }: ChipIconProps) {
  const getChipImage = (val: number) => {
    if (val >= 100) return chip100;
    if (val >= 50) return chip50;
    if (val >= 25) return chip25;
    if (val >= 10) return chip10;
    return chip5;
  };

  return (
    <img 
      src={getChipImage(value)} 
      alt="Chip" 
      className={cn("w-6 h-6 object-contain drop-shadow-sm", className)}
    />
  );
}
