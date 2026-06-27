'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { createDailyUpdates } from './actions'
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
type Row = { po_id: string; sku_id: string; supervisor_name: string; work_done: string; remark: string }

const emptyRow = (): Row => ({ po_id: '', sku_id: '', supervisor_name: '', work_done: '', remark: '' })
const today = () => new Date().toISOString().slice(0, 10)

const cellInput =
  'h-9 w-full bg-transparent px-2 text-sm outline-none focus:bg-primary/10'
const cellTrigger =
  'h-9 w-full rounded-none border-0 px-2 text-sm shadow-none focus-visible:ring-0'

export function DailyForm({ pos, skus, defaultName }: { pos: POOpt[]; skus: SkuOpt[]; defaultName: string }) {
  const router = useRouter()
  const [date, setDate] = useState(today())
  const [rows, setRows] = useState<Row[]>([
    { ...emptyRow(), supervisor_name: defaultName },
    emptyRow(),
    emptyRow(),
  ])
  const [submitting, setSubmitting] = useState(false)

  function set(i: number, key: keyof Row, value: string) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const res = await createDailyUpdates(
      date,
      rows.map((r) => ({
        po_id: r.po_id || null,
        sku_id: r.sku_id || null,
        supervisor_name: r.supervisor_name.trim() || null,
        work_done: r.work_done.trim() || null,
        remark: r.remark.trim() || null,
      })),
    )
    if (res.error) {
      toast.error(res.error)
      setSubmitting(false)
      return
    }
    toast.success('Updates saved')
    setRows([{ ...emptyRow(), supervisor_name: defaultName }, emptyRow(), emptyRow()])
    setSubmitting(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Add daily updates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9 w-44" />
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[54rem] border-collapse text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="border-r border-b px-2 py-1.5 text-left text-xs font-medium" style={{ width: '9rem' }}>PO</th>
                  <th className="border-r border-b px-2 py-1.5 text-left text-xs font-medium" style={{ width: '13rem' }}>Item (SKU)</th>
                  <th className="border-r border-b px-2 py-1.5 text-left text-xs font-medium" style={{ width: '10rem' }}>Supervisor</th>
                  <th className="border-r border-b px-2 py-1.5 text-left text-xs font-medium">Work done</th>
                  <th className="border-r border-b px-2 py-1.5 text-left text-xs font-medium">Remark</th>
                  <th className="w-10 border-b" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    <td className="border-r border-b p-0" style={{ width: '9rem' }}>
                      <Select value={row.po_id} onValueChange={(v) => set(i, 'po_id', v)}>
                        <SelectTrigger className={cellTrigger}>
                          <SelectValue placeholder="PO…" />
                        </SelectTrigger>
                        <SelectContent>
                          {pos.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.po_no}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="border-r border-b p-0" style={{ width: '13rem' }}>
                      <Select value={row.sku_id} onValueChange={(v) => set(i, 'sku_id', v)}>
                        <SelectTrigger className={cellTrigger}>
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
                    <td className="border-r border-b p-0" style={{ width: '10rem' }}>
                      <input aria-label="Supervisor" value={row.supervisor_name} onChange={(e) => set(i, 'supervisor_name', e.target.value)} className={cellInput} />
                    </td>
                    <td className="border-r border-b p-0">
                      <input aria-label="Work done" value={row.work_done} onChange={(e) => set(i, 'work_done', e.target.value)} className={cellInput} />
                    </td>
                    <td className="border-r border-b p-0">
                      <input aria-label="Remark" value={row.remark} onChange={(e) => set(i, 'remark', e.target.value)} className={cellInput} />
                    </td>
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

          <div className="flex items-center justify-between">
            <Button type="button" variant="outline" size="sm" onClick={() => setRows((prev) => [...prev, emptyRow()])}>
              <Plus className="size-4" />
              Add row
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : 'Submit updates'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
