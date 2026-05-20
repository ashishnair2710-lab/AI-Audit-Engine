'use client'
import { useState } from 'react'
import type { Lead } from '@/lib/types'

export default function LeadDetailClient({ lead }: { lead: Lead }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-brand-border shadow-card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 hover:bg-brand-gray/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-brand-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          <h3 className="text-sm font-semibold text-brand-black">Full Conversation Transcript</h3>
        </div>
        <svg
          className={`w-4 h-4 text-brand-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {open && (
        <div className="border-t border-brand-border px-5 py-4 bg-brand-gray/30">
          <pre className="text-xs text-brand-subtext whitespace-pre-wrap leading-relaxed font-mono">
            {lead.transcript}
          </pre>
        </div>
      )}
    </div>
  )
}
