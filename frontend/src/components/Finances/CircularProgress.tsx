interface Props {
  percent: number; // 0–100
  size?: number;
  strokeWidth?: number;
  paid?: boolean;
}

export function CircularProgress({ percent, size = 64, strokeWidth = 6, paid = false }: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = circumference * (1 - clamped / 100);

  const trackColor = 'rgb(var(--color-bg-3))';
  const fillColor = paid
    ? 'rgb(var(--color-green))'
    : clamped >= 80
    ? 'rgb(var(--color-warn))'
    : 'rgb(var(--color-green))';

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={fillColor}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  );
}
