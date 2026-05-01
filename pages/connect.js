import { useState, useEffect } from "react";
import { useRouter }           from "next/router";
import Head                    from "next/head";
import Navbar                  from "../components/Navbar";

export default function ConnectPage({ metaConnected, googleConnected, metaAccountName, googleAccountEmail, metaAccountId }) {
  const router  = useRouter();
  const [toast, setToast]       = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selected, setSelected] = useState(metaAccountId || "");

  useEffect(() => {
    const { success, error } = router.query;
    if (success === "meta")   showToast("Meta Ads connected successfully!", "success");
    if (success === "google") showToast("Google Ads connected successfully!", "success");
    if (error)                showToast(friendlyError(error), "error");
  }, [router.query]);

  useEffect(() => {
    if (!metaConnected) return;
    fetch("/api/auth/meta/accounts")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.accounts)) setAccounts(d.accounts);
        if (d.selected) setSelected(d.selected);
      })
      .catch(() => {});
  }, [metaConnected]);

  async function pickAccount(id) {
    const acc = accounts.find((a) => a.id === id);
    setSelected(id);
    await fetch("/api/auth/meta/select-account", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ account_id: id, account_name: acc?.name || "" }),
    });
    showToast(`Selected ${acc?.name || id}`, "success");
  }

  function showToast(msg, type) {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  async function disconnect(platform) {
    await fetch(`/api/auth/disconnect?platform=${platform}`);
    router.reload();
  }

  return (
    <>
      <Head>
        <title>Connect Ad Accounts — Audit Engine</title>
      </Head>

      <div className="min-h-screen bg-brand-bg">
        <Navbar metaConnected={metaConnected} googleConnected={googleConnected} />

        {/* Toast */}
        {toast && (
          <div className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold animate-slide-up ${
            toast.type === "success"
              ? "bg-brand-green text-brand-navy"
              : "bg-red-500 text-white"
          }`}>
            {toast.msg}
          </div>
        )}

        <main className="pt-28 pb-20 px-6 max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-10 animate-fade-in">
            <h1 className="text-3xl font-extrabold text-brand-navy mb-2">Connect Ad Accounts</h1>
            <p className="text-slate-500">
              Connect your Meta and Google Ads accounts to run audits on live campaign data automatically.
            </p>
          </div>

          <div className="space-y-4">
            {/* Meta */}
            <PlatformCard
              platform="Meta Ads"
              description="Connect Facebook & Instagram ad campaigns. Pulls spend, performance, creative data, and audience signals."
              icon={<MetaIcon />}
              connected={metaConnected}
              accountLabel={metaAccountName ? decodeURIComponent(metaAccountName) : null}
              connectHref="/api/auth/meta"
              onDisconnect={() => disconnect("meta")}
              permissions={["ads_read", "ads_management", "business_management"]}
            >
              {metaConnected && accounts.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-brand-muted uppercase tracking-widest mb-2">
                    Select Ad Account
                  </label>
                  <select
                    value={selected}
                    onChange={(e) => pickAccount(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-purple/30 focus:border-brand-purple"
                  >
                    <option value="">— Choose an account —</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} {a.business ? `· ${a.business}` : ""} ({a.currency || "—"})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-brand-muted mt-1.5">
                    {accounts.length} account{accounts.length === 1 ? "" : "s"} available
                  </p>
                </div>
              )}
            </PlatformCard>

            {/* Google */}
            <PlatformCard
              platform="Google Ads"
              description="Connect Search and Shopping campaigns. Pulls ROAS, keyword data, conversion performance, and feed quality."
              icon={<GoogleIcon />}
              connected={googleConnected}
              accountLabel={googleAccountEmail ? decodeURIComponent(googleAccountEmail) : null}
              connectHref="/api/auth/google"
              onDisconnect={() => disconnect("google")}
              permissions={["Google Ads read access", "User email (display only)"]}
            />
          </div>

          {/* Security note */}
          <div className="mt-8 p-5 rounded-xl bg-brand-navy/4 border border-brand-navy/10">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
              <div>
                <p className="text-brand-navy font-semibold text-sm mb-1">Read-only access only</p>
                <p className="text-slate-500 text-xs leading-relaxed">
                  We only request read permissions. Tokens are stored in secure httpOnly cookies — never in a database or exposed to third parties. We cannot make changes to your campaigns.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          {(metaConnected || googleConnected) && (
            <div className="mt-6 text-center">
              <a href="/" className="btn-primary inline-flex">
                Run Audit with Live Data →
              </a>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

function PlatformCard({ platform, description, icon, connected, accountLabel, connectHref, onDisconnect, permissions, children }) {
  return (
    <div className={`bg-white rounded-2xl border shadow-card p-6 transition-all duration-200 ${
      connected ? "border-brand-green/30" : "border-slate-200"
    }`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-bold text-brand-navy text-lg">{platform}</h3>
            {connected && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-green/10 border border-brand-green/30 text-brand-green text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
                Connected
              </span>
            )}
          </div>

          {accountLabel && (
            <p className="text-sm text-brand-blue font-medium mb-2">{accountLabel}</p>
          )}

          <p className="text-slate-500 text-sm mb-4">{description}</p>

          {/* Permissions */}
          <div className="flex flex-wrap gap-2 mb-4">
            {permissions.map((p) => (
              <span key={p} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-500 text-xs font-medium">
                {p}
              </span>
            ))}
          </div>

          {/* Actions */}
          {connected ? (
            <button
              onClick={onDisconnect}
              className="text-sm text-slate-400 hover:text-red-500 font-medium transition-colors"
            >
              Disconnect account
            </button>
          ) : (
            <a href={connectHref} className="btn-primary inline-flex text-sm">
              Connect {platform} →
            </a>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}

function MetaIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M4 17.5c0 2.485 1.567 4 3.5 4 1.4 0 2.5-.7 3.5-2.1l3-4.4 3 4.4c1 1.4 2.1 2.1 3.5 2.1 1.933 0 3.5-1.515 3.5-4 0-1.05-.3-1.95-.85-2.65L17 9.5c-1-1.4-2.1-2-3.5-2s-2.5.6-3.5 2L6.85 14.85C6.3 15.55 4 16.45 4 17.5z" fill="#1877F2"/>
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <path d="M25.2 13.26c0-.9-.08-1.77-.22-2.6H13v4.92h6.84a5.83 5.83 0 01-2.53 3.83v3.18h4.09c2.4-2.21 3.8-5.47 3.8-9.33z" fill="#4285F4"/>
      <path d="M13 26c3.43 0 6.31-1.14 8.41-3.08l-4.09-3.18c-1.14.76-2.59 1.21-4.32 1.21-3.32 0-6.14-2.24-7.14-5.25H1.64v3.29A13 13 0 0013 26z" fill="#34A853"/>
      <path d="M5.86 15.7A7.83 7.83 0 015.45 13c0-.94.16-1.85.41-2.7V6.99H1.64A13.01 13.01 0 000 13c0 2.1.5 4.08 1.64 5.99l4.22-3.29z" fill="#FBBC05"/>
      <path d="M13 5.16c1.87 0 3.54.64 4.86 1.91l3.64-3.64C19.3 1.27 16.42 0 13 0A13 13 0 001.64 6.99l4.22 3.31C6.86 7.4 9.68 5.16 13 5.16z" fill="#EA4335"/>
    </svg>
  );
}

function friendlyError(code) {
  const map = {
    meta_denied:          "Meta authorisation was denied.",
    meta_token_failed:    "Failed to exchange Meta token. Check your App ID/Secret.",
    google_denied:        "Google authorisation was denied.",
    google_token_failed:  "Failed to exchange Google token. Check your Client ID/Secret.",
    meta_unexpected:      "An unexpected error occurred with Meta. Please try again.",
    google_unexpected:    "An unexpected error occurred with Google. Please try again.",
  };
  return map[code] || "An error occurred. Please try again.";
}

export async function getServerSideProps({ req }) {
  const cookies = req.headers.cookie || "";
  const get = (name) => {
    const match = cookies.match(new RegExp(`${name}=([^;]+)`));
    return match ? match[1] : null;
  };
  return {
    props: {
      metaConnected:      cookies.includes("meta_connected=true"),
      googleConnected:    cookies.includes("google_connected=true"),
      metaAccountName:    get("meta_account_name")    || null,
      metaAccountId:      get("meta_ad_account_id")   || null,
      googleAccountEmail: get("google_account_email") || null,
    },
  };
}
