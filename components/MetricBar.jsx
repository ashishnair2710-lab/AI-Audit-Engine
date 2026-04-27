export default function MetricBar({ label, value, pct, color = "green", sublabel }) {
  const colorMap = {
    green:  "bg-brand-green",
    blue:   "bg-brand-blue",
    orange: "bg-orange-500",
    muted:  "bg-brand-muted",
  };

  const barColor = colorMap[color] || colorMap.green;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-300 font-medium">{label}</span>
        <div className="text-right">
          <span className="text-sm font-bold text-white">{pct}%</span>
          {sublabel && <span className="text-xs text-brand-muted ml-2">{sublabel}</span>}
        </div>
      </div>
      <div className="h-2 bg-brand-border rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

export function MetricGrid({ children }) {
  return <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{children}</div>;
}

export function MetricTile({ label, value, sub, highlight }) {
  return (
    <div className="card-dark p-4 text-center">
      <p className="metric-label">{label}</p>
      <p className={`metric-value mt-1 ${highlight ? "text-brand-green" : "text-white"}`}>{value}</p>
      {sub && <p className="text-xs text-brand-muted mt-1">{sub}</p>}
    </div>
  );
}
