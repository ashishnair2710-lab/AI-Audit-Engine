import { notFound } from 'next/navigation'
import TopBar from '@/components/TopBar'
import SourceBadge from '@/components/SourceBadge'
import StatusBadge from '@/components/StatusBadge'
import LeadDetailClient from '@/components/LeadDetailClient'
import { LEADS, buildTimeline } from '@/lib/mock-data'

export async function generateStaticParams() {
  return LEADS.map(l => ({ id: l.id }))
}

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const lead = LEADS.find(l => l.id === params.id)
  if (!lead) notFound()

  const timeline = buildTimeline(lead)

  return (
    <>
      <TopBar title={lead.name} subtitle={`Lead — ${lead.source.replace('_', ' ')}`} />
      <div className="p-6 space-y-5">

        {/* Back link */}
        <a href="/leads" className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-purple transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          Back to leads
        </a>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-5">

            {/* Lead info card */}
            <div className="bg-white rounded-xl border border-brand-border shadow-card p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-brand-purple/10 flex items-center justify-center text-lg font-bold text-brand-purple">
                    {lead.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-brand-black">{lead.name}</h2>
                    <p className="text-sm text-brand-muted">{lead.email}</p>
                  </div>
                </div>
                <SourceBadge source={lead.source} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InfoRow label="Phone" value={lead.phone} />
                <InfoRow label="Interest" value={lead.interest.split('(')[0].trim()} />
                <InfoRow label="WhatsApp" value={<StatusBadge status={lead.whatsapp_status} />} />
                <InfoRow label="Voice Call" value={<StatusBadge status={lead.call_status} />} />
                <InfoRow
                  label="Created"
                  value={new Date(lead.created_at).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                />
              </div>
            </div>

            {/* AI Summary */}
            <div className="bg-white rounded-xl border border-brand-border shadow-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-brand-purple flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-brand-black">AI Summary</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-purple/10 text-brand-purple font-medium">Claude AI</span>
              </div>
              <p className="text-sm text-brand-subtext leading-relaxed">{lead.ai_summary}</p>
            </div>

            {/* Transcript */}
            <LeadDetailClient lead={lead} />
          </div>

          {/* Right column — Timeline + Status */}
          <div className="space-y-5">

            {/* Status selector */}
            <div className="bg-white rounded-xl border border-brand-border shadow-card p-5">
              <h3 className="text-sm font-semibold text-brand-black mb-3">Lead Status</h3>
              <StatusSelectorStatic currentStatus={lead.status} />
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl border border-brand-border shadow-card p-5">
              <h3 className="text-sm font-semibold text-brand-black mb-4">Activity Timeline</h3>
              <div className="space-y-4">
                {timeline.map((event, i) => (
                  <div key={event.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg(event.icon)}`}>
                        {iconSvg(event.icon)}
                      </div>
                      {i < timeline.length - 1 && <div className="flex-1 w-px bg-brand-border mt-1 min-h-[16px]" />}
                    </div>
                    <div className="pb-3 flex-1">
                      <p className="text-xs font-medium text-brand-black leading-tight">{event.label}</p>
                      {event.detail && <p className="text-xs text-brand-muted mt-0.5">{event.detail}</p>}
                      <p className="text-xs text-brand-muted mt-1">
                        {new Date(event.timestamp).toLocaleString('en-AE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-brand-muted mb-0.5">{label}</p>
      <p className="text-sm font-medium text-brand-black">{value}</p>
    </div>
  )
}

function StatusSelectorStatic({ currentStatus }: { currentStatus: string }) {
  const options = [
    { value: 'new',       label: 'New',       color: 'bg-blue-500' },
    { value: 'contacted', label: 'Contacted', color: 'bg-amber-500' },
    { value: 'qualified', label: 'Qualified', color: 'bg-emerald-500' },
    { value: 'cold',      label: 'Cold',      color: 'bg-gray-400' },
  ]
  return (
    <div className="space-y-2">
      {options.map(opt => (
        <div
          key={opt.value}
          className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
            currentStatus === opt.value
              ? 'border-brand-purple bg-brand-purple/5'
              : 'border-brand-border hover:border-brand-purple/30'
          }`}
        >
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${opt.color}`} />
          <span className={`text-sm font-medium ${currentStatus === opt.value ? 'text-brand-purple' : 'text-brand-subtext'}`}>
            {opt.label}
          </span>
          {currentStatus === opt.value && (
            <svg className="w-4 h-4 text-brand-purple ml-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
          )}
        </div>
      ))}
      <p className="text-xs text-brand-muted mt-2">Status updates are reflected in real time in the leads table.</p>
    </div>
  )
}

function iconBg(icon: string) {
  const map: Record<string, string> = {
    lead:      'bg-brand-purple/10',
    whatsapp:  'bg-emerald-50',
    call:      'bg-blue-50',
    qualified: 'bg-emerald-50',
    cold:      'bg-gray-100',
  }
  return map[icon] ?? 'bg-gray-100'
}

function iconSvg(icon: string) {
  const cls = 'w-3.5 h-3.5'
  if (icon === 'lead') return <svg className={`${cls} text-brand-purple`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
  if (icon === 'whatsapp') return <svg className={`${cls} text-emerald-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
  if (icon === 'call') return <svg className={`${cls} text-blue-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
  if (icon === 'qualified') return <svg className={`${cls} text-emerald-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4"/></svg>
  return <svg className={`${cls} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
}
