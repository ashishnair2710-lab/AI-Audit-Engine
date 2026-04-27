export default function FunnelViz({ tofu, mofu, bofu, tofuPct, mofuPct, bofuPct, tofuSpend, mofuSpend, bofuSpend }) {
  const stages = [
    { key: "TOFU", label: "Awareness",  pct: tofuPct, spend: tofuSpend, active: tofu,  color: "#7C3AED", width: "100%" },
    { key: "MOFU", label: "Traffic",    pct: mofuPct, spend: mofuSpend, active: mofu,  color: "#3B82F6", width: "72%"  },
    { key: "BOFU", label: "Conversion", pct: bofuPct, spend: bofuSpend, active: bofu,  color: "#0F172A", width: "46%"  },
  ];

  return (
    <div className="space-y-2">
      {stages.map((s, i) => (
        <div key={s.key} className="flex items-center gap-4">
          {/* Funnel bar */}
          <div className="flex-1 flex justify-center">
            <div
              className="relative flex items-center justify-between px-4 py-3 rounded-lg transition-all"
              style={{
                width: s.width,
                background: s.active ? s.color + "14" : "#FEF2F2",
                border: `1.5px solid ${s.active ? s.color + "40" : "#FECACA"}`,
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: s.active ? s.color : "#EF4444" }}
                />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: s.active ? s.color : "#EF4444" }}>
                  {s.key}
                </span>
                <span className="text-xs text-brand-muted font-medium">{s.label}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-brand-text">{s.pct}%</span>
                <span className="text-xs text-brand-muted ml-1.5">AED {Number(s.spend||0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Status badge */}
          <div className="w-16 text-right flex-shrink-0">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
              s.active
                ? "bg-purple-50 text-brand-purple border border-purple-200"
                : "bg-red-50 text-red-500 border border-red-200"
            }`}>
              {s.active ? "Active" : "Missing"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
