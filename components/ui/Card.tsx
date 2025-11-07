interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-lg border border-neutral-200
        shadow-sm p-6
        ${hover ? 'transition-shadow hover:shadow-md' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xl font-semibold text-neutral-900">{children}</h3>
}

export function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="text-neutral-600">{children}</div>
}
