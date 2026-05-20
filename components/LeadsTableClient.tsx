'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { Lead, LeadStatus, LeadSource } from '@/lib/types'
import StatusBadge from './StatusBadge'
import SourceBadge from './SourceBadge'
import { formatTimeAgo } from '@/lib/mock-data'

const ALL = 'all'

export default function LeadsTableClient({ leads }: { leads: Lead[] }) {
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatus]   = useState<string>(ALL)
  const [sourceFilter, setSource]   = useState<string>(ALL)

  const filtered = useMemo(() => {
    return leads.filter(l => {
      const matchSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.phone.includes(search)
      const matchStatus = statusFilter === ALL || l.status === statusFilter
      const matchSource = sourceFilter === ALL || l.source === sourceFilter
      return matchSearch && matchStatus && matchSource
    })
  }, [leads, search, statusFilter, sourceFilter])

  const statusOptions: LeadStatus[] = ['new', 'contacted', 'qualified', 'cold']
  const sourceOptions: LeadSource[] = ['meta_ad', 'google', 'website', 'tiktok']

  return (
    <div className="bg-white rounded-xl border border-brand-border shadow-card overflow-hidden">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 p-4 border-b border-brand-border">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Search name or phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-brand-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-purple/30 focus:border-brand-purple transition-colors"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => setStatus(e.target.value)}
          className="text-sm border border-brand-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-purple/30 focus:border-brand-purple text-brand-subtext cursor-pointer"
        >
          <option value={ALL}>All statuses</option>
          {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>

        {/* Source filter */}
        <select
          value={sourceFilter}
          onChange={e => setSource(e.target.value)}
          className="text-sm border border-brand-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-purple/30 focus:border-brand-purple text-brand-subtext cursor-pointer"
        >
          <option value={ALL}>All sources</option>
          {sourceOptions.map(s => <option key={s} value={s}>{s === 'meta_ad' ? 'Meta Ad' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>

        <div className="ml-auto flex items-center text-xs text-brand-muted self-center">
          {filtered.length} of {leads.length} leads
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-brand-gray/60 border-b border-brand-border">
              <th className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide hidden md:table-cell">Phone</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide">Source</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide hidden lg:table-cell">WhatsApp</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide hidden lg:table-cell">Voice Call</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide hidden sm:table-cell">Created</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-brand-muted text-sm">No leads match your filters.</td>
              </tr>
            )}
            {filtered.map(lead => (
              <tr key={lead.id} className="hover:bg-brand-gray/40 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-brand-purple/10 flex items-center justify-center text-xs font-semibold text-brand-purple flex-shrink-0">
                      {lead.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-brand-black truncate">{lead.name}</p>
                      <p className="text-xs text-brand-muted truncate hidden sm:block">{lead.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-brand-subtext hidden md:table-cell font-mono text-xs">{lead.phone}</td>
                <td className="px-4 py-3"><SourceBadge source={lead.source} /></td>
                <td className="px-4 py-3"><StatusBadge status={lead.status} showDot /></td>
                <td className="px-4 py-3 hidden lg:table-cell"><StatusBadge status={lead.whatsapp_status} /></td>
                <td className="px-4 py-3 hidden lg:table-cell"><StatusBadge status={lead.call_status} /></td>
                <td className="px-4 py-3 text-brand-muted text-xs hidden sm:table-cell">{formatTimeAgo(lead.created_at)}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/leads/${lead.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-brand-purple border border-brand-purple/30 rounded-lg hover:bg-brand-purple hover:text-white transition-all duration-150"
                  >
                    View
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                    </svg>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
