interface StatsWidgetProps {
  title: string
  value: number
  subtitle: string
  color: 'blue' | 'purple' | 'red' | 'green'
}

export function StatsWidget({ title, value, subtitle, color }: StatsWidgetProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600',
  }

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-600">{title}</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">{value}</p>
          <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
        </div>
        <div className={`w-12 h-12 rounded-full ${colorClasses[color]} flex items-center justify-center`}>
          <span className="text-2xl font-bold">{value}</span>
        </div>
      </div>
    </div>
  )
}
