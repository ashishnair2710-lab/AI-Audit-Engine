import { useState } from "react";
import { useRouter } from "next/router";
import Head          from "next/head";
import Navbar        from "../components/Navbar";
import { mockAuditPayload } from "../data/mockData";

export default function HomePage() {
  const router  = useRouter();
  const [json,    setJson]    = useState(JSON.stringify(mockAuditPayload, null, 2));
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    let parsed;
    try {
      parsed = JSON.parse(json);
    } catch {
      setError("Invalid JSON — please check your input.");
      setLoading(false);
      return;
    }

    try {
      const res  = await fetch("/api/audit", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(parsed),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Audit failed.");
        setLoading(false);
        return;
      }

      sessionStorage.setItem("auditResult", JSON.stringify(data));
      router.push("/audit/results");
    } catch {
      setError("Network error — is the dev server running?");
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>AI Full Funnel Audit Engine</title>
        <meta name="description" content="Analyse Meta and Google Ads performance across the full funnel." />
      </Head>

      <div className="min-h-screen bg-brand-bg">
        <Navbar />

        <main className="pt-28 pb-20 px-6 max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-10 animate-fade-in">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green text-xs font-semibold uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
              Decision Engine
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-brand-navy leading-tight mb-4">
              AI Full Funnel<br />
              <span className="text-brand-green">Audit Engine</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
              Analyse Meta + Google Ads across the full funnel. Get prioritised fixes, wasted spend alerts, and competitor gap analysis — in seconds.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-brand-navy text-lg">Campaign Data</h2>
                <p className="text-slate-500 text-sm mt-0.5">
                  Demo data pre-loaded — edit or paste your own JSON and hit Run Audit
                </p>
              </div>
              <button
                type="button"
                onClick={() => setJson(JSON.stringify(mockAuditPayload, null, 2))}
                className="btn-outline text-sm px-4 py-2"
              >
                Reset Demo Data
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <textarea
                value={json}
                onChange={(e) => setJson(e.target.value)}
                className="w-full h-72 bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-xs text-brand-navy placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 resize-none"
                spellCheck={false}
              />

              {error && (
                <p className="mt-3 text-sm text-red-500 bg-red-50 border border-red-200 px-4 py-2.5 rounded-lg">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Running Audit…
                  </>
                ) : "Run Audit →"}
              </button>
            </form>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {["Full Funnel Analysis", "Wasted Spend Detection", "Competitor Gap Analysis", "AI Prioritised Fixes", "Cross-Platform Insights"].map((f) => (
              <span key={f} className="px-3 py-1.5 rounded-full bg-brand-navy/5 border border-brand-navy/10 text-slate-500 text-xs font-medium">
                {f}
              </span>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
