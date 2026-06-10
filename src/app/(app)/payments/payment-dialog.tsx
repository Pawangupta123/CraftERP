'use client'

import * as React from 'react'
import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AlertCircle } from 'lucide-react'
import { savePayment } from './actions'
import { CURRENCIES, type Currency } from '@/lib/currency'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type { Database } from '@/lib/database.types'

type Payment = Database['public']['Tables']['payments']['Row']
type POOpt = { id: string; po_no: string }

const num = (v: string): number | null => {
  const t = v.trim()
  if (!t) return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}
const today = () => new Date().toISOString().slice(0, 10)

export function PaymentDialog({
  payment,
  pos,
  trigger,
}: {
  payment?: Payment
  pos: POOpt[]
  trigger: React.ReactNode
}) {
  const router = useRouter()
  const editing = Boolean(payment)

  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [poId, setPoId] = useState('')
  const [date, setDate] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<Currency>('INR')
  const [rate, setRate] = useState('')
  const [percentage, setPercentage] = useState('')
  const [containerNo, setContainerNo] = useState('')
  const [remark, setRemark] = useState('')
  const [bl, setBl] = useState(false)
  const [brc, setBrc] = useState(false)

  function reset() {
    setError(null)
    setPoId(payment?.po_id ?? '')
    setDate(payment?.date ?? today())
    setAmount(payment?.amount?.toString() ?? '')
    setCurrency(payment?.currency ?? 'INR')
    setRate(payment?.conversion_rate?.toString() ?? '')
    setPercentage(payment?.percentage?.toString() ?? '')
    setContainerNo(payment?.container_no ?? '')
    setRemark(payment?.remark ?? '')
    setBl(payment?.bl ?? false)
    setBrc(payment?.brc ?? false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!poId) {
      setError('Please select a purchase order.')
      return
    }
    setSubmitting(true)
    setError(null)
    const res = await savePayment({
      id: payment?.id,
      po_id: poId,
      date: date || null,
      amount: num(amount),
      currency,
      conversion_rate: currency === 'INR' ? null : num(rate),
      percentage: num(percentage),
      container_no: containerNo.trim() || null,
      remark: remark.trim() || null,
      bl,
      brc,
    })
    if (res.error) {
      setError(res.error)
      setSubmitting(false)
      return
    }
    toast.success(editing ? 'Payment updated' : 'Payment added')
    setSubmitting(false)
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) reset()
        setOpen(o)
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit payment' : 'Add payment'}</DialogTitle>
          <DialogDescription>Record a payment received against a purchase order.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>
              Purchase order <span className="text-destructive">*</span>
            </Label>
            <Select value={poId} onValueChange={setPoId}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Select PO" />
              </SelectTrigger>
              <SelectContent>
                {pos.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">No POs — create one first.</div>
                ) : (
                  pos.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.po_no}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="container_no">Container No.</Label>
              <Input id="container_no" value={containerNo} onChange={(e) => setContainerNo(e.target.value)} placeholder="e.g. MSKU1234567" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currency !== 'INR' ? (
              <div className="space-y-1.5">
                <Label htmlFor="rate">Conversion rate (to INR)</Label>
                <Input id="rate" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="e.g. 83.5" className="h-9" />
              </div>
            ) : null}
            <div className="space-y-1.5">
              <Label htmlFor="percentage">Percentage (%)</Label>
              <Input id="percentage" inputMode="decimal" value={percentage} onChange={(e) => setPercentage(e.target.value)} placeholder="e.g. 30" className="h-9" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="remark">Remark</Label>
            <Input id="remark" value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Any note" className="h-9" />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={bl} onCheckedChange={setBl} />
              BL received
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={brc} onCheckedChange={setBrc} />
              BRC received
            </label>
          </div>

          {error ? (
            <p className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : editing ? 'Save changes' : 'Add payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
