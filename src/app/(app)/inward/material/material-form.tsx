'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { createMaterialInward, type MaterialRow } from './actions'
import { MATERIAL_COLUMNS, MATERIAL_TYPES, type ColKey, type MaterialType } from '@/lib/material-inward'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type POOpt = { id: string; po_no: string }
type SkuOpt = { id: string; sku_no: string; name: string }
type Row = Record<ColKey, string> & { sku_id: string }

const emptyRow = (): Row => ({
  sku_id: '',
  name: '',
  description: '',
  section: '',
  length: '',
  width: '',
  qty: '',
  unit: '',
  remark: '',
})
const num = (v: string): number | null => {
  const t = v.trim()
  if (!t) return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}
const str = (v: string): string | null => v.trim() || null
const today = () => new Date().toISOString().slice(0, 10)

function HeaderField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="h-9" />
    </div>
  )
}

export function MaterialInwardForm({ pos, skus }: { pos: POOpt[]; skus: SkuOpt[] }) {
  const router = useRouter()
  const [materialType, setMaterialType] = useState<MaterialType>('iron')
  const [poId, setPoId] = useState('')
  const [date, setDate] = useState(today())
  const [party, setParty] = useState('')
  const [vehicleNo, setVehicleNo] = useState('')
  const [invoiceNo, setInvoiceNo] = useState('')
  const [remark, setRemark] = useState('')
  const [rows, setRows] = useState<Row[]>([emptyRow(), emptyRow(), emptyRow()])
  const [submitting, setSubmitting] = useState(false)

  const columns = MATERIAL_COLUMNS[materialType]

  function setCell(i: number, key: ColKey, value: string) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)))
  }
  function setSku(i: number, value: string) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, sku_id: value } : r)))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const payloadRows: MaterialRow[] = rows.map((r) => ({
      sku_id: r.sku_id || null,
      name: str(r.name),
      description: str(r.description),
      section: str(r.section),
      length: num(r.length),
      width: num(r.width),
      qty: num(r.qty),
      unit: str(r.unit),
      remark: str(r.remark),
    }))
    setSubmitting(true)
    const res = await createMaterialInward({
      material_type: materialType,
      po_id: poId || null,
      date: date || null,
      party: str(party),
      vehicle_no: str(vehicleNo),
      invoice_no: str(invoiceNo),
      remark: str(remark),
      rows: payloadRows,
    })
    if (res.error || !res.id) {
      toast.error(res.error ?? 'Could not save.')
      setSubmitting(false)
      return
    }
    toast.success('Inward saved')
    router.push('/inward')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Material inward</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Material type</Label>
            <Select value={materialType} onValueChange={(v) => setMaterialType(v as MaterialType)}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MATERIAL_TYPES.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Purchase order</Label>
            <Select value={poId} onValueChange={setPoId}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Select PO (optional)" />
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
          <HeaderField label="Date" type="date" value={date} onChange={setDate} />
          <HeaderField label="Supplier / Party" value={party} onChange={setParty} />
          <HeaderField label="Vehicle No." value={vehicleNo} onChange={setVehicleNo} />
          <HeaderField label="Invoice No." value={invoiceNo} onChange={setInvoiceNo} />
          <div className="sm:col-span-3">
            <HeaderField label="Remark" value={remark} onChange={setRemark} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 pt-4">
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[42rem] border-collapse text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="w-10 border-r border-b py-1.5 text-center text-xs font-medium">#</th>
                  <th className="border-r border-b px-2 py-1.5 text-left text-xs font-medium whitespace-nowrap" style={{ width: '12rem' }}>
                    Item (SKU)
                  </th>
                  {columns.map((c) => (
                    <th
                      key={c.key}
                      className="border-r border-b px-2 py-1.5 text-left text-xs font-medium whitespace-nowrap"
                      style={c.width ? { width: c.width } : undefined}
                    >
                      {c.label}
                    </th>
                  ))}
                  <th className="w-10 border-b" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    <td className="border-r border-b text-center text-xs text-muted-foreground">{i + 1}</td>
                    <td className="border-r border-b p-0" style={{ width: '12rem' }}>
                      <Select value={row.sku_id} onValueChange={(v) => setSku(i, v)}>
                        <SelectTrigger className="h-9 w-full rounded-none border-0 px-2 text-xs shadow-none focus-visible:ring-0">
                          <SelectValue placeholder="Item…" />
                        </SelectTrigger>
                        <SelectContent>
                          {skus.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.sku_no} — {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    {columns.map((c) => (
                      <td key={c.key} className="border-r border-b p-0" style={c.width ? { width: c.width } : undefined}>
                        <input
                          aria-label={c.label}
                          inputMode={c.numeric ? 'decimal' : undefined}
                          value={row[c.key]}
                          onChange={(e) => setCell(i, c.key, e.target.value)}
                          className={`h-9 w-full bg-transparent px-2 text-sm outline-none focus:bg-primary/10 ${c.numeric ? 'text-right tabular-nums' : ''}`}
                        />
                      </td>
                    ))}
                    <td className="border-b p-0">
                      <button
                        type="button"
                        aria-label="Remove row"
                        onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
                        className="grid h-9 w-10 place-items-center text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => setRows((prev) => [...prev, emptyRow()])}>
            <Plus className="size-4" />
            Add row
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push('/inward')} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save inward'}
        </Button>
      </div>
    </form>
  )
}
