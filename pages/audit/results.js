import { useEffect, useState } from "react";
import Head          from "next/head";
import Navbar        from "../../components/Navbar";
import ScoreRing     from "../../components/ScoreRing";
import IssueCard     from "../../components/IssueCard";
import MetricBar, { MetricTile } from "../../components/MetricBar";
import TabPanel      from "../../components/TabPanel";
import InsightCard   from "../../components/InsightCard";
import SummaryBanner from "../../components/SummaryBanner";

export default function ResultsPage() {
  const [data,  setData]  = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("auditResult");
    if (!stored) { setError("No audit result found."); return; }
    try { setData(JSON.parse(stored)); } catch { setError("Could not parse result."); }
  }, []);

  if (error) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <a href="/" className="btn-primary">← Run Audit</a>
      </div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const meta       = data.meta_audit          || {};
  const google     = data.google_audit        || {};
  const competitor = data.competitor_insights || {};
  const cross      = data.cross_platform_insights || [];
  const kpis       = data.kpis               || {};
  const bp         = meta.budget_split        || {};

  // Map score color to purple always for brand
  const ringColor = data.funnel_health_score >= 70 ? "purple" : data.funnel_health_score >= 45 ? "orange" : "red";

  return (
    <>
      <Head><title>Audit Results — {data.funnel_health_score}/100</title></Head>

      <div className="min-h-screen bg-brand-bg">
        <Navbar />

        <main className="pt-24 pb-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-6">

          {/* ── Row 1: Score + KPIs + Summary ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

            {/* Score ring */}
            <div className="lg:col-span-3 card p-6 flex flex-col items-center justify-center gap-2">
              <ScoreRing
                score={data.funnel_health_score}
                label={data.score_label}
                color={ringColor}
                grade={data.score_grade}
              />
              <p className="text-xs text-brand-muted uppercase tracking-widest mt-2">Funnel Health Score</p>
            </div>

            {/* Score breakdown */}
            <div className="lg:col-span-3 card p-5 space-y-4">
              <p className="section-title">Score Breakdown</p>
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

            {/* KPI row + summary */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3">
                <MetricTile label="Total Spend"   value={`AED ${fmt(kpis.total_spend)}`} />
                <MetricTile label="Wasted Spend"  value={`AED ${fmt(kpis.wasted_spend)}`} sub="Google" />
                <MetricTile label="Issues Found"  value={kpis.total_issues || 0} />
                <MetricTile label="Critical+High" value={(kpis.critical_issues||0)+(kpis.high_issues||0)} highlight />
              </div>
              <SummaryBanner
                summary={data.summary}
                score={data.funnel_health_score}
                criticalCount={kpis.critical_issues || 0}
                highCount={kpis.high_issues || 0}
                wastedSpend={kpis.wasted_spend_formatted || "AED 0"}
              />
            </div>
          </div>

          {/* ── Row 2: Top Priority Fixes ── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-brand-navy">Top Priority Fixes</h2>
              <span className="text-xs text-brand-muted bg-white border border-brand-border px-3 py-1 rounded-full">
                {data.top_fixes?.length || 0} actions
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(data.top_fixes || []).map((fix, i) => (
                <IssueCard key={i} severity={fix.severity} title={fix.title} impact={fix.impact} action={fix.action} index={i} />
              ))}
            </div>
          </section>

          {/* ── Row 3: Platform Deep Dive ── */}
          <section>
            <h2 className="text-xl font-bold text-brand-navy mb-4">Platform Deep Dive</h2>
            <div className="card p-5">
              <TabPanel tabs={[
                { label: "Meta Ads",    icon: "📘", count: meta?.issues?.length,       content: <MetaTab meta={meta} bp={bp} /> },
                { label: "Google Ads",  icon: "🔍", count: google?.issues?.length,     content: <GoogleTab google={google} /> },
                { label: "Competitors", icon: "🎯", count: competitor?.issues?.length, content: <CompetitorTab competitor={competitor} /> },
              ]} />
            </div>
          </section>

          {/* ── Row 4: Cross-platform ── */}
          {cross.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-brand-navy mb-4">Cross-Platform Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cross.map((c, i) => (
                  <InsightCard key={i} type="cross" title={c.title} detail={c.detail} impact={c.impact} fix={c.fix} index={i} />
                ))}
              </div>
            </section>
          )}

          {/* ── Row 5: Growth ── */}
          {data.growth_opportunities?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-brand-navy mb-4">Growth Opportunities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.growth_opportunities.map((opp, i) => (
                  <InsightCard key={i} type="growth" title={opp.title} detail={opp.detail} impact={opp.impact} effort={opp.effort} timeline={opp.timeline} index={i} />
                ))}
              </div>
            </section>
          )}

          {/* ── Footer ── */}
          <div className="flex gap-3 justify-center pt-4">
            <a href="/" className="btn-outline">← New Audit</a>
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                const url  = URL.createObjectURL(blob);
                const a    = document.createElement("a");
                a.href = url; a.download = "audit-report.json"; a.click();
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

// ── Sub-tab panels ───────────────────────────────────────────────────────────

function MetaTab({ meta, bp }) {
  return (
    <div className="space-y-5">
      {/* Funnel */}
      <div>
        <p className="section-title">Funnel Coverage</p>
        <div className="grid grid-cols-3 gap-3">
          {[["TOFU","Awareness",meta.funnel_presence?.tofu],["MOFU","Traffic",meta.funnel_presence?.mofu],["BOFU","Conversion",meta.funnel_presence?.bofu]].map(([s,l,a]) => (
            <div key={s} className={`rounded-xl border p-4 text-center ${a ? "border-purple-200 bg-purple-50" : "border-red-200 bg-red-50"}`}>
              <p className={`text-xs font-bold uppercase tracking-wider ${a ? "text-brand-purple" : "text-red-500"}`}>{s}</p>
              <p className="text-brand-text font-semibold text-sm mt-1">{l}</p>
              <p className={`text-xs mt-1 font-medium ${a ? "text-brand-purple" : "text-red-500"}`}>{a ? "Active ✓" : "Missing ✗"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div>
        <p className="section-title">Budget Split</p>
        <div className="space-y-3">
          <MetricBar label="TOFU (Awareness)"  pct={bp.tofu_pct||0} sublabel={`AED ${fmt(bp.tofu_spend)}`} color="purple" />
          <MetricBar label="MOFU (Traffic)"    pct={bp.mofu_pct||0} sublabel={`AED ${fmt(bp.mofu_spend)}`} color="muted"  />
          <MetricBar label="BOFU (Conversion)" pct={bp.bofu_pct||0} sublabel={`AED ${fmt(bp.bofu_spend)}`} color="blue"   />
        </div>
      </div>

      <IssueList issues={meta.issues} />
    </div>
  );
}

function GoogleTab({ google }) {
  const s = google.summary || {};
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricTile label="Avg ROAS"     value={`${s.avg_roas || 0}x`} highlight={s.avg_roas >= 3} />
        <MetricTile label="Wasted Spend" value={`AED ${fmt(s.wasted_spend)}`} />
        <MetricTile label="Conversions"  value={s.total_conversions || 0} />
        <MetricTile label="Campaigns"    value={(s.search_campaigns||0)+(s.shopping_campaigns||0)} />
      </div>

      {google.wasted_campaigns?.length > 0 && (
        <div>
          <p className="section-title">Wasted Campaigns</p>
          <div className="space-y-2">
            {google.wasted_campaigns.map((c, i) => (
              <div key={i} className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-brand-text capitalize">{c.type}</span>
                  <span className="text-xs bg-white border border-red-200 text-red-600 px-2 py-0.5 rounded font-medium">ROAS {c.roas}x</span>
                </div>
                <span className="text-red-600 font-bold text-sm">AED {fmt(c.spend)}</span>
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
  const bm = competitor.benchmarks || {};
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricTile label="Your Creatives"      value={bm.user_creative_count||0} />
        <MetricTile label="Avg Competitor Ads"  value={bm.avg_competitor_creative_count||0} />
        <MetricTile label="Competitors Analysed" value={bm.competitors_analyzed||0} />
        <MetricTile label="Winning Ads Found"   value={competitor.winning_ads?.length||0} highlight />
      </div>

      {competitor.winning_ads?.length > 0 && (
        <div>
          <p className="section-title">Competitor Winning Ads</p>
          <div className="space-y-3">
            {competitor.winning_ads.map((ad, i) => (
              <div key={i} className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-brand-text text-sm">{ad.brand}</span>
                  <span className="text-brand-purple text-xs font-bold bg-white px-2.5 py-1 rounded-full border border-purple-200">
                    {ad.duration_days} days running
                  </span>
                </div>
                <p className="text-brand-muted text-xs mb-2">{ad.signal}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(ad.hooks||[]).map((h,j) => (
                    <span key={j} className="px-2 py-1 bg-white border border-purple-200 text-brand-subtext text-xs rounded">{h}</span>
                  ))}
                </div>
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
  if (!issues?.length) return (
    <div className="rounded-xl bg-purple-50 border border-purple-200 p-4 text-center">
      <p className="text-brand-purple text-sm font-medium">No issues in this section ✓</p>
    </div>
  );
  return (
    <div className="space-y-3">
      <p className="section-title">{issues.length} Issue{issues.length !== 1 ? "s" : ""} Found</p>
      {issues.map((issue, i) => (
        <IssueCard key={i} severity={issue.severity} title={issue.message} impact={issue.impact} action={issue.fix} index={i} />
      ))}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

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
