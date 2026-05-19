export function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = (current / total) * 100;
  return (
    <div className="h-1 w-full bg-neutral-200">
      <div
        className="h-full bg-neutral-900 transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
