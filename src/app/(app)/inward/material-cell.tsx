import { cn } from '@/lib/utils'
import type { MaterialStat } from '@/lib/procurement'

export function MaterialCell({ stat }: { stat: MaterialStat }) {
  if (stat.status === 'no-bom') {
    return <span className="text-xs text-muted-foreground">—</span>
  }
  const bar =
    stat.status === 'complete'
      ? 'bg-emerald-500'
      : stat.status === 'partial'
        ? 'bg-amber-500'
        : 'bg-muted-foreground/30'

  return (
    <div className="min-w-28 space-y-1">
      <div className="text-xs tabular-nums">
        <span className="font-medium">{stat.received}</span>
        <span className="text-muted-foreground">
          {' '}
          / {stat.required} {stat.unit}
        </span>
        {stat.surplus > 0 ? <span className="text-emerald-600"> (+{stat.surplus})</span> : null}
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn('h-full rounded-full', bar)} style={{ width: `${stat.pct}%` }} />
      </div>
    </div>
  )
}
