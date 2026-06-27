import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { InwardForm } from '../inward-form'

export const metadata: Metadata = { title: 'New inward · CraftERP' }

export default async function NewInwardPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('purchase_orders')
    .select('id, po_no')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link
          href="/inward"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to inward
        </Link>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">New wood inward</h1>
      </div>
      <InwardForm pos={data ?? []} />
    </div>
  )
}
