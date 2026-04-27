import { useEffect, useState } from "react";

const SIZE   = 160;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUM = 2 * Math.PI * RADIUS;

const COLOR_MAP = {
  red:    "#EF4444",
  orange: "#F97316",
  yellow: "#EAB308",
  purple: "#7C3AED",
  blue:   "#3B82F6",
};

export default function ScoreRing({ score = 0, label = "", color = "purple", grade = "B" }) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 120);
    return () => clearTimeout(t);
  }, [score]);

  const offset      = CIRCUM - (animated / 100) * CIRCUM;
  const strokeColor = COLOR_MAP[color] || COLOR_MAP.purple;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          <circle cx={SIZE/2} cy={SIZE/2} r={RADIUS}
            fill="none" stroke="#F3F4F6" strokeWidth={STROKE} />
          <circle cx={SIZE/2} cy={SIZE/2} r={RADIUS}
            fill="none" stroke={strokeColor} strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUM} strokeDashoffset={offset}
            className="score-ring-fill"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold text-brand-text leading-none">{score}</span>
          <span className="text-brand-muted text-xs font-medium mt-0.5">/ 100</span>
        </div>
      </div>

      <span
        className="px-3 py-1 rounded-full text-xs font-bold border"
        style={{ color: strokeColor, borderColor: strokeColor + "44", background: strokeColor + "12" }}
      >
        {grade} — {label}
      </span>
    </div>
  );
}
