import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Navbar from "../components/Navbar";
import { mockAuditPayload } from "../data/mockData";

export default function HomePage() {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [userName, setUserName] = useState("");
  const [clientName, setClientName] = useState("");
  const [days, setDays]         = useState(30);
  const [useLive, setUseLive]   = useState(false);
  const [conn, setConn]         = useState({ meta: false, google: false });

  useEffect(() => {
    if (!sessionStorage.getItem("auth")) { router.push("/login"); return; }
    setUserName(sessionStorage.getItem("user_name") || "");
    const cookies = document.cookie;
    const meta    = cookies.includes("meta_connected=true");
    const google  = cookies.includes("google_connected=true");
    setConn({ meta, google });
    if (meta || google) setUseLive(true);
  }, []);

  async function runAudit() {
    setLoading(true);
    setError("");
    try {
      const body = useLive
        ? { use_live_data: true, days, client_name: clientName, competitor_brands: ["Nike", "Adidas", "Puma"], country: "AE" }
        : { ...mockAuditPayload, days, client_name: clientName || "Demo Client", competitor_brands: ["Nike", "Adidas", "Puma"], country: "AE" };

      const res  = await fetch("/api/audit", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        const detail = Array.isArray(data.details) && data.details.length ? `: ${data.details.join("; ")}` : "";
        setError((data.error || "Audit failed.") + detail);
        setLoading(false);
        return;
      }
      sessionStorage.setItem("auditResult",  JSON.stringify(data));
      sessionStorage.setItem("auditPayload", JSON.stringify(body));
      router.push("/audit/results");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>AuditEngine: Full Funnel Ads Audit</title>
      </Head>
      <div className="min-h-screen bg-brand-gray">
        <Navbar />

        <main className="pt-24 pb-28 px-6 max-w-5xl mx-auto">

          {/* HERO */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl sm:text-6xl font-extrabold text-brand-black leading-[1.1] mb-4 tracking-tight">
              {userName ? `${userName.split(" ")[0]},` : "Let's dig into"}<br />
              <span className="text-brand-purple">{userName ? "let's dig into your ads." : "your ads."}</span>
            </h1>
            <p className="text-brand-subtext text-lg max-w-md mx-auto leading-relaxed">
              Spot what's wasting budget, find what's working, and get a clear path to fix it.
            </p>
          </div>

          {/* PLATFORM CHIPS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10 animate-slide-up">
            <PlatformCard icon={<MetaIcon />}   name="Meta Ads"    desc="Campaigns, creatives, audiences, funnel" dot="bg-blue-500" />
            <PlatformCard icon={<GoogleIcon />}  name="Google Ads"  desc="Search, shopping, ROAS, wasted spend"   dot="bg-orange-500" />
            <PlatformCard icon={<SearchIcon />}  name="Competitors" desc="Ad library, winning creatives, gaps"    dot="bg-brand-purple" />
          </div>

          {/* AUDIT CONFIG */}
          <div className="card p-6 mb-6 max-w-2xl mx-auto animate-slide-up">
            <h3 className="text-xs font-bold text-brand-black uppercase tracking-widest mb-4">Audit Setup</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">Client Name</label>
                <input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full text-sm border border-brand-border rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple text-brand-black placeholder:text-brand-muted"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">Date Range</label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { v: 7,          label: "7d"       },
                    { v: 30,         label: "30d"      },
                    { v: 60,         label: "60d"      },
                    { v: 90,         label: "90d"      },
                    { v: "lifetime", label: "All time" },
                  ].map((opt) => (
                    <button
                      key={opt.v}
                      onClick={() => setDays(opt.v)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        days === opt.v
                          ? "bg-brand-purple text-white border-brand-purple"
                          : "bg-white text-brand-muted border-brand-border hover:border-brand-purple/40 hover:text-brand-black"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-brand-gray border border-brand-border">
                <div>
                  <p className="text-sm font-semibold text-brand-black">Use live data</p>
                  <p className="text-[11px] text-brand-muted">
                    {(conn.meta || conn.google)
                      ? `Connected: ${[conn.meta && "Meta", conn.google && "Google"].filter(Boolean).join(" + ")}`
                      : "No accounts connected. Using demo data."}
                  </p>
                </div>
                <button
                  onClick={() => setUseLive(!useLive)}
                  disabled={!conn.meta && !conn.google}
                  className={`relative w-11 h-6 rounded-full transition-all ${
                    useLive && (conn.meta || conn.google) ? "bg-brand-purple" : "bg-gray-300"
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                    useLive && (conn.meta || conn.google) ? "left-[22px]" : "left-0.5"
                  }`} />
                </button>
              </div>

              {!conn.meta && !conn.google && (
                <a href="/connect" className="block text-center text-xs text-brand-purple font-semibold hover:underline">
                  Connect Meta or Google Ads to use live data
                </a>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-4 animate-slide-up">
            <button
              onClick={runAudit}
              disabled={loading}
              className="btn-primary text-base px-12 py-4 disabled:opacity-60 flex items-center gap-3"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Analysing campaigns...
                </>
              ) : (
                <>
                  Run Full Funnel Audit
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                  </svg>
                </>
              )}
            </button>

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2.5 rounded-lg">{error}</p>}
            <p className="text-brand-muted text-sm">Demo data available. Connect accounts for live analysis.</p>
          </div>

          {/* WHAT IT CHECKS */}
          <section className="mt-24">
            <div className="text-center mb-10">
              <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-brand-purple mb-3">What it checks</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-black leading-tight mb-3">
                700+ checks. Every audit.<br />
                <span className="text-brand-purple">You just read the report.</span>
              </h2>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
              {[
                { value: "700+",  label: "Checks run",     color: "text-brand-purple" },
                { value: "7+",    label: "Platforms",       color: "text-brand-purple" },
                { value: "60s",   label: "Audit runtime",   color: "text-brand-yellow" },
                { value: "AI",    label: "Analyses efficiently", color: "text-green-600" },
              ].map((s) => (
                <div key={s.label} className="card p-4 text-center">
                  <p className={`text-2xl font-extrabold ${s.color} mb-0.5`}>{s.value}</p>
                  <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Feature grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: <ChartIcon />,
                  title: "Funnel Health Score",
                  sub: "0 to 100, both platforms",
                  points: ["Campaign structure", "Creative freshness", "Audience setup"],
                },
                {
                  icon: <MoneyIcon />,
                  title: "Wasted Spend",
                  sub: "Exact amount, per campaign",
                  points: ["Campaigns with ROAS below 1x", "Search terms that don't convert", "Ad fatigue draining your CPM"],
                },
                {
                  icon: <SearchIcon />,
                  title: "Competitor Gaps",
                  sub: "Live from Meta Ads Library",
                  points: ["Formats your rivals are running", "How long their top ads have run", "What's missing from your account"],
                },
                {
                  icon: <BoltIcon />,
                  title: "What to Fix First",
                  sub: "Sorted by money impact",
                  points: ["AED saved or earned per fix", "Easy / Medium / Hard effort", "How long it takes to see results"],
                },
              ].map((f) => (
                <FeatureCard key={f.title} {...f} />
              ))}
            </div>
          </section>

        </main>
      </div>
    </>
  );
}

function PlatformCard({ icon, name, desc, dot }) {
  return (
    <div className="card p-4 flex items-start gap-3.5 hover:shadow-lifted transition-all">
      <div className="w-10 h-10 rounded-xl bg-brand-gray border border-brand-border flex items-center justify-center flex-shrink-0">{icon}</div>
      <div>
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
          <p className="font-bold text-brand-black text-sm">{name}</p>
        </div>
        <p className="text-brand-muted text-xs leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, sub, points }) {
  return (
    <div className="card p-5 hover:shadow-lifted transition-all">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-brand-purple/8 border border-brand-purple/15 flex items-center justify-center flex-shrink-0 text-brand-purple">
          {icon}
        </div>
        <div>
          <p className="font-bold text-brand-black text-sm">{title}</p>
          <p className="text-xs text-brand-purple font-semibold mt-0.5">{sub}</p>
        </div>
      </div>
      <ul className="space-y-2">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2 text-xs text-brand-subtext">
            <svg className="w-3.5 h-3.5 text-brand-purple flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Icons ── */
function MetaIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
}
function GoogleIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>;
}
function SearchIcon() {
  return <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
}
function ChartIcon() {
  return <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>;
}
function MoneyIcon() {
  return <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
}
function BoltIcon() {
  return <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>;
}
