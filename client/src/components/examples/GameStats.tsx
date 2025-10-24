import { GameStats } from '../GameStats';

export default function GameStatsExample() {
  return (
    <div className="p-8">
      <GameStats
        gamesPlayed={15}
        wins={8}
        losses={7}
        currentStreak={3}
      />
    </div>
  );
}
