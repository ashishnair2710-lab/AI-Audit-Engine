export default function CompetitorBar({ competitors, userCount }) {
  const max = Math.max(userCount, ...competitors.map((c) => c.ad_count), 1);

  return (
    <div className="space-y-3">
      {/* User bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-brand-purple">You</span>
          <span className="text-xs font-bold text-brand-text">{userCount} creatives</span>
        </div>
        <div className="h-6 bg-slate-100 rounded-lg overflow-hidden">
          <div
            className="h-full bg-brand-purple rounded-lg flex items-center px-2 transition-all duration-700"
            style={{ width: `${(userCount / max) * 100}%`, minWidth: "2px" }}
          />
        </div>
      </div>

      {/* Competitor bars */}
      {competitors.map((c) => (
        <div key={c.brand}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-brand-subtext">{c.brand}</span>
              {c.is_winning && (
                <span className="text-xs bg-orange-50 border border-orange-200 text-orange-600 px-1.5 py-0.5 rounded font-medium">
                  🏆 Winning
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-brand-text">{c.ad_count} ads</span>
          </div>
          <div className="h-6 bg-slate-100 rounded-lg overflow-hidden">
            <div
              className="h-full rounded-lg flex items-center px-2 transition-all duration-700"
              style={{
                width: `${(c.ad_count / max) * 100}%`,
                background: c.is_winning ? "#F97316" : "#94A3B8",
                minWidth: "2px",
              }}
            />
          </div>
        </div>
      ))}

      <p className="text-xs text-brand-muted pt-1">
        Creative volume directly impacts learning speed and ad performance
      </p>
    </div>
  );
}
