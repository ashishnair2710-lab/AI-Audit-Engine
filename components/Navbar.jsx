import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Navbar() {
  const router = useRouter();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    setUserName(sessionStorage.getItem("user_name") || "");
  }, []);

  function logout() {
    sessionStorage.removeItem("auth");
    sessionStorage.removeItem("user_name");
    sessionStorage.removeItem("auditResult");
    router.push("/login");
  }

  const navLink = (href, label) => {
    const active = router.pathname === href || router.pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className={`text-sm font-medium transition-colors ${
          active ? "text-white" : "text-slate-400 hover:text-white"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A] border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-accent flex items-center justify-center shadow-glow">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 12L6 7.5L9 10.5L13 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="13" cy="3.5" r="1.5" fill="white"/>
            </svg>
          </div>
          <span className="font-bold text-white text-lg tracking-tight">
            Audit<span className="text-brand-accent">Engine</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-7">
          {navLink("/", "Audit")}
          {navLink("/library", "Ads Library")}
          {navLink("/connect", "Connect Accounts")}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {userName && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center">
                <span className="text-xs font-bold text-brand-accent">{userName[0]?.toUpperCase()}</span>
              </div>
              <span className="text-sm text-slate-300 font-medium hidden sm:block">{userName}</span>
            </div>
          )}
          <button
            onClick={logout}
            className="text-sm font-medium text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-4 py-1.5 rounded-lg transition-all"
          >
            Sign Out
          </button>
        </div>

      </div>
    </nav>
  );
}
