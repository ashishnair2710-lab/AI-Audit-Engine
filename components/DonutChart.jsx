export default function DonutChart({ segments, size = 140, thickness = 18 }) {
  const radius  = (size - thickness) / 2;
  const circum  = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  let cumulative = 0;
  const arcs = segments
    .filter((s) => s.value > 0)
    .map((s) => {
      const dash   = (s.value / 100) * circum;
      const offset = circum - cumulative * circum / 100;
      cumulative  += s.value;
      return { ...s, dash, offset };
    });

  return (
    <div className="flex items-center gap-6">
      {/* SVG donut */}
      <div className="flex-shrink-0">
        <svg width={size} height={size} className="-rotate-90">
          {/* Track */}
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#F3F4F6" strokeWidth={thickness} />
          {/* Segments */}
          {arcs.map((arc, i) => (
            <circle
              key={i}
              cx={cx} cy={cy} r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth={thickness}
              strokeDasharray={`${arc.dash} ${circum - arc.dash}`}
              strokeDashoffset={arc.offset}
              strokeLinecap="butt"
            />
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: s.color }} />
            <span className="text-xs text-brand-muted">{s.label}</span>
            <span className="text-xs font-bold text-brand-text ml-auto pl-3">{s.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
