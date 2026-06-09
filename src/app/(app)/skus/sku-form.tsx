'use client'

import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ImagePlus, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createSku, type SkuPayload } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type WoodRow = { description: string; length: string; thickness: string; breadth: string; quantity: string }
type IronRow = { description: string; section: string; length: string; width: string; remark: string }
type HardwareRow = { name: string; description: string; quantity: string; unit: string }
type Packaging = { corrugated_box: string; labels: string; barcode: string; corners: string }

const emptyWood = (): WoodRow => ({ description: '', length: '', thickness: '', breadth: '', quantity: '' })
const emptyIron = (): IronRow => ({ description: '', section: '', length: '', width: '', remark: '' })
const emptyHardware = (): HardwareRow => ({ name: '', description: '', quantity: '', unit: '' })

const num = (v: string): number | null => {
  const t = v.trim()
  if (!t) return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}
const str = (v: string): string | null => v.trim() || null

const ROW_GRID = 'grid grid-cols-2 gap-2'

export function SkuForm() {
  const router = useRouter()

  const [skuNo, setSkuNo] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [remark, setRemark] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const [wood, setWood] = useState<WoodRow[]>([emptyWood()])
  const [iron, setIron] = useState<IronRow[]>([])
  const [hardware, setHardware] = useState<HardwareRow[]>([emptyHardware()])
  const [packaging, setPackaging] = useState<Packaging>({ corrugated_box: '', labels: '', barcode: '', corners: '' })

  const [submitting, setSubmitting] = useState(false)

  function onPhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setPhotoFile(file)
    setPhotoPreview(file ? URL.createObjectURL(file) : null)
  }

  async function uploadPhoto(file: File): Promise<string | null> {
    const supabase = createClient()
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `skus/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('uploads').upload(path, file)
    if (error) {
      toast.error(`Photo upload failed: ${error.message}`)
      return null
    }
    return supabase.storage.from('uploads').getPublicUrl(path).data.publicUrl
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Item name is required.')
      return
    }
    setSubmitting(true)

    let photo_url: string | null = null
    if (photoFile) {
      photo_url = await uploadPhoto(photoFile)
      if (!photo_url) {
        setSubmitting(false)
        return
      }
    }

    const payload: SkuPayload = {
      sku_no: skuNo,
      name,
      photo_url,
      description: str(description),
      remark: str(remark),
      wood: wood.map((w) => ({
        description: str(w.description),
        length: num(w.length),
        thickness: num(w.thickness),
        breadth: num(w.breadth),
        quantity: num(w.quantity),
      })),
      iron: iron.map((x) => ({
        description: str(x.description),
        section: str(x.section),
        length: num(x.length),
        width: num(x.width),
        remark: str(x.remark),
      })),
      hardware: hardware.map((h) => ({
        name: str(h.name),
        description: str(h.description),
        quantity: num(h.quantity),
        unit: str(h.unit),
      })),
      packaging: {
        corrugated_box: str(packaging.corrugated_box),
        labels: str(packaging.labels),
        barcode: str(packaging.barcode),
        corners: str(packaging.corners),
      },
    }

    const res = await createSku(payload)
    if (res.error) {
      toast.error(res.error)
      setSubmitting(false)
      return
    }
    toast.success('Item created')
    router.push('/skus')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic details */}
      <Card>
        <CardHeader>
          <CardTitle>Item details</CardTitle>
          <CardDescription>Basic information about the item (SKU).</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="sku_no">SKU No.</Label>
            <Input id="sku_no" value={skuNo} onChange={(e) => setSkuNo(e.target.value)} placeholder="Leave blank to auto-generate" className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Item name" className="h-9" />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label>Photo</Label>
            <div className="flex items-center gap-3">
              <label className="flex size-20 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted/40 text-muted-foreground transition-colors hover:bg-muted">
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreview} alt="Preview" className="size-full object-cover" />
                ) : (
                  <ImagePlus className="size-5" />
                )}
                <input type="file" accept="image/*" onChange={onPhotoChange} className="hidden" />
              </label>
              {photoPreview ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPhotoFile(null)
                    setPhotoPreview(null)
                  }}
                >
                  Remove
                </Button>
              ) : (
                <span className="text-sm text-muted-foreground">Upload a product photo (optional).</span>
              )}
            </div>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Item description" rows={2} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="remark">Remark</Label>
            <Textarea id="remark" value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Any note" rows={2} />
          </div>
        </CardContent>
      </Card>

      {/* Wood */}
      <Card>
        <CardHeader>
          <CardTitle>Wood</CardTitle>
          <CardDescription>Per-piece dimensions. Add a row for each different size. (Total CFT is calculated later at PO time.)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="hidden px-1 text-xs font-medium text-muted-foreground sm:grid sm:grid-cols-[minmax(0,1fr)_5rem_5rem_5rem_5rem_2.25rem] sm:gap-2">
            <span>Description</span>
            <span>Length</span>
            <span>Thickness</span>
            <span>Breadth</span>
            <span>Qty</span>
            <span />
          </div>
          {wood.map((row, i) => (
            <div key={i} className={`${ROW_GRID} sm:grid-cols-[minmax(0,1fr)_5rem_5rem_5rem_5rem_2.25rem] sm:gap-2`}>
              <Input aria-label="Description" placeholder="Description" value={row.description} onChange={(e) => setWood(wood.map((r, idx) => (idx === i ? { ...r, description: e.target.value } : r)))} className="col-span-2 h-9 sm:col-span-1" />
              <Input aria-label="Length" placeholder="L" inputMode="decimal" value={row.length} onChange={(e) => setWood(wood.map((r, idx) => (idx === i ? { ...r, length: e.target.value } : r)))} className="h-9" />
              <Input aria-label="Thickness" placeholder="T" inputMode="decimal" value={row.thickness} onChange={(e) => setWood(wood.map((r, idx) => (idx === i ? { ...r, thickness: e.target.value } : r)))} className="h-9" />
              <Input aria-label="Breadth" placeholder="B" inputMode="decimal" value={row.breadth} onChange={(e) => setWood(wood.map((r, idx) => (idx === i ? { ...r, breadth: e.target.value } : r)))} className="h-9" />
              <Input aria-label="Quantity" placeholder="Qty" inputMode="decimal" value={row.quantity} onChange={(e) => setWood(wood.map((r, idx) => (idx === i ? { ...r, quantity: e.target.value } : r)))} className="h-9" />
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Remove row" onClick={() => setWood(wood.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => setWood([...wood, emptyWood()])}>
            <Plus className="size-4" /> Add wood row
          </Button>
        </CardContent>
      </Card>

      {/* Iron (optional) */}
      <Card>
        <CardHeader>
          <CardTitle>
            Iron <span className="text-sm font-normal text-muted-foreground">(optional)</span>
          </CardTitle>
          <CardDescription>Iron components used in this item.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {iron.length === 0 ? (
            <p className="text-sm text-muted-foreground">No iron components.</p>
          ) : (
            iron.map((row, i) => (
              <div key={i} className={`${ROW_GRID} sm:grid-cols-[minmax(0,1.4fr)_7rem_5rem_5rem_minmax(0,1fr)_2.25rem] sm:gap-2`}>
                <Input aria-label="Description" placeholder="Description" value={row.description} onChange={(e) => setIron(iron.map((r, idx) => (idx === i ? { ...r, description: e.target.value } : r)))} className="col-span-2 h-9 sm:col-span-1" />
                <Input aria-label="Section" placeholder="Section" value={row.section} onChange={(e) => setIron(iron.map((r, idx) => (idx === i ? { ...r, section: e.target.value } : r)))} className="h-9" />
                <Input aria-label="Length" placeholder="Length" inputMode="decimal" value={row.length} onChange={(e) => setIron(iron.map((r, idx) => (idx === i ? { ...r, length: e.target.value } : r)))} className="h-9" />
                <Input aria-label="Width" placeholder="Width" inputMode="decimal" value={row.width} onChange={(e) => setIron(iron.map((r, idx) => (idx === i ? { ...r, width: e.target.value } : r)))} className="h-9" />
                <Input aria-label="Remark" placeholder="Remark" value={row.remark} onChange={(e) => setIron(iron.map((r, idx) => (idx === i ? { ...r, remark: e.target.value } : r)))} className="col-span-2 h-9 sm:col-span-1" />
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Remove row" onClick={() => setIron(iron.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))
          )}
          <Button type="button" variant="outline" size="sm" onClick={() => setIron([...iron, emptyIron()])}>
            <Plus className="size-4" /> Add iron row
          </Button>
          <p className="text-xs text-muted-foreground">Per-row picture attachment will be added in a later update.</p>
        </CardContent>
      </Card>

      {/* Hardware */}
      <Card>
        <CardHeader>
          <CardTitle>Hardware</CardTitle>
          <CardDescription>Hardware items. Serial number is assigned automatically.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {hardware.map((row, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-muted text-sm font-medium text-muted-foreground">{i + 1}</span>
              <Input aria-label="Name" placeholder="Name" value={row.name} onChange={(e) => setHardware(hardware.map((r, idx) => (idx === i ? { ...r, name: e.target.value } : r)))} className="h-9 min-w-32 flex-1" />
              <Input aria-label="Description" placeholder="Description" value={row.description} onChange={(e) => setHardware(hardware.map((r, idx) => (idx === i ? { ...r, description: e.target.value } : r)))} className="h-9 min-w-32 flex-1" />
              <Input aria-label="Quantity" placeholder="Qty" inputMode="decimal" value={row.quantity} onChange={(e) => setHardware(hardware.map((r, idx) => (idx === i ? { ...r, quantity: e.target.value } : r)))} className="h-9 w-20" />
              <Input aria-label="Unit" placeholder="Unit" value={row.unit} onChange={(e) => setHardware(hardware.map((r, idx) => (idx === i ? { ...r, unit: e.target.value } : r)))} className="h-9 w-24" />
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Remove row" onClick={() => setHardware(hardware.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => setHardware([...hardware, emptyHardware()])}>
            <Plus className="size-4" /> Add hardware row
          </Button>
        </CardContent>
      </Card>

      {/* Packaging */}
      <Card>
        <CardHeader>
          <CardTitle>Packaging</CardTitle>
          <CardDescription>Packaging details for this item.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="corrugated_box">Corrugated box</Label>
            <Input id="corrugated_box" value={packaging.corrugated_box} onChange={(e) => setPackaging({ ...packaging, corrugated_box: e.target.value })} placeholder="Box used" className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="labels">Labels</Label>
            <Input id="labels" value={packaging.labels} onChange={(e) => setPackaging({ ...packaging, labels: e.target.value })} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="barcode">Barcode</Label>
            <Input id="barcode" value={packaging.barcode} onChange={(e) => setPackaging({ ...packaging, barcode: e.target.value })} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="corners">Corners</Label>
            <Input id="corners" value={packaging.corners} onChange={(e) => setPackaging({ ...packaging, corners: e.target.value })} className="h-9" />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push('/skus')} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save item'}
        </Button>
      </div>
    </form>
  )
}
