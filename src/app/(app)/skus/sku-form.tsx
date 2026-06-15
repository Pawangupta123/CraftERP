'use client'

import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ImagePlus, Plus, Trash2, X } from 'lucide-react'
import { uploadImage } from '@/lib/upload'
import { compressImage } from '@/lib/compress-image'
import { perPieceCbm, cartonCbm, roundCbm } from '@/lib/cbm'
import { createSku, updateSku, type SkuPayload } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type WoodRow = { description: string; length: string; thickness: string; breadth: string; quantity: string }
type IronRow = { description: string; section: string; length: string; width: string; remark: string; photos: PhotoItem[] }
type HardwareRow = { name: string; description: string; quantity: string; unit: string }
type PackagingMaterialRow = { material: string; specification: string; quantity: string }
type CartonRow = { description: string; length: string; width: string; height: string; pcs_per_carton: string }
// A photo is either already uploaded (url) or a freshly picked local file pending upload.
type PhotoItem = { url?: string; file?: File; preview: string }

export type SkuInitial = {
  id: string
  sku_no: string
  name: string
  photos: string[]
  description: string
  remark: string
  wood: WoodRow[]
  iron: IronRow[]
  hardware: HardwareRow[]
  packaging_materials: PackagingMaterialRow[]
  cartons: CartonRow[]
}

const emptyWood = (): WoodRow => ({ description: '', length: '', thickness: '', breadth: '', quantity: '' })
const emptyIron = (): IronRow => ({ description: '', section: '', length: '', width: '', remark: '', photos: [] })
const emptyHardware = (): HardwareRow => ({ name: '', description: '', quantity: '', unit: '' })
const emptyPackagingMaterial = (): PackagingMaterialRow => ({ material: '', specification: '', quantity: '' })
const emptyCarton = (): CartonRow => ({ description: '', length: '', width: '', height: '', pcs_per_carton: '' })

const num = (v: string): number | null => {
  const t = v.trim()
  if (!t) return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}
const str = (v: string): string | null => v.trim() || null

const ROW_GRID = 'grid grid-cols-2 gap-2'

export function SkuForm({ initial }: { initial?: SkuInitial }) {
  const router = useRouter()
  const editing = Boolean(initial)

  const [skuNo, setSkuNo] = useState(initial?.sku_no ?? '')
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [remark, setRemark] = useState(initial?.remark ?? '')

  const [photos, setPhotos] = useState<PhotoItem[]>(
    (initial?.photos ?? []).map((url) => ({ url, preview: url })),
  )

  const [wood, setWood] = useState<WoodRow[]>(initial?.wood.length ? initial.wood : [emptyWood()])
  const [iron, setIron] = useState<IronRow[]>(initial?.iron ?? [])
  const [hardware, setHardware] = useState<HardwareRow[]>(initial?.hardware.length ? initial.hardware : [emptyHardware()])
  const [packagingMaterials, setPackagingMaterials] = useState<PackagingMaterialRow[]>(
    initial?.packaging_materials.length ? initial.packaging_materials : [emptyPackagingMaterial()],
  )
  const [cartons, setCartons] = useState<CartonRow[]>(initial?.cartons.length ? initial.cartons : [emptyCarton()])

  const [submitting, setSubmitting] = useState(false)

  // Live CBM contributed by one ordered piece, summed across cartons.
  const cbmPerPiece = roundCbm(
    perPieceCbm(
      cartons.map((c) => ({
        length: num(c.length),
        width: num(c.width),
        height: num(c.height),
        pcs_per_carton: num(c.pcs_per_carton),
      })),
    ),
  )

  function onPhotosChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setPhotos((prev) => [...prev, ...files.map((file) => ({ file, preview: URL.createObjectURL(file) }))])
    e.target.value = '' // allow picking the same file again after removing it
  }

  function removePhotoAt(i: number) {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i))
  }

  function addIronPhotos(rowIdx: number, files: File[]) {
    if (files.length === 0) return
    setIron((prev) =>
      prev.map((r, i) =>
        i === rowIdx ? { ...r, photos: [...r.photos, ...files.map((f) => ({ file: f, preview: URL.createObjectURL(f) }))] } : r,
      ),
    )
  }

  function removeIronPhoto(rowIdx: number, photoIdx: number) {
    setIron((prev) => prev.map((r, i) => (i === rowIdx ? { ...r, photos: r.photos.filter((_, pi) => pi !== photoIdx) } : r)))
  }

  async function uploadPhoto(file: File): Promise<string | null> {
    const compressed = await compressImage(file)
    const fd = new FormData()
    fd.append('file', compressed)
    const res = await uploadImage(fd)
    if (res.error || !res.url) {
      toast.error(res.error ?? 'Photo upload failed.')
      return null
    }
    return res.url
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Item name is required.')
      return
    }
    setSubmitting(true)

    // Upload any newly added photos; keep already-uploaded ones in their current order.
    const photo_urls: string[] = []
    for (const p of photos) {
      if (p.url) {
        photo_urls.push(p.url)
      } else if (p.file) {
        const url = await uploadPhoto(p.file)
        if (!url) {
          setSubmitting(false)
          return
        }
        photo_urls.push(url)
      }
    }

    // Upload each iron row's photos (compressed); keep already-uploaded ones in order.
    const ironPayload: SkuPayload['iron'] = []
    for (const x of iron) {
      const picture_urls: string[] = []
      for (const p of x.photos) {
        if (p.url) {
          picture_urls.push(p.url)
        } else if (p.file) {
          const url = await uploadPhoto(p.file)
          if (!url) {
            setSubmitting(false)
            return
          }
          picture_urls.push(url)
        }
      }
      ironPayload.push({
        description: str(x.description),
        section: str(x.section),
        length: num(x.length),
        width: num(x.width),
        remark: str(x.remark),
        picture_urls,
      })
    }

    const payload: SkuPayload = {
      sku_no: skuNo,
      name,
      photo_urls,
      description: str(description),
      remark: str(remark),
      wood: wood.map((w) => ({
        description: str(w.description),
        length: num(w.length),
        thickness: num(w.thickness),
        breadth: num(w.breadth),
        quantity: num(w.quantity),
      })),
      iron: ironPayload,
      hardware: hardware.map((h) => ({
        name: str(h.name),
        description: str(h.description),
        quantity: num(h.quantity),
        unit: str(h.unit),
      })),
      packaging_materials: packagingMaterials.map((m) => ({
        material: str(m.material),
        specification: str(m.specification),
        quantity: str(m.quantity),
      })),
      cartons: cartons.map((c) => ({
        description: str(c.description),
        length: num(c.length),
        width: num(c.width),
        height: num(c.height),
        pcs_per_carton: num(c.pcs_per_carton),
      })),
    }

    const res = editing ? await updateSku(initial!.id, payload) : await createSku(payload)
    if (res.error) {
      toast.error(res.error)
      setSubmitting(false)
      return
    }
    toast.success(editing ? 'Item updated' : 'Item created')
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
            <Label>Photos</Label>
            <div className="flex flex-wrap items-center gap-3">
              {photos.map((p, i) => (
                <div key={i} className="relative size-20 overflow-hidden rounded-lg border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.preview} alt={`Photo ${i + 1}`} className="size-full object-cover" />
                  <button
                    type="button"
                    aria-label="Remove photo"
                    onClick={() => removePhotoAt(i)}
                    className="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-background/80 text-muted-foreground shadow-sm transition-colors hover:text-destructive"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
              <label className="flex size-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed bg-muted/40 text-muted-foreground transition-colors hover:bg-muted">
                <ImagePlus className="size-5" />
                <span className="text-[10px]">Add</span>
                <input type="file" accept="image/*" multiple onChange={onPhotosChange} className="hidden" />
              </label>
            </div>
            <p className="text-xs text-muted-foreground">Add one or more product photos (optional). The first is used as the thumbnail and shown on the PO.</p>
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
          <CardDescription>Per-piece dimensions. Add a row for each different size.</CardDescription>
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
          <CardDescription>Iron components used in this item. Add one or more photos per row.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {iron.length === 0 ? (
            <p className="text-sm text-muted-foreground">No iron components.</p>
          ) : (
            iron.map((row, i) => (
              <div key={i} className="space-y-2 rounded-lg border p-3">
                <div className={`${ROW_GRID} sm:grid-cols-[minmax(0,1.4fr)_7rem_5rem_5rem_minmax(0,1fr)_2.25rem] sm:gap-2`}>
                  <Input aria-label="Description" placeholder="Description" value={row.description} onChange={(e) => setIron(iron.map((r, idx) => (idx === i ? { ...r, description: e.target.value } : r)))} className="col-span-2 h-9 sm:col-span-1" />
                  <Input aria-label="Section" placeholder="Section" value={row.section} onChange={(e) => setIron(iron.map((r, idx) => (idx === i ? { ...r, section: e.target.value } : r)))} className="h-9" />
                  <Input aria-label="Length" placeholder="Length" inputMode="decimal" value={row.length} onChange={(e) => setIron(iron.map((r, idx) => (idx === i ? { ...r, length: e.target.value } : r)))} className="h-9" />
                  <Input aria-label="Width" placeholder="Width" inputMode="decimal" value={row.width} onChange={(e) => setIron(iron.map((r, idx) => (idx === i ? { ...r, width: e.target.value } : r)))} className="h-9" />
                  <Input aria-label="Remark" placeholder="Remark" value={row.remark} onChange={(e) => setIron(iron.map((r, idx) => (idx === i ? { ...r, remark: e.target.value } : r)))} className="col-span-2 h-9 sm:col-span-1" />
                  <Button type="button" variant="ghost" size="icon-sm" aria-label="Remove row" onClick={() => setIron(iron.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {row.photos.map((p, pi) => (
                    <div key={pi} className="relative size-16 overflow-hidden rounded-md border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.preview} alt={`Iron photo ${pi + 1}`} className="size-full object-cover" />
                      <button
                        type="button"
                        aria-label="Remove photo"
                        onClick={() => removeIronPhoto(i, pi)}
                        className="absolute top-0.5 right-0.5 grid size-4 place-items-center rounded-full bg-background/80 text-muted-foreground shadow-sm transition-colors hover:text-destructive"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                  <label className="flex size-16 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-md border border-dashed bg-muted/40 text-muted-foreground transition-colors hover:bg-muted">
                    <ImagePlus className="size-4" />
                    <span className="text-[9px]">Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        addIronPhotos(i, Array.from(e.target.files ?? []))
                        e.target.value = ''
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ))
          )}
          <Button type="button" variant="outline" size="sm" onClick={() => setIron([...iron, emptyIron()])}>
            <Plus className="size-4" /> Add iron row
          </Button>
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

      {/* Carton & CBM */}
      <Card>
        <CardHeader>
          <CardTitle>Carton Size Master</CardTitle>
          <CardDescription>
            Carton size in cm — CBM is auto-calculated: (L × W × H ÷ 1,000,000) ÷ pieces per carton, summed across rows.
            On a PO it becomes CBM × ordered quantity. (Leave pieces per carton blank for 1.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="hidden px-1 text-xs font-medium text-muted-foreground sm:grid sm:grid-cols-[minmax(0,1fr)_4.5rem_4.5rem_4.5rem_5rem_4.5rem_2.25rem] sm:gap-2">
            <span>Description</span>
            <span>Length</span>
            <span>Width</span>
            <span>Height</span>
            <span>Pcs/carton</span>
            <span>CBM</span>
            <span />
          </div>
          {cartons.map((row, i) => {
            const rowCbm = roundCbm(
              cartonCbm({
                length: num(row.length),
                width: num(row.width),
                height: num(row.height),
                pcs_per_carton: num(row.pcs_per_carton),
              }),
            )
            return (
              <div key={i} className={`${ROW_GRID} sm:grid-cols-[minmax(0,1fr)_4.5rem_4.5rem_4.5rem_5rem_4.5rem_2.25rem] sm:gap-2`}>
                <Input aria-label="Carton description" placeholder="e.g. Master carton" value={row.description} onChange={(e) => setCartons(cartons.map((r, idx) => (idx === i ? { ...r, description: e.target.value } : r)))} className="col-span-2 h-9 sm:col-span-1" />
                <Input aria-label="Length (cm)" placeholder="L cm" inputMode="decimal" value={row.length} onChange={(e) => setCartons(cartons.map((r, idx) => (idx === i ? { ...r, length: e.target.value } : r)))} className="h-9" />
                <Input aria-label="Width (cm)" placeholder="W cm" inputMode="decimal" value={row.width} onChange={(e) => setCartons(cartons.map((r, idx) => (idx === i ? { ...r, width: e.target.value } : r)))} className="h-9" />
                <Input aria-label="Height (cm)" placeholder="H cm" inputMode="decimal" value={row.height} onChange={(e) => setCartons(cartons.map((r, idx) => (idx === i ? { ...r, height: e.target.value } : r)))} className="h-9" />
                <Input aria-label="Pieces per carton" placeholder="Pcs" inputMode="decimal" value={row.pcs_per_carton} onChange={(e) => setCartons(cartons.map((r, idx) => (idx === i ? { ...r, pcs_per_carton: e.target.value } : r)))} className="h-9" />
                <div className="hidden h-9 items-center px-1 text-sm tabular-nums text-muted-foreground sm:flex">{rowCbm}</div>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Remove carton" onClick={() => setCartons(cartons.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            )
          })}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => setCartons([...cartons, emptyCarton()])}>
              <Plus className="size-4" /> Add carton
            </Button>
            <div className="rounded-lg border bg-muted/30 px-3 py-1.5 text-sm">
              <span className="text-muted-foreground">CBM per piece: </span>
              <span className="font-heading font-semibold tabular-nums">{cbmPerPiece}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Packaging Material */}
      <Card>
        <CardHeader>
          <CardTitle>Packaging Material</CardTitle>
          <CardDescription>Materials used for packing — material, specification/size and quantity. Add as many rows as you need.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="hidden px-1 text-xs font-medium text-muted-foreground sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_7rem_2.25rem] sm:gap-2">
            <span>Material</span>
            <span>Specification / size</span>
            <span>Quantity</span>
            <span />
          </div>
          {packagingMaterials.map((row, i) => (
            <div key={i} className={`${ROW_GRID} sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_7rem_2.25rem] sm:gap-2`}>
              <Input aria-label="Material" placeholder="e.g. Corrugated box / corner / foam" value={row.material} onChange={(e) => setPackagingMaterials(packagingMaterials.map((r, idx) => (idx === i ? { ...r, material: e.target.value } : r)))} className="col-span-2 h-9 sm:col-span-1" />
              <Input aria-label="Specification" placeholder="e.g. 4 x 4 x 20 cm" value={row.specification} onChange={(e) => setPackagingMaterials(packagingMaterials.map((r, idx) => (idx === i ? { ...r, specification: e.target.value } : r)))} className="col-span-2 h-9 sm:col-span-1" />
              <Input aria-label="Quantity" placeholder="e.g. 8" value={row.quantity} onChange={(e) => setPackagingMaterials(packagingMaterials.map((r, idx) => (idx === i ? { ...r, quantity: e.target.value } : r)))} className="h-9" />
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Remove material" onClick={() => setPackagingMaterials(packagingMaterials.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => setPackagingMaterials([...packagingMaterials, emptyPackagingMaterial()])}>
            <Plus className="size-4" /> Add packaging material
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push('/skus')} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : editing ? 'Save changes' : 'Save item'}
        </Button>
      </div>
    </form>
  )
}
