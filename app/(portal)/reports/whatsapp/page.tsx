import TopBar from '@/components/TopBar'
import MetricCard from '@/components/MetricCard'
import StatusBadge from '@/components/StatusBadge'
import SourceBadge from '@/components/SourceBadge'
import { LEADS, getWhatsappMetrics, getChatsPerDay, formatTimeAgo } from '@/lib/mock-data'
import WhatsappLineChart from '@/components/WhatsappLineChart'

export default function WhatsappReportPage() {
  const metrics = getWhatsappMetrics()
  const chartData = getChatsPerDay(30)
  const recentConvos = [...LEADS]
    .filter(l => l.whatsapp_status !== 'no_reply')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 15)

  const outcomeLabel: Record<string, string> = {
    replied: 'AI resolved',
    handed_off: 'Handed to agent',
    sent: 'Awaiting reply',
    no_reply: 'No reply',
  }

  return (
    <>
      <TopBar title="WhatsApp Report" subtitle="AI conversation performance over the last 30 days" />
      <div className="p-6 space-y-6">

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            label="Chats initiated"
            value={metrics.initiated}
            accent="bg-brand-purple/10 text-brand-purple"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>}
          />
          <MetricCard
            label="AI answered"
            value={metrics.aiAnswered}
            delta="76%"
            deltaUp
            accent="bg-emerald-50 text-emerald-600"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
          />
          <MetricCard
            label="Handed to human"
            value={metrics.handedToHuman}
            accent="bg-violet-50 text-violet-600"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
          />
          <MetricCard
            label="No reply"
            value={metrics.noReply}
            accent="bg-gray-100 text-gray-500"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>}
          />
          <MetricCard
            label="Response rate"
            value={`${metrics.responseRate}%`}
            delta="5%"
            deltaUp
            accent="bg-amber-50 text-amber-600"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>}
          />
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl border border-brand-border shadow-card p-5">
          <h3 className="text-sm font-semibold text-brand-black mb-1">Chats Initiated — Last 30 Days</h3>
          <p className="text-xs text-brand-muted mb-4">WhatsApp conversations started by AI bot</p>
          <WhatsappLineChart data={chartData} />
        </div>

        {/* Recent conversations table */}
        <div className="bg-white rounded-xl border border-brand-border shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-border">
            <h3 className="text-sm font-semibold text-brand-black">Recent Conversations</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-gray/60 border-b border-brand-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide hidden md:table-cell">Interest</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide">Source</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide">Outcome</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide hidden sm:table-cell">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {recentConvos.map(lead => (
                  <tr key={lead.id} className="hover:bg-brand-gray/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center text-xs font-semibold text-emerald-700 flex-shrink-0">
                          {lead.name.charAt(0)}
                        </div>
                        <span className="font-medium text-brand-black">{lead.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-brand-muted text-xs hidden md:table-cell max-w-[180px] truncate">{lead.interest.split('(')[0].trim()}</td>
                    <td className="px-4 py-3"><SourceBadge source={lead.source} /></td>
                    <td className="px-4 py-3">
                      <StatusBadge status={lead.whatsapp_status} />
                    </td>
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
