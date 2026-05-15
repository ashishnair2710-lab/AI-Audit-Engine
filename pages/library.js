import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Navbar from "../components/Navbar";

const COUNTRIES = [
  { code: "AE", label: "UAE" },
  { code: "SA", label: "Saudi Arabia" },
  { code: "US", label: "United States" },
  { code: "GB", label: "United Kingdom" },
  { code: "AU", label: "Australia" },
];

export default function LibraryPage() {
  const router = useRouter();
  const [brand,   setBrand]   = useState("");
  const [country, setCountry] = useState("AE");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [result,  setResult]  = useState(null);

  useEffect(() => {
    if (!sessionStorage.getItem("auth")) { router.push("/login"); }
  }, []);

  async function search(e) {
    e.preventDefault();
    if (!brand.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res  = await fetch(`/api/library?brand=${encodeURIComponent(brand.trim())}&country=${country}&limit=50`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.hint || data.error || "Search failed.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head><title>Ads Library · Competitor Intelligence</title></Head>
      <div className="min-h-screen bg-brand-bg">
        <Navbar />
        <main className="pt-24 pb-16 px-4 sm:px-6 max-w-5xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-brand-purple uppercase tracking-widest mb-1">Competitor Intelligence</p>
            <h1 className="text-2xl font-bold text-brand-black">Facebook Ads Library</h1>
            <p className="text-sm text-brand-muted mt-1">Search any brand's live ads to benchmark creatives, hooks, and formats.</p>
          </div>

          {/* Search form */}
          <form onSubmit={search} className="card p-5 mb-6 flex flex-col sm:flex-row gap-3">
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Brand name, e.g. Chivas Regal"
              className="flex-1 text-sm border border-brand-border rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
            />
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="text-sm border border-brand-border rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={loading || !brand.trim()}
              className="btn-primary px-6 py-2.5 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"/>
                </svg>
              )}
              Search
            </button>
          </form>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm space-y-1">
              <p className="font-semibold text-red-600">{error}</p>
              {(error.includes("No Ad Library") || error.includes("not configured")) && (
                <p className="text-xs text-red-500">
                  Connect your Meta account on{" "}
                  <a href="/connect" className="underline font-semibold">Connect Accounts</a>
                  {" "}The Ads Library uses your existing Meta login. No extra setup needed.
                </p>
              )}
            </div>
          )}

          {result && (
            <div className="space-y-5">
              {/* Summary bar */}
              <div className="card p-4 flex flex-wrap gap-6 items-center">
                <div>
                  <p className="text-xs text-brand-muted uppercase tracking-wider font-semibold">Brand</p>
                  <p className="text-base font-bold text-brand-black mt-0.5">{result.brand}</p>
                </div>
                <div>
                  <p className="text-xs text-brand-muted uppercase tracking-wider font-semibold">Active Ads Found</p>
                  <p className="text-base font-bold text-brand-black mt-0.5">{result.ad_count}</p>
                </div>
                <div>
                  <p className="text-xs text-brand-muted uppercase tracking-wider font-semibold">Formats</p>
                  <div className="flex gap-1 mt-0.5">
                    {result.formats?.length
                      ? result.formats.map((f) => (
                          <span key={f} className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-purple-50 border border-purple-200 text-brand-purple capitalize">{f}</span>
                        ))
                      : <span className="text-xs text-brand-muted">—</span>
                    }
                  </div>
                </div>
                <div>
                  <p className="text-xs text-brand-muted uppercase tracking-wider font-semibold">Longest Running</p>
                  <p className="text-base font-bold text-brand-black mt-0.5">{result.duration_days > 0 ? `${result.duration_days}d` : "—"}</p>
                </div>
              </div>

              {/* Hooks */}
              {result.hooks?.length > 0 && (
                <div className="card p-5">
                  <h3 className="text-sm font-bold text-brand-black mb-3">Ad Hooks Detected</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.hooks.map((h, i) => (
                      <span key={i} className="text-xs px-3 py-1.5 bg-brand-bg border border-brand-border rounded-full text-brand-text leading-snug">
                        "{h}"
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Ad cards */}
              {result.ads?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-brand-black mb-3">Live Ad Previews</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {result.ads.map((ad) => (
                      <AdCard key={ad.id} ad={ad} />
                    ))}
                  </div>
                </div>
              )}

              {result.ad_count === 0 && (
                <div className="card p-10 text-center">
                  <p className="text-sm font-semibold text-brand-black">No ads found</p>
                  <p className="text-xs text-brand-muted mt-1">Try a different brand name or country.</p>
                </div>
              )}
            </div>
          )}

          {!result && !loading && (
            <div className="card p-10 text-center text-brand-muted text-sm">
              Enter a brand name above to search the Facebook Ads Library.
            </div>
          )}
        </main>
      </div>
    </>
  );
}

function AdCard({ ad }) {
  const fmtLabel = {
    video: { label: "Video", cls: "bg-blue-50 text-blue-600 border-blue-200" },
    carousel: { label: "Carousel", cls: "bg-amber-50 text-amber-600 border-amber-200" },
    dynamic: { label: "Dynamic", cls: "bg-violet-50 text-violet-600 border-violet-200" },
    image: { label: "Image", cls: "bg-brand-gray text-brand-muted border-brand-border" },
  }[ad.format] || { label: ad.format || "Ad", cls: "bg-brand-gray text-brand-muted border-brand-border" };

  const startDate = ad.start
    ? toDate(ad.start).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div className="card overflow-hidden flex flex-col">
      {/* Creative image */}
      {ad.image_url ? (
        <img
          src={ad.image_url}
          alt=""
          className="w-full h-44 object-cover bg-brand-gray"
          onError={(e) => { e.target.style.display = "none"; }}
        />
      ) : (
        <div className="w-full h-20 bg-gradient-to-br from-purple-50 to-brand-gray flex items-center justify-center">
          <svg className="w-8 h-8 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        </div>
      )}

      <div className="p-4 flex flex-col gap-2.5 flex-1">
        {/* Page header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {ad.page_picture && (
              <img src={ad.page_picture} alt="" className="w-6 h-6 rounded-full bg-brand-gray flex-shrink-0" onError={(e) => { e.target.style.display = "none"; }} />
            )}
            <p className="text-xs font-bold text-brand-black truncate">{ad.page_name}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${fmtLabel.cls}`}>{fmtLabel.label}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              ad.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-brand-gray text-brand-muted border-brand-border"
            }`}>{ad.is_active ? "Live" : "Ended"}</span>
          </div>
        </div>

        {/* Copy */}
        {ad.title && <p className="text-sm font-semibold text-brand-text leading-snug">{ad.title}</p>}
        {ad.body  && <p className="text-xs text-brand-muted leading-relaxed line-clamp-3">{ad.body}</p>}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-brand-muted">
          {startDate    && <span>Started {startDate}</span>}
          {ad.impressions && <span>· {ad.impressions}</span>}
          {ad.cta        && <span className="px-2 py-0.5 rounded bg-brand-gray border border-brand-border font-medium text-brand-black">{ad.cta}</span>}
        </div>

        {/* Platforms */}
        {ad.platforms?.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {ad.platforms.map((p) => (
              <span key={p} className="text-[10px] px-2 py-0.5 rounded bg-brand-gray text-slate-500 capitalize">{p}</span>
            ))}
          </div>
        )}

        {/* Snapshot link */}
        <a
          href={ad.snapshot_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-brand-purple hover:underline flex items-center gap-1 mt-auto pt-1"
        >
          View on Ads Library
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
          </svg>
        </a>
      </div>
    </div>
  );
}

function toDate(raw) {
  if (!raw) return new Date();
  if (typeof raw === "number") return new Date(raw < 9_000_000_000 ? raw * 1000 : raw);
  return new Date(raw);
}
