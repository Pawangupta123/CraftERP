'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { deletePO } from './actions'
import { PO_STATUS, PO_STATUS_ORDER, type POStatus } from '@/lib/po-status'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export type PORow = {
  id: string
  po_no: string
  status: POStatus
  shipping_date: string | null
  buyer_name: string
}

function StatusBadge({ status }: { status: POStatus }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', PO_STATUS[status].badge)}>
      {PO_STATUS[status].label}
    </span>
  )
}

function PORowItem({ po }: { po: PORow }) {
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const res = await deletePO(po.id)
      if (res?.error) toast.error(res.error)
      else toast.success('Purchase order deleted')
    })
  }

  return (
    <TableRow className={pending ? 'opacity-50' : undefined}>
      <TableCell className="font-mono text-xs">
        <Link href={`/purchase-orders/${po.id}`} className="font-medium text-primary hover:underline">
          {po.po_no}
        </Link>
      </TableCell>
      <TableCell className="font-medium">{po.buyer_name}</TableCell>
      <TableCell>
        <StatusBadge status={po.status} />
      </TableCell>
      <TableCell className="text-muted-foreground">{po.shipping_date ?? '—'}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button asChild variant="ghost" size="icon-sm" aria-label={`View ${po.po_no}`}>
            <Link href={`/purchase-orders/${po.id}`}>
              <Eye className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon-sm" aria-label={`Edit ${po.po_no}`}>
            <Link href={`/purchase-orders/${po.id}/edit`}>
              <Pencil className="size-4" />
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={`Delete ${po.po_no}`} disabled={pending} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete purchase order?</AlertDialogTitle>
                <AlertDialogDescription>
                  <span className="font-medium text-foreground">{po.po_no}</span> and its items will be
                  permanently deleted. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  )
}

export function POsTable({ pos }: { pos: PORow[] }) {
  const [filter, setFilter] = useState<'all' | POStatus>('all')
  const shown = filter === 'all' ? pos : pos.filter((p) => p.status === filter)
  const count = (s: POStatus) => pos.filter((p) => p.status === s).length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        <Button variant={filter === 'all' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('all')}>
          All ({pos.length})
        </Button>
        {PO_STATUS_ORDER.map((s) => (
          <Button key={s} variant={filter === s ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter(s)}>
            {PO_STATUS[s].label} ({count(s)})
          </Button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO No.</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Shipping date</TableHead>
              <TableHead className="w-0 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  No purchase orders in this view.
                </TableCell>
              </TableRow>
            ) : (
              shown.map((po) => <PORowItem key={po.id} po={po} />)
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
