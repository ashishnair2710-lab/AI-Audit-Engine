export default function MetricBar({ label, pct, sublabel, color = "purple" }) {
  const bar = {
    purple: "bg-brand-purple",
    blue:   "bg-brand-blue",
    orange: "bg-orange-400",
    muted:  "bg-slate-300",
  }[color] || "bg-brand-purple";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-brand-subtext font-medium">{label}</span>
        <div className="text-right">
          <span className="text-sm font-bold text-brand-text">{pct}%</span>
          {sublabel && <span className="text-xs text-brand-muted ml-2">{sublabel}</span>}
        </div>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${bar} rounded-full transition-all duration-700`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
}

export function MetricTile({ label, value, sub, highlight }) {
  return (
    <div className="card p-4">
      <p className="metric-label">{label}</p>
      <p className={`text-xl font-bold mt-1 truncate ${highlight ? "text-brand-purple" : "text-brand-text"}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-brand-muted mt-0.5">{sub}</p>}
    </div>
  );
}
