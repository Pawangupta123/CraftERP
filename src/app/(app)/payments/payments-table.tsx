'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Check, Pencil, Trash2 } from 'lucide-react'
import { deletePayment } from './actions'
import { PaymentDialog } from './payment-dialog'
import { CURRENCY_SYMBOL } from '@/lib/currency'
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

type Payment = Database['public']['Tables']['payments']['Row']
type POOpt = { id: string; po_no: string }

function YesNo({ value }: { value: boolean }) {
  return value ? (
    <span className="inline-flex items-center gap-1 text-emerald-700">
      <Check className="size-4" /> Yes
    </span>
  ) : (
    <span className="text-muted-foreground">No</span>
  )
}

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
    payment.amount === null ? '—' : `${CURRENCY_SYMBOL[payment.currency]}${payment.amount}`

  return (
    <TableRow className={pending ? 'opacity-50' : undefined}>
      <TableCell className="font-mono text-xs font-medium">{poNo}</TableCell>
      <TableCell className="whitespace-nowrap text-muted-foreground">{payment.date ?? '—'}</TableCell>
      <TableCell className="tabular-nums">{amount}</TableCell>
      <TableCell className="text-muted-foreground tabular-nums">{payment.conversion_rate ?? '—'}</TableCell>
      <TableCell className="tabular-nums">{payment.percentage === null ? '—' : `${payment.percentage}%`}</TableCell>
      <TableCell>{payment.container_no ?? '—'}</TableCell>
      <TableCell><YesNo value={payment.bl} /></TableCell>
      <TableCell><YesNo value={payment.brc} /></TableCell>
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

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>PO No.</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Rate</TableHead>
            <TableHead>%</TableHead>
            <TableHead>Container</TableHead>
            <TableHead>BL</TableHead>
            <TableHead>BRC</TableHead>
            <TableHead className="w-0 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <PaymentRow key={payment.id} payment={payment} poNo={poMap.get(payment.po_id) ?? '—'} pos={pos} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
