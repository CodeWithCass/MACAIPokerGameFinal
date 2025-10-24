import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Target, XCircle, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameStatsProps {
  gamesPlayed: number;
  wins: number;
  losses: number;
  currentStreak: number;
  className?: string;
}

export function GameStats({ gamesPlayed, wins, losses, currentStreak, className }: GameStatsProps) {
  const stats = [
    {
      label: "Games",
      value: gamesPlayed,
      icon: Target,
      color: "text-primary"
    },
    {
      label: "Wins",
      value: wins,
      icon: Trophy,
      color: "text-green-600"
    },
    {
      label: "Losses",
      value: losses,
      icon: XCircle,
      color: "text-destructive"
    },
    {
      label: "Streak",
      value: currentStreak,
      icon: Flame,
      color: "text-orange-500"
    }
  ];

  return (
    <div className={cn("grid grid-cols-4 gap-2", className)} data-testid="game-stats">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="hover-elevate">
            <CardContent className="p-3 flex flex-col items-center gap-1">
              <Icon className={cn("w-4 h-4", stat.color)} />
              <span className="text-2xl font-mono font-bold" data-testid={`stat-${stat.label.toLowerCase()}`}>
                {stat.value}
              </span>
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </span>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
