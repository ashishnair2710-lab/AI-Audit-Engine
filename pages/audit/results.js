import { useEffect, useState } from "react";
import { useRouter }           from "next/router";
import Head                    from "next/head";
import Navbar                  from "../../components/Navbar";
import ScoreRing               from "../../components/ScoreRing";
import IssueCard               from "../../components/IssueCard";
import MetricBar, { MetricGrid, MetricTile } from "../../components/MetricBar";
import TabPanel                from "../../components/TabPanel";
import InsightCard             from "../../components/InsightCard";
import SummaryBanner           from "../../components/SummaryBanner";

export default function ResultsPage() {
  const router  = useRouter();
  const [data,  setData]  = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("auditResult");
    if (!stored) {
      setError("No audit result found. Run an audit first.");
      return;
    }
    try {
      setData(JSON.parse(stored));
    } catch {
      setError("Could not parse audit result.");
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <a href="/" className="btn-primary">← Back to Audit</a>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const meta       = data.meta_audit;
  const google     = data.google_audit;
  const competitor = data.competitor_insights;
  const cross      = data.cross_platform_insights || [];
  const kpis       = data.kpis || {};

  return (
    <>
      <Head>
        <title>Audit Results — Score {data.funnel_health_score}/100</title>
      </Head>

      <div className="min-h-screen bg-brand-bg">
        <Navbar />

        <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
          {/* ── Hero row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Score ring */}
            <div className="card-dark p-8 flex flex-col items-center justify-center animate-fade-in">
              <ScoreRing
                score={data.funnel_health_score}
                label={data.score_label}
                color={data.score_color}
                grade={data.score_grade}
              />
              <p className="mt-5 text-xs text-brand-muted text-center uppercase tracking-widest">
                Funnel Health Score
              </p>
            </div>

            {/* Score breakdown */}
            <div className="card-dark p-6 space-y-4 animate-fade-in" style={{ animationDelay: "80ms" }}>
              <p className="section-title">Score Breakdown</p>
              {Object.entries(data.score_breakdown || {}).map(([dim, val]) => (
                <MetricBar
                  key={dim}
                  label={dimLabel(dim)}
                  pct={Math.round((val.score / val.max) * 100)}
                  sublabel={`${val.score}/${val.max}`}
                  color={barColor(val.score, val.max)}
                />
              ))}
            </div>

            {/* KPI tiles */}
            <div className="space-y-3 animate-fade-in" style={{ animationDelay: "160ms" }}>
              <MetricGrid>
                <MetricTile label="Total Spend"    value={`AED ${(kpis.total_spend || 0).toLocaleString()}`} />
                <MetricTile label="Wasted Spend"   value={kpis.wasted_spend_formatted || "AED 0"} sub="Google" />
                <MetricTile label="Total Issues"   value={kpis.total_issues || 0} />
                <MetricTile label="Critical+High"  value={(kpis.critical_issues || 0) + (kpis.high_issues || 0)} highlight />
              </MetricGrid>

              {/* Summary banner */}
              <SummaryBanner
                summary={data.summary}
                score={data.funnel_health_score}
                criticalCount={kpis.critical_issues || 0}
                highCount={kpis.high_issues || 0}
                wastedSpend={kpis.wasted_spend_formatted || "AED 0"}
              />
            </div>
          </div>

          {/* ── Top Fixes ── */}
          <section className="mb-8 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-brand-navy">Top Priority Fixes</h2>
              <span className="text-xs text-brand-muted">{data.top_fixes?.length || 0} actions identified</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(data.top_fixes || []).map((fix, i) => (
                <IssueCard
                  key={fix.title + i}
                  severity={fix.severity}
                  title={fix.title}
                  impact={fix.impact}
                  action={fix.action}
                  index={i}
                />
              ))}
            </div>
          </section>

          {/* ── Platform tabs ── */}
          <section className="mb-8 animate-slide-up">
            <h2 className="text-xl font-bold text-brand-navy mb-4">Platform Deep Dive</h2>
            <TabPanel tabs={[
              {
                label:   "Meta Ads",
                icon:    "📘",
                count:   meta?.issues?.length,
                content: <MetaTab meta={meta} />,
              },
              {
                label:   "Google Ads",
                icon:    "🔍",
                count:   google?.issues?.length,
                content: <GoogleTab google={google} />,
              },
              {
                label:   "Competitors",
                icon:    "🎯",
                count:   competitor?.issues?.length,
                content: <CompetitorTab competitor={competitor} />,
              },
            ]} />
          </section>

          {/* ── Cross-platform insights ── */}
          {cross.length > 0 && (
            <section className="mb-8 animate-slide-up">
              <h2 className="text-xl font-bold text-brand-navy mb-4">Cross-Platform Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cross.map((insight, i) => (
                  <InsightCard
                    key={insight.code || i}
                    type="cross"
                    title={insight.title}
                    detail={insight.detail}
                    impact={insight.impact}
                    fix={insight.fix}
                    index={i}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── Growth opportunities ── */}
          {data.growth_opportunities?.length > 0 && (
            <section className="animate-slide-up">
              <h2 className="text-xl font-bold text-brand-navy mb-4">Growth Opportunities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.growth_opportunities.map((opp, i) => (
                  <InsightCard
                    key={opp.title + i}
                    type="growth"
                    title={opp.title}
                    detail={opp.detail}
                    impact={opp.impact}
                    effort={opp.effort}
                    timeline={opp.timeline}
                    index={i}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── Footer actions ── */}
          <div className="flex gap-3 justify-center mt-12">
            <a href="/" className="btn-outline">← Run New Audit</a>
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                const url  = URL.createObjectURL(blob);
                const a    = document.createElement("a");
                a.href = url; a.download = "audit-report.json"; a.click();
              }}
              className="btn-secondary"
            >
              Export JSON
            </button>
          </div>
        </main>
      </div>
    </>
  );
}

// ── Sub-tab components ──────────────────────────────────────────────────────

function MetaTab({ meta }) {
  if (!meta) return <p className="text-brand-muted text-sm">No Meta data available.</p>;
  const bp = meta.budget_split || {};
  const cs = meta.creative_system || {};

  return (
    <div className="space-y-6">
      {/* Funnel presence */}
      <div className="card-dark p-5">
        <p className="section-title">Funnel Coverage</p>
        <div className="flex gap-3">
          {[["TOFU", "Awareness", meta.funnel_presence?.tofu], ["MOFU", "Traffic", meta.funnel_presence?.mofu], ["BOFU", "Conversion", meta.funnel_presence?.bofu]].map(([stage, label, active]) => (
            <div key={stage} className={`flex-1 rounded-xl p-4 border text-center ${active ? "border-brand-green/30 bg-brand-green/5" : "border-red-500/20 bg-red-500/5"}`}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${active ? "text-brand-green" : "text-red-400"}`}>{stage}</p>
              <p className="text-white text-sm font-medium">{label}</p>
              <p className={`text-xs mt-1 ${active ? "text-brand-green" : "text-red-400"}`}>{active ? "Active" : "Missing"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Budget split */}
      <div className="card-dark p-5">
        <p className="section-title">Budget Split</p>
        <div className="space-y-3">
          <MetricBar label="TOFU (Awareness)"  pct={bp.tofu_pct || 0} sublabel={`AED ${(bp.tofu_spend || 0).toLocaleString()}`} color="blue" />
          <MetricBar label="MOFU (Traffic)"    pct={bp.mofu_pct || 0} sublabel={`AED ${(bp.mofu_spend || 0).toLocaleString()}`} color="muted" />
          <MetricBar label="BOFU (Conversion)" pct={bp.bofu_pct || 0} sublabel={`AED ${(bp.bofu_spend || 0).toLocaleString()}`} color="green" />
        </div>
      </div>

      {/* Issues */}
      <IssueList issues={meta.issues} />
    </div>
  );
}

function GoogleTab({ google }) {
  if (!google) return <p className="text-brand-muted text-sm">No Google data available.</p>;
  const s = google.summary || {};

  return (
    <div className="space-y-6">
      <MetricGrid>
        <MetricTile label="Avg ROAS"       value={`${s.avg_roas || 0}x`}          highlight={s.avg_roas >= 3} />
        <MetricTile label="Wasted Spend"   value={`AED ${(s.wasted_spend || 0).toLocaleString()}`} />
        <MetricTile label="Conversions"    value={s.total_conversions || 0} />
        <MetricTile label="Campaigns"      value={(s.search_campaigns || 0) + (s.shopping_campaigns || 0)} />
      </MetricGrid>

      {google.wasted_campaigns?.length > 0 && (
        <div className="card-dark p-5">
          <p className="section-title">Wasted Spend Campaigns</p>
          <div className="space-y-2">
            {google.wasted_campaigns.map((c, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-brand-border last:border-0">
                <div>
                  <span className="text-sm text-white font-medium capitalize">{c.type}</span>
                  <span className="ml-2 text-xs text-brand-muted">ROAS: {c.roas}x</span>
                </div>
                <span className="text-red-400 text-sm font-bold">AED {(c.spend || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <IssueList issues={google.issues} />
    </div>
  );
}

function CompetitorTab({ competitor }) {
  if (!competitor) return <p className="text-brand-muted text-sm">No competitor data available.</p>;
  const bm = competitor.benchmarks || {};

  return (
    <div className="space-y-6">
      <MetricGrid>
        <MetricTile label="Your Creatives"       value={bm.user_creative_count || 0} />
        <MetricTile label="Avg Competitor Ads"   value={bm.avg_competitor_creative_count || 0} />
        <MetricTile label="Competitors Analysed" value={bm.competitors_analyzed || 0} />
        <MetricTile label="Winning Ads Found"    value={competitor.winning_ads?.length || 0} highlight />
      </MetricGrid>

      {competitor.winning_ads?.length > 0 && (
        <div className="card-dark p-5">
          <p className="section-title">Competitor Winning Ads</p>
          <div className="space-y-3">
            {competitor.winning_ads.map((ad, i) => (
              <div key={i} className="rounded-xl border border-brand-green/20 bg-brand-green/5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold text-sm">{ad.brand}</span>
                  <span className="text-brand-green text-xs font-bold">{ad.duration_days} days running</span>
                </div>
                <p className="text-brand-muted text-xs">{ad.signal}</p>
                {ad.hooks?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {ad.hooks.map((h, j) => (
                      <span key={j} className="px-2 py-1 rounded bg-brand-border text-slate-300 text-xs">{h}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <IssueList issues={competitor.issues} />
    </div>
  );
}

function IssueList({ issues }) {
  if (!issues?.length) {
    return (
      <div className="card-dark p-5 text-center">
        <p className="text-brand-green text-sm font-medium">No issues found in this section ✓</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <p className="section-title">{issues.length} Issue{issues.length !== 1 ? "s" : ""} Found</p>
      {issues.map((issue, i) => (
        <IssueCard
          key={issue.code || i}
          severity={issue.severity}
          title={issue.message}
          impact={issue.impact}
          action={issue.fix}
          index={i}
        />
      ))}
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function dimLabel(dim) {
  return { funnel: "Funnel Completeness", efficiency: "Efficiency", signal: "Signal Strength", competitive: "Competitive Strength" }[dim] || dim;
}

function barColor(score, max) {
  const pct = score / max;
  if (pct >= 0.8) return "green";
  if (pct >= 0.6) return "blue";
  if (pct >= 0.4) return "orange";
  return "muted";
}
