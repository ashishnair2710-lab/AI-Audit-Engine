import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Navbar from "../../components/Navbar";
import ScoreRing from "../../components/ScoreRing";
import MetricBar from "../../components/MetricBar";
import FunnelViz from "../../components/FunnelViz";
import DonutChart from "../../components/DonutChart";
import CompetitorBar from "../../components/CompetitorBar";

export default function ResultsPage() {
  const router = useRouter();
  const [data, setData]   = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionStorage.getItem("auth")) { router.push("/login"); return; }
    const stored = sessionStorage.getItem("auditResult");
    if (!stored) { setError("No audit result found."); return; }
    try { setData(JSON.parse(stored)); } catch { setError("Could not parse result."); }
  }, []);

  if (error) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <div className="text-center"><p className="text-red-500 mb-4">{error}</p><a href="/" className="btn-primary">← Run Audit</a></div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-2 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-brand-muted text-sm">Analysing…</p>
      </div>
    </div>
  );

  const meta       = data.meta_audit          || {};
  const google     = data.google_audit        || {};
  const competitor = data.competitor_insights || {};
  const cross      = data.cross_platform_insights || [];
  const kpis       = data.kpis               || {};
  const bp         = meta.budget_split        || {};
  const fp         = meta.funnel_presence     || {};
  const score      = data.funnel_health_score || 0;
  const ringColor  = score >= 70 ? "purple" : score >= 45 ? "orange" : "red";

  const totalSpend = google.summary?.total_spend || 0;
  const wasted     = google.summary?.wasted_spend || 0;
  const efficient  = Math.round(((totalSpend - wasted) / Math.max(totalSpend, 1)) * 100);

  const donutSegments = [
    { label: "Awareness",  value: bp.tofu_pct || 0, color: "#7C3AED" },
    { label: "Traffic",    value: bp.mofu_pct || 0, color: "#3B82F6" },
    { label: "Conversion", value: bp.bofu_pct || 0, color: "#0F172A" },
  ];

  const topFixes = (data.top_fixes || []).slice(0, 4);

  return (
    <>
      <Head><title>Audit · {score}/100</title></Head>
      <div className="min-h-screen bg-brand-bg">
        <Navbar />

        <main className="pt-20 pb-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-5">

          {/* ── HEADER STRIP ── */}
          <div className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-brand-purple uppercase tracking-widest">AI Audit Report</p>
              <h1 className="text-2xl font-bold text-brand-navy">Funnel Health Overview</h1>
            </div>
            <span className="text-xs text-brand-muted bg-white border border-brand-border px-3 py-1.5 rounded-full">
              {new Date().toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>

          {/* ── HERO ── */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

            <div className="card p-6 flex flex-col items-center justify-center">
              <ScoreRing score={score} label={data.score_label} color={ringColor} grade={data.score_grade} />
              <p className="text-xs text-brand-muted uppercase tracking-widest mt-3">Health Score</p>
            </div>

            <StatCard
              tone="red"
              label="Wasted / month"
              value={`AED ${fmt(kpis.wasted_spend)}`}
              footer={`${google.summary?.wasted_campaigns || 0} campaigns · ROAS < 1`}
            />

            <StatCard
              tone="purple"
              label="Total Spend"
              value={`AED ${fmt(kpis.total_spend)}`}
              footer={`${efficient}% efficient`}
            />

            <div className="card p-6">
              <p className="text-xs font-semibold text-brand-muted uppercase tracking-widest mb-3">Score Breakdown</p>
              <div className="space-y-2.5">
                {Object.entries(data.score_breakdown || {}).map(([dim, val]) => (
                  <MetricBar
                    key={dim}
                    label={dimLabel(dim)}
                    pct={Math.round((val.score / val.max) * 100)}
                    sublabel={`${val.score}/${val.max}`}
                    color={scoreColor(val.score, val.max)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── ISSUE PULSE ── */}
          <div className="card p-5">
            <div className="grid grid-cols-3 gap-4">
              <PulseStat color="bg-red-500"    label="Critical" count={kpis.critical_issues || 0} />
              <PulseStat color="bg-orange-500" label="High"     count={kpis.high_issues     || 0} />
              <PulseStat color="bg-yellow-400" label="Total"    count={kpis.total_issues    || 0} />
            </div>
          </div>

          {/* ── TOP FIXES (compact) ── */}
          <section>
            <SectionHeader title="Fix First" badge={`${topFixes.length} actions`} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {topFixes.map((fix, i) => (
                <FixRow key={i} index={i+1} severity={fix.severity} title={fix.title} impact={fix.impact} />
              ))}
            </div>
          </section>

          {/* ── PLATFORM ── */}
          <section>
            <SectionHeader title="Platform Performance" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              <div className="card p-5">
                <ChartTitle dot="#3B82F6" text="Meta · Funnel" />
                <FunnelViz
                  tofu={fp.tofu} mofu={fp.mofu} bofu={fp.bofu}
                  tofuPct={bp.tofu_pct||0} mofuPct={bp.mofu_pct||0} bofuPct={bp.bofu_pct||0}
                  tofuSpend={bp.tofu_spend||0} mofuSpend={bp.mofu_spend||0} bofuSpend={bp.bofu_spend||0}
                />
                <div className="grid grid-cols-4 gap-1.5 mt-4 pt-4 border-t border-brand-border">
                  <SignalBadge label="Pixel" active={meta.signal_quality?.pixel_active} />
                  <SignalBadge label="CAPI"  active={meta.signal_quality?.capi_enabled} />
                  <SignalBadge label="Video" active={meta.creative_system?.has_video}    />
                  <SignalBadge label="Retgt" active={(meta.audience_mix?.retargeting||0) > 0} />
                </div>
              </div>

              <div className="card p-5">
                <ChartTitle dot="#7C3AED" text="Budget Split" />
                <DonutChart segments={donutSegments} />
                <div className="mt-4 pt-4 border-t border-brand-border text-xs text-brand-muted">
                  Meta spend · <span className="font-bold text-brand-text">AED {fmt(bp.total_spend)}</span>
                </div>
              </div>

              <div className="card p-5">
                <ChartTitle dot="#F97316" text="Google · Efficiency" />

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <KpiTile
                    label="ROAS"
                    value={`${google.summary?.avg_roas || 0}x`}
                    tone={(google.summary?.avg_roas||0) >= 3 ? "purple" : "orange"}
                  />
                  <KpiTile
                    label="Wasted"
                    value={`AED ${fmt(wasted)}`}
                    tone="red"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-brand-purple font-semibold">{efficient}% Effective</span>
                    <span className="text-red-400 font-semibold">{100-efficient}% Wasted</span>
                  </div>
                  <div className="h-2.5 bg-red-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-brand-purple" style={{ width: `${efficient}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── COMPETITORS ── */}
          {competitor.competitors?.length > 0 && (
            <section>
              <SectionHeader title="Competitors" badge={`${competitor.benchmarks?.competitors_analyzed} brands`} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="card p-5">
                  <ChartTitle dot="#7C3AED" text="Creative Volume" />
                  <CompetitorBar
                    competitors={competitor.competitors}
                    userCount={competitor.benchmarks?.user_creative_count || 0}
                  />
                </div>
                <div className="card p-5">
                  <ChartTitle dot="#F97316" text="Winning Ads" />
                  {competitor.winning_ads?.length > 0 ? (
                    <div className="space-y-2.5">
                      {competitor.winning_ads.slice(0,3).map((ad, i) => (
                        <div key={i} className="rounded-lg border border-purple-200 bg-purple-50 p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span>🏆</span>
                            <span className="font-bold text-brand-text text-sm truncate">{ad.brand}</span>
                            <div className="flex gap-1 flex-wrap">
                              {(ad.hooks||[]).slice(0,2).map((h,j) => (
                                <span key={j} className="text-[10px] bg-white border border-purple-200 text-brand-subtext px-1.5 py-0.5 rounded">{h}</span>
                              ))}
                            </div>
                          </div>
                          <span className="text-xs font-bold text-brand-purple bg-white border border-purple-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                            {ad.duration_days}d
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-brand-muted text-sm">No winning ads detected.</p>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ── INSIGHTS (compact rows) ── */}
          {cross.length > 0 && (
            <section>
              <SectionHeader title="AI Insights" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {cross.slice(0,4).map((c, i) => (
                  <InsightRow key={i} title={c.title} fix={c.fix} />
                ))}
              </div>
            </section>
          )}

          {/* ── ACTIONS ── */}
          <div className="flex gap-3 justify-center pt-2">
            <a href="/" className="btn-outline">← New Audit</a>
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "audit-report.json" });
                a.click();
              }}
              className="btn-primary"
            >
              Export Report
            </button>
          </div>
        </main>
      </div>
    </>
  );
}

// ── helpers ──────────────────────────────────────────────────────────────────

function SectionHeader({ title, badge }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-lg font-bold text-brand-navy">{title}</h2>
      {badge && <span className="text-xs text-brand-muted bg-white border border-brand-border px-2.5 py-1 rounded-full">{badge}</span>}
    </div>
  );
}

function ChartTitle({ dot, text }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="w-2 h-2 rounded-full" style={{ background: dot }} />
      <p className="font-semibold text-brand-text text-sm">{text}</p>
    </div>
  );
}

function StatCard({ tone, label, value, footer }) {
  const tones = {
    red:    { border: "border-red-400",    text: "text-red-500" },
    purple: { border: "border-brand-purple", text: "text-brand-purple" },
  };
  const t = tones[tone] || tones.purple;
  return (
    <div className={`card p-6 border-l-4 ${t.border} flex flex-col justify-between`}>
      <div>
        <p className="text-xs font-semibold text-brand-muted uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-3xl font-extrabold leading-none ${t.text}`}>{value}</p>
      </div>
      <p className="text-xs text-brand-muted mt-3 pt-3 border-t border-brand-border">{footer}</p>
    </div>
  );
}

function KpiTile({ label, value, tone }) {
  const tones = {
    purple: "bg-purple-50 text-brand-purple",
    orange: "bg-orange-50 text-orange-500",
    red:    "bg-red-50 text-red-500",
  };
  return (
    <div className={`rounded-xl p-3 text-center ${tones[tone]}`}>
      <p className="text-[10px] uppercase tracking-widest font-semibold opacity-70 mb-0.5">{label}</p>
      <p className="text-xl font-extrabold leading-tight">{value}</p>
    </div>
  );
}

function PulseStat({ color, label, count }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />
      <span className="text-sm text-brand-muted flex-1">{label}</span>
      <span className="text-2xl font-extrabold text-brand-text">{count}</span>
    </div>
  );
}

function SignalBadge({ label, active }) {
  return (
    <span className={`text-center text-[10px] font-semibold px-1 py-1 rounded-md border ${
      active ? "bg-purple-50 text-brand-purple border-purple-200" : "bg-red-50 text-red-500 border-red-200"
    }`}>
      {active ? "✓" : "✗"} {label}
    </span>
  );
}

function FixRow({ index, severity, title, impact }) {
  const sev = (severity || "").toLowerCase();
  const tone = sev === "critical" ? "bg-red-500" : sev === "high" ? "bg-orange-500" : "bg-yellow-400";
  return (
    <div className="card p-4 flex items-start gap-3 hover:shadow-lifted transition-all">
      <div className={`w-8 h-8 rounded-lg ${tone} text-white flex items-center justify-center font-bold text-sm flex-shrink-0`}>
        {index}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-brand-text text-sm truncate">{title}</p>
        {impact && <p className="text-xs text-brand-muted mt-0.5 line-clamp-2">{impact}</p>}
      </div>
    </div>
  );
}

function InsightRow({ title, fix }) {
  return (
    <div className="card p-4 border-l-4 border-brand-purple">
      <p className="font-semibold text-brand-text text-sm">{title}</p>
      {fix && <p className="text-xs text-brand-muted mt-1 line-clamp-2">{fix}</p>}
    </div>
  );
}

function fmt(n) {
  return Number(n || 0).toLocaleString("en-AE", { maximumFractionDigits: 0 });
}

function dimLabel(dim) {
  return { funnel: "Funnel", efficiency: "Efficiency", signal: "Signal", competitive: "Competitive" }[dim] || dim;
}

function scoreColor(score, max) {
  const p = score / max;
  return p >= 0.7 ? "purple" : p >= 0.4 ? "orange" : "muted";
}
