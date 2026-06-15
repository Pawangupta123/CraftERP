'use client'

import * as React from 'react'
import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AlertCircle } from 'lucide-react'
import { saveSourcing } from './actions'
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
import type { Database } from '@/lib/database.types'

type SourcingRow = Database['public']['Tables']['sourcing_entries']['Row']

const STATUSES = ['Pending', 'Ordered', 'Received'] as const
const num = (v: string): number | null => {
  const t = v.trim()
  if (!t) return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

export function SourcingDialog({
  entry,
  trigger,
}: {
  entry?: SourcingRow
  trigger: React.ReactNode
}) {
  const router = useRouter()
  const editing = Boolean(entry)

  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [item, setItem] = useState('')
  const [supplier, setSupplier] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('')
  const [rate, setRate] = useState('')
  const [status, setStatus] = useState<string>('Pending')
  const [date, setDate] = useState('')
  const [remark, setRemark] = useState('')

  function reset() {
    setError(null)
    setItem(entry?.item ?? '')
    setSupplier(entry?.supplier ?? '')
    setQuantity(entry?.quantity?.toString() ?? '')
    setUnit(entry?.unit ?? '')
    setRate(entry?.rate?.toString() ?? '')
    setStatus(entry?.status ?? 'Pending')
    setDate(entry?.date ?? '')
    setRemark(entry?.remark ?? '')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const res = await saveSourcing({
      id: entry?.id,
      item: item.trim() || null,
      supplier: supplier.trim() || null,
      quantity: num(quantity),
      unit: unit.trim() || null,
      rate: num(rate),
      status: status || null,
      date: date || null,
      remark: remark.trim() || null,
    })
    if (res.error) {
      setError(res.error)
      setSubmitting(false)
      return
    }
    toast.success(editing ? 'Sourcing entry updated' : 'Sourcing entry added')
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
          <DialogTitle>{editing ? 'Edit sourcing entry' : 'Add sourcing entry'}</DialogTitle>
          <DialogDescription>Material to source from a supplier.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="item">Material / Item</Label>
              <Input id="item" value={item} onChange={(e) => setItem(e.target.value)} placeholder="e.g. Sheesham wood plank" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="supplier">Supplier</Label>
              <Input id="supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Supplier name" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" inputMode="decimal" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="unit">Unit</Label>
              <Input id="unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g. cft, kg, pcs" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rate">Rate</Label>
              <Input id="rate" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="0.00" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="remark">Remark</Label>
              <Input id="remark" value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Any note" className="h-9" />
            </div>
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
              {submitting ? 'Saving…' : editing ? 'Save changes' : 'Add entry'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
