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
  const [days, setDays]         = useState(30); // number or "lifetime"
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
        const detail = Array.isArray(data.details) && data.details.length ? ` — ${data.details.join("; ")}` : "";
        setError((data.error || "Audit failed.") + detail);
        setLoading(false);
        return;
      }
      sessionStorage.setItem("auditResult", JSON.stringify(data));
      router.push("/audit/results");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>AI Full Funnel Audit Engine</title>
      </Head>
      <div className="min-h-screen bg-brand-bg">
        <Navbar />

        <main className="pt-28 pb-24 px-6 max-w-5xl mx-auto">

          {/* Hero */}
          <div className="text-center mb-14 animate-fade-in">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-lavender border border-purple-200 text-brand-purple text-xs font-semibold uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-pulse" />
              AI Decision Engine
            </span>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-brand-navy leading-tight mb-5">
              {userName ? `Welcome back, ${userName}.` : "Full Funnel"}<br />
              <span className="text-brand-purple">{userName ? "Ready to audit?" : "Audit Engine"}</span>
            </h1>
            <p className="text-brand-muted text-xl max-w-xl mx-auto leading-relaxed">
              Know exactly where your Meta and Google budget is leaking — and what to fix first.
            </p>
          </div>

          {/* Platform cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 animate-slide-up">
            <PlatformCard icon={<MetaIcon />}   name="Meta Ads"    desc="Campaigns · Creatives · Audiences · Funnel" ring="border-blue-200 bg-blue-50" />
            <PlatformCard icon={<GoogleIcon />}  name="Google Ads"  desc="Search · Shopping · ROAS · Wasted Spend"   ring="border-orange-200 bg-orange-50" />
            <PlatformCard icon={<CompIcon />}    name="Competitors" desc="Ad Library · Winning Creatives · Gaps"     ring="border-purple-200 bg-brand-lavender" />
          </div>

          {/* AUDIT CONFIG */}
          <div className="card p-6 mb-6 max-w-2xl mx-auto animate-slide-up">
            <h3 className="text-sm font-bold text-brand-navy uppercase tracking-widest mb-4">Audit Setup</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">Client Name</label>
                <input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-purple/30 focus:border-brand-purple"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">Date Range</label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { v: 7,          label: "Last 7d"   },
                    { v: 30,         label: "Last 30d"  },
                    { v: 60,         label: "Last 60d"  },
                    { v: 90,         label: "Last 90d"  },
                    { v: "lifetime", label: "Lifetime"  },
                  ].map((opt) => (
                    <button
                      key={opt.v}
                      onClick={() => setDays(opt.v)}
                      className={`py-2 text-sm font-semibold rounded-lg border transition-all ${
                        days === opt.v
                          ? "bg-brand-purple text-white border-brand-purple"
                          : "bg-white text-brand-muted border-slate-200 hover:border-brand-purple/40"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-brand-bg border border-brand-border">
                <div>
                  <p className="text-sm font-semibold text-brand-text">Use live data</p>
                  <p className="text-[11px] text-brand-muted">
                    {(conn.meta || conn.google)
                      ? `Connected: ${[conn.meta && "Meta", conn.google && "Google"].filter(Boolean).join(" + ")}`
                      : "No accounts connected — will use demo data"}
                  </p>
                </div>
                <button
                  onClick={() => setUseLive(!useLive)}
                  disabled={!conn.meta && !conn.google}
                  className={`relative w-11 h-6 rounded-full transition-all ${
                    useLive && (conn.meta || conn.google) ? "bg-brand-purple" : "bg-slate-300"
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                    useLive && (conn.meta || conn.google) ? "left-[22px]" : "left-0.5"
                  }`} />
                </button>
              </div>

              {!conn.meta && !conn.google && (
                <a href="/connect" className="block text-center text-xs text-brand-purple font-semibold hover:underline">
                  → Connect Meta or Google Ads to use live data
                </a>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-4 animate-slide-up">
            <button
              onClick={runAudit}
              disabled={loading}
              className="btn-primary text-lg px-14 py-4 disabled:opacity-60 flex items-center gap-3 shadow-glow"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Analysing campaigns…
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

            {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 px-4 py-2.5 rounded-lg">{error}</p>}
            <p className="text-brand-muted text-sm">Demo data · Connect accounts for live analysis</p>
          </div>

          {/* What you get */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            {[
              { icon: "📊", label: "Funnel Health Score",   sub: "0–100 across 4 dimensions" },
              { icon: "💸", label: "Wasted Spend",          sub: "AED value, per campaign"   },
              { icon: "🎯", label: "Competitor Gaps",       sub: "Creatives, formats, hooks" },
              { icon: "⚡", label: "Prioritised Fixes",     sub: "Sorted by business impact" },
            ].map((f) => (
              <div key={f.label} className="card p-4 text-center hover:shadow-lifted transition-all">
                <div className="text-2xl mb-2">{f.icon}</div>
                <p className="text-sm font-semibold text-brand-text">{f.label}</p>
                <p className="text-xs text-brand-muted mt-1">{f.sub}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}

function PlatformCard({ icon, name, desc, ring }) {
  return (
    <div className="card p-5 flex items-start gap-4 hover:shadow-lifted transition-all">
      <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${ring}`}>{icon}</div>
      <div>
        <p className="font-semibold text-brand-text text-sm">{name}</p>
        <p className="text-brand-muted text-xs mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function MetaIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
}
function GoogleIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>;
}
function CompIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
}
