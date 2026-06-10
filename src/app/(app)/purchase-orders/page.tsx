import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { POsTable, type PORow } from './pos-table'

export const metadata: Metadata = { title: 'Purchase Orders · CraftERP' }

export default async function PurchaseOrdersPage() {
  const supabase = await createClient()
  const [posRes, buyersRes] = await Promise.all([
    supabase
      .from('purchase_orders')
      .select('id, po_no, status, shipping_date, buyer_id')
      .order('created_at', { ascending: false }),
    supabase.from('buyers').select('id, name'),
  ])

  const buyerMap = new Map((buyersRes.data ?? []).map((b) => [b.id, b.name]))
  const rows: PORow[] = (posRes.data ?? []).map((p) => ({
    id: p.id,
    po_no: p.po_no,
    status: p.status,
    shipping_date: p.shipping_date,
    buyer_name: buyerMap.get(p.buyer_id) ?? '—',
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Purchase Orders</h1>
          <p className="text-sm text-muted-foreground">Track orders by buyer and stage.</p>
        </div>
        <Button asChild>
          <Link href="/purchase-orders/new">
            <Plus className="size-4" />
            New PO
          </Link>
        </Button>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
              <FileText className="size-6" />
            </span>
            <p className="text-sm text-muted-foreground">No purchase orders yet.</p>
            <Button asChild variant="outline">
              <Link href="/purchase-orders/new">
                <Plus className="size-4" />
                Create your first PO
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <POsTable pos={rows} />
      )}
    </div>
  )
}
