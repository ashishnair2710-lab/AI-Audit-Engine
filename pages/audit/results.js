import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Navbar from "../../components/Navbar";

export default function ResultsPage() {
  const router = useRouter();
  const [data, setData]   = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab]     = useState("overview");
  const [showFull, setShowFull] = useState(false);

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
      <div className="w-10 h-10 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const meta       = data.meta_audit          || {};
  const google     = data.google_audit        || {};
  const competitor = data.competitor_insights || {};
  const platforms  = data.score_platforms     || {};
  const overall    = { score: data.funnel_health_score || 0, color_hex: data.score_color_hex || "#7C3AED", verdict: data.score_verdict || data.score_label || "" };
  const metaP      = platforms.meta   || { score: 0, color_hex: "#94a3b8", verdict: "—", rubric: [] };
  const googleP    = platforms.google || { score: 0, color_hex: "#94a3b8", verdict: "—", rubric: [] };
  const mode       = data.score_mode || "ecom";
  const clientName = data.client_name || "Untitled Client";

  const topMeta    = meta.top_creatives || [];
  const killMeta   = meta.underperforming_creatives || [];

  return (
    <>
      <Head><title>Audit · {overall.score}/100</title></Head>
      <div className="min-h-screen bg-brand-bg">
        <Navbar />
        <main className="pt-20 pb-16 px-4 sm:px-6 max-w-7xl mx-auto space-y-6">

          {/* ── 1. TOP BAR ── */}
          <div className="pt-3 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs font-semibold text-brand-purple uppercase tracking-widest">AI Audit Report</p>
              <h1 className="text-2xl font-bold text-brand-navy">{clientName}</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                mode === "ecom" ? "bg-purple-50 text-brand-purple border border-purple-200" : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}>
                {mode === "ecom" ? "eCommerce" : "Lead Generation"}
              </span>
              <span className="text-xs text-brand-muted bg-white border border-brand-border px-3 py-1.5 rounded-full">
                {new Date().toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
          </div>

          {/* ── 2. SCORE ROW ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ScoreCard label="Overall"  score={overall.score} color={overall.color_hex} verdict={overall.verdict} />
            <ScoreCard label="Meta Ads" score={metaP.score}    color={metaP.color_hex}   verdict={metaP.verdict} />
            <ScoreCard label="Google Ads" score={googleP.score} color={googleP.color_hex} verdict={googleP.verdict} />
          </div>

          {/* ── 3. PLATFORM METRICS ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PlatformMetrics platform="meta"   data={meta.performance  || {}} />
            <PlatformMetrics platform="google" data={google.summary    || {}} />
          </div>

          {/* ── 4. CREATIVE ROW ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CreativePanel title="Top Creatives"     subtitle="Highest CTR" tone="top"    creatives={topMeta} />
            <CreativePanel title="Creatives to Kill" subtitle="High spend · low CTR" tone="kill" creatives={killMeta} />
          </div>

          {/* ── 4. FUNNEL HEALTH PANEL ── */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="text-lg font-bold text-brand-navy">Funnel Health</h2>
              <div className="flex gap-1 bg-brand-bg border border-brand-border rounded-lg p-1">
                {[
                  { id: "overview",    label: "Overview" },
                  { id: "meta",        label: "Meta Ads" },
                  { id: "google",      label: "Google Ads" },
                  { id: "competitors", label: "Competitors" },
                ].map((t) => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      tab === t.id ? "bg-brand-purple text-white shadow-sm" : "text-brand-muted hover:text-brand-text"
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {tab === "overview"    && <OverviewFlags meta={metaP.rubric || []} google={googleP.rubric || []} />}
            {tab === "meta"        && <FlagsPanel rubric={metaP.rubric   || []} />}
            {tab === "google"      && <FlagsPanel rubric={googleP.rubric || []} />}
            {tab === "competitors" && <CompetitorPanel competitor={competitor} />}

            <div className="mt-5 pt-5 border-t border-brand-border flex justify-center">
              <button onClick={() => setShowFull(!showFull)} className="btn-outline text-sm">
                {showFull ? "Hide full audit" : "View full audit →"}
              </button>
            </div>

            {showFull && (
              <div className="mt-5 pt-5 border-t border-brand-border space-y-5">
                <FullChecklist title="Meta Ads — Full Checklist"   rubric={metaP.rubric   || []} />
                <FullChecklist title="Google Ads — Full Checklist" rubric={googleP.rubric || []} />
              </div>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 justify-center pt-2">
            <a href="/" className="btn-outline">← New Audit</a>
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "audit-report.json" });
                a.click();
              }}
              className="btn-primary"
            >Export Report</button>
          </div>
        </main>
      </div>
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═════════════════════════════════════════════════════════════════════════════
function ScoreCard({ label, score, color, verdict }) {
  return (
    <div className="card p-5">
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-xs font-semibold text-brand-muted uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-extrabold leading-none" style={{ color }}>
          {score}<span className="text-base text-brand-muted font-bold">/100</span>
        </p>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, background: color }} />
      </div>
      <p className="text-xs text-brand-subtext leading-snug">{verdict}</p>
    </div>
  );
}

function PlatformMetrics({ platform, data }) {
  const isMeta   = platform === "meta";
  const currency = "AED";

  const fmt  = (n) => n != null ? Math.round(Number(n)).toLocaleString() : "—";
  const fmtC = (n) => n != null && n > 0 ? `${currency} ${Math.round(Number(n)).toLocaleString()}` : "—";
  const fmtP = (n) => n != null ? `${Number(n).toFixed(2)}%` : "—";
  const fmtX = (n) => n != null && n > 0 ? `${Number(n).toFixed(2)}x` : "—";

  const metaKpis = [
    { label: "Total Spend",       value: fmtC(data.total_spend),            sub: null },
    { label: "Conversions",       value: fmt(data.total_conversions),        sub: data.total_conversions > 0 ? `CVR ${fmtP(data.blended_cvr)}` : null },
    { label: "Conv. Value",       value: fmtC(data.total_conversion_value),  sub: data.roas ? `ROAS ${fmtX(data.roas)}` : null },
    { label: "CPA",               value: fmtC(data.cost_per_conversion),     sub: null },
    { label: "CTR",               value: fmtP(data.blended_ctr),             sub: `${fmt(data.total_clicks)} clicks` },
    {
      label: "Ad Fatigue",
      value: data.ad_fatigue_label || "—",
      sub:   data.impressions_per_creative ? `${Number(data.impressions_per_creative).toLocaleString()} impr/creative` : null,
      highlight: data.ad_fatigue_label === "High" ? "red" : data.ad_fatigue_label === "Medium" ? "amber" : "green",
    },
  ];

  const googleKpis = [
    { label: "Total Spend",       value: fmtC(data.total_spend),            sub: null },
    { label: "Conversions",       value: fmt(data.total_conversions),        sub: data.cpa ? `CPA ${fmtC(data.cpa)}` : null },
    { label: "Conv. Value",       value: fmtC(data.total_conv_value),        sub: data.avg_roas > 0 ? `ROAS ${fmtX(data.avg_roas)}` : null },
    { label: "Wasted Spend",      value: fmtC(data.wasted_spend),            sub: data.wasted_campaigns > 0 ? `${data.wasted_campaigns} campaign(s) ROAS < 1` : null, highlight: data.wasted_spend > 0 ? "red" : null },
    { label: "Irrelevant Terms",  value: fmtC(data.irrelevant_spend),        sub: "Estimated from broad match", highlight: data.irrelevant_spend > 0 ? "amber" : null },
    { label: "CTR",               value: fmtP(data.blended_ctr),             sub: `${fmt(data.total_clicks)} clicks` },
  ];

  const kpis  = isMeta ? metaKpis : googleKpis;
  const title = isMeta ? "Meta Ads" : "Google Ads";
  const color = isMeta ? "text-blue-600" : "text-orange-500";
  const dot   = isMeta ? "bg-blue-500" : "bg-orange-400";

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className={`w-2 h-2 rounded-full ${dot}`} />
        <h3 className={`text-xs font-bold uppercase tracking-widest ${color}`}>{title} — Performance</h3>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {kpis.map((k, i) => {
          const valColor = k.highlight === "red" ? "text-red-500"
            : k.highlight === "amber" ? "text-amber-500"
            : k.highlight === "green" ? "text-emerald-600"
            : "text-brand-navy";
          return (
            <div key={i} className="flex flex-col">
              <p className="text-[10px] font-semibold text-brand-muted uppercase tracking-wider leading-none mb-1">{k.label}</p>
              <p className={`text-sm font-bold leading-tight ${valColor}`}>{k.value}</p>
              {k.sub && <p className="text-[10px] text-brand-muted mt-0.5 leading-snug">{k.sub}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CreativePanel({ title, subtitle, tone, creatives }) {
  const accent = tone === "top"
    ? { bar: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 border-emerald-200" }
    : { bar: "bg-red-500",     chip: "bg-red-50 text-red-600 border-red-200" };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-brand-navy">{title}</h3>
          <p className="text-[11px] text-brand-muted">{subtitle}</p>
        </div>
        <span className={`w-2 h-6 rounded-full ${accent.bar}`} />
      </div>
      {creatives.length === 0 ? (
        <p className="text-xs text-brand-muted py-6 text-center">No data yet.</p>
      ) : (
        <div className="space-y-3">
          {creatives.slice(0, 3).map((c, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-brand-bg border border-brand-border hover:shadow-sm transition-all">
              <Thumbnail src={c.thumbnail} label={c.format} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-brand-text line-clamp-2 leading-snug">{c.label || c.name}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">{c.format || "ad"}</span>
                  {c.spend ? <span className="text-[10px] text-brand-muted">· AED {Number(c.spend).toLocaleString()}</span> : null}
                </div>
              </div>
              <span className={`text-xs font-bold border px-2.5 py-1.5 rounded-lg ${accent.chip} whitespace-nowrap`}>
                {Number(c.ctr || 0).toFixed(2)}% CTR
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Thumbnail({ src, label }) {
  if (src) {
    return <img src={src} alt="" className="w-24 h-24 rounded-lg object-cover bg-slate-100 flex-shrink-0 ring-1 ring-slate-200" />;
  }
  return (
    <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center flex-shrink-0">
      <svg className="w-8 h-8 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
    </div>
  );
}

function OverviewFlags({ meta, google }) {
  const passed = [...meta, ...google].filter((r) => r.passed).sort((a, b) => b.points - a.points).slice(0, 3);
  const failed = [...meta, ...google].filter((r) => !r.passed).sort((a, b) => b.points - a.points).slice(0, 3);
  return <FlagsGrid passed={passed} failed={failed} />;
}

function FlagsPanel({ rubric }) {
  const passed = rubric.filter((r) => r.passed).sort((a, b) => b.points - a.points).slice(0, 3);
  const failed = rubric.filter((r) => !r.passed).sort((a, b) => b.points - a.points).slice(0, 3);
  return <FlagsGrid passed={passed} failed={failed} />;
}

function FlagsGrid({ passed, failed }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-2">✓ Passing</p>
        <div className="space-y-2">
          {passed.length ? passed.map((r, i) => <Flag key={i} rule={r} pass />) : <Empty />}
        </div>
      </div>
      <div>
        <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-2">✗ Failing</p>
        <div className="space-y-2">
          {failed.length ? failed.map((r, i) => <Flag key={i} rule={r} />) : <Empty />}
        </div>
      </div>
    </div>
  );
}

function Flag({ rule, pass }) {
  return (
    <div className={`p-3 rounded-lg border flex items-start gap-2.5 ${
      pass ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
    }`}>
      <span className={`text-xs font-bold mt-0.5 ${pass ? "text-emerald-600" : "text-red-500"}`}>{pass ? "✓" : "✗"}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-brand-text leading-snug">{rule.label}</p>
        {!pass && rule.flag && <p className="text-[11px] text-brand-muted mt-0.5">{rule.flag}</p>}
      </div>
      <span className={`text-[10px] font-bold whitespace-nowrap ${pass ? "text-emerald-600" : "text-red-500"}`}>+{rule.points}</span>
    </div>
  );
}

function Empty() {
  return <p className="text-xs text-brand-muted text-center py-4">No data.</p>;
}

function FullChecklist({ title, rubric }) {
  if (!rubric.length) return null;
  return (
    <div>
      <h4 className="text-sm font-bold text-brand-navy mb-3">{title}</h4>
      <div className="space-y-1.5">
        {rubric.map((r, i) => (
          <div key={i} className={`flex items-center gap-3 p-2.5 rounded-md border text-xs ${
            r.passed ? "bg-emerald-50/50 border-emerald-100" : "bg-red-50/50 border-red-100"
          }`}>
            <span className={`font-bold ${r.passed ? "text-emerald-600" : "text-red-500"}`}>{r.passed ? "✓" : "✗"}</span>
            <span className="flex-1 text-brand-text">{r.label}</span>
            {!r.passed && <span className="text-brand-muted text-[11px] hidden md:inline">{r.flag}</span>}
            <span className={`font-bold ${r.passed ? "text-emerald-600" : "text-red-500"}`}>+{r.points}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompetitorPanel({ competitor }) {
  const benchmarks  = competitor.benchmarks  || {};
  const competitors = competitor.competitors || [];
  const issues      = competitor.issues      || [];
  const insights    = competitor.insights    || [];

  if (!competitors.length) {
    return (
      <div className="text-center py-8 px-4">
        <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-purple-50 flex items-center justify-center">
          <svg className="w-5 h-5 text-brand-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"/>
          </svg>
        </div>
        <p className="text-sm font-bold text-brand-navy mb-1">No competitor data</p>
        <p className="text-xs text-brand-muted max-w-xs mx-auto">
          Add <code className="bg-slate-100 px-1 rounded">APIFY_TOKEN</code> in your Vercel environment variables, then re-run the audit to pull live competitor ads.
        </p>
      </div>
    );
  }

  const userCount   = benchmarks.user_creative_count        || 0;
  const avgComp     = benchmarks.avg_competitor_creative_count || 0;
  const compFormats = benchmarks.competitor_formats          || [];
  const userFormats = benchmarks.user_formats                || [];
  const formatGaps  = compFormats.filter((f) => !userFormats.includes(f));

  return (
    <div className="space-y-5">

      {/* ── Benchmark strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <BenchStat label="Competitors analysed" value={benchmarks.competitors_analyzed || competitors.length} />
        <BenchStat label="Your creatives"        value={userCount} />
        <BenchStat label="Avg competitor ads"    value={avgComp}   highlight={avgComp > userCount} />
        <BenchStat label="Format gaps"           value={formatGaps.length ? formatGaps.join(", ") : "None"} highlight={formatGaps.length > 0} isText />
      </div>

      {/* ── Issues ── */}
      {issues.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest">✗ Gaps identified</p>
          {issues.map((iss, i) => (
            <div key={i} className="p-3 rounded-lg border bg-red-50 border-red-200 flex items-start gap-2.5">
              <span className="text-xs font-bold text-red-500 mt-0.5">✗</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-brand-text leading-snug">{iss.message}</p>
                {iss.fix && <p className="text-[11px] text-brand-muted mt-0.5">{iss.fix}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Insights ── */}
      {insights.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-brand-purple uppercase tracking-widest">💡 Insights</p>
          {insights.map((ins, i) => (
            <div key={i} className="p-3 rounded-lg border bg-purple-50 border-purple-200">
              <p className="text-xs text-brand-text leading-snug">{ins}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Per-competitor cards ── */}
      <div className="space-y-4">
        {competitors.map((comp) => (
          <CompetitorCard key={comp.brand} comp={comp} />
        ))}
      </div>
    </div>
  );
}

function BenchStat({ label, value, highlight, isText }) {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-bg p-3">
      <p className="text-[10px] font-semibold text-brand-muted uppercase tracking-wider mb-1">{label}</p>
      <p className={`font-bold leading-tight ${isText ? "text-xs" : "text-xl"} ${highlight ? "text-red-500" : "text-brand-navy"}`}>
        {value}
      </p>
    </div>
  );
}

function CompetitorCard({ comp }) {
  const [open, setOpen] = useState(false);
  const ads = comp.ads || [];

  return (
    <div className="border border-brand-border rounded-xl overflow-hidden">
      {/* Header row */}
      <div
        className="flex items-center justify-between p-3 bg-white cursor-pointer hover:bg-brand-bg transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3">
          {comp.is_winning && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-600">🏆 Winner</span>
          )}
          <p className="text-sm font-bold text-brand-navy">{comp.brand}</p>
          <span className="text-xs text-brand-muted">{comp.ad_count} ads</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex gap-1">
            {(comp.formats || []).map((f) => (
              <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 capitalize">{f}</span>
            ))}
          </div>
          {comp.duration_days > 0 && (
            <span className="text-[11px] text-brand-muted whitespace-nowrap">{comp.duration_days}d running</span>
          )}
          <svg className={`w-4 h-4 text-brand-muted transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </div>

      {/* Expanded ad previews */}
      {open && (
        <div className="border-t border-brand-border bg-brand-bg p-3">
          {ads.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ads.map((ad, i) => (
                <a
                  key={i}
                  href={ad.snapshot_url || `https://www.facebook.com/ads/library/?id=${ad.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col rounded-lg border border-brand-border bg-white overflow-hidden hover:shadow-md transition-all"
                >
                  {ad.image_url ? (
                    <img src={ad.image_url} alt="" className="w-full h-28 object-cover bg-slate-100" onError={(e) => { e.target.style.display = "none"; }} />
                  ) : (
                    <div className="w-full h-28 bg-gradient-to-br from-purple-50 to-slate-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                    </div>
                  )}
                  <div className="p-2">
                    {ad.title && <p className="text-[11px] font-semibold text-brand-text line-clamp-1">{ad.title}</p>}
                    {ad.body  && <p className="text-[10px] text-brand-muted line-clamp-2 mt-0.5">{ad.body}</p>}
                    <p className="text-[10px] text-brand-purple font-semibold mt-1 group-hover:underline">View ad →</p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            /* No live ad data — show hooks instead */
            <div>
              {comp.hooks?.length > 0 ? (
                <div>
                  <p className="text-[11px] font-semibold text-brand-muted mb-2">Ad hooks detected:</p>
                  <div className="flex flex-wrap gap-2">
                    {comp.hooks.map((h, i) => (
                      <span key={i} className="text-[11px] px-3 py-1.5 rounded-full bg-white border border-brand-border text-brand-text">"{h}"</span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-brand-muted text-center py-4">No ad previews available for this competitor.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
