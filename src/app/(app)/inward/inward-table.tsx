'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Eye, Trash2 } from 'lucide-react'
import { deleteInward } from './actions'
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
import { MATERIAL_LABEL } from '@/lib/material-inward'

export type InwardRow = {
  id: string
  inward_no: string | null
  date: string
  material_type: string
  po_no: string
  wood_type: string | null
  total_pieces: number
  total_cft: number
}

function Row({ row }: { row: InwardRow }) {
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteInward(row.id)
      if (res?.error) toast.error(res.error)
      else toast.success('Inward deleted')
    })
  }

  return (
    <TableRow className={pending ? 'opacity-50' : undefined}>
      <TableCell className="font-mono text-xs font-medium">{row.inward_no ?? '—'}</TableCell>
      <TableCell className="whitespace-nowrap text-muted-foreground">{row.date}</TableCell>
      <TableCell>{MATERIAL_LABEL[row.material_type] ?? row.material_type}</TableCell>
      <TableCell className="font-mono text-xs">{row.po_no}</TableCell>
      <TableCell>{row.wood_type ?? '—'}</TableCell>
      <TableCell className="text-right tabular-nums">{row.total_pieces}</TableCell>
      <TableCell className="text-right tabular-nums font-medium">
        {row.material_type === 'wood' ? row.total_cft : '—'}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button asChild variant="ghost" size="icon-sm" aria-label="View inward">
            <Link href={`/inward/${row.id}`}>
              <Eye className="size-4" />
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Delete inward" disabled={pending} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete inward entry?</AlertDialogTitle>
              <AlertDialogDescription>
                <span className="font-medium text-foreground">{row.inward_no}</span> and its measurements
                will be permanently deleted.
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

export function InwardTable({ rows }: { rows: InwardRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Inward No.</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>PO</TableHead>
            <TableHead>Wood type</TableHead>
            <TableHead className="text-right">Pieces</TableHead>
            <TableHead className="text-right">Total CFT</TableHead>
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
