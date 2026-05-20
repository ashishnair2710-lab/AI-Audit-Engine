import TopBar from '@/components/TopBar'
import MetricCard from '@/components/MetricCard'
import StatusBadge from '@/components/StatusBadge'
import SourceBadge from '@/components/SourceBadge'
import { LEADS, CALL_EVENTS, getCallMetrics, getCallsPerDay, formatTimeAgo } from '@/lib/mock-data'
import CallsBarChart from '@/components/CallsBarChart'

export default function CallsReportPage() {
  const metrics = getCallMetrics()
  const chartData = getCallsPerDay(30)

  const recentCalls = [...LEADS]
    .filter(l => l.call_status !== 'queued')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 15)
    .map(lead => {
      const callEnd = CALL_EVENTS.find(e => e.lead_id === lead.id && e.event_type === 'call_ended')
      return { ...lead, duration: callEnd?.duration_seconds ?? 0 }
    })

  function fmtDuration(s: number) {
    if (!s) return '—'
    return `${Math.floor(s / 60)}m ${s % 60}s`
  }

  return (
    <>
      <TopBar title="Voice Calls Report" subtitle="AI voice call performance over the last 30 days" />
      <div className="p-6 space-y-6">

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            label="Calls made"
            value={metrics.made}
            accent="bg-brand-purple/10 text-brand-purple"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>}
          />
          <MetricCard
            label="Answered"
            value={metrics.answered}
            delta="66%"
            deltaUp
            accent="bg-emerald-50 text-emerald-600"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
          />
          <MetricCard
            label="Not answered"
            value={metrics.notAnswered}
            accent="bg-red-50 text-red-500"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>}
          />
          <MetricCard
            label="Callbacks scheduled"
            value={metrics.callbacks}
            accent="bg-amber-50 text-amber-600"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
          />
          <MetricCard
            label="Avg duration"
            value={fmtDuration(metrics.avgDuration)}
            accent="bg-blue-50 text-blue-600"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>}
          />
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl border border-brand-border shadow-card p-5">
          <h3 className="text-sm font-semibold text-brand-black mb-1">Calls Made — Last 30 Days</h3>
          <p className="text-xs text-brand-muted mb-4">Daily AI voice call volume</p>
          <CallsBarChart data={chartData} />
        </div>

        {/* Recent calls table */}
        <div className="bg-white rounded-xl border border-brand-border shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-border">
            <h3 className="text-sm font-semibold text-brand-black">Recent Calls</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-gray/60 border-b border-brand-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide hidden md:table-cell">Interest</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide">Source</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide">Outcome</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide hidden sm:table-cell">Duration</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide hidden sm:table-cell">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {recentCalls.map(lead => (
                  <tr key={lead.id} className="hover:bg-brand-gray/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-xs font-semibold text-blue-700 flex-shrink-0">
                          {lead.name.charAt(0)}
                        </div>
                        <span className="font-medium text-brand-black">{lead.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-brand-muted text-xs hidden md:table-cell max-w-[180px] truncate">{lead.interest.split('(')[0].trim()}</td>
                    <td className="px-4 py-3"><SourceBadge source={lead.source} /></td>
                    <td className="px-4 py-3"><StatusBadge status={lead.call_status} /></td>
                    <td className="px-4 py-3 text-brand-subtext text-xs hidden sm:table-cell">{fmtDuration(lead.duration)}</td>
                    <td className="px-4 py-3 text-brand-muted text-xs hidden sm:table-cell">{formatTimeAgo(lead.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
