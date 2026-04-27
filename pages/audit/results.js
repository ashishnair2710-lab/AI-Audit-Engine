import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Navbar from "../../components/Navbar";
import ScoreRing from "../../components/ScoreRing";
import IssueCard from "../../components/IssueCard";
import MetricBar, { MetricTile } from "../../components/MetricBar";
import TabPanel from "../../components/TabPanel";
import InsightCard from "../../components/InsightCard";
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
        <p className="text-brand-muted text-sm">Analysing your campaigns…</p>
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

  const donutSegments = [
    { label: "TOFU – Awareness",  value: bp.tofu_pct || 0, color: "#7C3AED" },
    { label: "MOFU – Traffic",    value: bp.mofu_pct || 0, color: "#3B82F6" },
    { label: "BOFU – Conversion", value: bp.bofu_pct || 0, color: "#0F172A" },
  ];

  return (
    <>
      <Head><title>Audit Results — {score}/100</title></Head>
      <div className="min-h-screen bg-brand-bg">
        <Navbar />

        <main className="pt-20 pb-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-5">

          {/* ── HERO BANNER ── */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 pt-4">

            {/* Score */}
            <div className="card p-6 flex flex-col items-center justify-center gap-2">
              <ScoreRing score={score} label={data.score_label} color={ringColor} grade={data.score_grade} />
              <p className="text-xs text-brand-muted uppercase tracking-widest mt-1">Funnel Health Score</p>
            </div>

            {/* Wasted spend callout */}
            <div className="card p-6 border-l-4 border-red-400 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-1">⚠ Wasted Spend</p>
                <p className="text-4xl font-extrabold text-red-500 leading-none">
                  AED {fmt(kpis.wasted_spend)}
                </p>
                <p className="text-sm text-brand-muted mt-1">per month on Google</p>
              </div>
              <div className="mt-4 pt-4 border-t border-brand-border">
                <p className="text-xs text-brand-muted">Across <span className="font-bold text-brand-text">{google.summary?.wasted_campaigns || 0} campaign(s)</span> with ROAS &lt; 1</p>
              </div>
            </div>

            {/* Issues summary */}
            <div className="card p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-brand-muted uppercase tracking-widest mb-3">Issues Breakdown</p>
                <div className="space-y-2">
                  <IssueLine color="bg-red-500"    label="Critical" count={kpis.critical_issues || 0} />
                  <IssueLine color="bg-orange-500" label="High"     count={kpis.high_issues     || 0} />
                  <IssueLine color="bg-yellow-400" label="Total"    count={kpis.total_issues    || 0} />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-brand-border">
                <p className="text-xs text-brand-muted">Total spend: <span className="font-bold text-brand-text">AED {fmt(kpis.total_spend)}</span></p>
              </div>
            </div>

            {/* Score breakdown */}
            <div className="card p-6">
              <p className="section-title">Score Breakdown</p>
              <div className="space-y-3">
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

          {/* ── AI SUMMARY ── */}
          <div className="card p-6 border-l-4 border-brand-purple">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-brand-lavender flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-brand-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-brand-purple uppercase tracking-widest mb-1">AI Decision Summary</p>
                <p className="text-brand-subtext text-sm leading-relaxed">{data.summary}</p>
              </div>
            </div>
          </div>

          {/* ── TOP FIXES ── */}
          <section>
            <SectionHeader title="Top Priority Fixes" badge={`${data.top_fixes?.length || 0} actions`} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(data.top_fixes || []).map((fix, i) => (
                <IssueCard key={i} severity={fix.severity} title={fix.title} impact={fix.impact} action={fix.action} index={i} />
              ))}
            </div>
          </section>

          {/* ── VISUAL PLATFORM ANALYSIS ── */}
          <section>
            <SectionHeader title="Platform Analysis" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Meta — Funnel visual */}
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">f</span>
                  </div>
                  <p className="font-semibold text-brand-text text-sm">Meta Ads — Funnel</p>
                </div>
                <FunnelViz
                  tofu={fp.tofu} mofu={fp.mofu} bofu={fp.bofu}
                  tofuPct={bp.tofu_pct||0} mofuPct={bp.mofu_pct||0} bofuPct={bp.bofu_pct||0}
                  tofuSpend={bp.tofu_spend||0} mofuSpend={bp.mofu_spend||0} bofuSpend={bp.bofu_spend||0}
                />
                {/* Signal badges */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-brand-border">
                  <SignalBadge label="Pixel" active={meta.signal_quality?.pixel_active} />
                  <SignalBadge label="CAPI"  active={meta.signal_quality?.capi_enabled} />
                  <SignalBadge label="Video" active={meta.creative_system?.has_video}    />
                  <SignalBadge label="Retargeting" active={(meta.audience_mix?.retargeting||0) > 0} />
                </div>
              </div>

              {/* Meta — Budget donut */}
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-brand-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/>
                    </svg>
                  </div>
                  <p className="font-semibold text-brand-text text-sm">Meta Budget Split</p>
                </div>
                <DonutChart segments={donutSegments} />
                <div className="mt-4 pt-4 border-t border-brand-border">
                  <p className="text-xs text-brand-muted">Total Meta spend: <span className="font-bold text-brand-text">AED {fmt(bp.total_spend)}</span></p>
                </div>
              </div>

              {/* Google — ROAS + Wasted */}
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center">
                    <span className="text-xs font-bold text-orange-600">G</span>
                  </div>
                  <p className="font-semibold text-brand-text text-sm">Google Ads Performance</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-brand-muted mb-1">Avg ROAS</p>
                    <p className={`text-2xl font-extrabold ${(google.summary?.avg_roas||0) >= 3 ? "text-brand-purple" : "text-orange-500"}`}>
                      {google.summary?.avg_roas || 0}x
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-red-400 mb-1">Wasted</p>
                    <p className="text-xl font-extrabold text-red-500">AED {fmt(google.summary?.wasted_spend)}</p>
                  </div>
                </div>

                {/* Efficiency bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-brand-muted mb-1">
                    <span>Spend efficiency</span>
                    <span>{Math.round(((google.summary?.total_spend||0) - (google.summary?.wasted_spend||0)) / Math.max(google.summary?.total_spend||1, 1) * 100)}% efficient</span>
                  </div>
                  <div className="h-3 bg-red-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-purple rounded-full"
                      style={{ width: `${Math.round(((google.summary?.total_spend||0) - (google.summary?.wasted_spend||0)) / Math.max(google.summary?.total_spend||1, 1) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-brand-purple font-medium">Effective</span>
                    <span className="text-red-400 font-medium">Wasted</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── COMPETITOR LANDSCAPE ── */}
          {competitor.competitors?.length > 0 && (
            <section>
              <SectionHeader title="Competitor Creative Landscape" badge={`${competitor.benchmarks?.competitors_analyzed} competitors`} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="card p-5">
                  <p className="section-title">Creative Volume Comparison</p>
                  <CompetitorBar
                    competitors={competitor.competitors}
                    userCount={competitor.benchmarks?.user_creative_count || 0}
                  />
                </div>
                <div className="card p-5">
                  <p className="section-title">Winning Ads Detected</p>
                  {competitor.winning_ads?.length > 0 ? (
                    <div className="space-y-3">
                      {competitor.winning_ads.map((ad, i) => (
                        <div key={i} className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">🏆</span>
                              <span className="font-bold text-brand-text text-sm">{ad.brand}</span>
                            </div>
                            <span className="text-xs font-bold text-brand-purple bg-white border border-purple-200 px-2.5 py-1 rounded-full">
                              {ad.duration_days} days live
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(ad.hooks||[]).map((h,j) => (
                              <span key={j} className="text-xs bg-white border border-purple-200 text-brand-subtext px-2 py-0.5 rounded">{h}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-brand-muted text-sm">No winning ads detected yet.</p>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ── CROSS-PLATFORM INSIGHTS ── */}
          {cross.length > 0 && (
            <section>
              <SectionHeader title="Cross-Platform Insights" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cross.map((c, i) => (
                  <InsightCard key={i} type="cross" title={c.title} detail={c.detail} impact={c.impact} fix={c.fix} index={i} />
                ))}
              </div>
            </section>
          )}

          {/* ── GROWTH OPPORTUNITIES ── */}
          {data.growth_opportunities?.length > 0 && (
            <section>
              <SectionHeader title="Growth Opportunities" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.growth_opportunities.map((opp, i) => (
                  <InsightCard key={i} type="growth" title={opp.title} detail={opp.detail} impact={opp.impact} effort={opp.effort} timeline={opp.timeline} index={i} />
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

// ── Small helpers ────────────────────────────────────────────────────────────

function SectionHeader({ title, badge }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-brand-navy">{title}</h2>
      {badge && <span className="text-xs text-brand-muted bg-white border border-brand-border px-3 py-1 rounded-full">{badge}</span>}
    </div>
  );
}

function SignalBadge({ label, active }) {
  return (
    <span className={`flex-1 text-center text-xs font-semibold px-1.5 py-1 rounded-lg border ${
      active ? "bg-purple-50 text-brand-purple border-purple-200" : "bg-red-50 text-red-500 border-red-200"
    }`}>
      {active ? "✓" : "✗"} {label}
    </span>
  );
}

function IssueLine({ color, label, count }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`} />
      <span className="text-sm text-brand-muted flex-1">{label}</span>
      <span className="text-lg font-extrabold text-brand-text">{count}</span>
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
