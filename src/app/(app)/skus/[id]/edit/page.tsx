import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { SkuForm, type SkuInitial } from '../../sku-form'

export const metadata: Metadata = { title: 'Edit item · CraftERP' }

const s = (v: string | null) => v ?? ''
const n = (v: number | null) => (v === null || v === undefined ? '' : String(v))

export default async function EditSkuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: sku } = await supabase.from('skus').select('*').eq('id', id).maybeSingle()
  if (!sku) notFound()

  const [woodRes, ironRes, hardwareRes, packagingRes, cartonRes] = await Promise.all([
    supabase.from('wood_components').select('*').eq('sku_id', id).order('position'),
    supabase.from('iron_components').select('*').eq('sku_id', id).order('position'),
    supabase.from('hardware_components').select('*').eq('sku_id', id).order('position'),
    supabase.from('packaging_components').select('*').eq('sku_id', id).maybeSingle(),
    supabase.from('carton_components').select('*').eq('sku_id', id).order('position'),
  ])

  const initial: SkuInitial = {
    id: sku.id,
    sku_no: sku.sku_no,
    name: sku.name,
    photos: sku.photo_urls ?? [],
    description: s(sku.description),
    remark: s(sku.remark),
    wood: (woodRes.data ?? []).map((w) => ({
      description: s(w.description),
      length: n(w.length),
      thickness: n(w.thickness),
      breadth: n(w.breadth),
      quantity: n(w.quantity),
    })),
    iron: (ironRes.data ?? []).map((x) => ({
      description: s(x.description),
      section: s(x.section),
      length: n(x.length),
      width: n(x.width),
      remark: s(x.remark),
      photos: (x.picture_urls ?? []).map((url) => ({ url, preview: url })),
    })),
    hardware: (hardwareRes.data ?? []).map((h) => ({
      name: s(h.name),
      description: s(h.description),
      quantity: n(h.quantity),
      unit: s(h.unit),
    })),
    packaging: {
      corrugated_box: s(packagingRes.data?.corrugated_box ?? null),
      labels: s(packagingRes.data?.labels ?? null),
      barcode: s(packagingRes.data?.barcode ?? null),
      corners: s(packagingRes.data?.corners ?? null),
    },
    cartons: (cartonRes.data ?? []).map((c) => ({
      description: s(c.description),
      length: n(c.length),
      width: n(c.width),
      height: n(c.height),
      pcs_per_carton: n(c.pcs_per_carton),
    })),
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <Link
          href="/skus"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to items
        </Link>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Edit item</h1>
      </div>
      <SkuForm initial={initial} />
    </div>
  )
}
