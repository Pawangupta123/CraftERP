'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { deleteDailyUpdate } from './actions'
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

export type DailyRow = {
  id: string
  date: string
  po_no: string
  sku_label: string
  supervisor_name: string | null
  work_done: string | null
  remark: string | null
}

function Row({ row }: { row: DailyRow }) {
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteDailyUpdate(row.id)
      if (res?.error) toast.error(res.error)
      else toast.success('Update deleted')
    })
  }

  return (
    <TableRow className={pending ? 'opacity-50' : undefined}>
      <TableCell className="whitespace-nowrap text-muted-foreground">{row.date}</TableCell>
      <TableCell className="font-mono text-xs">{row.po_no}</TableCell>
      <TableCell className="text-xs">{row.sku_label}</TableCell>
      <TableCell>{row.supervisor_name ?? '—'}</TableCell>
      <TableCell className="max-w-xs truncate">{row.work_done ?? '—'}</TableCell>
      <TableCell className="max-w-xs truncate text-muted-foreground">{row.remark ?? '—'}</TableCell>
      <TableCell className="text-right">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Delete update" disabled={pending} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this update?</AlertDialogTitle>
              <AlertDialogDescription>This daily update entry will be permanently deleted.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={handleDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  )
}

export function DailyTable({ rows }: { rows: DailyRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>PO</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Supervisor</TableHead>
            <TableHead>Work done</TableHead>
            <TableHead>Remark</TableHead>
            <TableHead className="w-0 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <Row key={row.id} row={row} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
