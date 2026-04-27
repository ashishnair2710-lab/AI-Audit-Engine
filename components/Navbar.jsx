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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-purple flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 12L6 7.5L9 10.5L13 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="13" cy="3.5" r="1.5" fill="white"/>
            </svg>
          </div>
          <span className="font-bold text-brand-navy text-lg tracking-tight">
            Audit<span className="text-brand-purple">Engine</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-brand-muted hover:text-brand-text text-sm font-medium transition-colors">Audit</Link>
          <Link href="/connect" className="text-brand-muted hover:text-brand-text text-sm font-medium transition-colors">Connect Accounts</Link>
        </div>

        <div className="flex items-center gap-3">
          {userName && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-brand-lavender flex items-center justify-center">
                <span className="text-xs font-bold text-brand-purple">{userName[0]}</span>
              </div>
              <span className="text-sm text-brand-subtext font-medium hidden sm:block">{userName}</span>
            </div>
          )}
          <button onClick={logout} className="btn-outline text-sm px-4 py-2">
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
