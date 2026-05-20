'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'

interface Props {
  data: { date: string; calls: number }[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-brand-border rounded-lg shadow-card px-3 py-2">
        <p className="text-xs text-brand-muted">{label}</p>
        <p className="text-sm font-semibold text-brand-black">{payload[0].value} calls</p>
      </div>
    )
  }
  return null
}

export default function CallsBarChart({ data }: Props) {
  const sparse = data.filter((_, i) => i % 5 === 0 || i === data.length - 1)
  const max = Math.max(...data.map(d => d.calls))
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barSize={14}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
        <XAxis
          dataKey="date"
          ticks={sparse.map(d => d.date)}
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={24} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F5F5F5' }} />
        <Bar dataKey="calls" radius={[3, 3, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.calls === max ? '#6B5FE4' : '#8B7FF5'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
