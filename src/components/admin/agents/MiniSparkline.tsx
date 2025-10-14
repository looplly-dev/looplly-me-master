interface MiniSparklineProps {
  data: number[];
}

export function MiniSparkline({ data }: MiniSparklineProps) {
  if (!data || data.length === 0) {
    return <div className="h-8 w-full bg-muted/20 rounded" />;
  }

  const max = Math.max(...data, 1);
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - (value / max) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg className="w-full h-8" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        points={points}
        className="text-primary"
      />
    </svg>
  );
}
