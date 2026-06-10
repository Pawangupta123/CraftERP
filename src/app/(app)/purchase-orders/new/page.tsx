import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { POForm } from '../po-form'

export const metadata: Metadata = { title: 'New purchase order · CraftERP' }

export default async function NewPOPage() {
  const supabase = await createClient()
  const [buyersRes, skusRes] = await Promise.all([
    supabase.from('buyers').select('id, name').order('name'),
    supabase.from('skus').select('id, sku_no, name').order('sku_no'),
  ])

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <Link
          href="/purchase-orders"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to purchase orders
        </Link>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">New purchase order</h1>
      </div>
      <POForm buyers={buyersRes.data ?? []} skus={skusRes.data ?? []} />
    </div>
  )
}
