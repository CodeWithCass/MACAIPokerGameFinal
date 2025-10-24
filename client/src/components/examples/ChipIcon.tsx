import { ChipIcon } from '../ChipIcon';

export default function ChipIconExample() {
  return (
    <div className="flex gap-4 p-8 items-center">
      <ChipIcon value={5} />
      <ChipIcon value={10} />
      <ChipIcon value={25} />
      <ChipIcon value={50} />
      <ChipIcon value={100} />
    </div>
  );
}
