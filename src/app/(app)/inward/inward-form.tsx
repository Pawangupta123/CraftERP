'use client'

import { useCallback, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { createInward, type InwardWoodItem } from './actions'
import { NaapiGrid, type Cells } from './naapi-grid'
import { cellCft, roundCft } from '@/lib/inward-cft'
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
type Section = { id: string; thickness: string; cells: Cells }

const today = () => new Date().toISOString().slice(0, 10)

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-9" />
    </div>
  )
}

export function InwardForm({ pos }: { pos: POOpt[] }) {
  const router = useRouter()
  const idRef = useRef(1)

  const [poId, setPoId] = useState('')
  const [date, setDate] = useState(today())
  const [party, setParty] = useState('')
  const [vehicleNo, setVehicleNo] = useState('')
  const [invoiceNo, setInvoiceNo] = useState('')
  const [woodType, setWoodType] = useState('')
  const [remark, setRemark] = useState('')
  const [sections, setSections] = useState<Section[]>([{ id: 's1', thickness: '', cells: {} }])
  const [submitting, setSubmitting] = useState(false)

  const onCellChange = useCallback((sectionId: string, key: string, pieces: number) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, cells: { ...s.cells, [key]: pieces } } : s)),
    )
  }, [])

  function addSection() {
    idRef.current += 1
    setSections((prev) => [...prev, { id: `s${idRef.current}`, thickness: '', cells: {} }])
  }
  function removeSection(id: string) {
    setSections((prev) => prev.filter((s) => s.id !== id))
  }
  function setThickness(id: string, value: string) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, thickness: value } : s)))
  }

  let totalCft = 0
  let totalPieces = 0
  for (const s of sections) {
    const t = Number(s.thickness) || 0
    for (const [key, pcs] of Object.entries(s.cells)) {
      if (!pcs) continue
      totalPieces += pcs
      const [w, l] = key.split('_').map(Number)
      totalCft += cellCft(w, t, l, pcs)
    }
  }
  totalCft = roundCft(totalCft)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const items: InwardWoodItem[] = []
    for (const s of sections) {
      const t = Number(s.thickness)
      if (!t) continue
      for (const [key, pcs] of Object.entries(s.cells)) {
        if (!pcs || pcs <= 0) continue
        const [w, l] = key.split('_').map(Number)
        items.push({ thickness: t, width: w, length: l, pieces: pcs, cft: roundCft(cellCft(w, t, l, pcs)) })
      }
    }
    if (items.length === 0) {
      toast.error('Enter a thickness and some pieces first.')
      return
    }
    setSubmitting(true)
    const res = await createInward({
      po_id: poId || null,
      date: date || null,
      party: party.trim() || null,
      vehicle_no: vehicleNo.trim() || null,
      invoice_no: invoiceNo.trim() || null,
      wood_type: woodType.trim() || null,
      remark: remark.trim() || null,
      items,
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
    <form onSubmit={handleSubmit} className="space-y-6 pb-4">
      <Card>
        <CardHeader>
          <CardTitle>Wood inward</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Purchase order</Label>
            <Select value={poId} onValueChange={setPoId}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Select PO (optional)" />
              </SelectTrigger>
              <SelectContent>
                {pos.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">No POs yet.</div>
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
          <Field label="Date" type="date" value={date} onChange={setDate} />
          <Field label="Wood type" value={woodType} onChange={setWoodType} placeholder="e.g. Sheesham" />
          <Field label="Supplier / Party" value={party} onChange={setParty} />
          <Field label="Vehicle No." value={vehicleNo} onChange={setVehicleNo} />
          <Field label="Invoice No." value={invoiceNo} onChange={setInvoiceNo} />
          <div className="sm:col-span-3">
            <Field label="Remark" value={remark} onChange={setRemark} />
          </div>
        </CardContent>
      </Card>

      {sections.map((s, i) => (
        <Card key={s.id}>
          <CardContent className="space-y-3 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-heading text-base font-medium">Section {i + 1}</span>
                <div className="flex items-center gap-1.5">
                  <Label htmlFor={`th-${s.id}`} className="text-xs text-muted-foreground">
                    Thickness (in)
                  </Label>
                  <Input
                    id={`th-${s.id}`}
                    inputMode="decimal"
                    value={s.thickness}
                    onChange={(e) => setThickness(s.id, e.target.value)}
                    className="h-8 w-20"
                    placeholder="e.g. 1"
                  />
                </div>
              </div>
              {sections.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remove section"
                  onClick={() => removeSection(s.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              ) : null}
            </div>

            {Number(s.thickness) ? (
              <NaapiGrid sectionId={s.id} thickness={Number(s.thickness)} cells={s.cells} onCellChange={onCellChange} />
            ) : (
              <p className="text-sm text-muted-foreground">Enter a thickness above to open the measurement grid.</p>
            )}
          </CardContent>
        </Card>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addSection}>
        <Plus className="size-4" />
        Add thickness section
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
        <div className="text-sm">
          <span className="text-muted-foreground">Total: </span>
          <span className="font-heading font-semibold tabular-nums">{totalPieces}</span> pcs ·{' '}
          <span className="font-heading font-semibold tabular-nums">{totalCft}</span> CFT
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.push('/inward')} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save inward'}
          </Button>
        </div>
      </div>
    </form>
  )
}
