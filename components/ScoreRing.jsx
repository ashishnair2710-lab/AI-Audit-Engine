import { useEffect, useState } from "react";

const SIZE    = 180;
const STROKE  = 14;
const RADIUS  = (SIZE - STROKE) / 2;
const CIRCUM  = 2 * Math.PI * RADIUS;

const COLOR_MAP = {
  red:    "#EF4444",
  orange: "#F97316",
  yellow: "#EAB308",
  green:  "#22C55E",
  blue:   "#3B82F6",
};

export default function ScoreRing({ score = 0, label = "", color = "green", grade = "B" }) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const offset      = CIRCUM - (animated / 100) * CIRCUM;
  const strokeColor = COLOR_MAP[color] || COLOR_MAP.green;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          {/* Track */}
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
            fill="none" stroke="#334155" strokeWidth={STROKE}
            className="score-ring-track"
          />
          {/* Fill */}
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
            fill="none"
            stroke={strokeColor}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUM}
            strokeDashoffset={offset}
            className="score-ring-fill"
            style={{ filter: `drop-shadow(0 0 8px ${strokeColor}66)` }}
          />
        </svg>

        {/* Centre text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold text-white leading-none">{score}</span>
          <span className="text-brand-muted text-xs font-medium mt-1">/ 100</span>
        </div>
      </div>

      {/* Grade badge */}
      <div className="text-center">
        <span
          className="inline-block px-4 py-1 rounded-full text-sm font-bold border"
          style={{ color: strokeColor, borderColor: strokeColor + "44", background: strokeColor + "18" }}
        >
          Grade {grade} — {label}
        </span>
      </div>
    </div>
  );
}
