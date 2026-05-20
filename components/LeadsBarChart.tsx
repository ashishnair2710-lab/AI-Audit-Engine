'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface Props {
  data: { date: string; leads: number }[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-brand-border rounded-lg shadow-card px-3 py-2">
        <p className="text-xs text-brand-muted">{label}</p>
        <p className="text-sm font-semibold text-brand-black">{payload[0].value} leads</p>
      </div>
    )
  }
  return null
}

export default function LeadsBarChart({ data }: Props) {
  const max = Math.max(...data.map(d => d.leads))
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} barSize={28}>
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={24} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F5F5F5' }} />
        <Bar dataKey="leads" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.leads === max ? '#6B5FE4' : '#8B7FF5'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
