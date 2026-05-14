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
      <div className="text-center"><p className="text-red-400 mb-4">{error}</p><a href="/" className="btn-primary">← Run Audit</a></div>
    </div>
  );
  if (!data) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const meta       = data.meta_audit          || {};
  const google     = data.google_audit        || {};
  const competitor = data.competitor_insights || {};
  const platforms  = data.score_platforms     || {};
  const overall    = { score: data.funnel_health_score || 0, color_hex: data.score_color_hex || "#22C55E", verdict: data.score_verdict || data.score_label || "" };
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
              <p className="text-xs font-semibold text-brand-blue uppercase tracking-widest mb-1">Performance Audit</p>
              <h1 className="text-2xl font-bold text-brand-navy">{clientName}</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                mode === "ecom"
                  ? "bg-blue-50 text-brand-blue border-blue-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}>
                {mode === "ecom" ? "eCommerce" : "Lead Generation"}
              </span>
              <span className="text-xs text-slate-500 bg-white border border-brand-border px-3 py-1.5 rounded-full">
                {new Date().toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
          </div>

          {/* ── 2. SCORE ROW ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ScoreCard label="Overall Health"  score={overall.score} color={overall.color_hex} verdict={overall.verdict} />
            <ScoreCard label="Meta Ads"        score={metaP.score}   color={metaP.color_hex}   verdict={metaP.verdict} />
            <ScoreCard label="Google Ads"      score={googleP.score} color={googleP.color_hex} verdict={googleP.verdict} />
          </div>

          {/* ── 3. PLATFORM METRICS ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PlatformMetrics platform="meta"   data={meta.performance || {}} />
            <PlatformMetrics platform="google" data={google.summary   || {}} />
          </div>

          {/* ── 4. CREATIVE ROW ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CreativePanel title="Top Performers"  subtitle="Highest CTR" tone="top"  creatives={topMeta} />
            <CreativePanel title="Drain Ads"       subtitle="High spend · low CTR" tone="kill" creatives={killMeta} />
          </div>

          {/* ── 5. FUNNEL HEALTH PANEL ── */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <h2 className="text-lg font-bold text-white">Funnel Health</h2>
              <div className="flex gap-1 bg-slate-900 border border-slate-700 rounded-lg p-1">
                {[
                  { id: "overview",    label: "Overview" },
                  { id: "meta",        label: "Meta Ads" },
                  { id: "google",      label: "Google Ads" },
                  { id: "competitors", label: "Competitors" },
                ].map((t) => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      tab === t.id
                        ? "bg-brand-accent text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
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

            <div className="mt-5 pt-5 border-t border-slate-700 flex justify-center">
              <button onClick={() => setShowFull(!showFull)} className="btn-outline text-sm">
                {showFull ? "Hide full audit" : "View full audit →"}
              </button>
            </div>

            {showFull && (
              <div className="mt-5 pt-5 border-t border-slate-700 space-y-5">
                <FullChecklist title="Meta Ads — Full Checklist"   rubric={metaP.rubric   || []} />
                <FullChecklist title="Google Ads — Full Checklist" rubric={googleP.rubric || []} />
              </div>
            )}
          </div>

          {/* ── 6. OUTCOME ENGINE ── */}
          <OutcomeEngine data={data} />

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

// ═══════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════

function ScoreCard({ label, score, color, verdict }) {
  return (
    <div className="card p-5">
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-extrabold leading-none" style={{ color }}>
          {score}<span className="text-base text-slate-500 font-bold">/100</span>
        </p>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mb-3">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, background: color }} />
      </div>
      <p className="text-xs text-slate-300 leading-snug">{verdict}</p>
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
    { label: "Total Spend",      value: fmtC(data.total_spend),           sub: null },
    { label: "Conversions",      value: fmt(data.total_conversions),       sub: data.total_conversions > 0 ? `CVR ${fmtP(data.blended_cvr)}` : null },
    { label: "Conv. Value",      value: fmtC(data.total_conversion_value), sub: data.roas ? `ROAS ${fmtX(data.roas)}` : null },
    { label: "CPA",              value: fmtC(data.cost_per_conversion),    sub: null },
    { label: "CTR",              value: fmtP(data.blended_ctr),            sub: `${fmt(data.total_clicks)} clicks` },
    {
      label: "Ad Fatigue",
      value: data.ad_fatigue_label || "—",
      sub:   data.impressions_per_creative ? `${Number(data.impressions_per_creative).toLocaleString()} impr/creative` : null,
      highlight: data.ad_fatigue_label === "High" ? "red" : data.ad_fatigue_label === "Medium" ? "amber" : "green",
    },
  ];

  const googleKpis = [
    { label: "Total Spend",      value: fmtC(data.total_spend),       sub: null },
    { label: "Conversions",      value: fmt(data.total_conversions),   sub: data.cpa ? `CPA ${fmtC(data.cpa)}` : null },
    { label: "Conv. Value",      value: fmtC(data.total_conv_value),   sub: data.avg_roas > 0 ? `ROAS ${fmtX(data.avg_roas)}` : null },
    { label: "Wasted Spend",     value: fmtC(data.wasted_spend),       sub: data.wasted_campaigns > 0 ? `${data.wasted_campaigns} campaign(s) ROAS < 1` : null, highlight: data.wasted_spend > 0 ? "red" : null },
    { label: "Irrelevant Terms", value: fmtC(data.irrelevant_spend),   sub: "Estimated from broad match", highlight: data.irrelevant_spend > 0 ? "amber" : null },
    { label: "CTR",              value: fmtP(data.blended_ctr),        sub: `${fmt(data.total_clicks)} clicks` },
  ];

  const kpis  = isMeta ? metaKpis : googleKpis;
  const title = isMeta ? "Meta Ads" : "Google Ads";
  const color = isMeta ? "text-brand-blue" : "text-orange-400";
  const dot   = isMeta ? "bg-brand-blue"   : "bg-orange-400";

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className={`w-2 h-2 rounded-full ${dot}`} />
        <h3 className={`text-xs font-bold uppercase tracking-widest ${color}`}>{title} — Performance</h3>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {kpis.map((k, i) => {
          const valColor = k.highlight === "red"   ? "text-red-400"
            : k.highlight === "amber"  ? "text-amber-400"
            : k.highlight === "green"  ? "text-brand-accent"
            : "text-white";
          return (
            <div key={i} className="flex flex-col">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none mb-1">{k.label}</p>
              <p className={`text-sm font-bold leading-tight ${valColor}`}>{k.value}</p>
              {k.sub && <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{k.sub}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CreativePanel({ title, subtitle, tone, creatives }) {
  const accent = tone === "top"
    ? { bar: "bg-brand-accent", chip: "bg-emerald-900/30 text-emerald-400 border-emerald-700/50" }
    : { bar: "bg-red-500",      chip: "bg-red-900/30 text-red-400 border-red-700/50" };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white">{title}</h3>
          <p className="text-[11px] text-slate-400">{subtitle}</p>
        </div>
        <span className={`w-2 h-6 rounded-full ${accent.bar}`} />
      </div>
      {creatives.length === 0 ? (
        <p className="text-xs text-slate-500 py-6 text-center">No data yet.</p>
      ) : (
        <div className="space-y-3">
          {creatives.slice(0, 3).map((c, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all">
              <Thumbnail src={c.thumbnail} format={c.format} previewUrl={c.preview_url} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-100 line-clamp-2 leading-snug">{c.label || c.name || "Untitled Ad"}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-700 px-1.5 py-0.5 rounded">{c.format || "ad"}</span>
                  {c.spend > 0     && <span className="text-[10px] text-slate-500">AED {Math.round(c.spend).toLocaleString()} spent</span>}
                  {c.impressions > 0 && <span className="text-[10px] text-slate-500">· {Number(c.impressions).toLocaleString()} impr</span>}
                </div>
                {c.preview_url && (
                  <a href={c.preview_url} target="_blank" rel="noopener noreferrer"
                    className="text-[10px] text-blue-400 font-semibold hover:underline mt-1 flex items-center gap-0.5">
                    View ad preview ↗
                  </a>
                )}
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

function Thumbnail({ src, format, previewUrl }) {
  const inner = src ? (
    <img src={src} alt="" className="w-20 h-20 rounded-lg object-cover bg-slate-700 flex-shrink-0 ring-1 ring-slate-600" />
  ) : (
    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-slate-700 to-slate-600 flex flex-col items-center justify-center flex-shrink-0 gap-1">
      <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
      <span className="text-[9px] text-slate-500 font-medium uppercase tracking-wide">{format || "ad"}</span>
    </div>
  );

  if (previewUrl) {
    return (
      <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 group relative">
        {inner}
        <div className="absolute inset-0 rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white text-[9px] font-bold">Preview</span>
        </div>
      </a>
    );
  }
  return <div className="flex-shrink-0">{inner}</div>;
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
        <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest mb-2">✓ Passing</p>
        <div className="space-y-2">
          {passed.length ? passed.map((r, i) => <Flag key={i} rule={r} pass />) : <Empty />}
        </div>
      </div>
      <div>
        <p className="text-[11px] font-bold text-red-400 uppercase tracking-widest mb-2">✗ Failing</p>
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
      pass ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30"
    }`}>
      <span className={`text-xs font-bold mt-0.5 ${pass ? "text-emerald-400" : "text-red-400"}`}>{pass ? "✓" : "✗"}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-200 leading-snug">{rule.label}</p>
        {!pass && rule.flag && <p className="text-[11px] text-slate-400 mt-0.5">{rule.flag}</p>}
      </div>
      <span className={`text-[10px] font-bold whitespace-nowrap ${pass ? "text-emerald-400" : "text-red-400"}`}>+{rule.points}</span>
    </div>
  );
}

function Empty() {
  return <p className="text-xs text-slate-500 text-center py-4">No data.</p>;
}

function FullChecklist({ title, rubric }) {
  if (!rubric.length) return null;
  return (
    <div>
      <h4 className="text-sm font-bold text-white mb-3">{title}</h4>
      <div className="space-y-1.5">
        {rubric.map((r, i) => (
          <div key={i} className={`flex items-center gap-3 p-2.5 rounded-md border text-xs ${
            r.passed ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"
          }`}>
            <span className={`font-bold ${r.passed ? "text-emerald-400" : "text-red-400"}`}>{r.passed ? "✓" : "✗"}</span>
            <span className="flex-1 text-slate-200">{r.label}</span>
            {!r.passed && <span className="text-slate-400 text-[11px] hidden md:inline">{r.flag}</span>}
            <span className={`font-bold ${r.passed ? "text-emerald-400" : "text-red-400"}`}>+{r.points}</span>
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
        <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
          <svg className="w-5 h-5 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"/>
          </svg>
        </div>
        <p className="text-sm font-bold text-white mb-1">No competitor data</p>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          Add <code className="bg-slate-700 text-slate-300 px-1 rounded">APIFY_TOKEN</code> in your Vercel environment variables, then re-run the audit to pull live competitor ads.
        </p>
      </div>
    );
  }

  const userCount   = benchmarks.user_creative_count           || 0;
  const avgComp     = benchmarks.avg_competitor_creative_count || 0;
  const compFormats = benchmarks.competitor_formats            || [];
  const userFormats = benchmarks.user_formats                  || [];
  const formatGaps  = compFormats.filter((f) => !userFormats.includes(f));

  return (
    <div className="space-y-5">

      {/* Benchmark strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <BenchStat label="Competitors analysed" value={benchmarks.competitors_analyzed || competitors.length} />
        <BenchStat label="Your creatives"        value={userCount} />
        <BenchStat label="Avg competitor ads"    value={avgComp}   highlight={avgComp > userCount} />
        <BenchStat label="Format gaps"           value={formatGaps.length ? formatGaps.join(", ") : "None"} highlight={formatGaps.length > 0} isText />
      </div>

      {/* Issues */}
      {issues.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-red-400 uppercase tracking-widest">✗ Gaps identified</p>
          {issues.map((iss, i) => (
            <div key={i} className="p-3 rounded-lg border bg-red-500/10 border-red-500/30 flex items-start gap-2.5">
              <span className="text-xs font-bold text-red-400 mt-0.5">✗</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-200 leading-snug">{iss.message}</p>
                {iss.fix && <p className="text-[11px] text-slate-400 mt-0.5">{iss.fix}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-blue-400 uppercase tracking-widest">💡 Insights</p>
          {insights.map((ins, i) => (
            <div key={i} className="p-3 rounded-lg border bg-blue-500/10 border-blue-500/30">
              <p className="text-xs text-slate-200 leading-snug">{ins}</p>
            </div>
          ))}
        </div>
      )}

      {/* Per-competitor cards */}
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
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-3">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`font-bold leading-tight ${isText ? "text-xs" : "text-xl"} ${highlight ? "text-red-400" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}

function CompetitorCard({ comp }) {
  const [open, setOpen] = useState(false);
  const ads = comp.ads || [];

  return (
    <div className="border border-slate-700 rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between p-3 bg-slate-800 cursor-pointer hover:bg-slate-700/80 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3">
          {comp.is_winning && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">🏆 Winner</span>
          )}
          <p className="text-sm font-bold text-white">{comp.brand}</p>
          <span className="text-xs text-slate-400">{comp.ad_count} ads</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex gap-1">
            {(comp.formats || []).map((f) => (
              <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 border border-slate-600 text-slate-400 capitalize">{f}</span>
            ))}
          </div>
          {comp.duration_days > 0 && (
            <span className="text-[11px] text-slate-400 whitespace-nowrap">{comp.duration_days}d running</span>
          )}
          <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-700 bg-slate-900 p-3">
          {ads.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ads.map((ad, i) => (
                <a
                  key={i}
                  href={ad.snapshot_url || `https://www.facebook.com/ads/library/?id=${ad.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col rounded-lg border border-slate-700 bg-slate-800 overflow-hidden hover:border-slate-500 hover:shadow-lg transition-all"
                >
                  {ad.image_url ? (
                    <img src={ad.image_url} alt="" className="w-full h-28 object-cover bg-slate-700" onError={(e) => { e.target.style.display = "none"; }} />
                  ) : (
                    <div className="w-full h-28 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                      <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                    </div>
                  )}
                  <div className="p-2">
                    {ad.title && <p className="text-[11px] font-semibold text-slate-200 line-clamp-1">{ad.title}</p>}
                    {ad.body  && <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{ad.body}</p>}
                    <p className="text-[10px] text-blue-400 font-semibold mt-1 group-hover:underline">View ad →</p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div>
              {comp.hooks?.length > 0 ? (
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 mb-2">Ad hooks detected:</p>
                  <div className="flex flex-wrap gap-2">
                    {comp.hooks.map((h, i) => (
                      <span key={i} className="text-[11px] px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">"{h}"</span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">No ad previews available for this competitor.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// OUTCOME ENGINE
// ═══════════════════════════════════════════════════════════════════

function computeOutcomes(data) {
  const metaRubric   = data.score_platforms?.meta?.google?.rubric || data.score_platforms?.meta?.rubric   || [];
  const googleRubric = data.score_platforms?.google?.rubric || [];
  const mp           = data.meta_audit?.performance   || {};
  const gs           = data.google_audit?.summary     || {};

  const metaSpend    = mp.total_spend       || 0;
  const googleSpend  = gs.total_spend       || 0;
  const metaCtr      = mp.blended_ctr       || 0;
  const metaClicks   = mp.total_clicks      || 0;
  const metaConv     = mp.total_conversions || 0;
  const metaCpa      = mp.cost_per_conversion || 0;
  const metaImpr     = mp.total_impressions || 0;
  const fatigueLabel = mp.ad_fatigue_label  || "";
  const wastedSpend  = gs.wasted_spend      || 0;
  const irrelevant   = gs.irrelevant_spend  || 0;

  const failed = (rubric) => (id) => rubric.some((r) => r.id === id && !r.passed);
  const mFail  = failed(metaRubric);
  const gFail  = failed(googleRubric);

  const fmtC = (n) => `AED ${Math.round(n).toLocaleString()}`;
  const outcomes = [];

  // ── IMMEDIATE SAVINGS ────────────────────────────────────────────
  if (wastedSpend > 0) {
    outcomes.push({
      id: "wasted_spend", platform: "google", category: "savings",
      effort: "Easy", timeframe: "Immediate",
      title: "Pause zero-ROAS campaigns",
      metric: fmtC(wastedSpend) + "/mo",
      metricRaw: wastedSpend,
      description: `${gs.wasted_campaigns || "Some"} campaign(s) spending money and returning less than AED 1 back. Pure loss.`,
      action: "Pause them. Move budget to campaigns that actually convert.",
      confidence: 95,
      icon: "savings",
    });
  }

  if (irrelevant > 0) {
    outcomes.push({
      id: "irrelevant_terms", platform: "google", category: "savings",
      effort: "Easy", timeframe: "1–2 days",
      title: "Cut irrelevant search terms",
      metric: fmtC(irrelevant) + "/mo",
      metricRaw: irrelevant,
      description: "Broad match is showing your ads to people searching for completely different things.",
      action: "Open Search Terms Report → add negatives for anything irrelevant.",
      confidence: 80,
      icon: "savings",
    });
  }

  // ── SIGNAL RECOVERY ──────────────────────────────────────────────
  if (mFail("META_PIXEL_CAPI") && metaConv > 0) {
    const recovered = Math.round(metaConv * 0.3);
    const revenueImpact = Math.round(recovered * (metaCpa || 0));
    outcomes.push({
      id: "capi", platform: "meta", category: "revenue",
      effort: "Medium", timeframe: "3–5 days",
      title: "Turn on Conversions API",
      metric: `+${recovered} conversions/mo`,
      metricRaw: revenueImpact,
      description: "iOS privacy blocks ~30% of your conversions from reaching Meta. It's optimising blind.",
      action: "Enable CAPI in Meta Events Manager. Use a partner integration if possible.",
      confidence: 88,
      icon: "signal",
    });
  } else if (mFail("META_PIXEL_CAPI") && metaSpend > 0) {
    outcomes.push({
      id: "capi", platform: "meta", category: "revenue",
      effort: "Medium", timeframe: "3–5 days",
      title: "Turn on Conversions API",
      metric: "~30% more signal",
      metricRaw: Math.round(metaSpend * 0.1),
      description: "iOS privacy hides roughly 30% of your conversions from Meta. It's bidding with bad data.",
      action: "Enable CAPI in Meta Events Manager.",
      confidence: 85,
      icon: "signal",
    });
  }

  // ── CTR / CREATIVE UPSIDE ────────────────────────────────────────
  if (mFail("META_FRESH_7D") && metaClicks > 0) {
    const uplift = Math.round(metaClicks * 0.18);
    outcomes.push({
      id: "creative_refresh", platform: "meta", category: "efficiency",
      effort: "Medium", timeframe: "7 days",
      title: "Refresh your creatives",
      metric: `+18% CTR`,
      metricRaw: uplift,
      description: "Your ads haven't changed in 14+ days. People have seen them. CTR drops fast after that.",
      action: "Upload 2–3 fresh ads this week. Different hook, different format.",
      confidence: 82,
      icon: "ctr",
    });
  }

  if (fatigueLabel === "High" && metaSpend > 0) {
    const cpmPenalty = Math.round(metaSpend * 0.25);
    outcomes.push({
      id: "fatigue", platform: "meta", category: "savings",
      effort: "Easy", timeframe: "Immediate",
      title: "Ad fatigue — CPM going up",
      metric: fmtC(cpmPenalty) + " CPM waste/mo",
      metricRaw: cpmPenalty,
      description: "Same people seeing the same ad too often. Meta charges you more for it.",
      action: "Rotate creatives. Expand your audience. Set a frequency cap.",
      confidence: 78,
      icon: "efficiency",
    });
  }

  // ── FUNNEL GAPS ──────────────────────────────────────────────────
  const noFullFunnel = mFail("META_FULL_FUNNEL");
  if (noFullFunnel && metaSpend > 0) {
    const cpaReduction = 0.28;
    const monthlySaving = Math.round(metaSpend * cpaReduction * 0.3);
    outcomes.push({
      id: "full_funnel", platform: "meta", category: "revenue",
      effort: "Hard", timeframe: "30–60 days",
      title: "Build a proper funnel",
      metric: `−28% CPA`,
      metricRaw: monthlySaving,
      description: "You're going straight for the sale with cold audiences. Warm them up first — it's cheaper.",
      action: "Add awareness and traffic campaigns. Split budget 30% / 20% / 50% across funnel stages.",
      confidence: 75,
      icon: "funnel",
    });
  }

  if (!data.meta_audit?.audience_mix?.retargeting && metaSpend > 0) {
    const retargetingUpside = Math.round(metaSpend * 0.15);
    outcomes.push({
      id: "retargeting", platform: "meta", category: "revenue",
      effort: "Medium", timeframe: "1 week",
      title: "Add retargeting",
      metric: `3–5× ROAS`,
      metricRaw: retargetingUpside,
      description: "People who visited your site and didn't buy are being ignored. They're your easiest customers.",
      action: "Create retargeting ad sets: site visitors (90d), video viewers (75%), add-to-cart (30d).",
      confidence: 85,
      icon: "revenue",
    });
  }

  // ── GOOGLE STRUCTURE ─────────────────────────────────────────────
  if (gFail("G_BRAND_SPLIT") && googleSpend > 0) {
    const brandProtection = Math.round(googleSpend * 0.08);
    outcomes.push({
      id: "brand_split", platform: "google", category: "efficiency",
      effort: "Easy", timeframe: "2–3 days",
      title: "Split brand vs non-brand",
      metric: `+20% branded CTR`,
      metricRaw: brandProtection,
      description: "Brand and non-brand in the same campaign hides what's actually working.",
      action: "Create separate campaigns. Add brand terms as negatives in the non-brand one.",
      confidence: 90,
      icon: "efficiency",
    });
  }

  if (gFail("G_TRACKING") && googleSpend > 0) {
    outcomes.push({
      id: "tracking", platform: "google", category: "signal",
      effort: "Medium", timeframe: "3–5 days",
      title: "Fix GA4 tracking",
      metric: "Unlock Smart Bidding",
      metricRaw: Math.round(googleSpend * 0.15),
      description: "Your tracking isn't clean. Smart Bidding is making decisions on incomplete data.",
      action: "Check GA4 is linked in Google Ads. Enable auto-tagging. Confirm GCLID is tracking.",
      confidence: 92,
      icon: "signal",
    });
  }

  // Sort: savings first (certain), then by metricRaw desc
  return outcomes
    .filter((o) => o.metricRaw > 0 || o.metric.includes("%"))
    .sort((a, b) => {
      const catOrder = { savings: 0, signal: 1, revenue: 2, efficiency: 3, funnel: 4 };
      if (catOrder[a.category] !== catOrder[b.category]) return catOrder[a.category] - catOrder[b.category];
      return (b.metricRaw || 0) - (a.metricRaw || 0);
    });
}

const ICONS = {
  savings:    { emoji: "💰", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  signal:     { emoji: "📡", color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20" },
  revenue:    { emoji: "📈", color: "text-brand-accent", bg: "bg-emerald-500/10 border-emerald-500/20" },
  ctr:        { emoji: "⚡", color: "text-yellow-400",  bg: "bg-yellow-500/10 border-yellow-500/20" },
  efficiency: { emoji: "🎯", color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20" },
  funnel:     { emoji: "🔻", color: "text-orange-400",  bg: "bg-orange-500/10 border-orange-500/20" },
};

const EFFORT_COLOR = {
  Easy:   "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  Medium: "text-yellow-400  bg-yellow-500/10  border-yellow-500/30",
  Hard:   "text-red-400     bg-red-500/10     border-red-500/30",
};

const PLATFORM_BADGE = {
  meta:   "bg-blue-500/10 text-blue-400 border-blue-500/30",
  google: "bg-orange-500/10 text-orange-400 border-orange-500/30",
};

function OutcomeEngine({ data }) {
  const outcomes = computeOutcomes(data);

  const totalSavings = outcomes
    .filter((o) => o.category === "savings")
    .reduce((s, o) => s + (o.metricRaw || 0), 0);
  const totalRevenue = outcomes
    .filter((o) => ["revenue", "signal"].includes(o.category))
    .reduce((s, o) => s + (o.metricRaw || 0), 0);
  const quickWins = outcomes.filter((o) => o.effort === "Easy").length;

  if (outcomes.length === 0) return null;

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-brand-blue uppercase tracking-widest mb-1">What to fix</p>
        <h2 className="text-lg font-bold text-white">Opportunity Engine</h2>
        <p className="text-xs text-slate-400 mt-0.5">Money left on the table — based on your actual data</p>
      </div>

      {/* Summary metric strip */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-center">
          <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-0.5">Recoverable Spend</p>
          <p className="text-xl font-extrabold text-emerald-400">
            {totalSavings > 0 ? <>AED {Math.round(totalSavings).toLocaleString()}<span className="text-xs font-medium text-emerald-600">/mo</span></> : "—"}
          </p>
        </div>
        <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 px-4 py-3 text-center">
          <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-0.5">Revenue Upside</p>
          <p className="text-xl font-extrabold text-blue-400">
            {totalRevenue > 0 ? <>AED {Math.round(totalRevenue).toLocaleString()}<span className="text-xs font-medium text-blue-600">/mo</span></> : "—"}
          </p>
        </div>
        <div className="rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-center">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Easy Wins</p>
          <p className="text-xl font-extrabold text-white">{quickWins}<span className="text-xs font-medium text-slate-500"> actions</span></p>
        </div>
      </div>

      {/* Metric tiles grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {outcomes.map((o) => {
          const icon = ICONS[o.icon] || ICONS.efficiency;
          return (
            <div key={o.id} className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 flex flex-col gap-2.5 hover:border-slate-600 transition-all">
              {/* Top row: icon + badges */}
              <div className="flex items-center justify-between">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm border ${icon.bg}`}>
                  {icon.emoji}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${PLATFORM_BADGE[o.platform]}`}>{o.platform.toUpperCase()}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${EFFORT_COLOR[o.effort]}`}>{o.effort}</span>
                </div>
              </div>

              {/* Big metric */}
              <div>
                <p className={`text-xl font-extrabold leading-none ${icon.color}`}>{o.metric}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{o.timeframe}</p>
              </div>

              {/* Title */}
              <p className="text-xs font-bold text-slate-200 leading-snug">{o.title}</p>

              {/* Description */}
              <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">{o.description}</p>

              {/* Fix hint */}
              <div className="border-t border-slate-700 pt-2.5 mt-auto">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Fix</p>
                <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">{o.action}</p>
              </div>

              {/* Confidence bar */}
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex-1 h-1 bg-slate-700 rounded-full">
                  <div className="h-full bg-brand-accent rounded-full transition-all" style={{ width: `${o.confidence}%` }} />
                </div>
                <span className="text-[10px] font-bold text-slate-500">{o.confidence}% conf.</span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-600 mt-4 text-center">Based on benchmarks + your actual spend. Results vary.</p>
    </div>
  );
}
