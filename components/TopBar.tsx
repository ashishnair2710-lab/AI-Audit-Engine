'use client'
import { useRouter } from 'next/navigation'

interface TopBarProps {
  title: string
  subtitle?: string
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const router = useRouter()

  function handleLogout() {
    document.cookie = 'crm_session=; Max-Age=0; path=/'
    router.push('/login')
  }

  return (
    <header className="fixed top-0 right-0 left-60 h-14 bg-white border-b border-brand-border z-10 flex items-center justify-between px-6">
      <div>
        <h1 className="text-sm font-semibold text-brand-black">{title}</h1>
        {subtitle && <p className="text-xs text-brand-muted">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Demo badge */}
        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          Demo Mode
        </span>

        {/* Client name */}
        <div className="hidden md:flex items-center gap-2 text-sm text-brand-subtext">
          <div className="w-6 h-6 rounded bg-brand-purple/10 flex items-center justify-center">
            <span className="text-xs font-bold text-brand-purple">A</span>
          </div>
          <span className="font-medium">Al Huzaifa Furniture</span>
        </div>

        <div className="h-4 w-px bg-brand-border hidden md:block" />

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs text-brand-muted hover:text-brand-black transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Logout
        </button>
      </div>
    </header>
  )
}
