'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Pencil, Trash2 } from 'lucide-react'
import { deleteSourcing } from './actions'
import { SourcingDialog } from './sourcing-dialog'
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
import type { Database } from '@/lib/database.types'

type SourcingRow = Database['public']['Tables']['sourcing_entries']['Row']

const STATUS_BADGE: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-800',
  Ordered: 'bg-blue-100 text-blue-800',
  Received: 'bg-emerald-100 text-emerald-800',
}

function Row({ entry }: { entry: SourcingRow }) {
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteSourcing(entry.id)
      if (res?.error) toast.error(res.error)
      else toast.success('Sourcing entry deleted')
    })
  }

  return (
    <TableRow className={pending ? 'opacity-50' : undefined}>
      <TableCell className="font-medium">{entry.item ?? '—'}</TableCell>
      <TableCell>{entry.supplier ?? '—'}</TableCell>
      <TableCell className="text-right tabular-nums">{entry.quantity ?? '—'}</TableCell>
      <TableCell className="text-muted-foreground">{entry.unit ?? '—'}</TableCell>
      <TableCell className="text-right tabular-nums">{entry.rate ?? '—'}</TableCell>
      <TableCell>
        {entry.status ? (
          <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', STATUS_BADGE[entry.status] ?? 'bg-muted text-muted-foreground')}>
            {entry.status}
          </span>
        ) : (
          '—'
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap text-muted-foreground">{entry.date ?? '—'}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <SourcingDialog
            entry={entry}
            trigger={
              <Button variant="ghost" size="icon-sm" aria-label="Edit entry">
                <Pencil className="size-4" />
              </Button>
            }
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Delete entry" disabled={pending} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                <AlertDialogDescription>This sourcing entry will be permanently deleted.</AlertDialogDescription>
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

export function SourcingTable({ entries }: { entries: SourcingRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Material / Item</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead className="text-right">Rate</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-0 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <Row key={entry.id} entry={entry} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
