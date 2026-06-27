import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { maxStage } from '@/lib/po-stages'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { POsByBuyer, EmptyBuyers, type PORow } from './pos-by-buyer'

export const metadata: Metadata = { title: 'Purchase Orders · CraftERP' }

export default async function PurchaseOrdersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: me } = user
    ? await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    : { data: null }
  const isAdmin = me?.role === 'admin'

  const [posRes, buyersRes, liRes] = await Promise.all([
    supabase
      .from('purchase_orders')
      .select('id, po_no, status, delivery_date, buyer_id')
      .order('created_at', { ascending: false }),
    supabase.from('buyers').select('id, name').order('name'),
    supabase.from('po_line_items').select('id, po_id, sku_id, quantity'),
  ])

  const pos = posRes.data ?? []
  const buyers = buyersRes.data ?? []
  const lineItems = liRes.data ?? []

  const skuIds = [...new Set(lineItems.map((l) => l.sku_id))]
  const lineIds = lineItems.map((l) => l.id)
  const [skusRes, stageRes] = await Promise.all([
    supabase.from('skus').select('id, name').in('id', skuIds),
    supabase.from('stage_tracking').select('po_line_item_id, current_stage').in('po_line_item_id', lineIds),
  ])
  const skuName = new Map((skusRes.data ?? []).map((s) => [s.id, s.name]))
  const stageByLine = new Map((stageRes.data ?? []).map((s) => [s.po_line_item_id, s.current_stage]))

  const linesByPo = new Map<string, typeof lineItems>()
  for (const l of lineItems) {
    const arr = linesByPo.get(l.po_id) ?? []
    arr.push(l)
    linesByPo.set(l.po_id, arr)
  }

  const buyerName = new Map(buyers.map((b) => [b.id, b.name]))

  const rows: PORow[] = pos.map((p) => {
    const lines = linesByPo.get(p.id) ?? []
    return {
      id: p.id,
      po_no: p.po_no,
      status: p.status,
      delivery_date: p.delivery_date,
      buyer_id: p.buyer_id,
      buyer_name: buyerName.get(p.buyer_id) ?? '—',
      items: lines.map((l) => ({ name: skuName.get(l.sku_id) ?? '—', qty: l.quantity })),
      totalQty: lines.reduce((sum, l) => sum + l.quantity, 0),
      stage: maxStage(lines.map((l) => stageByLine.get(l.id))),
    }
  })

  // Only buyers that actually have purchase orders, in the order they appear.
  const buyerIdsWithPos = new Set(rows.map((r) => r.buyer_id))
  const activeBuyers = buyers.filter((b) => buyerIdsWithPos.has(b.id))

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Purchase Orders</h1>
          <p className="text-sm text-muted-foreground">Pick a buyer to see their orders, stage and deadlines.</p>
        </div>
        {isAdmin ? (
          <Button asChild>
            <Link href="/purchase-orders/new">
              <Plus className="size-4" />
              New PO
            </Link>
          </Button>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-sm text-muted-foreground">No purchase orders yet.</p>
            {isAdmin ? (
              <Button asChild variant="outline">
                <Link href="/purchase-orders/new">
                  <Plus className="size-4" />
                  Create your first PO
                </Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : activeBuyers.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyBuyers />
          </CardContent>
        </Card>
      ) : (
        <POsByBuyer buyers={activeBuyers} pos={rows} isAdmin={isAdmin} />
      )}
    </div>
  )
}
