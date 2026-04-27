import Link from "next/link";

export default function Navbar({ metaConnected, googleConnected }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-brand-border bg-brand-navy/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-green flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 14L7 9L10 12L14 6" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="14" cy="4" r="2" fill="#0F172A"/>
            </svg>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            Audit<span className="text-brand-green">Engine</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/"       className="text-brand-muted hover:text-white text-sm font-medium transition-colors">Audit</Link>
          <Link href="/connect" className="text-brand-muted hover:text-white text-sm font-medium transition-colors">Connect Accounts</Link>
        </div>

        {/* Connection status pills */}
        <div className="flex items-center gap-3">
          <StatusPill label="Meta"   connected={metaConnected}   />
          <StatusPill label="Google" connected={googleConnected} />
          <Link href="/connect" className="btn-primary text-sm px-4 py-2">
            {metaConnected && googleConnected ? "Manage" : "Connect"}
          </Link>
        </div>
      </div>
    </nav>
  );
}

function StatusPill({ label, connected }) {
  return (
    <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
      connected
        ? "bg-brand-green/10 text-brand-green border-brand-green/30"
        : "bg-brand-border/40 text-brand-muted border-brand-border"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-brand-green" : "bg-brand-muted"}`} />
      {label}
    </span>
  );
}
