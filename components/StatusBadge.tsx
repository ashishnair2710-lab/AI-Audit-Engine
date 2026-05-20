import type { LeadStatus, WhatsappStatus, CallStatus } from '@/lib/types'

const STATUS_STYLES: Record<string, string> = {
  // Lead statuses
  new:       'bg-blue-50 text-blue-700 border border-blue-200',
  contacted: 'bg-amber-50 text-amber-700 border border-amber-200',
  qualified: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  cold:      'bg-gray-100 text-gray-600 border border-gray-200',
  // WhatsApp
  sent:      'bg-amber-50 text-amber-700 border border-amber-200',
  replied:   'bg-emerald-50 text-emerald-700 border border-emerald-200',
  no_reply:  'bg-gray-100 text-gray-500 border border-gray-200',
  handed_off:'bg-violet-50 text-violet-700 border border-violet-200',
  // Call
  queued:      'bg-blue-50 text-blue-600 border border-blue-200',
  answered:    'bg-emerald-50 text-emerald-700 border border-emerald-200',
  not_answered:'bg-red-50 text-red-600 border border-red-200',
  callback:    'bg-amber-50 text-amber-700 border border-amber-200',
}

const STATUS_DOTS: Record<string, string> = {
  new: 'bg-blue-500', contacted: 'bg-amber-500', qualified: 'bg-emerald-500', cold: 'bg-gray-400',
}

const LABELS: Record<string, string> = {
  no_reply: 'No Reply', not_answered: 'Not Answered', handed_off: 'Handed Off',
}

interface StatusBadgeProps {
  status: LeadStatus | WhatsappStatus | CallStatus
  showDot?: boolean
}

export default function StatusBadge({ status, showDot }: StatusBadgeProps) {
  const label = LABELS[status] ?? status.charAt(0).toUpperCase() + status.slice(1)
  const style = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600 border border-gray-200'

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOTS[status] ?? 'bg-gray-400'}`} />}
      {label}
    </span>
  )
}
