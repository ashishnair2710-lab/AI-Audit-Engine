export default function InsightCard({ title, detail, impact, fix, effort, timeline, type = "cross", index = 0 }) {
  const typeConfig = {
    cross:       { accent: "text-brand-blue",  border: "border-brand-blue/20",  bg: "bg-brand-blue/5"  },
    growth:      { accent: "text-brand-green", border: "border-brand-green/20", bg: "bg-brand-green/5" },
    opportunity: { accent: "text-brand-green", border: "border-brand-green/20", bg: "bg-brand-green/5" },
    warning:     { accent: "text-orange-400",  border: "border-orange-500/20",  bg: "bg-orange-500/5"  },
  };

  const config = typeConfig[type] || typeConfig.cross;

  return (
    <div
      className={`rounded-2xl border ${config.border} ${config.bg} p-5 animate-slide-up`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Title */}
      <h4 className={`font-semibold text-sm ${config.accent} mb-2`}>{title}</h4>

      {/* Detail */}
      {detail && <p className="text-slate-300 text-sm leading-relaxed mb-3">{detail}</p>}

      {/* Impact */}
      {impact && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Impact:</span>
          <span className="text-sm font-bold text-white">{impact}</span>
        </div>
      )}

      {/* Fix */}
      {fix && (
        <div className="pt-3 border-t border-white/5">
          <p className="text-xs font-semibold text-brand-green uppercase tracking-wider mb-1">Recommended Action</p>
          <p className="text-slate-300 text-sm">{fix}</p>
        </div>
      )}

      {/* Growth meta */}
      {(effort || timeline) && (
        <div className="flex gap-4 pt-3 border-t border-white/5 mt-3">
          {effort   && <Pill label="Effort"   value={effort}   />}
          {timeline && <Pill label="Timeline" value={timeline} />}
        </div>
      )}
    </div>
  );
}

function Pill({ label, value }) {
  return (
    <div>
      <p className="text-xs text-brand-muted">{label}</p>
      <p className="text-xs font-semibold text-white">{value}</p>
    </div>
  );
}
