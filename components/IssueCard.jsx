import { useState } from "react";

const SEV = {
  CRITICAL: { label: "Critical", cls: "badge-critical", dot: "bg-red-500"    },
  HIGH:     { label: "High",     cls: "badge-high",     dot: "bg-orange-500"  },
  MEDIUM:   { label: "Medium",   cls: "badge-medium",   dot: "bg-yellow-500"  },
  LOW:      { label: "Low",      cls: "badge-low",      dot: "bg-slate-400"   },
};

export default function IssueCard({ severity, title, impact, action, index }) {
  const [open, setOpen] = useState(false);
  const s = SEV[severity] || SEV.LOW;

  return (
    <div
      className="card p-4 cursor-pointer hover:shadow-lifted transition-all duration-200 animate-slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-start gap-3">
        <span className={`flex-shrink-0 mt-0.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${s.cls}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          {s.label}
        </span>
        <p className="text-brand-text text-sm font-medium leading-snug flex-1">{title}</p>
        <svg className={`flex-shrink-0 w-4 h-4 text-brand-muted mt-0.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {open && (
        <div className="mt-4 pt-4 border-t border-brand-border space-y-3 animate-fade-in">
          <div>
            <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">Business Impact</p>
            <p className="text-brand-subtext text-sm leading-relaxed">{impact}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-brand-purple uppercase tracking-wider mb-1">Recommended Fix</p>
            <p className="text-brand-subtext text-sm leading-relaxed">{action}</p>
          </div>
        </div>
      )}
    </div>
  );
}
