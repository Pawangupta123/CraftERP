import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { totalCft, roundCft, DEFAULT_CFT_UNIT } from '@/lib/cft'
import { PO_STATUS } from '@/lib/po-status'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PrintButton, StatusControl } from '../po-detail-client'

export const metadata: Metadata = { title: 'Purchase order · CraftERP' }

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value || '—'}</p>
    </div>
  )
}

export default async function PODetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: po } = await supabase.from('purchase_orders').select('*').eq('id', id).maybeSingle()
  if (!po) notFound()

  const { data: buyer } = await supabase
    .from('buyers')
    .select('name, country, email, address')
    .eq('id', po.buyer_id)
    .maybeSingle()

  const { data: lineItems } = await supabase
    .from('po_line_items')
    .select('id, sku_id, quantity, position')
    .eq('po_id', id)
    .order('position')
  const items = lineItems ?? []
  const skuIds = [...new Set(items.map((i) => i.sku_id))]
  const lineIds = items.map((i) => i.id)

  const [skusRes, woodRes, stageRes] = await Promise.all([
    supabase.from('skus').select('id, sku_no, name').in('id', skuIds),
    supabase.from('wood_components').select('sku_id, length, thickness, breadth, quantity').in('sku_id', skuIds),
    supabase.from('stage_tracking').select('po_line_item_id, current_stage').in('po_line_item_id', lineIds),
  ])

  const skuMap = new Map((skusRes.data ?? []).map((s) => [s.id, s]))
  const woodBySku = new Map<
    string,
    { length: number | null; thickness: number | null; breadth: number | null; quantity: number | null }[]
  >()
  for (const w of woodRes.data ?? []) {
    const arr = woodBySku.get(w.sku_id) ?? []
    arr.push(w)
    woodBySku.set(w.sku_id, arr)
  }
  const stageMap = new Map((stageRes.data ?? []).map((s) => [s.po_line_item_id, s.current_stage]))

  const rows = items.map((it) => {
    const sku = skuMap.get(it.sku_id)
    const wood = woodBySku.get(it.sku_id) ?? []
    return {
      id: it.id,
      sku_no: sku?.sku_no ?? '—',
      name: sku?.name ?? '—',
      quantity: it.quantity,
      stage: stageMap.get(it.id) ?? 'Pending',
      cft: roundCft(totalCft(wood, it.quantity)),
    }
  })
  const totalCftValue = roundCft(rows.reduce((sum, r) => sum + r.cft, 0))

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href="/purchase-orders"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to purchase orders
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href={`/purchase-orders/${po.id}/edit`}>
              <Pencil className="size-4" />
              Edit
            </Link>
          </Button>
          <StatusControl id={po.id} status={po.status} />
          <PrintButton />
        </div>
      </div>

      <Card>
        <CardContent className="space-y-6 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
            <div>
              <p className="text-xs tracking-wide text-muted-foreground uppercase">Purchase Order</p>
              <h1 className="font-heading text-2xl font-semibold tracking-tight">{po.po_no}</h1>
            </div>
            <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', PO_STATUS[po.status].badge)}>
              {PO_STATUS[po.status].label}
            </span>
          </div>

          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <Field label="Buyer" value={buyer?.name} />
            <Field label="Shipping country" value={po.shipping_country ?? buyer?.country} />
            <Field label="Delivery date" value={po.delivery_date} />
            <Field label="Inspection date" value={po.inspection_date} />
            <Field label="Shipping date" value={po.shipping_date} />
          </div>

          {po.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={po.photo_url} alt="PO reference" className="max-h-48 rounded-lg border object-contain" />
          ) : null}

          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU No.</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Current stage</TableHead>
                  <TableHead className="text-right">Total CFT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                      No items on this PO.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs">{r.sku_no}</TableCell>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.quantity}</TableCell>
                      <TableCell>{r.stage}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.cft}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end">
            <div className="rounded-lg border bg-muted/30 px-4 py-2 text-sm">
              <span className="text-muted-foreground">Total CFT ({DEFAULT_CFT_UNIT} basis): </span>
              <span className="font-heading text-base font-semibold tabular-nums">{totalCftValue}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
