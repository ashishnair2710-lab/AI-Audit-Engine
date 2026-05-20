import TopBar from '@/components/TopBar'
import LeadsTableClient from '@/components/LeadsTableClient'
import { LEADS } from '@/lib/mock-data'

export default function LeadsPage() {
  return (
    <>
      <TopBar title="Leads" subtitle="All captured leads and their current status" />
      <div className="p-6">
        <LeadsTableClient leads={LEADS} />
      </div>
    </>
  )
}
