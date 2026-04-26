import { useEffect, useState } from "react";

interface SubjectBreakdownBarProps {
  subject: string;
  percentage: number;
  color: string;
  correct: number;
  total: number;
}

export function SubjectBreakdownBar({
  subject,
  percentage,
  color,
  correct,
  total,
}: SubjectBreakdownBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(percentage), 150);
    return () => clearTimeout(t);
  }, [percentage]);

  return (
    <div className="flex items-center gap-3">
      <span className="font-body text-sm text-ink w-24 truncate flex-shrink-0">{subject}</span>
      <div className="flex-1 bg-ink/8 rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
      <span className="font-body text-xs text-ink-3 w-12 text-right flex-shrink-0 tabular-nums">
        {correct}/{total}
      </span>
    </div>
  );
}
