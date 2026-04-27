export default function InsightCard({ title, detail, impact, fix, effort, timeline, type = "cross", index = 0 }) {
  const cfg = {
    cross:   { border: "border-blue-200",   bg: "bg-blue-50",   title: "text-blue-700"   },
    growth:  { border: "border-purple-200", bg: "bg-purple-50", title: "text-brand-purple"},
    warning: { border: "border-orange-200", bg: "bg-orange-50", title: "text-orange-700" },
  }[type] || { border: "border-purple-200", bg: "bg-purple-50", title: "text-brand-purple" };

  return (
    <div
      className={`rounded-2xl border ${cfg.border} ${cfg.bg} p-5 animate-slide-up`}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <h4 className={`font-semibold text-sm ${cfg.title} mb-2`}>{title}</h4>
      {detail && <p className="text-brand-subtext text-sm leading-relaxed mb-3">{detail}</p>}
      {impact && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Impact:</span>
          <span className="text-sm font-bold text-brand-text">{impact}</span>
        </div>
      )}
      {fix && (
        <div className="pt-3 border-t border-white/80">
          <p className="text-xs font-semibold text-brand-purple uppercase tracking-wider mb-1">Recommended Action</p>
          <p className="text-brand-subtext text-sm">{fix}</p>
        </div>
      )}
      {(effort || timeline) && (
        <div className="flex gap-6 pt-3 border-t border-white/80 mt-3">
          {effort   && <div><p className="text-xs text-brand-muted">Effort</p><p className="text-xs font-semibold text-brand-text">{effort}</p></div>}
          {timeline && <div><p className="text-xs text-brand-muted">Timeline</p><p className="text-xs font-semibold text-brand-text">{timeline}</p></div>}
        </div>
      )}
    </div>
  );
}
