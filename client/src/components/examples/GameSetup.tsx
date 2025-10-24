import { GameSetup } from '../GameSetup';

export default function GameSetupExample() {
  return (
    <GameSetup onStart={(count) => console.log('Starting game with', count, 'bots')} />
  );
}
