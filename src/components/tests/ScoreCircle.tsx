interface ScoreCircleProps {
  percentage: number;
  size?: "sm" | "lg";
}

export function ScoreCircle({ percentage, size = "lg" }: ScoreCircleProps) {
  const isLg = size === "lg";
  const dim = isLg ? 120 : 80;
  const r = isLg ? 50 : 32;
  const sw = isLg ? 8 : 6;
  const center = dim / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(Math.max(percentage, 0), 100);
  const offset = circumference * (1 - pct / 100);

  const strokeColor =
    pct >= 70 ? "#0D6E6E" : pct >= 40 ? "#F5A623" : "#E8445A";

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: dim, height: dim }}
    >
      <svg
        width={dim}
        height={dim}
        className="-rotate-90"
        style={{ display: "block" }}
      >
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={sw}
        />
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-display font-bold leading-none"
          style={{ fontSize: isLg ? 26 : 16, color: strokeColor }}
        >
          {Math.round(pct)}%
        </span>
        {isLg && (
          <span className="font-body text-[11px] text-ink-3 mt-0.5">Score</span>
        )}
      </div>
    </div>
  );
}
