export default function SummaryBanner({ summary, score, criticalCount, highCount, wastedSpend }) {
  return (
    <div className="card-purple p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-lavender flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-brand-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347A3.75 3.75 0 0112 21a3.75 3.75 0 01-2.64-1.09l-.347-.347z"/>
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold text-brand-purple uppercase tracking-widest">AI Audit Summary</p>
          <p className="text-brand-text font-semibold text-sm">Decision Engine Analysis</p>
        </div>
      </div>

      <p className="text-brand-subtext text-sm leading-relaxed">{summary}</p>

      <div className="grid grid-cols-3 gap-2 pt-1">
        <Chip label="Score"         value={`${score}/100`}                      color="purple" />
        <Chip label="Critical+High" value={`${criticalCount + highCount} issues`} color="orange" />
        <Chip label="Wasted Spend"  value={wastedSpend}                          color="red"    />
      </div>
    </div>
  );
}

function Chip({ label, value, color }) {
  const cls = {
    purple: "bg-brand-lavender text-brand-purple border-purple-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    red:    "bg-red-50 text-red-600 border-red-200",
  }[color];
  return (
    <div className={`rounded-xl border px-3 py-2 ${cls}`}>
      <p className="text-xs opacity-70 font-medium">{label}</p>
      <p className="text-sm font-bold mt-0.5 truncate">{value}</p>
    </div>
  );
}
