'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { updateStage } from './actions'
import { PRODUCTION_STAGES } from '@/lib/stages'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export type ProdRow = {
  lineItemId: string
  poId: string
  poNo: string
  buyerName: string
  skuLabel: string
  quantity: number
  stage: string
}

function StageCell({ row }: { row: ProdRow }) {
  const [pending, startTransition] = useTransition()
  const [stage, setStage] = useState(row.stage)

  function onChange(value: string) {
    const prev = stage
    setStage(value)
    startTransition(async () => {
      const res = await updateStage(row.lineItemId, value, row.poId)
      if (res?.error) {
        toast.error(res.error)
        setStage(prev)
      } else {
        toast.success('Stage updated')
      }
    })
  }

  return (
    <Select value={stage} onValueChange={onChange} disabled={pending}>
      <SelectTrigger className="h-8 w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PRODUCTION_STAGES.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function ProductionTable({ rows }: { rows: ProdRow[] }) {
  const [filter, setFilter] = useState<string>('all')
  const shown = filter === 'all' ? rows : rows.filter((r) => r.stage === filter)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Filter by stage:</span>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="h-8 w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages ({rows.length})</SelectItem>
            {PRODUCTION_STAGES.map((s) => (
              <SelectItem key={s} value={s}>
                {s} ({rows.filter((r) => r.stage === s).length})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO No.</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead>Stage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  No items in this view.
                </TableCell>
              </TableRow>
            ) : (
              shown.map((row) => (
                <TableRow key={row.lineItemId}>
                  <TableCell className="font-mono text-xs">
                    <Link href={`/purchase-orders/${row.poId}`} className="font-medium text-primary hover:underline">
                      {row.poNo}
                    </Link>
                  </TableCell>
                  <TableCell>{row.buyerName}</TableCell>
                  <TableCell className="font-medium">{row.skuLabel}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.quantity}</TableCell>
                  <TableCell>
                    <StageCell row={row} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
