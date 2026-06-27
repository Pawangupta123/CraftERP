import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { MATERIAL_COLUMNS, MATERIAL_LABEL, type MaterialType } from '@/lib/material-inward'
import { formatWidth } from '@/lib/inward-cft'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const metadata: Metadata = { title: 'Inward · CraftERP' }

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value || '—'}</p>
    </div>
  )
}

export default async function InwardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: entry } = await supabase.from('inward_entries').select('*').eq('id', id).maybeSingle()
  if (!entry) notFound()

  let poNo: string | null = null
  if (entry.po_id) {
    const { data: po } = await supabase.from('purchase_orders').select('po_no').eq('id', entry.po_id).maybeSingle()
    poNo = po?.po_no ?? null
  }

  const isWood = entry.material_type === 'wood'

  const woodItems = isWood
    ? (
        await supabase
          .from('inward_wood_items')
          .select('thickness, width, length, pieces, cft')
          .eq('inward_entry_id', id)
      ).data ?? []
    : []
  woodItems.sort(
    (a, b) =>
      (a.thickness ?? 0) - (b.thickness ?? 0) ||
      (a.width ?? 0) - (b.width ?? 0) ||
      (a.length ?? 0) - (b.length ?? 0),
  )

  const rows = !isWood
    ? (await supabase.from('inward_rows').select('*').eq('inward_entry_id', id).order('position')).data ?? []
    : []
  const skuIds = [...new Set(rows.map((r) => r.sku_id).filter((v): v is string => Boolean(v)))]
  const { data: skuList } = skuIds.length
    ? await supabase.from('skus').select('id, sku_no, name').in('id', skuIds)
    : { data: [] }
  const skuMap = new Map((skuList ?? []).map((s) => [s.id, `${s.sku_no} — ${s.name}`]))

  const columns = isWood ? [] : MATERIAL_COLUMNS[entry.material_type as MaterialType] ?? []

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link
          href="/inward"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to inward
        </Link>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {entry.inward_no ?? 'Inward'} — {MATERIAL_LABEL[entry.material_type] ?? entry.material_type}
        </h1>
      </div>

      <Card>
        <CardContent className="grid gap-4 pt-4 text-sm sm:grid-cols-3 lg:grid-cols-4">
          <Info label="PO" value={poNo ?? 'General stock'} />
          <Info label="Date" value={entry.date} />
          <Info label="Wood type" value={entry.wood_type} />
          <Info label="Supplier / Party" value={entry.party} />
          <Info label="Vehicle No." value={entry.vehicle_no} />
          <Info label="Invoice No." value={entry.invoice_no} />
          <Info label="Total pieces" value={String(entry.total_pieces)} />
          {isWood ? <Info label="Total CFT" value={String(entry.total_cft)} /> : null}
          {entry.remark ? <Info label="Remark" value={entry.remark} /> : null}
        </CardContent>
      </Card>

      <div className="overflow-hidden rounded-xl border bg-card">
        {isWood ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thickness (in)</TableHead>
                <TableHead>Width (in)</TableHead>
                <TableHead>Length (ft)</TableHead>
                <TableHead className="text-right">Pieces</TableHead>
                <TableHead className="text-right">CFT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {woodItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                    No measurements.
                  </TableCell>
                </TableRow>
              ) : (
                woodItems.map((w, i) => (
                  <TableRow key={i}>
                    <TableCell className="tabular-nums">{w.thickness}</TableCell>
                    <TableCell className="tabular-nums">{w.width != null ? `${formatWidth(w.width)}"` : '—'}</TableCell>
                    <TableCell className="tabular-nums">{w.length}</TableCell>
                    <TableCell className="text-right tabular-nums">{w.pieces}</TableCell>
                    <TableCell className="text-right tabular-nums">{w.cft}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 text-center">#</TableHead>
                <TableHead>Item (SKU)</TableHead>
                {columns.map((c) => (
                  <TableHead key={c.key} className={c.numeric ? 'text-right' : undefined}>
                    {c.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} className="py-6 text-center text-sm text-muted-foreground">
                    No rows.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r, i) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-center text-xs text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="text-xs">{r.sku_id ? skuMap.get(r.sku_id) ?? '—' : '—'}</TableCell>
                    {columns.map((c) => {
                      const v = r[c.key]
                      return (
                        <TableCell key={c.key} className={c.numeric ? 'text-right tabular-nums' : undefined}>
                          {v ?? '—'}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
