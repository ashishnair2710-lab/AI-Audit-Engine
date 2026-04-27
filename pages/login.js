import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      if (
        email.trim().toLowerCase() === "ashish.krishnan-ext@pernod-ricard.com" &&
        password === "1234"
      ) {
        sessionStorage.setItem("auth", "true");
        sessionStorage.setItem("user_name", "Ashish");
        router.push("/");
      } else {
        setError("Invalid email or password.");
        setLoading(false);
      }
    }, 600);
  }

  return (
    <>
      <Head><title>Sign In — AuditEngine</title></Head>

      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center px-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-10 h-10 rounded-xl bg-brand-purple flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 15L8 9L11 12.5L16 6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="16" cy="4" r="2" fill="white"/>
            </svg>
          </div>
          <span className="font-bold text-brand-navy text-2xl tracking-tight">
            Audit<span className="text-brand-purple">Engine</span>
          </span>
        </div>

        {/* Card */}
        <div className="card w-full max-w-md p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-brand-navy">Welcome back</h1>
            <p className="text-brand-muted text-sm mt-1">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-brand-subtext mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-subtext mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-100 transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in…
                </>
              ) : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-brand-muted text-xs mt-6">
          AI Full Funnel Audit Engine · Powered by Decision Intelligence
        </p>
      </div>
    </>
  );
}
