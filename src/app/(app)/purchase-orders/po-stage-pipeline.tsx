'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Package, RotateCcw } from 'lucide-react'
import { updateLineItemStage } from './actions'
import { PRODUCTION_STAGES, stageIndex, type StageKey } from '@/lib/po-stages'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export type LineStage = {
  lineItemId: string
  skuNo: string
  skuName: string
  photoUrl: string | null
  description: string | null
  qty: number
  cbm: number
  stage: StageKey | null
}

function StageTrack({ poId, line }: { poId: string; line: LineStage }) {
  const router = useRouter()
  const [stage, setStage] = useState<StageKey | null>(line.stage)
  const [pending, startTransition] = useTransition()
  const activeIdx = stageIndex(stage)

  function commit(next: StageKey | null) {
    const prev = stage
    setStage(next) // optimistic
    startTransition(async () => {
      const res = await updateLineItemStage(poId, line.lineItemId, next)
      if (res?.error) {
        setStage(prev)
        toast.error(res.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className={cn('flex items-end gap-0.5', pending && 'opacity-60')}>
      {PRODUCTION_STAGES.map((s, i) => {
        const reached = activeIdx >= i
        const isCurrent = activeIdx === i
        const Icon = s.icon
        return (
          <div key={s.key} className="flex items-end">
            {i > 0 ? (
              <span className={cn('mb-3.5 h-1 w-3 shrink-0 rounded-full sm:w-5', reached ? s.line : 'bg-muted')} />
            ) : null}
            <button
              type="button"
              onClick={() => commit(s.key)}
              disabled={pending}
              title={`Mark ${s.label}`}
              className="flex shrink-0 flex-col items-center gap-1"
            >
              <span
                className={cn(
                  'grid size-8 place-items-center rounded-full text-white transition-transform hover:scale-105',
                  reached ? s.fill : 'bg-muted text-muted-foreground',
                  isCurrent && 'ring-2 ring-foreground/20 ring-offset-2',
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className={cn('text-[9px] font-medium', reached ? 'text-foreground' : 'text-muted-foreground')}>
                {s.short}
              </span>
            </button>
          </div>
        )
      })}
      <button
        type="button"
        onClick={() => commit(null)}
        disabled={pending || activeIdx < 0}
        title="Reset to not started"
        className="mb-3.5 ml-1 grid size-6 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
      >
        <RotateCcw className="size-3" />
      </button>
    </div>
  )
}

export function POStagePipeline({ poId, lines }: { poId: string; lines: LineStage[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">CBM</TableHead>
            <TableHead>Production stage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                No items on this PO.
              </TableCell>
            </TableRow>
          ) : (
            lines.map((line) => (
              <TableRow key={line.lineItemId}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg border bg-muted/40 text-muted-foreground">
                      {line.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={line.photoUrl} alt={line.skuName} className="size-full object-cover" />
                      ) : (
                        <Package className="size-5" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium">{line.skuName}</p>
                      <p className="font-mono text-xs text-muted-foreground">{line.skuNo}</p>
                      {line.description ? (
                        <p className="max-w-[16rem] truncate text-xs text-muted-foreground">{line.description}</p>
                      ) : null}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right align-middle tabular-nums">{line.qty}</TableCell>
                <TableCell className="text-right align-middle tabular-nums">{line.cbm}</TableCell>
                <TableCell className="align-middle">
                  <StageTrack poId={poId} line={line} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
