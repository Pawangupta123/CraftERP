import type { Metadata } from 'next'
import { Factory } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { ProductionTable, type ProdRow } from './production-table'

export const metadata: Metadata = { title: 'Production · CraftERP' }

export default async function ProductionPage() {
  const supabase = await createClient()

  const { data: lineItems } = await supabase.from('po_line_items').select('id, po_id, sku_id, quantity')
  const items = lineItems ?? []
  const poIds = [...new Set(items.map((i) => i.po_id))]
  const skuIds = [...new Set(items.map((i) => i.sku_id))]
  const lineIds = items.map((i) => i.id)

  const [posRes, skusRes, stagesRes] = await Promise.all([
    supabase.from('purchase_orders').select('id, po_no, buyer_id').in('id', poIds),
    supabase.from('skus').select('id, sku_no, name').in('id', skuIds),
    supabase.from('stage_tracking').select('po_line_item_id, current_stage').in('po_line_item_id', lineIds),
  ])
  const pos = posRes.data ?? []
  const buyerIds = [...new Set(pos.map((p) => p.buyer_id))]
  const { data: buyersData } = await supabase.from('buyers').select('id, name').in('id', buyerIds)

  const poMap = new Map(pos.map((p) => [p.id, p]))
  const skuMap = new Map((skusRes.data ?? []).map((s) => [s.id, s]))
  const stageMap = new Map((stagesRes.data ?? []).map((s) => [s.po_line_item_id, s.current_stage]))
  const buyerMap = new Map((buyersData ?? []).map((b) => [b.id, b.name]))

  const rows: ProdRow[] = items.map((it) => {
    const po = poMap.get(it.po_id)
    const sku = skuMap.get(it.sku_id)
    return {
      lineItemId: it.id,
      poId: it.po_id,
      poNo: po?.po_no ?? '—',
      buyerName: po ? buyerMap.get(po.buyer_id) ?? '—' : '—',
      skuLabel: sku ? `${sku.sku_no} — ${sku.name}` : '—',
      quantity: it.quantity,
      stage: stageMap.get(it.id) ?? 'Pending',
    }
  })
  rows.sort((a, b) => (a.poNo < b.poNo ? 1 : a.poNo > b.poNo ? -1 : 0))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Production</h1>
        <p className="text-sm text-muted-foreground">Update the production stage of each ordered item.</p>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
              <Factory className="size-6" />
            </span>
            <p className="text-sm text-muted-foreground">
              Nothing in production yet. Create a purchase order to add items here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ProductionTable rows={rows} />
      )}
    </div>
  )
}
