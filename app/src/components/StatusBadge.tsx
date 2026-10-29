import { STATUS_LABELS, STATUS_COLORS } from '../lib/contract'

interface StatusBadgeProps {
  status: number
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const label = STATUS_LABELS[status] ?? 'Unknown'
  const color = STATUS_COLORS[status] ?? '#8a849c'

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full tabular-nums ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}
      style={{
        color,
        background: `${color}18`,
        border: `1px solid ${color}30`,
      }}
    >
      {label}
    </span>
  )
}
