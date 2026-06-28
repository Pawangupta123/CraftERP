'use client'

import * as React from 'react'
import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AlertCircle } from 'lucide-react'
import { createDailyUpdate } from './actions'
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
import { Textarea } from '@/components/ui/textarea'

type POOpt = { id: string; po_no: string }
type SkuOpt = { id: string; sku_no: string; name: string }

const today = () => new Date().toISOString().slice(0, 10)

export function DailyDialog({
  pos,
  skus,
  defaultName,
  trigger,
}: {
  pos: POOpt[]
  skus: SkuOpt[]
  defaultName: string
  trigger: React.ReactNode
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [date, setDate] = useState(today())
  const [poId, setPoId] = useState('')
  const [skuId, setSkuId] = useState('')
  const [supervisor, setSupervisor] = useState(defaultName)
  const [workDone, setWorkDone] = useState('')
  const [remark, setRemark] = useState('')

  function reset() {
    setError(null)
    setDate(today())
    setPoId('')
    setSkuId('')
    setSupervisor(defaultName)
    setWorkDone('')
    setRemark('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const res = await createDailyUpdate({
      date: date || null,
      po_id: poId || null,
      sku_id: skuId || null,
      supervisor_name: supervisor.trim() || null,
      work_done: workDone.trim() || null,
      remark: remark.trim() || null,
    })
    if (res.error) {
      setError(res.error)
      setSubmitting(false)
      return
    }
    toast.success('Update added')
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
          <DialogTitle>Add daily update</DialogTitle>
          <DialogDescription>Record a day&apos;s work on a purchase order / item.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="d-date">Date</Label>
              <Input id="d-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="d-sup">Logged by</Label>
              <Input id="d-sup" value={supervisor} onChange={(e) => setSupervisor(e.target.value)} placeholder="Name" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label>Purchase order</Label>
              <Select value={poId} onValueChange={setPoId}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Select PO" />
                </SelectTrigger>
                <SelectContent>
                  {pos.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.po_no}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Item (SKU)</Label>
              <Select value={skuId} onValueChange={setSkuId}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {skus.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.sku_no} — {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="d-work">Work done</Label>
            <Textarea id="d-work" value={workDone} onChange={(e) => setWorkDone(e.target.value)} placeholder="What was done today…" rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="d-remark">Remark</Label>
            <Input id="d-remark" value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Any note" className="h-9" />
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
              {submitting ? 'Saving…' : 'Add update'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
