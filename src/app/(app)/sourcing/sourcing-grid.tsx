'use client'

import { Fragment, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Save, Trash2, UserPlus, X } from 'lucide-react'
import { saveAllSourcing, type SourcingRowInput } from './actions'
import { Button } from '@/components/ui/button'
import type { Database } from '@/lib/database.types'

type Entry = Database['public']['Tables']['sourcing_entries']['Row']

/** Default vendor columns shown — fits the screen; user can add as many as needed. */
const DEFAULT_VENDORS = 4
type VendorCell = { name: string; price: string }
type Row = { id?: string; item: string; price: string; unit: string; vendors: VendorCell[]; remark: string }

const emptyVendors = (n: number): VendorCell[] => Array.from({ length: n }, () => ({ name: '', price: '' }))
const emptyRow = (n: number): Row => ({ item: '', price: '', unit: '', vendors: emptyVendors(n), remark: '' })

function padVendors(v: Entry['vendors'], n: number): VendorCell[] {
  const arr = Array.isArray(v) ? v : []
  const out: VendorCell[] = arr.map((x) => {
    const o = (x ?? {}) as { name?: unknown; price?: unknown }
    return { name: o.name != null ? String(o.name) : '', price: o.price != null ? String(o.price) : '' }
  })
  while (out.length < n) out.push({ name: '', price: '' })
  return out
}

const toRow = (e: Entry, n: number): Row => ({
  id: e.id,
  item: e.item ?? '',
  price: e.price?.toString() ?? '',
  unit: e.unit ?? '',
  vendors: padVendors(e.vendors, n),
  remark: e.remark ?? '',
})

const num = (v: string): number | null => {
  const t = v.trim()
  if (!t) return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}
const str = (v: string): string | null => v.trim() || null

/** Keep vendor columns up to the last filled one (preserves column alignment, drops trailing blanks). */
function packVendors(vendors: VendorCell[]) {
  let last = -1
  vendors.forEach((v, i) => {
    if (v.name.trim() || v.price.trim()) last = i
  })
  return vendors.slice(0, last + 1).map((v) => ({ name: str(v.name), price: num(v.price) }))
}

const CELL = 'h-9 w-full bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground/50 focus:bg-accent/50'

export function SourcingGrid({ initial }: { initial: Entry[] }) {
  const router = useRouter()
  const initialCount = Math.max(
    DEFAULT_VENDORS,
    ...initial.map((e) => (Array.isArray(e.vendors) ? e.vendors.length : 0)),
  )
  const [vendorCount, setVendorCount] = useState(initialCount)
  const [rows, setRows] = useState<Row[]>(
    initial.length ? initial.map((e) => toRow(e, initialCount)) : [emptyRow(initialCount)],
  )
  const [saving, setSaving] = useState(false)

  function setField(i: number, field: 'item' | 'price' | 'unit' | 'remark', value: string) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)))
  }
  function setVendor(i: number, vi: number, field: 'name' | 'price', value: string) {
    setRows((prev) =>
      prev.map((r, idx) =>
        idx === i ? { ...r, vendors: r.vendors.map((v, j) => (j === vi ? { ...v, [field]: value } : v)) } : r,
      ),
    )
  }

  function addVendor() {
    setVendorCount((n) => n + 1)
    setRows((prev) => prev.map((r) => ({ ...r, vendors: [...r.vendors, { name: '', price: '' }] })))
  }
  function removeVendor(vi: number) {
    if (vendorCount <= 1) return
    setVendorCount((n) => n - 1)
    setRows((prev) => prev.map((r) => ({ ...r, vendors: r.vendors.filter((_, j) => j !== vi) })))
  }

  async function save() {
    setSaving(true)
    const payload: SourcingRowInput[] = rows.map((r) => ({
      id: r.id,
      item: str(r.item),
      price: num(r.price),
      unit: str(r.unit),
      remark: str(r.remark),
      vendors: packVendors(r.vendors),
    }))
    const res = await saveAllSourcing(payload)
    if (res.error) {
      toast.error(res.error)
      setSaving(false)
      return
    }
    toast.success('Sourcing saved')
    setSaving(false)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground">
              <th rowSpan={2} className="border-r px-2 py-2 align-bottom">Commodity</th>
              <th rowSpan={2} className="border-r px-2 py-2 align-bottom">Price</th>
              <th rowSpan={2} className="border-r px-2 py-2 align-bottom">Unit</th>
              {Array.from({ length: vendorCount }, (_, v) => (
                <th key={v} colSpan={2} className="border-r border-l px-2 py-1 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span>Vendor {v + 1}</span>
                    {vendorCount > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeVendor(v)}
                        aria-label={`Remove vendor ${v + 1}`}
                        title="Remove vendor"
                        className="rounded p-0.5 text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="size-3" />
                      </button>
                    ) : null}
                  </div>
                </th>
              ))}
              <th rowSpan={2} className="border-l px-1 py-2 align-middle">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={addVendor}
                  aria-label="Add vendor"
                  title="Add vendor"
                >
                  <UserPlus className="size-4" />
                </Button>
              </th>
              <th rowSpan={2} className="border-r border-l px-2 py-2 align-bottom">Remark</th>
              <th rowSpan={2} className="w-0 px-1 py-2" />
            </tr>
            <tr className="border-b bg-muted/30 text-left text-[10px] font-medium text-muted-foreground">
              {Array.from({ length: vendorCount }, (_, v) => (
                <Fragment key={v}>
                  <th className="border-l px-2 py-1">Name</th>
                  <th className="border-r px-2 py-1">Price</th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id ?? `new-${i}`} className="border-b last:border-0">
                <td className="border-r p-0">
                  <input className={`${CELL} min-w-40`} value={row.item} onChange={(e) => setField(i, 'item', e.target.value)} placeholder="Commodity" />
                </td>
                <td className="border-r p-0">
                  <input className={`${CELL} min-w-20 text-right tabular-nums`} inputMode="decimal" value={row.price} onChange={(e) => setField(i, 'price', e.target.value)} placeholder="0" />
                </td>
                <td className="border-r p-0">
                  <input className={`${CELL} min-w-16`} value={row.unit} onChange={(e) => setField(i, 'unit', e.target.value)} placeholder="kg" />
                </td>
                {row.vendors.map((v, vi) => (
                  <Fragment key={vi}>
                    <td className="border-l p-0">
                      <input className={`${CELL} min-w-28`} value={v.name} onChange={(e) => setVendor(i, vi, 'name', e.target.value)} placeholder="Vendor" />
                    </td>
                    <td className="border-r p-0">
                      <input className={`${CELL} min-w-20 text-right tabular-nums`} inputMode="decimal" value={v.price} onChange={(e) => setVendor(i, vi, 'price', e.target.value)} placeholder="0" />
                    </td>
                  </Fragment>
                ))}
                <td className="border-l p-0" />
                <td className="border-r border-l p-0">
                  <input className={`${CELL} min-w-36`} value={row.remark} onChange={(e) => setField(i, 'remark', e.target.value)} placeholder="Note" />
                </td>
                <td className="p-1 align-middle">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove row"
                    onClick={() => setRows((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : [emptyRow(vendorCount)]))}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setRows((prev) => [...prev, emptyRow(vendorCount)])}>
            <Plus className="size-4" /> Add row
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={addVendor}>
            <UserPlus className="size-4" /> Add vendor
          </Button>
        </div>
        <Button type="button" onClick={save} disabled={saving}>
          <Save className="size-4" /> {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  )
}
