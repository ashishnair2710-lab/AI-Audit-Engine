import TopBar from '@/components/TopBar'
import MetricCard from '@/components/MetricCard'
import StatusBadge from '@/components/StatusBadge'
import SourceBadge from '@/components/SourceBadge'
import { LEADS, getDashboardMetrics, getLeadsPerDay, formatTimeAgo } from '@/lib/mock-data'
import LeadsBarChart from '@/components/LeadsBarChart'

export default function DashboardPage() {
  const metrics = getDashboardMetrics()
  const chartData = getLeadsPerDay(7)
  const recentLeads = [...LEADS].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10)

  return (
    <>
      <TopBar title="Dashboard" subtitle="Overview of your lead pipeline" />
      <div className="p-6 space-y-6">

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total leads this month"
            value={metrics.totalLeads}
            delta="12%"
            deltaUp
            accent="bg-brand-purple/10 text-brand-purple"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
          />
          <MetricCard
            label="WhatsApp chats answered"
            value={metrics.whatsappAnswered}
            delta="8%"
            deltaUp
            accent="bg-emerald-50 text-emerald-600"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>}
          />
          <MetricCard
            label="Voice calls made"
            value={metrics.callsMade}
            delta="5%"
            deltaUp
            accent="bg-blue-50 text-blue-600"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>}
          />
          <MetricCard
            label="Qualified leads"
            value={metrics.qualifiedLeads}
            delta="3%"
            deltaUp
            accent="bg-amber-50 text-amber-600"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>}
          />
        </div>

        {/* Bottom row: chart + recent leads */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Bar chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-brand-border shadow-card p-5">
            <h3 className="text-sm font-semibold text-brand-black mb-1">Leads — Last 7 Days</h3>
            <p className="text-xs text-brand-muted mb-4">Daily lead capture volume</p>
            <LeadsBarChart data={chartData} />
          </div>

          {/* Recent leads */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-brand-border shadow-card">
            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border">
              <h3 className="text-sm font-semibold text-brand-black">Recent Leads</h3>
              <a href="/leads" className="text-xs text-brand-purple hover:text-brand-purplehov font-medium transition-colors">View all →</a>
            </div>
            <div className="divide-y divide-brand-border">
              {recentLeads.map(lead => (
                <div key={lead.id} className="flex items-center gap-3 px-5 py-3 hover:bg-brand-gray/50 transition-colors">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-brand-purple/10 flex items-center justify-center text-xs font-semibold text-brand-purple flex-shrink-0">
                    {lead.name.charAt(0)}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-black truncate">{lead.name}</p>
                    <p className="text-xs text-brand-muted truncate">{lead.interest.split('(')[0].trim()}</p>
                  </div>
                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <SourceBadge source={lead.source} />
                    <StatusBadge status={lead.status} showDot />
                  </div>
                  {/* Time */}
                  <span className="text-xs text-brand-muted flex-shrink-0 hidden sm:block">{formatTimeAgo(lead.created_at)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
