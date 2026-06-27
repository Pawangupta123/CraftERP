'use client'

import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { ArrowLeft, ChevronRight, Eye, Pencil, Search, Trash2, Users } from 'lucide-react'
import { deletePO } from './actions'
import { PO_STATUS, PO_STATUS_ORDER, type POStatus } from '@/lib/po-status'
import { stageMeta, type StageKey } from '@/lib/po-stages'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

type Item = { name: string; qty: number }

export type PORow = {
  id: string
  po_no: string
  status: POStatus
  delivery_date: string | null
  buyer_id: string
  buyer_name: string
  items: Item[]
  totalQty: number
  stage: StageKey | null
}

type BuyerOpt = { id: string; name: string }

function StatusBadge({ status }: { status: POStatus }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', PO_STATUS[status].badge)}>
      {PO_STATUS[status].label}
    </span>
  )
}

function StageBadge({ stage }: { stage: StageKey | null }) {
  const meta = stageMeta(stage)
  if (!meta) {
    return <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Not started</span>
  }
  const Icon = meta.icon
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', meta.badge)}>
      <Icon className="size-3" />
      {meta.label}
    </span>
  )
}

function ItemsCell({ items }: { items: Item[] }) {
  if (items.length === 0) return <span className="text-muted-foreground">—</span>
  const first = items[0].name
  const extra = items.length - 1
  return (
    <span className="block max-w-[14rem] truncate">
      {first}
      {extra > 0 ? <span className="text-muted-foreground"> +{extra}</span> : null}
    </span>
  )
}

function PORowItem({ po, isAdmin }: { po: PORow; isAdmin: boolean }) {
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
      <TableCell className="font-medium"><ItemsCell items={po.items} /></TableCell>
      <TableCell className="text-right tabular-nums">{po.totalQty}</TableCell>
      <TableCell><StatusBadge status={po.status} /></TableCell>
      <TableCell><StageBadge stage={po.stage} /></TableCell>
      <TableCell className="whitespace-nowrap text-muted-foreground">{po.delivery_date ?? '—'}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button asChild variant="ghost" size="icon-sm" aria-label={`View ${po.po_no}`}>
            <Link href={`/purchase-orders/${po.id}`}>
              <Eye className="size-4" />
            </Link>
          </Button>
          {isAdmin ? (
            <>
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
            </>
          ) : null}
        </div>
      </TableCell>
    </TableRow>
  )
}

export function POsByBuyer({ buyers, pos, isAdmin }: { buyers: BuyerOpt[]; pos: PORow[]; isAdmin: boolean }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'all' | POStatus>('all')

  const countByBuyer = useMemo(() => {
    const m = new Map<string, number>()
    for (const p of pos) m.set(p.buyer_id, (m.get(p.buyer_id) ?? 0) + 1)
    return m
  }, [pos])

  // Buyer picker view
  if (!selected) {
    const q = search.trim().toLowerCase()
    const shown = buyers.filter((b) => !q || b.name.toLowerCase().includes(q))
    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search buyers…"
            className="h-10 pl-9"
          />
        </div>

        {shown.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No buyers match “{search}”.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((b) => {
              const count = countByBuyer.get(b.id) ?? 0
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setSelected(b.id)
                    setTab('all')
                  }}
                  className="group flex items-center justify-between gap-3 rounded-xl border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-lg bg-primary/10 font-heading text-sm font-semibold text-primary">
                      {b.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <p className="font-medium">{b.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {count} {count === 1 ? 'order' : 'orders'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Selected-buyer view
  const buyer = buyers.find((b) => b.id === selected)
  const buyerPos = pos.filter((p) => p.buyer_id === selected)
  const shown = tab === 'all' ? buyerPos : buyerPos.filter((p) => p.status === tab)
  const tabCount = (s: POStatus) => buyerPos.filter((p) => p.status === s).length

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setSelected(null)}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All buyers
      </button>

      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-lg bg-primary/10 font-heading text-sm font-semibold text-primary">
          {(buyer?.name ?? '—').slice(0, 2).toUpperCase()}
        </span>
        <div>
          <h2 className="font-heading text-lg font-semibold tracking-tight">{buyer?.name ?? '—'}</h2>
          <p className="text-xs text-muted-foreground">{buyerPos.length} purchase {buyerPos.length === 1 ? 'order' : 'orders'}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Button variant={tab === 'all' ? 'secondary' : 'ghost'} size="sm" onClick={() => setTab('all')}>
          All ({buyerPos.length})
        </Button>
        {PO_STATUS_ORDER.map((s) => (
          <Button key={s} variant={tab === s ? 'secondary' : 'ghost'} size="sm" onClick={() => setTab(s)}>
            {PO_STATUS[s].label} ({tabCount(s)})
          </Button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO No.</TableHead>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead className="whitespace-nowrap">Delivery date (deadline)</TableHead>
              <TableHead className="w-0 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                  No purchase orders in this view.
                </TableCell>
              </TableRow>
            ) : (
              shown.map((po) => <PORowItem key={po.id} po={po} isAdmin={isAdmin} />)
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export function EmptyBuyers() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <Users className="size-6" />
      </span>
      <p className="text-sm text-muted-foreground">No buyers with purchase orders yet.</p>
    </div>
  )
}
