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
  const [tab, setTab]     = useState("overview");

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
  const score      = data.funnel_health_score || 0;
  const ringColor  = score >= 70 ? "purple" : score >= 45 ? "orange" : "red";

  const tabs = [
    { id: "overview",    label: "Overview" },
    { id: "meta",        label: "Meta Ads" },
    { id: "google",      label: "Google Ads" },
    { id: "competitors", label: "Competitors" },
  ];

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

          {/* ── TABS ── */}
          <div className="flex gap-1 bg-white border border-brand-border rounded-xl p-1 w-fit">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  tab === t.id ? "bg-brand-purple text-white shadow-sm" : "text-brand-muted hover:text-brand-text"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "overview"    && <OverviewTab data={data} score={score} ringColor={ringColor} kpis={kpis} google={google} cross={cross} />}
          {tab === "meta"        && <MetaTab meta={meta} />}
          {tab === "google"      && <GoogleTab google={google} />}
          {tab === "competitors" && <CompetitorsTab competitor={competitor} />}

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

// ═══════════════════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════════════════════════════
function OverviewTab({ data, score, ringColor, kpis, google, cross }) {
  const totalSpend = google.summary?.total_spend || 0;
  const wasted     = google.summary?.wasted_spend || 0;
  const efficient  = Math.round(((totalSpend - wasted) / Math.max(totalSpend, 1)) * 100);
  const topFixes = (data.top_fixes || []).slice(0, 4);

  return (
    <div className="space-y-5">
      {/* HERO */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="card p-6 flex flex-col items-center justify-center">
          <ScoreRing score={score} label={data.score_label} color={ringColor} grade={data.score_grade} />
          <p className="text-xs text-brand-muted uppercase tracking-widest mt-3">Health Score</p>
        </div>
        <StatCard tone="red"    label="Wasted / month" value={`AED ${fmt(kpis.wasted_spend)}`} footer={`${google.summary?.wasted_campaigns || 0} campaigns · ROAS < 1`} />
        <StatCard tone="purple" label="Total Spend"    value={`AED ${fmt(kpis.total_spend)}`}  footer={`${efficient}% efficient`} />
        <div className="card p-6">
          <p className="text-xs font-semibold text-brand-muted uppercase tracking-widest mb-3">Score Breakdown</p>
          <div className="space-y-2.5">
            {Object.entries(data.score_breakdown || {}).map(([dim, val]) => (
              <MetricBar key={dim} label={dimLabel(dim)} pct={Math.round((val.score / val.max) * 100)} sublabel={`${val.score}/${val.max}`} color={scoreColor(val.score, val.max)} />
            ))}
          </div>
        </div>
      </div>

      {/* PULSE */}
      <div className="card p-5 grid grid-cols-3 gap-4">
        <PulseStat color="bg-red-500"    label="Critical" count={kpis.critical_issues || 0} />
        <PulseStat color="bg-orange-500" label="High"     count={kpis.high_issues     || 0} />
        <PulseStat color="bg-yellow-400" label="Total"    count={kpis.total_issues    || 0} />
      </div>

      {/* TOP FIXES */}
      <section>
        <SectionHeader title="Fix First" badge={`${topFixes.length} actions`} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {topFixes.map((fix, i) => (
            <FixRow key={i} index={i+1} severity={fix.severity} title={fix.title} impact={fix.impact} />
          ))}
        </div>
      </section>

      {/* CROSS INSIGHTS */}
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
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// META TAB
// ═══════════════════════════════════════════════════════════════════════════
function MetaTab({ meta }) {
  const bp = meta.budget_split || {};
  const fp = meta.funnel_presence || {};
  const perf = meta.performance || {};
  const cs   = meta.creative_system || {};
  const sq   = meta.signal_quality || {};
  const am   = meta.audience_mix || {};
  const issues = meta.issues || [];

  const donutSegments = [
    { label: "Awareness",  value: bp.tofu_pct || 0, color: "#7C3AED" },
    { label: "Traffic",    value: bp.mofu_pct || 0, color: "#3B82F6" },
    { label: "Conversion", value: bp.bofu_pct || 0, color: "#0F172A" },
  ];

  return (
    <div className="space-y-5">
      <PlatformHeader color="#1877F2" name="Meta Ads" subtitle="Facebook + Instagram performance" />

      {/* KPI ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiBox label="Spend"       value={`AED ${fmt(perf.total_spend)}`} />
        <KpiBox label="Impressions" value={fmt(perf.total_impressions)} />
        <KpiBox label="CTR"         value={`${perf.blended_ctr || 0}%`} tone="purple" />
        <KpiBox label="Cost / Conv" value={perf.cost_per_conversion ? `AED ${fmt(perf.cost_per_conversion)}` : "—"} tone="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5">
          <ChartTitle dot="#3B82F6" text="Funnel Coverage" />
          <FunnelViz
            tofu={fp.tofu} mofu={fp.mofu} bofu={fp.bofu}
            tofuPct={bp.tofu_pct||0} mofuPct={bp.mofu_pct||0} bofuPct={bp.bofu_pct||0}
            tofuSpend={bp.tofu_spend||0} mofuSpend={bp.mofu_spend||0} bofuSpend={bp.bofu_spend||0}
          />
        </div>

        <div className="card p-5">
          <ChartTitle dot="#7C3AED" text="Budget Split" />
          <DonutChart segments={donutSegments} />
          <div className="mt-4 pt-4 border-t border-brand-border text-xs text-brand-muted">
            Meta spend · <span className="font-bold text-brand-text">AED {fmt(bp.total_spend)}</span>
          </div>
        </div>

        <div className="card p-5">
          <ChartTitle dot="#F97316" text="Signals & Audience" />
          <div className="grid grid-cols-2 gap-2 mb-4">
            <SignalBadge label="Pixel"       active={sq.pixel_active} />
            <SignalBadge label="CAPI"        active={sq.capi_enabled} />
            <SignalBadge label="Video"       active={cs.has_video}    />
            <SignalBadge label="Retargeting" active={(am.retargeting||0) > 0} />
          </div>
          <div className="space-y-2 pt-3 border-t border-brand-border">
            <RowKV k="Broad audiences"       v={am.broad || 0} />
            <RowKV k="Interest audiences"    v={am.interest || 0} />
            <RowKV k="Retargeting audiences" v={am.retargeting || 0} />
            <RowKV k="Total creatives"       v={cs.total_creatives || 0} />
          </div>
        </div>
      </div>

      {/* TOP / UNDERPERFORMING CREATIVES */}
      <section>
        <SectionHeader title="Top Performing Creatives" badge={`${(meta.top_creatives||[]).length}`} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(meta.top_creatives || []).length > 0
            ? meta.top_creatives.map((ad, i) => <CreativeCard key={i} ad={ad} tone="top" platform="meta" />)
            : Array.from({length: 4}).map((_, i) => <AdPreviewSkeleton key={i} platform="meta" />)}
        </div>
      </section>

      <section>
        <SectionHeader title="Underperforming — Consider Killing" badge={`${(meta.underperforming_creatives||[]).length}`} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(meta.underperforming_creatives || []).length > 0
            ? meta.underperforming_creatives.map((ad, i) => <CreativeCard key={i} ad={ad} tone="bottom" platform="meta" />)
            : Array.from({length: 4}).map((_, i) => <AdPreviewSkeleton key={i} platform="meta" />)}
        </div>
      </section>

      {/* ISSUES */}
      {issues.length > 0 && (
        <section>
          <SectionHeader title="Meta Issues" badge={`${issues.length}`} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {issues.slice(0,6).map((iss, i) => (
              <FixRow key={i} index={i+1} severity={iss.severity} title={iss.title} impact={iss.impact} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// GOOGLE TAB
// ═══════════════════════════════════════════════════════════════════════════
function GoogleTab({ google }) {
  const s = google.summary || {};
  const issues = google.issues || [];
  const wasted = s.wasted_spend || 0;
  const total  = s.total_spend  || 0;
  const efficient = Math.round(((total - wasted) / Math.max(total, 1)) * 100);

  return (
    <div className="space-y-5">
      <PlatformHeader color="#F97316" name="Google Ads" subtitle="Search + Shopping performance" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiBox label="Spend"        value={`AED ${fmt(s.total_spend)}`} />
        <KpiBox label="Conversions"  value={fmt(s.total_conversions)} />
        <KpiBox label="Avg ROAS"     value={`${s.avg_roas || 0}x`}     tone={(s.avg_roas||0) >= 3 ? "purple" : "orange"} />
        <KpiBox label="Wasted"       value={`AED ${fmt(s.wasted_spend)}`} tone="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <ChartTitle dot="#7C3AED" text="Spend Efficiency" />
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-xs">
              <span className="text-brand-purple font-semibold">{efficient}% Effective</span>
              <span className="text-red-400 font-semibold">{100-efficient}% Wasted</span>
            </div>
            <div className="h-3 bg-red-100 rounded-full overflow-hidden flex">
              <div className="h-full bg-brand-purple" style={{ width: `${efficient}%` }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-brand-border">
            <RowKV k="Search campaigns"   v={s.search_campaigns || 0} />
            <RowKV k="Shopping campaigns" v={s.shopping_campaigns || 0} />
            <RowKV k="Wasted campaigns"   v={s.wasted_campaigns || 0} />
            <RowKV k="Total campaigns"    v={(s.search_campaigns||0) + (s.shopping_campaigns||0)} />
          </div>
        </div>

        <div className="card p-5">
          <ChartTitle dot="#F97316" text="Wasted Campaigns" />
          {(google.wasted_campaigns || []).length > 0 ? (
            <div className="space-y-2">
              {(google.wasted_campaigns || []).slice(0,5).map((w, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-100">
                  <span className="text-xs font-bold text-red-500 uppercase tracking-wider w-16 truncate">{w.type}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-brand-muted">ROAS <span className="font-bold text-red-500">{w.roas}x</span> · {w.conversions} conv</p>
                  </div>
                  <span className="text-sm font-bold text-red-500 whitespace-nowrap">AED {fmt(w.spend)}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-brand-muted">No wasted campaigns detected.</p>}
        </div>
      </div>

      {/* TOP / WORST CAMPAIGNS */}
      <section>
        <SectionHeader title="Top Performing Campaigns" badge={`${(google.top_campaigns||[]).length}`} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(google.top_campaigns || []).length > 0
            ? google.top_campaigns.map((c, i) => <CreativeCard key={i} ad={c} tone="top" platform="google" />)
            : Array.from({length: 4}).map((_, i) => <SearchAdSkeleton key={i} />)}
        </div>
      </section>

      <section>
        <SectionHeader title="Worst Campaigns — Consider Pausing" badge={`${(google.worst_campaigns||[]).length}`} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(google.worst_campaigns || []).length > 0
            ? google.worst_campaigns.map((c, i) => <CreativeCard key={i} ad={c} tone="bottom" platform="google" />)
            : Array.from({length: 4}).map((_, i) => <SearchAdSkeleton key={i} />)}
        </div>
      </section>

      {issues.length > 0 && (
        <section>
          <SectionHeader title="Google Issues" badge={`${issues.length}`} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {issues.slice(0,6).map((iss, i) => (
              <FixRow key={i} index={i+1} severity={iss.severity} title={iss.title} impact={iss.impact} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPETITORS TAB
// ═══════════════════════════════════════════════════════════════════════════
function CompetitorsTab({ competitor }) {
  const b = competitor.benchmarks || {};
  const issues = competitor.issues || [];
  const winning = competitor.winning_ads || [];

  return (
    <div className="space-y-5">
      <PlatformHeader color="#7C3AED" name="Competitor Analysis" subtitle="Ad library intelligence" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiBox label="Brands tracked"     value={b.competitors_analyzed || 0} />
        <KpiBox label="Their ads (total)"  value={b.total_competitor_ads || 0} />
        <KpiBox label="Their avg / brand"  value={b.avg_competitor_creative_count || 0} tone="orange" />
        <KpiBox label="Your creatives"     value={b.user_creative_count || 0} tone="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <ChartTitle dot="#7C3AED" text="Creative Volume Gap" />
          <CompetitorBar competitors={competitor.competitors || []} userCount={b.user_creative_count || 0} />
        </div>

        <div className="card p-5">
          <ChartTitle dot="#F97316" text="Winning Ads" />
          {winning.length > 0 ? (
            <div className="space-y-2.5">
              {winning.slice(0,4).map((ad, i) => (
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
          ) : <p className="text-sm text-brand-muted">No winning ads detected.</p>}
        </div>
      </div>

      {/* COMPETITOR AD PREVIEWS */}
      <section>
        {(() => {
          const realAds = (competitor.competitors || []).flatMap((c) => (c.ads || []).map((a) => ({...a, brand: c.brand})));
          if (realAds.length > 0) {
            return (
              <>
                <SectionHeader title="Competitor Ad Previews" badge={`${realAds.length} live`} />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {realAds.slice(0, 8).map((ad, i) => <AdPreviewLive key={i} ad={ad} />)}
                </div>
              </>
            );
          }
          return (
            <>
              <SectionHeader title="Competitor Ad Previews" badge="Loading" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(competitor.competitors || []).slice(0,4).map((c, i) => (
                  <AdPreviewSkeleton key={i} platform="competitor" brand={c.brand} />
                ))}
              </div>
            </>
          );
        })()}
      </section>

      {issues.length > 0 && (
        <section>
          <SectionHeader title="Competitor Gaps" badge={`${issues.length}`} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {issues.slice(0,6).map((iss, i) => (
              <FixRow key={i} index={i+1} severity={iss.severity} title={iss.title} impact={iss.impact} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════
function PlatformHeader({ color, name, subtitle }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}40` }}>
        <span className="w-3 h-3 rounded-full" style={{ background: color }} />
      </span>
      <div>
        <h2 className="text-xl font-bold text-brand-navy leading-tight">{name}</h2>
        <p className="text-xs text-brand-muted">{subtitle}</p>
      </div>
    </div>
  );
}

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
    red:    { border: "border-red-400",     text: "text-red-500" },
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

function KpiBox({ label, value, tone }) {
  const tones = {
    purple: "text-brand-purple",
    orange: "text-orange-500",
    red:    "text-red-500",
  };
  return (
    <div className="card p-4">
      <p className="text-[10px] font-semibold text-brand-muted uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-xl font-extrabold leading-tight ${tones[tone] || "text-brand-text"}`}>{value}</p>
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
    <span className={`text-center text-[11px] font-semibold px-2 py-1.5 rounded-md border ${
      active ? "bg-purple-50 text-brand-purple border-purple-200" : "bg-red-50 text-red-500 border-red-200"
    }`}>
      {active ? "✓" : "✗"} {label}
    </span>
  );
}

function RowKV({ k, v }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-brand-muted">{k}</span>
      <span className="font-bold text-brand-text">{v}</span>
    </div>
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

// ── CREATIVE / CAMPAIGN CARD (top + bottom performers) ──────────────────────
function CreativeCard({ ad, tone, platform }) {
  const isTop = tone === "top";
  const accent = isTop
    ? { ring: "border-emerald-200", bg: "bg-emerald-50",  text: "text-emerald-600", badge: "bg-emerald-500" }
    : { ring: "border-red-200",     bg: "bg-red-50",      text: "text-red-500",     badge: "bg-red-500" };

  const roas = ad.roas != null ? `${Number(ad.roas).toFixed(2)}x` : "—";
  const cpa  = ad.cpa  != null ? `AED ${fmt(ad.cpa)}`             : "—";

  return (
    <div className={`card p-4 border-l-4 ${accent.ring} hover:shadow-lifted transition-all`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`text-[9px] font-bold text-white uppercase tracking-wider ${accent.badge} px-1.5 py-0.5 rounded`}>
              {isTop ? "Winner" : "Killer"}
            </span>
            {platform === "google" && (
              <span className="text-[9px] font-bold text-brand-muted bg-slate-100 px-1.5 py-0.5 rounded uppercase">{ad.type || "search"}</span>
            )}
            {platform === "meta" && ad.format && (
              <span className="text-[9px] font-bold text-brand-muted bg-slate-100 px-1.5 py-0.5 rounded uppercase">{ad.format}</span>
            )}
          </div>
          <p className="font-semibold text-brand-text text-sm truncate">{ad.name || ad.headline || "Untitled"}</p>
        </div>
      </div>

      <div className={`grid grid-cols-3 gap-2 p-3 rounded-lg ${accent.bg}`}>
        <div>
          <p className="text-[9px] font-semibold text-brand-muted uppercase tracking-wider">Spend</p>
          <p className="text-sm font-extrabold text-brand-text">AED {fmt(ad.spend)}</p>
        </div>
        <div>
          <p className="text-[9px] font-semibold text-brand-muted uppercase tracking-wider">ROAS</p>
          <p className={`text-sm font-extrabold ${accent.text}`}>{roas}</p>
        </div>
        <div>
          <p className="text-[9px] font-semibold text-brand-muted uppercase tracking-wider">{platform === "meta" ? "Conv" : "CPA"}</p>
          <p className="text-sm font-extrabold text-brand-text">{platform === "meta" ? fmt(ad.conversions) : cpa}</p>
        </div>
      </div>
    </div>
  );
}

// ── LIVE AD PREVIEW (Meta Ad Library) ────────────────────────────────────────
function AdPreviewLive({ ad }) {
  const initial = (ad.brand || ad.page_name || "?")[0]?.toUpperCase();
  return (
    <a
      href={ad.snapshot_url}
      target="_blank"
      rel="noopener noreferrer"
      className="card p-3 overflow-hidden hover:shadow-lifted transition-all block"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-brand-lavender flex items-center justify-center text-[10px] font-bold text-brand-purple">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-brand-text truncate">{ad.page_name || ad.brand}</p>
          <p className="text-[10px] text-brand-muted">Sponsored</p>
        </div>
      </div>
      <div className="aspect-square bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg flex items-center justify-center text-center p-3">
        <p className="text-xs text-brand-purple font-medium line-clamp-4">
          {ad.title || ad.body?.slice(0, 80) || "Ad creative"}
        </p>
      </div>
      {ad.body && (
        <p className="text-[11px] text-brand-subtext mt-2 line-clamp-2">{ad.body}</p>
      )}
      <div className="mt-2 pt-2 border-t border-brand-border flex items-center justify-between">
        <span className="text-[10px] font-semibold text-brand-muted uppercase tracking-wider">{ad.brand}</span>
        <span className="text-[10px] text-brand-purple font-semibold">View →</span>
      </div>
    </a>
  );
}

// ── AD PREVIEW PLACEHOLDERS ──────────────────────────────────────────────────
function AdPreviewSkeleton({ platform, brand }) {
  return (
    <div className="card p-3 overflow-hidden">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-slate-200 shimmer" />
        <div className="flex-1 min-w-0">
          <div className="h-2.5 bg-slate-200 rounded shimmer w-3/4 mb-1" />
          <div className="h-2 bg-slate-100 rounded shimmer w-1/2" />
        </div>
      </div>
      <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg shimmer flex items-center justify-center">
        <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      </div>
      <div className="mt-2 space-y-1.5">
        <div className="h-2 bg-slate-200 rounded shimmer w-full" />
        <div className="h-2 bg-slate-100 rounded shimmer w-2/3" />
      </div>
      <div className="mt-2 pt-2 border-t border-brand-border flex items-center justify-between">
        <span className="text-[10px] font-semibold text-brand-muted uppercase tracking-wider">{brand || (platform === "meta" ? "Meta" : "Ad")}</span>
        <span className="text-[10px] text-brand-muted">Loading…</span>
      </div>
    </div>
  );
}

function SearchAdSkeleton() {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-bold text-brand-purple bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">Ad</span>
        <div className="h-2 bg-slate-200 rounded shimmer w-32" />
      </div>
      <div className="h-3 bg-slate-200 rounded shimmer w-3/4 mb-1.5" />
      <div className="h-3 bg-slate-200 rounded shimmer w-2/3 mb-3" />
      <div className="space-y-1.5">
        <div className="h-2 bg-slate-100 rounded shimmer w-full" />
        <div className="h-2 bg-slate-100 rounded shimmer w-full" />
        <div className="h-2 bg-slate-100 rounded shimmer w-4/5" />
      </div>
      <div className="mt-3 pt-3 border-t border-brand-border flex items-center justify-between">
        <span className="text-[10px] text-brand-muted">Loading preview…</span>
        <div className="w-3 h-3 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
      </div>
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
