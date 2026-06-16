'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Save, Trash2 } from 'lucide-react'
import { saveAllSourcing, type SourcingRowInput } from './actions'
import { Button } from '@/components/ui/button'
import type { Database } from '@/lib/database.types'

type Entry = Database['public']['Tables']['sourcing_entries']['Row']

type Row = {
  id?: string
  item: string
  supplier: string
  quantity: string
  unit: string
  rate: string
  status: string
  date: string
  remark: string
}

const emptyRow = (): Row => ({ item: '', supplier: '', quantity: '', unit: '', rate: '', status: '', date: '', remark: '' })

const toRow = (e: Entry): Row => ({
  id: e.id,
  item: e.item ?? '',
  supplier: e.supplier ?? '',
  quantity: e.quantity?.toString() ?? '',
  unit: e.unit ?? '',
  rate: e.rate?.toString() ?? '',
  status: e.status ?? '',
  date: e.date ?? '',
  remark: e.remark ?? '',
})

const num = (v: string): number | null => {
  const t = v.trim()
  if (!t) return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}
const str = (v: string): string | null => v.trim() || null

const CELL = 'h-9 w-full bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground/50 focus:bg-accent/50'

export function SourcingGrid({ initial }: { initial: Entry[] }) {
  const router = useRouter()
  const [rows, setRows] = useState<Row[]>(initial.length ? initial.map(toRow) : [emptyRow()])
  const [saving, setSaving] = useState(false)

  function set(i: number, field: keyof Row, value: string) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)))
  }

  async function save() {
    setSaving(true)
    const payload: SourcingRowInput[] = rows.map((r) => ({
      id: r.id,
      item: str(r.item),
      supplier: str(r.supplier),
      quantity: num(r.quantity),
      unit: str(r.unit),
      rate: num(r.rate),
      status: str(r.status),
      date: r.date || null,
      remark: str(r.remark),
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
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground">
              <th className="border-r px-2 py-2">Material / Item</th>
              <th className="border-r px-2 py-2">Supplier</th>
              <th className="border-r px-2 py-2">Quantity</th>
              <th className="border-r px-2 py-2">Unit</th>
              <th className="border-r px-2 py-2">Rate</th>
              <th className="border-r px-2 py-2">Status</th>
              <th className="border-r px-2 py-2">Date</th>
              <th className="border-r px-2 py-2">Remark</th>
              <th className="w-0 px-1 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id ?? `new-${i}`} className="border-b last:border-0">
                <td className="border-r p-0">
                  <input className={`${CELL} min-w-44`} value={row.item} onChange={(e) => set(i, 'item', e.target.value)} placeholder="Material" />
                </td>
                <td className="border-r p-0">
                  <input className={`${CELL} min-w-36`} value={row.supplier} onChange={(e) => set(i, 'supplier', e.target.value)} placeholder="Supplier" />
                </td>
                <td className="border-r p-0">
                  <input className={`${CELL} min-w-24 text-right tabular-nums`} inputMode="decimal" value={row.quantity} onChange={(e) => set(i, 'quantity', e.target.value)} placeholder="0" />
                </td>
                <td className="border-r p-0">
                  <input className={`${CELL} min-w-20`} value={row.unit} onChange={(e) => set(i, 'unit', e.target.value)} placeholder="cft" />
                </td>
                <td className="border-r p-0">
                  <input className={`${CELL} min-w-24 text-right tabular-nums`} inputMode="decimal" value={row.rate} onChange={(e) => set(i, 'rate', e.target.value)} placeholder="0.00" />
                </td>
                <td className="border-r p-0">
                  <input className={`${CELL} min-w-28`} list="sourcing-status" value={row.status} onChange={(e) => set(i, 'status', e.target.value)} placeholder="Pending" />
                </td>
                <td className="border-r p-0">
                  <input className={`${CELL} min-w-36`} type="date" value={row.date} onChange={(e) => set(i, 'date', e.target.value)} />
                </td>
                <td className="border-r p-0">
                  <input className={`${CELL} min-w-44`} value={row.remark} onChange={(e) => set(i, 'remark', e.target.value)} placeholder="Note" />
                </td>
                <td className="p-1 align-middle">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove row"
                    onClick={() => setRows((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : [emptyRow()]))}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <datalist id="sourcing-status">
          <option value="Pending" />
          <option value="Ordered" />
          <option value="Received" />
        </datalist>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setRows((prev) => [...prev, emptyRow()])}>
          <Plus className="size-4" /> Add row
        </Button>
        <Button type="button" onClick={save} disabled={saving}>
          <Save className="size-4" /> {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  )
}
