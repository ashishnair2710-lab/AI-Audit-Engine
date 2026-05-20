'use client'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface Props {
  data: { date: string; chats: number }[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-brand-border rounded-lg shadow-card px-3 py-2">
        <p className="text-xs text-brand-muted">{label}</p>
        <p className="text-sm font-semibold text-brand-black">{payload[0].value} chats</p>
      </div>
    )
  }
  return null
}

export default function WhatsappLineChart({ data }: Props) {
  const sparse = data.filter((_, i) => i % 5 === 0 || i === data.length - 1)
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
        <XAxis
          dataKey="date"
          ticks={sparse.map(d => d.date)}
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={24} />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="chats"
          stroke="#6B5FE4"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#6B5FE4' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
