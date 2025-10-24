import { BettingControls } from '../BettingControls';

export default function BettingControlsExample() {
  return (
    <BettingControls
      currentBet={50}
      minRaise={100}
      maxRaise={1000}
      playerChips={1500}
      canCheck={false}
      onFold={() => console.log('Fold clicked')}
      onCheck={() => console.log('Check clicked')}
      onCall={() => console.log('Call clicked')}
      onRaise={(amount) => console.log('Raise clicked:', amount)}
      onHint={() => console.log('Hint clicked')}
    />
  );
}
