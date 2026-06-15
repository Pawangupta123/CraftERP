'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Pencil, Trash2 } from 'lucide-react'
import { deletePayment } from './actions'
import { PaymentDialog } from './payment-dialog'
import { currencySymbol } from '@/lib/currency'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

type Payment = Database['public']['Tables']['payments']['Row']
type POOpt = { id: string; po_no: string }

function PaymentRow({ payment, poNo, pos }: { payment: Payment; poNo: string; pos: POOpt[] }) {
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const res = await deletePayment(payment.id)
      if (res?.error) toast.error(res.error)
      else toast.success('Payment deleted')
    })
  }

  const amount =
    payment.amount === null ? '—' : `${currencySymbol(payment.currency)}${payment.amount}`

  return (
    <TableRow className={pending ? 'opacity-50' : undefined}>
      <TableCell className="font-mono text-xs font-medium">{poNo}</TableCell>
      <TableCell className="whitespace-nowrap text-muted-foreground">{payment.date ?? '—'}</TableCell>
      <TableCell className="tabular-nums">{amount}</TableCell>
      <TableCell className="text-muted-foreground tabular-nums">{payment.conversion_rate ?? '—'}</TableCell>
      <TableCell className="tabular-nums">{payment.percentage === null ? '—' : `${payment.percentage}%`}</TableCell>
      <TableCell>{payment.container_no ?? '—'}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <PaymentDialog
            payment={payment}
            pos={pos}
            trigger={
              <Button variant="ghost" size="icon-sm" aria-label="Edit payment">
                <Pencil className="size-4" />
              </Button>
            }
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Delete payment" disabled={pending} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this payment?</AlertDialogTitle>
                <AlertDialogDescription>This payment record will be permanently deleted.</AlertDialogDescription>
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

export function PaymentsTable({ payments, pos }: { payments: Payment[]; pos: POOpt[] }) {
  const poMap = new Map(pos.map((p) => [p.id, p.po_no]))
  const [poFilter, setPoFilter] = useState('all')
  const shown = poFilter === 'all' ? payments : payments.filter((p) => p.po_id === poFilter)

  return (
    <div className="space-y-3">
      {/* Second filter — PO-wise (the date-wise table below stays as is) */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Filter by PO:</span>
        <Select value={poFilter} onValueChange={setPoFilter}>
          <SelectTrigger className="h-9 w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All POs</SelectItem>
            {pos.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.po_no}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {poFilter !== 'all' ? (
          <Button variant="ghost" size="sm" onClick={() => setPoFilter('all')}>
            Clear
          </Button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO No.</TableHead>
              <TableHead className="whitespace-nowrap">Received payment date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>%</TableHead>
              <TableHead>Container</TableHead>
              <TableHead className="w-0 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                  No payments{poFilter !== 'all' ? ' for this PO' : ' yet'}.
                </TableCell>
              </TableRow>
            ) : (
              shown.map((payment) => (
                <PaymentRow key={payment.id} payment={payment} poNo={poMap.get(payment.po_id) ?? '—'} pos={pos} />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
