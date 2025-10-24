import { DealerCommentary } from '../DealerCommentary';

export default function DealerCommentaryExample() {
  return (
    <div className="flex flex-col gap-4 p-8">
      <DealerCommentary message="Welcome back, hotshot. Let's see if you've learned to play smarter than my grandma today." />
      <DealerCommentary message="Ooh, someone's feeling lucky. Don't make me call your bluff!" />
      <DealerCommentary message="" isLoading />
    </div>
  );
}
