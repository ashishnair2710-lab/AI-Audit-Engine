interface MetricCardProps {
  label: string
  value: number | string
  delta?: string
  deltaUp?: boolean
  icon: React.ReactNode
  accent?: string
}

export default function MetricCard({ label, value, delta, deltaUp, icon, accent = 'bg-brand-purple/10 text-brand-purple' }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-brand-border shadow-card p-5 hover:shadow-lifted transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent}`}>
          {icon}
        </div>
        {delta && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${deltaUp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {deltaUp ? '↑' : '↓'} {delta}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-brand-black">{value}</p>
        <p className="text-sm text-brand-muted mt-0.5">{label}</p>
      </div>
    </div>
  )
}
