export default function SummaryBanner({ summary, score, criticalCount, highCount, wastedSpend }) {
  return (
    <div className="rounded-2xl border border-brand-blue/20 bg-gradient-to-br from-brand-blue/8 to-brand-navy p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-blue/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347A3.75 3.75 0 0112 21a3.75 3.75 0 01-2.64-1.09l-.347-.347z"/>
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold text-brand-blue uppercase tracking-widest">AI Audit Summary</p>
          <p className="text-white font-semibold text-sm">Decision Engine Analysis</p>
        </div>
      </div>

      {/* Summary text */}
      <p className="text-slate-300 text-sm leading-relaxed">{summary}</p>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        <StatChip label="Score"          value={`${score}/100`}            color="blue"   />
        <StatChip label="Critical/High"  value={`${criticalCount + highCount} issues`}     color="orange" />
        <StatChip label="Wasted Spend"   value={wastedSpend}               color="red"    />
      </div>
    </div>
  );
}

function StatChip({ label, value, color }) {
  const colors = {
    blue:   "text-brand-blue  bg-brand-blue/10  border-brand-blue/20",
    green:  "text-brand-green bg-brand-green/10 border-brand-green/20",
    orange: "text-orange-400  bg-orange-500/10  border-orange-500/20",
    red:    "text-red-400     bg-red-500/10     border-red-500/20",
  };
  return (
    <div className={`rounded-xl border px-3 py-2.5 ${colors[color] || colors.blue}`}>
      <p className="text-xs opacity-70 font-medium">{label}</p>
      <p className="text-sm font-bold mt-0.5">{value}</p>
    </div>
  );
}
