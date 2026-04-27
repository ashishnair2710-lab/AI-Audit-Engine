import { useState } from "react";

const SEVERITY_CONFIG = {
  CRITICAL: { label: "Critical", bg: "badge-critical", dot: "bg-red-400",    border: "border-red-500/20",    glow: "hover:border-red-500/40"    },
  HIGH:     { label: "High",     bg: "badge-high",     dot: "bg-orange-400", border: "border-orange-500/20", glow: "hover:border-orange-500/40" },
  MEDIUM:   { label: "Medium",   bg: "badge-medium",   dot: "bg-yellow-400", border: "border-yellow-500/20", glow: "hover:border-yellow-500/40" },
  LOW:      { label: "Low",      bg: "badge-low",      dot: "bg-slate-400",  border: "border-slate-500/20",  glow: "hover:border-slate-500/40"  },
};

export default function IssueCard({ severity, title, impact, action, index }) {
  const [expanded, setExpanded] = useState(false);
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.LOW;

  return (
    <div
      className={`card-dark border ${config.border} ${config.glow} transition-all duration-200 cursor-pointer animate-slide-up`}
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-5">
        <div className="flex items-start gap-3">
          {/* Severity dot + badge */}
          <div className="flex-shrink-0 mt-0.5">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${config.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
              {config.label}
            </span>
          </div>

          {/* Title */}
          <p className="text-white text-sm font-medium leading-snug flex-1">{title}</p>

          {/* Expand chevron */}
          <svg
            className={`flex-shrink-0 w-4 h-4 text-brand-muted transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-brand-border space-y-3 animate-fade-in">
            <div>
              <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">Business Impact</p>
              <p className="text-slate-300 text-sm leading-relaxed">{impact}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-brand-green uppercase tracking-wider mb-1">Recommended Fix</p>
              <p className="text-slate-300 text-sm leading-relaxed">{action}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
