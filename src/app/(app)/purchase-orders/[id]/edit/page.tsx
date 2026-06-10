import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { POForm, type POInitial } from '../../po-form'

export const metadata: Metadata = { title: 'Edit purchase order · CraftERP' }

export default async function EditPOPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: po } = await supabase.from('purchase_orders').select('*').eq('id', id).maybeSingle()
  if (!po) notFound()

  const [lineItemsRes, buyersRes, skusRes] = await Promise.all([
    supabase.from('po_line_items').select('id, sku_id, quantity, position').eq('po_id', id).order('position'),
    supabase.from('buyers').select('id, name').order('name'),
    supabase.from('skus').select('id, sku_no, name').order('sku_no'),
  ])

  const initial: POInitial = {
    id: po.id,
    po_no: po.po_no,
    buyer_id: po.buyer_id,
    photo_url: po.photo_url,
    delivery_date: po.delivery_date ?? '',
    inspection_date: po.inspection_date ?? '',
    shipping_date: po.shipping_date ?? '',
    shipping_country: po.shipping_country ?? '',
    status: po.status,
    line_items: (lineItemsRes.data ?? []).map((l) => ({
      id: l.id,
      sku_id: l.sku_id,
      quantity: String(l.quantity),
    })),
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <Link
          href={`/purchase-orders/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to purchase order
        </Link>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Edit purchase order</h1>
      </div>
      <POForm buyers={buyersRes.data ?? []} skus={skusRes.data ?? []} initial={initial} />
    </div>
  )
}
