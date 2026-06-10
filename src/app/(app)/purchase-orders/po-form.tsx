'use client'

import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ImagePlus, Plus, Trash2 } from 'lucide-react'
import { uploadImage } from '@/lib/upload'
import { createPO, updatePO, type POPayload } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type BuyerOpt = { id: string; name: string }
type SkuOpt = { id: string; sku_no: string; name: string }
type LineItem = { id?: string; sku_id: string; quantity: string }
type Status = 'upcoming' | 'in_progress' | 'completed'

export type POInitial = {
  id: string
  po_no: string
  buyer_id: string
  photo_url: string | null
  delivery_date: string
  inspection_date: string
  shipping_date: string
  shipping_country: string
  status: Status
  line_items: LineItem[]
}

const num = (v: string): number => {
  const n = Number(v.trim())
  return Number.isFinite(n) && n > 0 ? n : 0
}
const dateOrNull = (v: string): string | null => v.trim() || null

export function POForm({
  buyers,
  skus,
  initial,
}: {
  buyers: BuyerOpt[]
  skus: SkuOpt[]
  initial?: POInitial
}) {
  const router = useRouter()
  const editing = Boolean(initial)

  const [poNo, setPoNo] = useState(initial?.po_no ?? '')
  const [buyerId, setBuyerId] = useState(initial?.buyer_id ?? '')
  const [status, setStatus] = useState<Status>(initial?.status ?? 'upcoming')
  const [shippingCountry, setShippingCountry] = useState(initial?.shipping_country ?? '')
  const [deliveryDate, setDeliveryDate] = useState(initial?.delivery_date ?? '')
  const [inspectionDate, setInspectionDate] = useState(initial?.inspection_date ?? '')
  const [shippingDate, setShippingDate] = useState(initial?.shipping_date ?? '')

  const existingPhotoUrl = initial?.photo_url ?? null
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [newPreview, setNewPreview] = useState<string | null>(null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const preview = newPreview ?? (removePhoto ? null : existingPhotoUrl)

  const [lines, setLines] = useState<LineItem[]>(
    initial?.line_items.length ? initial.line_items : [{ sku_id: '', quantity: '1' }],
  )
  const [submitting, setSubmitting] = useState(false)

  function onPhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setPhotoFile(file)
    setNewPreview(file ? URL.createObjectURL(file) : null)
    setRemovePhoto(false)
  }

  function clearPhoto() {
    setPhotoFile(null)
    setNewPreview(null)
    setRemovePhoto(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!buyerId) {
      toast.error('Please select a buyer.')
      return
    }
    const items = lines
      .filter((l) => l.sku_id)
      .map((l) => ({ id: l.id, sku_id: l.sku_id, quantity: num(l.quantity) }))
    if (items.length === 0) {
      toast.error('Add at least one item.')
      return
    }
    if (items.some((l) => l.quantity <= 0)) {
      toast.error('Quantity must be greater than zero.')
      return
    }
    setSubmitting(true)

    let photo_url: string | null = existingPhotoUrl
    if (photoFile) {
      const fd = new FormData()
      fd.append('file', photoFile)
      const up = await uploadImage(fd)
      if (up.error || !up.url) {
        toast.error(up.error ?? 'Photo upload failed.')
        setSubmitting(false)
        return
      }
      photo_url = up.url
    } else if (removePhoto) {
      photo_url = null
    }

    const payload: POPayload = {
      po_no: poNo,
      buyer_id: buyerId,
      photo_url,
      delivery_date: dateOrNull(deliveryDate),
      inspection_date: dateOrNull(inspectionDate),
      shipping_date: dateOrNull(shippingDate),
      shipping_country: shippingCountry.trim() || null,
      status,
      line_items: items,
    }

    const res = editing ? await updatePO(initial!.id, payload) : await createPO(payload)
    if (res.error) {
      toast.error(res.error)
      setSubmitting(false)
      return
    }
    toast.success(editing ? 'Purchase order updated' : 'Purchase order created')
    const targetId = editing ? initial!.id : (res as { id?: string }).id
    router.push(targetId ? `/purchase-orders/${targetId}` : '/purchase-orders')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Purchase order</CardTitle>
          <CardDescription>Order details and shipping information.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="po_no">PO No.</Label>
            <Input id="po_no" value={poNo} onChange={(e) => setPoNo(e.target.value)} placeholder="Leave blank to auto-generate" className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label>
              Buyer <span className="text-destructive">*</span>
            </Label>
            <Select value={buyerId} onValueChange={setBuyerId}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Select buyer" />
              </SelectTrigger>
              <SelectContent>
                {buyers.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">No buyers — add one first.</div>
                ) : (
                  buyers.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="shipping_country">Shipping country</Label>
            <Input id="shipping_country" value={shippingCountry} onChange={(e) => setShippingCountry(e.target.value)} placeholder="e.g. United States" className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="delivery_date">Delivery date</Label>
            <Input id="delivery_date" type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inspection_date">Inspection date</Label>
            <Input id="inspection_date" type="date" value={inspectionDate} onChange={(e) => setInspectionDate(e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="shipping_date">Shipping date</Label>
            <Input id="shipping_date" type="date" value={shippingDate} onChange={(e) => setShippingDate(e.target.value)} className="h-9" />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label>Photo</Label>
            <div className="flex items-center gap-3">
              <label className="flex size-20 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted/40 text-muted-foreground transition-colors hover:bg-muted">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="Preview" className="size-full object-cover" />
                ) : (
                  <ImagePlus className="size-5" />
                )}
                <input type="file" accept="image/*" onChange={onPhotoChange} className="hidden" />
              </label>
              {preview ? (
                <Button type="button" variant="ghost" size="sm" onClick={clearPhoto}>
                  Remove
                </Button>
              ) : (
                <span className="text-sm text-muted-foreground">Upload a reference photo (optional).</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
          <CardDescription>Select items (SKU) and the ordered quantity. Total CFT is computed on the PO.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="hidden px-1 text-xs font-medium text-muted-foreground sm:grid sm:grid-cols-[minmax(0,1fr)_6rem_2.25rem] sm:gap-2">
            <span>Item (SKU)</span>
            <span>Quantity</span>
            <span />
          </div>
          {lines.map((row, i) => (
            <div key={row.id ?? `new-${i}`} className="grid grid-cols-[minmax(0,1fr)_5rem_2.25rem] gap-2 sm:grid-cols-[minmax(0,1fr)_6rem_2.25rem]">
              <Select value={row.sku_id} onValueChange={(v) => setLines(lines.map((r, idx) => (idx === i ? { ...r, sku_id: v } : r)))}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {skus.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">No items — add one first.</div>
                  ) : (
                    skus.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.sku_no} — {s.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Input aria-label="Quantity" inputMode="numeric" value={row.quantity} onChange={(e) => setLines(lines.map((r, idx) => (idx === i ? { ...r, quantity: e.target.value } : r)))} className="h-9" />
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Remove item" onClick={() => setLines(lines.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => setLines([...lines, { sku_id: '', quantity: '1' }])}>
            <Plus className="size-4" /> Add item
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push(editing ? `/purchase-orders/${initial!.id}` : '/purchase-orders')} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : editing ? 'Save changes' : 'Create PO'}
        </Button>
      </div>
    </form>
  )
}
